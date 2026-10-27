# Arquitetura Técnica do Perfect CV

Este documento detalha as decisões arquiteturais, padrões de design e componentes da aplicação **Perfect CV**.

---

## 1. Visão Geral da Arquitetura

O **Perfect CV** foi projetado como um aplicativo web local de alta performance, privacidade total e zero dependências de servidores ou bancos de dados remotos.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                            │
│  ┌───────────────┬──────────────┬───────────────┬───────────────────┐  │
│  │ /settings     │ /profile     │ /generator    │ /resumes          │  │
│  │ Configurações │ Meu Perfil   │ Assistente    │ Biblioteca/Canvas │  │
│  └───────┬───────┴──────┬───────┴───────┬───────┴─────────┬─────────┘  │
│          │              │               │                 │            │
│          ▼              ▼               ▼                 ▼            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     API Route Handlers Locais                    │  │
│  │  /api/config   /api/profile   /api/generate   /api/resumes       │  │
│  └───────┬──────────────┬───────────────┬─────────────────┬─────────┘  │
│          │              │               │                 │            │
│          ▼              ▼               ▼                 ▼            │
│  ┌─────────────────────────────┐ ┌──────────────────────────────────┐  │
│  │    Vercel AI SDK Adapter    │ │       Local Storage Engine       │  │
│  │ (Gemini, OpenAI, Claude,    │ │       (lib/storage/fs-storage)   │  │
│  │  Groq, Ollama, OmniRoute)   │ │                                  │  │
│  └─────────────────────────────┘ └────────────────┬─────────────────┘  │
└───────────────────────────────────────────────────┼────────────────────┘
                                                    ▼
                                   ┌──────────────────────────────────┐
                                   │      data/ (no .gitignore)       │
                                   │  ├── config.json                 │
                                   │  ├── profile.json                │
                                   │  └── resumes/[id].json           │
                                   └──────────────────────────────────┘
```

---

## 2. Camada de Inteligência Artificial Multi-Provedor (`lib/ai/`)

Para desacoplar a aplicação de provedores específicos de LLM, foi utilizado o **Vercel AI SDK**, operando sob uma camada de fábrica (`lib/ai/client.ts`):

* **Google Gemini (`@ai-sdk/google`)**: Provedor padrão, oferecendo alta velocidade e cota gratuita generosa no Google AI Studio.
* **OpenAI (`@ai-sdk/openai`)**: Modelos GPT-4o, GPT-4o-mini e série o3.
* **Anthropic (`@ai-sdk/anthropic`)**: Claude 3.5 Sonnet e Claude 3.5 Haiku.
* **Groq, Ollama e OmniRoute**: Unificados via adaptador compatível com a API da OpenAI (`createOpenAI` com `baseURL` customizável).
  * **Ollama**: Permite execução 100% offline em `http://localhost:11434/v1`, sem envio de dados para a internet.
  * **Groq**: Permite inferência em LPU de altíssima velocidade.
  * **OmniRoute / OpenRouter**: Permite roteamento unificado de dezenas de modelos sob um único proxy.

### Validação de Saída Estruturada com Zod
Para eliminar alucinações e respostas mal formatadas, todas as rotinas que utilizam LLM utilizam `generateObject({ schema: UserProfileSchema, ... })`, garantindo tipagem forte e validação em tempo de execução.

---

## 3. Armazenamento Local em Disco (`lib/storage/fs-storage.ts`)

A persistência de dados utiliza arquivos JSON organizados na pasta `data/`:

* `data/config.json`: Provedor ativo, chaves de API e preferências.
* `data/profile.json`: Perfil mestre unificado com o histórico completo do profissional.
* `data/resumes/[id].json`: Cada currículo gerado possui seu próprio arquivo individual com metadados de criação, vaga alvo, template visual utilizado e conteúdo refinado.

> **Segurança:** O arquivo `.gitignore` protege estritamente o diretório `data/` e arquivos `.env*`, impedindo vazamento de chaves ou dados pessoais caso o repositório seja compartilhado.

---

## 4. Motor de Renderização de Currículos e Carrossel de 5 Estilos

O módulo de visualização (`components/resume-view/`) renderiza o currículo em proporção física A4 (`210mm x 297mm`), suportando edição direta inline e alternância dinâmica entre 5 templates visuais:

1. **Modern Minimalist (`modern-minimal`)**: Fundo branco puro, layout linear em 1 coluna, divisores horizontais sutis e pontuação máxima em sistemas ATS de triagem mecânica.
2. **Executive Slate (`executive-slate`)**: Layout assimétrico em duas colunas (32% barra lateral suave em tom slate com contatos e skills; 68% coluna principal com resumo e trajetórias), com detalhes em azul-marinho executivo.
3. **Tech Charcoal (`tech-charcoal`)**: Cabeçalho de destaque em grafite/carvão escuro com tipografia clara, seguido por corpo limpo com tags técnicas em evidência.
4. **Classic Serif (`classic-serif`)**: Tipografia tradicional de prestígio (estilo Ivy League / Wall Street), cabeçalho centralizado e alinhamento sóbrio.
5. **Nordic Warm (`nordic-warm`)**: Estética escandinava contemporânea com fundo areia/off-white suave (`#fdfbf7`), tipografia espresso e acentos terrosos discretos.

### Exportação para PDF Vetorial
A exportação em PDF utiliza a engine nativa de impressão com estilos CSS `@media print` calibrados:
* Tamanho de folha travado em A4 sem margens artificiais do navegador.
* Cores de fundo preservadas com `-webkit-print-color-adjust: exact`.
* Quebras de página suaves que evitam o corte de títulos e bullet points ao meio.
