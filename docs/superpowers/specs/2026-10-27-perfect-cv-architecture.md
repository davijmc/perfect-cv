# Documento de Especificação e Arquitetura: Perfect CV

**Data**: 27 de Outubro de 2026  
**Status**: Aprovado  
**Objetivo**: Aplicação web local para criação, adaptação inteligente e gestão de currículos profissionais de alta conversão (ATS-friendly) utilizando Inteligência Artificial generativa com suporte multi-provedor (Gemini, OpenAI, Claude, Groq, Ollama e OmniRoute).

---

## 1. Visão Geral e Princípios de Design

O **Perfect CV** é uma solução projetada para resolver a dor de adaptar currículos para diferentes vagas e áreas de mercado sem depender de assinaturas recorrentes, sem expor dados pessoais a servidores de terceiros e sem perder horas formatando documentos no Word.

### Princípios Chave:
1. **Privacidade e Controle Local**: Todas as configurações, chaves de API, perfil profissional e histórico de currículos residem exclusivamente no computador do usuário (arquivos locais na pasta `data/`, protegidos no `.gitignore`).
2. **Multi-Provedor de LLM**: Suporte nativo e unificado ao Google Gemini (provedor padrão com cota gratuita generosa), OpenAI, Anthropic Claude, Groq (latência ultra baixa), endpoints locais (Ollama para uso offline sem custos) e roteadores universais (OmniRoute / OpenRouter).
3. **Fidelidade e Zero Alucinações**: Uso de *Structured Outputs* com validação estrita de schemas via Zod, garantindo que a IA nunca invente informações inexistentes e que os dados sigam formato padronizado.
4. **ATS-Friendly por Padrão**: Layouts limpos, hierarquia semântica precisa e tipografia padronizada para máxima pontuação em sistemas de triagem automatizada (Applicant Tracking Systems).
5. **Autonomia do Usuário**: Geração assistida em 3 modos (Cargo Genérico, Vaga Alvo ou Do Zero), 2 níveis de profundidade (Enxuto vs. Detalhado) e edição direta do texto gerado antes da exportação.

---

## 2. Arquitetura do Sistema e Stack Tecnológica

### 2.1 Stack Tecnológica
* **Framework Web Full-Stack**: [Next.js](https://nextjs.org/) (App Router, React 19 / Server Components + Route Handlers).
* **Linguagem**: [TypeScript](https://www.typescriptlang.org/) com tipagem estrita de ponta a ponta.
* **Estilização e UI**: [Tailwind CSS](https://tailwindcss.com/) com design system minimalista e moderno, enriquecido com [Lucide React](https://lucide.dev/) para iconografia.
* **Camada de IA**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `createOpenAICompatible` para Groq, Ollama e OmniRoute).
* **Validação de Schemas**: [Zod](https://zod.dev/) para validação em tempo de execução dos modelos de dados e respostas de LLM.
* **Parsing de Arquivos Locais**: `pdf-parse` (extração de texto de PDF) e `mammoth` (extração de texto de arquivos DOCX/DOC).
* **Web Scraping Local**: Leitor de URLs via `cheerio` e rotinas de extração de texto legível (Readability) com fallback gracioso para inserção manual.
* **Exportação**: Impressão vetorial A4 de alta fidelidade via CSS Print Engine / `@react-pdf/renderer` para PDF, além de exportação em Markdown e JSON estruturado.

### 2.2 Estrutura de Diretórios
```text
perfect-cv/
├── app/                              # Páginas e Rotas do Next.js
│   ├── page.tsx                      # Painel central / Redirecionador por abas
│   ├── settings/page.tsx             # Aba: Configurações de API e Modelos
│   ├── profile/page.tsx              # Aba: Meu Perfil (Formulário + Upload CV)
│   ├── generator/page.tsx            # Aba: Assistente de Geração de Currículo
│   ├── resumes/page.tsx              # Aba: Biblioteca / Histórico de Currículos
│   ├── layout.tsx                    # Shell da aplicação (Menu lateral / Navbar, Toaster)
│   └── api/                          # Endpoints locais (Route Handlers)
│       ├── config/route.ts           # Get e Save de configurações locais
│       ├── profile/route.ts          # Get e Save do perfil mestre
│       ├── profile/upload/route.ts   # Upload de arquivo e extração com LLM
│       ├── generate/route.ts         # Orquestração do prompt de geração
│       └── scrape-job/route.ts       # Extração de texto de link de vaga
├── components/                       # Componentes modulares
│   ├── ui/                           # Componentes de base (Button, Input, Card, Tabs, Modal)
│   ├── layout/                       # Header, Sidebar, Navigation
│   ├── settings/                     # Formulário de chaves, seleção de modelo, Ping test
│   ├── profile/                      # Seções do perfil (Pessoal, Exp, Edu, Skills, Projetos)
│   ├── generator/                    # Wizard de geração, seleção de vaga/modo/profundidade
│   └── resume-view/                  # Folha A4 interativa, carrossel de 5 estilos, editor inline, exportação PDF
├── lib/
│   ├── ai/                           # Adaptador Universal de IA
│   │   ├── client.ts                 # Fábrica de instâncias dos provedores
│   │   ├── prompts.ts                # Engenharia de prompts (CV parser, tailoring ATS)
│   │   └── schemas.ts                # Schemas Zod (UserProfile, GeneratedResume, Config)
│   ├── storage/                      # Camada de I/O em disco (Node.js fs/promises)
│   ├── parser/                       # Extratores de texto (PDF e Word)
│   └── scraper/                      # Extrator de texto de links de vagas com sanitização
├── data/                             # Dados locais (ignorado no Git)
│   ├── config.json                   # Chaves de API e preferências
│   ├── profile.json                  # Perfil profissional mestre
│   └── resumes/                      # Histórico de currículos gerados ([id].json)
├── docs/                             # Documentação técnica e de usuário
│   ├── architecture.md               # Detalhes de arquitetura e decisões
│   └── user-guide.md                 # Guia do usuário com passo a passo
├── .gitignore                        # Protege data/, .env e node_modules
├── package.json                      # Scripts e dependências
└── README.md                         # Guia rápido e enxuto de execução
```

---

## 3. Camada de LLM Multi-Provedor (`lib/ai/client.ts`)

A camada de inteligência artificial é padronizada usando o Vercel AI SDK. Uma única função fábrica `getAIModel(provider, modelName, customConfig)` resolve a instância correta do modelo:

| Provedor | Pacote / Adaptador | Exemplo de Modelos Padrão | Cenário de Uso |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | `@ai-sdk/google` | `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash` | Provedor padrão; rápido, alta capacidade de contexto e gratuito no Google AI Studio. |
| **OpenAI** | `@ai-sdk/openai` | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | Alta capacidade de raciocínio e aderência de formato. |
| **Anthropic** | `@ai-sdk/anthropic` | `claude-3-5-sonnet-latest`, `claude-3-5-haiku` | Excelente síntese textual e estilo executivo. |
| **Groq** | `createOpenAICompatible` | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` | Resposta quase instantânea (latência mínima). |
| **Ollama** | `createOpenAICompatible` | `llama3.2`, `mistral`, `deepseek-r1` | 100% offline, gratuito e sem saída de dados para a internet. URL padrão: `http://localhost:11434/v1`. |
| **OmniRoute / OpenRouter** | `createOpenAICompatible` | Configurável pelo usuário (ex: `anthropic/claude-3.5-sonnet`) | Roteamento unificado via proxy de chaves. |

### Validação Estruturada com `generateObject`
Para garantir que o resultado seja 100% tipado e livre de textos soltos, usamos:
```typescript
import { generateObject } from 'ai';
import { ResumeSchema } from '@/lib/ai/schemas';

const { object } = await generateObject({
  model: currentModel,
  schema: ResumeSchema,
  prompt: generatedPrompt,
});
```

---

## 4. Modelos de Dados e Persistência Local

### 4.1 Schema de Configuração (`data/config.json`)
```typescript
export interface AppConfig {
  activeProvider: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama' | 'omniRoute';
  providers: {
    gemini?: { apiKey: string; model: string };
    openai?: { apiKey: string; model: string };
    anthropic?: { apiKey: string; model: string };
    groq?: { apiKey: string; model: string };
    ollama?: { baseUrl: string; model: string };
    omniRoute?: { baseUrl: string; apiKey: string; model: string };
  };
}
```

### 4.2 Schema do Perfil Profissional Mestre (`data/profile.json`)
```typescript
export interface UserProfile {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  summary: string;
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    location: string;
    highlights: string[];
    technologies: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  skills: {
    technical: string[];
    toolsAndCloud: string[];
    softSkills: string[];
  };
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo';
  }>;
}
```

### 4.3 Schema do Currículo Gerado (`data/resumes/[id].json`)
```typescript
export interface GeneratedResume {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string; // Ex: "Tech Lead - Nubank"
  mode: 'generic' | 'job_specific' | 'from_scratch';
  depth: 'lean' | 'detailed';
  templateId: 'modern-minimal' | 'executive-slate' | 'tech-charcoal' | 'classic-serif' | 'nordic-warm';
  targetRole?: string;
  targetJobDetails?: {
    company?: string;
    jobTitle?: string;
    url?: string;
    rawDescription?: string;
  };
  content: UserProfile; // Versão adaptada e refinada para a vaga
}
```

---

## 5. Módulos Funcionais e Experiência do Usuário

### 5.1 Aba de Configurações
* Seletor de provedor ativo com ícones distintos.
* Inputs com visualização/ocultação segura de chaves (`password` toggle).
* Botão **"Testar Conexão"**: valida a chave e retorna mensagem de sucesso ou o erro detalhado da API.
* Persistência imediata no `data/config.json`.

### 5.2 Aba de Meu Perfil
* Formulário modular com abas: Dados Pessoais, Resumo, Experiência, Educação, Habilidades, Certificações, Idiomas e Projetos.
* **Botão "Importar de Currículo Existente"**:
  1. Suporta PDF, DOCX e DOC.
  2. Extrai texto com `pdf-parse` / `mammoth`.
  3. LLM processa o texto e mapeia para o schema `UserProfile`.
  4. Formulário é pré-preenchido e o usuário recebe um aviso para revisar e salvar em `data/profile.json`.

### 5.3 Aba do Gerador de Currículo
* **Passo 1: Escolha do Modo**:
  1. *Por Cargo/Área (Genérico)*: Informa o cargo alvo.
  2. *Específico para uma Vaga*: Campo de URL (com leitura automática) e campo de texto de fallback.
  3. *Do Zero / Livre*: Seleção manual de itens do perfil.
* **Passo 2: Nível de Profundidade**:
  * *Simples / Enxuto*: 2 a 3 bullet points de alto impacto por experiência (ideal para 1 página).
  * *Detalhado / Profundo*: 4 a 6 bullet points contextualizados com métricas e desafios técnicos (ideal para 2 páginas ou cargos sênior).
* **Passo 3: Geração**:
  * A LLM seleciona os pontos fortes, adapta as descrições e reescreve o resumo para maximizar aderência ATS.

### 5.4 Editor & Preview A4
* **Canvas A4**: Exibição fiel ao formato físico com estilos de impressão calibrados.
* **Carrossel de Estilos Integrado**: Logo acima do canvas A4, um carrossel visual (`TemplateCarousel`) permite deslizar e alternar entre 5 estilos de formatação com 1 clique, atualizando imediatamente o visual do documento sem perder edições de texto.
* **Edição Inline**: O usuário clica e edita qualquer texto no próprio currículo gerado.
* **Ações**:
  * **Baixar PDF**: Impressão vetorial limpa e selecionável baseada no template escolhido.
  * **Copiar Markdown / Baixar JSON**: Para portfólios e formulários de candidatura.
  * **Salvar na Biblioteca**: Persiste o currículo gerado em `data/resumes/[id].json` com o `templateId` selecionado.

### 5.5 Catálogo de Estilos de Formatação (5 Variações no Carrossel)
Todos os estilos foram concebidos com rigor estético, tipografia harmoniosa, contrastes calibrados e foco em compatibilidade ATS:

1. **Modern Minimalist (`modern-minimal`)**:
   * *Estilo visual*: Limpo, ultra focado em conteúdo e alta legibilidade.
   * *Paleta*: Fundo branco puro (`#ffffff`), tipografia principal em grafite profundo (`#0f172a`), títulos em `slate-800` com divisores horizontais sutis em `slate-200`.
   * *Tipografia*: Sans-serif moderna e geométrica (Inter).
   * *Estrutura*: Coluna única linear, hierarquia de títulos clara, excelente pontuação mecânica em robôs ATS.
2. **Executive Slate (`executive-slate`)**:
   * *Estilo visual*: Duas colunas assimétricas corporativas e elegantes.
   * *Paleta*: Fundo do corpo branco com barra lateral suave em `slate-50` / `zinc-100` e divisória sutil. Acentos em azul-marinho executivo (`#1e3a8a` / `#0f2744`) nos cabeçalhos e cargos.
   * *Tipografia*: Sans-serif refinada e equilibrada (Inter).
   * *Estrutura*: Barra lateral (30%) com contatos, skills agrupadas e idiomas; coluna principal (70%) com resumo, histórico profissional e educação.
3. **Tech Charcoal (`tech-charcoal`)**:
   * *Estilo visual*: Cabeçalho escuro sofisticado e tags destacadas, ideal para engenharia e tecnologia.
   * *Paleta*: Cabeçalho superior com fundo carvão/grafite escuro (`#18181b` / `#0f172a`) e tipografia contrastante; corpo branco limpo.
   * *Tipografia*: Sans-serif técnica, com tags de competências em caixas discretas (`bg-slate-100 text-slate-800`).
   * *Estrutura*: Bloco superior forte com nome e contatos, seguido por narrativa linear de experiências com tecnologias em evidência.
4. **Classic Serif (`classic-serif`)**:
   * *Estilo visual*: Atemporal, acadêmico e refinado (estilo Ivy League / Wall Street).
   * *Paleta*: Fundo branco marfim suave (`#fafafa`), tipografia em preto suave (`#111827`) e divisores clássicos finos.
   * *Tipografia*: Cabeçalho e títulos de seção em fonte serifada elegante (Merriweather / Georgia), corpo em serif ou sans legível.
   * *Estrutura*: Cabeçalho centralizado clássico, seções com títulos elegantes em versalete/maiúsculas, ideal para áreas jurídicas, consultorias e alta gestão.
5. **Nordic Warm (`nordic-warm`)**:
   * *Estilo visual*: Estética escandinava contemporânea, quente e acolhedora.
   * *Paleta*: Fundo em tom areia/off-white sutil (`#fdfbf7` / `stone-50`), tipografia em café espresso/stone-900 (`#1c1917`), divisores e acentos em tom terra/oliva sutil (`#57534e`).
   * *Tipografia*: Sans-serif humanista com espaçamento confortável.
   * *Estrutura*: Layout arejado e amigável, excelente para designers, gerentes de produto e profissionais criativos que valorizam sutileza e requinte.

### 5.6 Aba da Biblioteca de Currículos
* Listagem em cards com título, data, vaga/cargo alvo, badge do template visual utilizado e badges de modo/profundidade.
* Ações em cada card: **Abrir no Editor**, **Duplicar**, **Exportar PDF** e **Excluir**.

---

## 6. Tratamento de Erros e Resiliência

1. **Erros de API / Quota**: Captura amigável com indicação do provedor e instruções (ex: verificar saldo ou chave).
2. **Arquivos sem Camada de Texto**: Notificação caso o PDF seja digitalizado por foto, orientando o preenchimento ou uso de PDF gerado digitalmente.
3. **Sites de Vagas Protegidos**: Fallback transparente para o campo de texto manual caso o link exija autenticação ou bloqueie scrapers.
4. **Validação de Dados**: Schemas Zod com valores padrão para prevenir falhas de renderização.

---

## 7. Documentação e README

* `docs/architecture.md`: Guia de arquitetura técnica detalhada para desenvolvedores.
* `docs/user-guide.md`: Guia de uso com dicas de prompts, chaves de API e preparação de currículos para ATS.
* `README.md`: Documentação enxuta na raiz contendo apenas os pré-requisitos, 2 comandos para rodar (`npm install` e `npm run dev`) e os 3 passos para o primeiro uso.

---

## 8. Verificação e Auto-Revisão da Especificação

1. **Placeholder Scan**: Nenhum "TODO" ou requisito indefinido. Todos os provedores, schemas e fluxos estão especificados.
2. **Consistência Interna**: O modelo de dados em JSON bate exatamente com a camada de abstração de LLM e com os componentes de UI descritos.
3. **Escopo**: Focado no MVP robusto e autocontido, sem complexidades desnecessárias de banco relacional ou dependências de servidores remotos.
4. **Segurança**: Chaves e dados do usuário salvos em arquivos locais estritamente protegidos pelo `.gitignore`.
