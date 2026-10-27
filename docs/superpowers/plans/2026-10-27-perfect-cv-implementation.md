# Perfect CV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma aplicação web local em Next.js para criação, adaptação inteligente e gestão de currículos de alta conversão (ATS-friendly) com IA multi-provedor (Gemini, OpenAI, Claude, Groq, Ollama, OmniRoute), auto-preenchimento por upload de CV antigo e carrossel de 5 estilos visuais.

**Architecture:** Aplicação Next.js 15 (App Router) em TypeScript com Vercel AI SDK para integração de LLMs e persistência local de dados e configurações em arquivos JSON na pasta `data/` (protegida no `.gitignore`). Interface moderna com abas para Configurações, Meu Perfil, Gerador com Wizard, Preview A4 interativo com carrossel de 5 temas e Biblioteca de currículos.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Zod, Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`), `pdf-parse`, `mammoth`, `cheerio`, Vitest para testes unitários.

## Global Constraints

- Armazenamento 100% local em disco na pasta `data/` (`config.json`, `profile.json`, `resumes/[id].json`).
- Pasta `data/` e arquivos de credenciais estritamente ignorados no `.gitignore`.
- Todas as saídas de IA estruturadas devem usar `generateObject` com schemas Zod estritos.
- Provedor padrão inicial: Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`).
- Todos os 5 estilos de currículo devem manter compatibilidade ATS e tipografia profissional.
- Documentação técnica em `docs/` e `README.md` enxuto na raiz com apenas pré-requisitos, 2 comandos e instruções essenciais.

---

### Task 1: Setup do Projeto Next.js 15, Configurações de Build e Design System Base

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `vitest.config.ts`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Create: `components/layout/main-nav.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: N/A (bootstrap inicial)
- Produces: Base do aplicativo executável com navegação em abas (Configurações, Perfil, Gerador, Biblioteca), tailwind tokens e runner de testes Vitest.

- [ ] **Step 1: Escrever teste de verificação de ambiente**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Setup & Environment', () => {
  it('should have standard node environment variables defined', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
```

- [ ] **Step 2: Inicializar projeto Next.js com dependências essenciais**

Executar no terminal:
```bash
npm init -y
npm install next@15.0.0 react@19.0.0-rc.1 react-dom@19.0.0-rc.1 lucide-react clsx tailwind-merge zod ai @ai-sdk/google @ai-sdk/openai @ai-sdk/anthropic pdf-parse mammoth cheerio
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer vitest @types/pdf-parse
```

- [ ] **Step 3: Configurar `.gitignore` para proteção absoluta de dados e chaves**

Garantir que `.gitignore` contenha:
```text
node_modules
.next
out
build
dist
.env*
!.env.example
data/
*.log
```

- [ ] **Step 4: Configurar `tailwind.config.ts`, `globals.css` e layout de abas (`app/layout.tsx`)**

Criar `app/globals.css` com estilos A4 de impressão e `components/layout/main-nav.tsx` com navegação visual para as 4 seções principais.

- [ ] **Step 5: Rodar testes e build para verificar integridade**

Executar: `npx vitest run`  
Resultado esperado: PASS

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: setup next.js project with tailwind, base layout and test runner"
```

---

### Task 2: Camada de Armazenamento em Disco e Schemas Zod (`lib/ai/schemas.ts` e `lib/storage/`)

**Files:**
- Create: `lib/ai/schemas.ts`
- Create: `lib/storage/fs-storage.ts`
- Test: `tests/storage.test.ts`

**Interfaces:**
- Consumes: Arquivos em `data/`
- Produces:
  - `UserProfileSchema`, `AppConfigSchema`, `GeneratedResumeSchema`
  - `loadConfig(): Promise<AppConfig>`, `saveConfig(config: AppConfig): Promise<void>`
  - `loadProfile(): Promise<UserProfile | null>`, `saveProfile(profile: UserProfile): Promise<void>`
  - `listResumes(): Promise<GeneratedResume[]>`, `saveResume(resume: GeneratedResume): Promise<void>`, `deleteResume(id: string): Promise<void>`

- [ ] **Step 1: Escrever teste de validação de schemas e I/O em disco**

```typescript
// tests/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AppConfigSchema, UserProfileSchema } from '../lib/ai/schemas';
import { saveConfig, loadConfig } from '../lib/storage/fs-storage';

describe('Storage & Schema Validation', () => {
  it('should validate default config schema', () => {
    const validConfig = {
      activeProvider: 'gemini',
      providers: {
        gemini: { apiKey: 'test-key', model: 'gemini-1.5-flash' },
      },
    };
    const parsed = AppConfigSchema.safeParse(validConfig);
    expect(parsed.success).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar teste para verificar falha inicial**

Executar: `npx vitest run tests/storage.test.ts`  
Resultado esperado: FAIL (arquivos ainda não criados)

- [ ] **Step 3: Implementar `lib/ai/schemas.ts` com tipagem rigorosa Zod**

Implementar schemas para `AppConfig`, `UserProfile`, `ExperienceItem`, `EducationItem`, `SkillCategory`, `GeneratedResume` com `templateId` enum ('modern-minimal' | 'executive-slate' | 'tech-charcoal' | 'classic-serif' | 'nordic-warm').

- [ ] **Step 4: Implementar `lib/storage/fs-storage.ts` com `fs/promises` seguro**

Garantir criação automática do diretório `data/` e `data/resumes/` caso não existam.

- [ ] **Step 5: Rodar testes para verificar aprovação**

Executar: `npx vitest run tests/storage.test.ts`  
Resultado esperado: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/ai/schemas.ts lib/storage/fs-storage.ts tests/storage.test.ts
git commit -m "feat: add zod schemas and local fs storage module"
```

---

### Task 3: Camada de LLM Multi-Provedor e Rota de Teste de Conexão

**Files:**
- Create: `lib/ai/client.ts`
- Create: `lib/ai/prompts.ts`
- Create: `app/api/config/route.ts`
- Create: `app/api/config/test-connection/route.ts`
- Test: `tests/ai-client.test.ts`

**Interfaces:**
- Consumes: `AppConfig` do `fs-storage.ts`
- Produces:
  - `getAIModel(config: AppConfig)`: retorna a instância de modelo do Vercel AI SDK
  - `POST /api/config`: salva configurações
  - `GET /api/config`: carrega configurações (com apiKey mascarada por segurança)
  - `POST /api/config/test-connection`: testa a chave enviada com uma requisição de validação

- [ ] **Step 1: Escrever teste unitário para o resolvedor de provedores**

```typescript
// tests/ai-client.test.ts
import { describe, it, expect } from 'vitest';
import { resolveModelId } from '../lib/ai/client';

describe('AI Client Provider Resolution', () => {
  it('should resolve default gemini model when none specified', () => {
    const model = resolveModelId('gemini', undefined);
    expect(model).toBe('gemini-1.5-flash');
  });
});
```

- [ ] **Step 2: Rodar teste para verificar falha**

Executar: `npx vitest run tests/ai-client.test.ts`  
Resultado esperado: FAIL

- [ ] **Step 3: Implementar `lib/ai/client.ts` e `lib/ai/prompts.ts`**

Suportar:
- `@ai-sdk/google` para Gemini.
- `@ai-sdk/openai` para OpenAI.
- `@ai-sdk/anthropic` para Claude.
- `createOpenAICompatible` para Groq, Ollama e OmniRoute.

- [ ] **Step 4: Implementar Route Handlers `/api/config` e `/api/config/test-connection`**

- [ ] **Step 5: Rodar testes para verificar aprovação**

Executar: `npx vitest run tests/ai-client.test.ts`  
Resultado esperado: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/ai/client.ts lib/ai/prompts.ts app/api/config/ tests/ai-client.test.ts
git commit -m "feat: add multi-provider ai client and config api routes"
```

---

### Task 4: Interface de Configurações (`app/settings/page.tsx`)

**Files:**
- Create: `components/settings/provider-selector.tsx`
- Create: `components/settings/provider-card.tsx`
- Create: `components/settings/test-connection-button.tsx`
- Create: `app/settings/page.tsx`
- Test: `tests/settings-ui.test.ts`

**Interfaces:**
- Consumes: `/api/config` e `/api/config/test-connection`
- Produces: Tela de configurações interativa, visualmente rica, com seleção de provedor ativo, inputs de API key com toggle de visibilidade e feedback de status em tempo real.

- [ ] **Step 1: Criar componentes modulares de configuração**

Inputs dedicados para cada provedor com máscara de segurança, URL customizável para Ollama/OmniRoute e seletor de modelos populares.

- [ ] **Step 2: Implementar página `app/settings/page.tsx` com feedback visual imediato**

Adicionar toasts de notificação ("Configurações salvas localmente!", "Conexão com Gemini estabelecida com sucesso!").

- [ ] **Step 3: Testar carregamento e persistência das configurações no navegador**

- [ ] **Step 4: Commit**

```bash
git add components/settings/ app/settings/page.tsx
git commit -m "feat: implement settings page with provider switcher and live test"
```

---

### Task 5: Extratores de Texto (PDF/DOCX) e Módulo Meu Perfil com Auto-Preenchimento

**Files:**
- Create: `lib/parser/pdf-parser.ts`
- Create: `lib/parser/docx-parser.ts`
- Create: `app/api/profile/route.ts`
- Create: `app/api/profile/upload/route.ts`
- Create: `components/profile/profile-form.tsx`
- Create: `components/profile/file-dropzone.tsx`
- Create: `app/profile/page.tsx`
- Test: `tests/parser.test.ts`

**Interfaces:**
- Consumes: Arquivo PDF ou DOCX enviado pelo usuário e `UserProfile`
- Produces:
  - `extractTextFromPdf(buffer: Buffer): Promise<string>`
  - `extractTextFromDocx(buffer: Buffer): Promise<string>`
  - `POST /api/profile/upload`: recebe arquivo, extrai texto, chama LLM com `UserProfileSchema` e devolve JSON pré-preenchido.
  - `GET / POST /api/profile`: lê e salva `data/profile.json`.

- [ ] **Step 1: Escrever teste para extração de texto**

```typescript
// tests/parser.test.ts
import { describe, it, expect } from 'vitest';
import { extractTextFromDocx } from '../lib/parser/docx-parser';

describe('Document Text Parsers', () => {
  it('should exist and reject empty buffers gracefully', async () => {
    await expect(extractTextFromDocx(Buffer.from([]))).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Implementar `lib/parser/pdf-parser.ts` com `pdf-parse` e `lib/parser/docx-parser.ts` com `mammoth`**

- [ ] **Step 3: Implementar endpoint `/api/profile/upload` orquestrando o parsing com a LLM ativa**

- [ ] **Step 4: Implementar formulário completo em abas `components/profile/profile-form.tsx` e `app/profile/page.tsx`**

Seções:
1. Dados Pessoais e Redes (LinkedIn, GitHub).
2. Resumo Profissional.
3. Experiências com lista dinâmica (adicionar, editar, remover conquistas e tecnologias).
4. Educação e Cursos.
5. Habilidades categorizadas (Técnicas, Ferramentas, Soft Skills).
6. Projetos e Portfólio.
7. Certificações e Idiomas.

- [ ] **Step 5: Rodar testes e verificar fluxo de upload e salvamento**

- [ ] **Step 6: Commit**

```bash
git add lib/parser/ app/api/profile/ components/profile/ app/profile/ tests/parser.test.ts
git commit -m "feat: implement cv file upload parser and complete profile form"
```

---

### Task 6: Scraper de Vagas de Emprego com Fallback Gracioso

**Files:**
- Create: `lib/scraper/job-scraper.ts`
- Create: `app/api/scrape-job/route.ts`
- Test: `tests/scraper.test.ts`

**Interfaces:**
- Consumes: URL de vaga informada pelo usuário
- Produces: `scrapeJobUrl(url: string): Promise<{ title?: string; company?: string; description: string; isProtected: boolean }>`

- [ ] **Step 1: Escrever teste de sanitização e extração de vagas**

```typescript
// tests/scraper.test.ts
import { describe, it, expect } from 'vitest';
import { cleanHtmlText } from '../lib/scraper/job-scraper';

describe('Job Scraper & Sanitizer', () => {
  it('should strip scripts and extract meaningful job description text', () => {
    const raw = '<html><body><h1>Senior Dev</h1><script>alert(1)</script><p>Requirements: React</p></body></html>';
    const text = cleanHtmlText(raw);
    expect(text).toContain('Senior Dev');
    expect(text).toContain('Requirements: React');
    expect(text).not.toContain('alert(1)');
  });
});
```

- [ ] **Step 2: Implementar `lib/scraper/job-scraper.ts` com `cheerio` e detecção de páginas de login**

- [ ] **Step 3: Implementar endpoint `/api/scrape-job`**

- [ ] **Step 4: Rodar testes**

Executar: `npx vitest run tests/scraper.test.ts`  
Resultado esperado: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/scraper/ app/api/scrape-job/ tests/scraper.test.ts
git commit -m "feat: implement job url scraper with anti-bot fallback"
```

---

### Task 7: Motor Gerador de Currículos e Wizard Interativo (`app/generator/page.tsx`)

**Files:**
- Create: `app/api/generate/route.ts`
- Create: `components/generator/generator-wizard.tsx`
- Create: `components/generator/mode-selector.tsx`
- Create: `components/generator/depth-selector.tsx`
- Create: `app/generator/page.tsx`
- Test: `tests/generator.test.ts`

**Interfaces:**
- Consumes: `UserProfile`, modo escolhido, dados da vaga (se aplicável), profundidade (enxuto/detalhado)
- Produces:
  - `POST /api/generate`: orquestra a chamada de IA com prompt especializado em adaptação de currículo e schema `UserProfile` refinado
  - Interface passo a passo com indicador de progresso e barra de geração animada

- [ ] **Step 1: Implementar rota `/api/generate` com engenharia de prompts de alto impacto**

Diferenciação clara entre:
- **Enxuto**: 2 a 3 bullet points concisos e diretos com métricas rápidas.
- **Detalhado**: 4 a 6 bullet points aprofundados contextualizando desafios, tecnologias e resultados de negócio.

- [ ] **Step 2: Construir o Wizard no frontend `app/generator/page.tsx`**

Passo 1: Modo (Por Cargo / Vaga Alvo / Do Zero).  
Passo 2: Inserção de link ou texto da vaga.  
Passo 3: Nível de Profundidade (Enxuto vs. Detalhado).  
Passo 4: Botão "Gerar com IA" que redireciona para a tela de visualização e edição.

- [ ] **Step 3: Commit**

```bash
git add app/api/generate/ components/generator/ app/generator/
git commit -m "feat: implement resume generation engine and step-by-step wizard"
```

---

### Task 8: Os 5 Templates Visuais Profissionais e o Carrossel de Estilos

**Files:**
- Create: `components/resume-view/templates/modern-minimal.tsx`
- Create: `components/resume-view/templates/executive-slate.tsx`
- Create: `components/resume-view/templates/tech-charcoal.tsx`
- Create: `components/resume-view/templates/classic-serif.tsx`
- Create: `components/resume-view/templates/nordic-warm.tsx`
- Create: `components/resume-view/templates/index.ts`
- Create: `components/resume-view/template-carousel.tsx`
- Test: `tests/templates.test.ts`

**Interfaces:**
- Consumes: `UserProfile` formatado e `templateId` selecionado
- Produces: Renderização dinâmica dos 5 estilos de currículo mantendo tipografia calibrada, cores de fundo profissionais e estrutura ATS-friendly.

- [ ] **Step 1: Escrever teste de renderização e integridade dos 5 templates**

```typescript
// tests/templates.test.ts
import { describe, it, expect } from 'vitest';
import { TEMPLATE_CATALOG } from '../components/resume-view/templates';

describe('Resume Template Catalog', () => {
  it('should have exactly 5 distinct professional templates registered', () => {
    expect(Object.keys(TEMPLATE_CATALOG)).toHaveLength(5);
    expect(TEMPLATE_CATALOG['modern-minimal']).toBeDefined();
    expect(TEMPLATE_CATALOG['executive-slate']).toBeDefined();
    expect(TEMPLATE_CATALOG['tech-charcoal']).toBeDefined();
    expect(TEMPLATE_CATALOG['classic-serif']).toBeDefined();
    expect(TEMPLATE_CATALOG['nordic-warm']).toBeDefined();
  });
});
```

- [ ] **Step 2: Implementar os 5 componentes de template com fidelidade visual**

1. `ModernMinimal`: Fundo branco, divisores `slate-200`, sans-serif geométrica, 1 coluna clássica.
2. `ExecutiveSlate`: Fundo branco com barra lateral `slate-50`, acentos navy (`#1e3a8a`), 2 colunas.
3. `TechCharcoal`: Cabeçalho em carvão escuro (`#18181b`), badges técnicas em cinza discreto.
4. `ClassicSerif`: Fundo marfim suave, títulos serifados refinados (Merriweather/Georgia), alinhamento clássico.
5. `NordicWarm`: Fundo areia suave (`#fdfbf7`), tipografia espresso (`#1c1917`), divisores terracota sutis.

- [ ] **Step 3: Implementar `components/resume-view/template-carousel.tsx`**

Carrossel responsivo com miniaturas ilustrativas, setas de navegação anterior/próximo e seleção rápida com indicador de ativo.

- [ ] **Step 4: Rodar testes**

Executar: `npx vitest run tests/templates.test.ts`  
Resultado esperado: PASS

- [ ] **Step 5: Commit**

```bash
git add components/resume-view/templates/ components/resume-view/template-carousel.tsx tests/templates.test.ts
git commit -m "feat: implement 5 professional resume templates and visual style carousel"
```

---

### Task 9: Canvas A4 com Edição Inline, Exportação PDF e Biblioteca de Histórico

**Files:**
- Create: `components/resume-view/resume-canvas.tsx`
- Create: `components/resume-view/editable-text.tsx`
- Create: `app/api/resumes/route.ts`
- Create: `app/api/resumes/[id]/route.ts`
- Create: `app/resumes/page.tsx`
- Test: `tests/resumes-api.test.ts`

**Interfaces:**
- Consumes: Dados gerados, template ativo e ações do usuário
- Produces:
  - Edição inline direta clicando no texto na folha A4
  - Botão de impressão PDF vetorial com CSS `@media print` otimizado
  - Download de JSON e Markdown
  - Página da Biblioteca (`app/resumes/page.tsx`) com lista de currículos salvos, busca e duplicação

- [ ] **Step 1: Implementar componente de edição inline `editable-text.tsx` e o Canvas A4**

- [ ] **Step 2: Configurar estilos de impressão `@media print` para PDF perfeito**

Garantir margens de 12mm a 15mm, quebras de página suaves (`break-inside: avoid`), e fundo impresso fiel.

- [ ] **Step 3: Implementar rotas `/api/resumes` para listagem, salvamento e deleção**

- [ ] **Step 4: Implementar tela `app/resumes/page.tsx` (Biblioteca com histórico)**

- [ ] **Step 5: Commit**

```bash
git add components/resume-view/ app/api/resumes/ app/resumes/
git commit -m "feat: implement a4 canvas, inline editing, pdf export and resumes library"
```

---

### Task 10: Documentação Técnica Completa e README Enxuto

**Files:**
- Create: `docs/architecture.md`
- Create: `docs/user-guide.md`
- Create: `README.md`

**Interfaces:**
- Consumes: Arquitetura final implementada
- Produces:
  - Documentação completa em `docs/`
  - `README.md` direto e objetivo (apenas pré-requisitos, 2 comandos para rodar e passo a passo de uso)

- [ ] **Step 1: Criar `docs/architecture.md`**

Detalhar a arquitetura, schemas Zod, camada de LLMs do Vercel AI SDK e sistema de arquivos.

- [ ] **Step 2: Criar `docs/user-guide.md`**

Guia prático para obtenção de chaves de API, upload de CV e melhores práticas de geração.

- [ ] **Step 3: Criar `README.md` enxuto na raiz**

Estrutura direta:
1. Requisitos (Node.js 18+).
2. Como rodar (`npm install` e `npm run dev`).
3. 3 passos rápidos para o primeiro currículo gerado.

- [ ] **Step 4: Executar build completo da aplicação para validação final**

Executar: `npm run build`  
Resultado esperado: Build 100% verde sem erros de tipagem.

- [ ] **Step 5: Commit**

```bash
git add docs/ README.md
git commit -m "docs: add technical documentation and lean quickstart readme"
```
