# Modos Simples e Avançado (Diagnóstico de Vaga + Resultados) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o seletor de modo (Simples vs Avançado) no gerador de currículos, com diagnóstico automatizado de requisitos de vaga (atendidos vs ausentes), adequação com resultados comprovados (`keyResults`) no modo avançado e geração direta no modo simples.

**Architecture:** 
- Novos schemas Zod (`JobRequirementItemSchema`, `JobAnalysisResultSchema`) e atualização de `GeneratedResumeSchema`.
- Endpoint `POST /api/analyze-job` com `JOB_ANALYZER_SYSTEM_PROMPT` para diagnosticar requisitos (`supported`, `partial`, `not_supported`) contra o perfil mestre.
- Ajustes em `/api/generate` para forçar `keyResults = []` no modo simples e enriquecer o prompt no modo avançado.
- Refatoração do `GeneratorWizard` com o Passo 0 (Modo Simples vs Avançado) e componente `JobAnalysisCard` para o fluxo em 2 etapas no modo avançado.

**Tech Stack:** Next.js 16 (App Router), Vercel AI SDK v7 (`generateObject`), Zod 4, React 19, Tailwind 4, Vitest 5, Lucide React.

**Spec:** `docs/superpowers/specs/2026-10-28-modo-simples-avancado-diagnostico-design.md`

## Global Constraints

- Nenhuma dependência externa nova.
- Modo Simples: `keyResults` é sempre lista vazia `[]`.
- Modo Avançado: exige descrição de vaga; primeiro analisa os requisitos, depois adequa e gera com `keyResults`.
- Transparência radical: a IA nunca inventa qualificações para requisitos ausentes.
- Toda copy em português do Brasil com acessibilidade e IDs únicos.
- Guarda determinística de números permanece ativa para todos os modos.

---

## File Structure

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `lib/ai/schemas.ts` | Modificar | Schemas de análise de vaga e `assistantLevel` no currículo |
| `tests/schemas-analysis.test.ts` | Criar | Testes de validação dos novos schemas de análise de vaga |
| `lib/ai/prompts.ts` | Modificar | Prompt de diagnóstico de vaga (`JOB_ANALYZER_SYSTEM_PROMPT`) e adaptação do prompt de geração |
| `tests/analyze-prompts.test.ts` | Criar | Testes de construção de prompts do analisador de vaga |
| `app/api/analyze-job/route.ts` | Criar | API Route Handler para diagnosticar vaga contra o perfil mestre |
| `app/api/generate/route.ts` | Modificar | Suporte a `assistantLevel` (`simple` vs `advanced`) e `jobAnalysis` |
| `components/generator/job-analysis-card.tsx` | Criar | Visualização interativa da matriz de requisitos (atendidos, parciais e gaps) |
| `components/generator/generator-wizard.tsx` | Modificar | Passo 0 (Simples vs Avançado) e fluxo de 2 etapas |

---

### Task 1: Schemas de Análise de Vaga e Nível de Assistente

**Files:**
- Modify: `lib/ai/schemas.ts`
- Test: `tests/schemas-analysis.test.ts`

**Interfaces:**
- Produces:
  - `RequirementStatusEnum`: `'supported' | 'partial' | 'not_supported'`
  - `JobRequirementItemSchema`, `type JobRequirementItem`
  - `JobAnalysisResultSchema`, `type JobAnalysisResult`
  - `GeneratedResumeSchema.assistantLevel`: `'simple' | 'advanced'`
  - `GeneratedResumeSchema.jobAnalysis?: JobAnalysisResult`

- [ ] **Step 1: Write failing test** — `tests/schemas-analysis.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  JobAnalysisResultSchema,
  GeneratedResumeSchema,
  TemplateIdEnum,
  UserProfileSchema,
} from '../lib/ai/schemas';

describe('JobAnalysisResultSchema', () => {
  it('valida estrutura correta de análise de vaga', () => {
    const raw = {
      jobTitle: 'Desenvolvedor Frontend Sênior',
      company: 'TechCorp',
      summary: 'Vaga focada em React e TypeScript.',
      requirements: [
        {
          text: '5+ anos de experiência com React',
          category: 'tech',
          importance: 'required',
          status: 'supported',
          evidence: 'Atuou 6 anos com React na Acme Corp.',
        },
        {
          text: 'Conhecimento em Rust',
          category: 'tech',
          importance: 'desired',
          status: 'not_supported',
        },
      ],
      matchPercentage: 75,
    };

    const parsed = JobAnalysisResultSchema.parse(raw);
    expect(parsed.jobTitle).toBe('Desenvolvedor Frontend Sênior');
    expect(parsed.requirements).toHaveLength(2);
    expect(parsed.requirements[0].status).toBe('supported');
    expect(parsed.requirements[1].status).toBe('not_supported');
    expect(parsed.matchPercentage).toBe(75);
  });
});

describe('GeneratedResumeSchema with assistantLevel', () => {
  it('suporta assistantLevel simple e advanced com jobAnalysis opcional', () => {
    const resume = GeneratedResumeSchema.parse({
      id: 'test-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'CV Teste',
      mode: 'job_specific',
      depth: 'lean',
      templateId: 'modern-minimal',
      assistantLevel: 'advanced',
      content: UserProfileSchema.parse({ personalInfo: { fullName: 'Davi' } }),
      jobAnalysis: {
        jobTitle: 'Dev',
        requirements: [],
        matchPercentage: 90,
      },
    });

    expect(resume.assistantLevel).toBe('advanced');
    expect(resume.jobAnalysis?.matchPercentage).toBe(90);
  });

  it('tem default simple para assistantLevel', () => {
    const resume = GeneratedResumeSchema.parse({
      id: 'test-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'CV Simples',
      content: UserProfileSchema.parse({ personalInfo: { fullName: 'Davi' } }),
    });

    expect(resume.assistantLevel).toBe('simple');
    expect(resume.jobAnalysis).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/schemas-analysis.test.ts`
Expected: FAIL (`JobAnalysisResultSchema` não exportado).

- [ ] **Step 3: Implement schemas in `lib/ai/schemas.ts`**

Adicionar as definições de `RequirementStatusEnum`, `JobRequirementItemSchema`, `JobAnalysisResultSchema` e atualizar `GeneratedResumeSchema`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/schemas-analysis.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/ai/schemas.ts tests/schemas-analysis.test.ts
git commit -m "feat(schemas): adiciona schemas para diagnostico de vaga e assistantLevel"
```

---

### Task 2: Prompts do Analisador de Vagas e Ajuste do Gerador

**Files:**
- Modify: `lib/ai/prompts.ts`
- Test: `tests/analyze-prompts.test.ts`

**Interfaces:**
- Produces:
  - `JOB_ANALYZER_SYSTEM_PROMPT: string`
  - `buildJobAnalysisPrompt(params: { profile: any; rawDescription: string; jobTitle?: string; company?: string }): string`
  - `buildGenerateResumeUserPrompt(params & { assistantLevel?: 'simple' | 'advanced'; jobAnalysis?: JobAnalysisResult }): string`

- [ ] **Step 1: Write failing test** — `tests/analyze-prompts.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  JOB_ANALYZER_SYSTEM_PROMPT,
  buildJobAnalysisPrompt,
  buildGenerateResumeUserPrompt,
} from '../lib/ai/prompts';

describe('JOB_ANALYZER_SYSTEM_PROMPT', () => {
  it('define regras estritas de classificação sem alucinação de evidência', () => {
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('supported');
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('not_supported');
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('partial');
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('NUNCA invente');
  });
});

describe('buildJobAnalysisPrompt', () => {
  it('monta prompt delimitando perfil e vaga', () => {
    const prompt = buildJobAnalysisPrompt({
      profile: { personalInfo: { fullName: 'Davi' }, experiences: [] },
      rawDescription: 'Procuramos dev Go.',
      jobTitle: 'Go Developer',
      company: 'Acme',
    });
    expect(prompt).toContain('Go Developer');
    expect(prompt).toContain('Acme');
    expect(prompt).toContain('<<<VAGA');
    expect(prompt).toContain('Procuramos dev Go.');
  });
});

describe('buildGenerateResumeUserPrompt with assistantLevel', () => {
  it('instrui esvaziamento de keyResults quando assistantLevel for simple', () => {
    const prompt = buildGenerateResumeUserPrompt({
      profile: { summary: 'x' },
      mode: 'job_specific',
      depth: 'lean',
      assistantLevel: 'simple',
    });
    expect(prompt).toContain('MODO SIMPLES');
    expect(prompt).toContain('Deixe o campo keyResults como lista vazia');
  });

  it('inclui contexto de requisitos diagnosticados quando assistantLevel for advanced', () => {
    const prompt = buildGenerateResumeUserPrompt({
      profile: { summary: 'x' },
      mode: 'job_specific',
      depth: 'detailed',
      assistantLevel: 'advanced',
      jobAnalysis: {
        jobTitle: 'Dev',
        summary: 'Foco em Go',
        matchPercentage: 80,
        requirements: [
          { text: 'Docker', category: 'tech', importance: 'required', status: 'supported', evidence: 'Usa Docker diário' },
          { text: 'Kubernetes', category: 'tech', importance: 'required', status: 'not_supported', evidence: '' },
        ],
      },
    });
    expect(prompt).toContain('MODO AVANÇADO');
    expect(prompt).toContain('Docker (supported)');
    expect(prompt).toContain('Kubernetes (not_supported)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/analyze-prompts.test.ts`
Expected: FAIL (`buildJobAnalysisPrompt` não existe).

- [ ] **Step 3: Implement in `lib/ai/prompts.ts`**

Adicionar `JOB_ANALYZER_SYSTEM_PROMPT`, `buildJobAnalysisPrompt` e atualizar `buildGenerateResumeUserPrompt`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/analyze-prompts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add lib/ai/prompts.ts tests/analyze-prompts.test.ts
git commit -m "feat(ai): adiciona prompts para analise de vaga e suporte a modo simples/avancado"
```

---

### Task 3: Endpoint de Backend `/api/analyze-job`

**Files:**
- Create: `app/api/analyze-job/route.ts`

**Interfaces:**
- Consumes: `loadConfig`, `loadProfile`, `getAIModelInstance`, `JobAnalysisResultSchema`, `JOB_ANALYZER_SYSTEM_PROMPT`, `buildJobAnalysisPrompt`
- Produces: `POST /api/analyze-job` -> `{ success: true, analysis: JobAnalysisResult }`

- [ ] **Step 1: Implement `app/api/analyze-job/route.ts`**

Carrega perfil mestre e chave de IA, chama `generateObject` com `JobAnalysisResultSchema`, calcula `matchPercentage` caso a IA não tenha calculado adequadamente e retorna o resultado.

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: PASS sem erros.

- [ ] **Step 3: Commit Task 3**

```bash
git add app/api/analyze-job/route.ts
git commit -m "feat(api): cria rota /api/analyze-job para diagnostico de requisitos de vaga"
```

---

### Task 4: Atualização da Rota `/api/generate`

**Files:**
- Modify: `app/api/generate/route.ts`

**Interfaces:**
- Consumes: `body.assistantLevel`, `body.jobAnalysis`
- Produces: `newResume.assistantLevel`, `newResume.jobAnalysis`
- Behavior:
  - Se `assistantLevel === 'simple'`, força `tailoredProfile.keyResults = []`.
  - Se `assistantLevel === 'advanced'`, mantém até 4 itens de `keyResults`.

- [ ] **Step 1: Modify `app/api/generate/route.ts`**

Extrair `assistantLevel` e `jobAnalysis` do corpo da requisição. Se `assistantLevel === 'simple'`, sanitizar `tailoredProfile.keyResults = []`. Salvar ambos os campos em `newResume`.

- [ ] **Step 2: Verify typecheck & tests**

Run: `npx tsc --noEmit && npm test`
Expected: PASS.

- [ ] **Step 3: Commit Task 4**

```bash
git add app/api/generate/route.ts
git commit -m "feat(generate): suporta assistantLevel e integracao com analise de vaga"
```

---

### Task 5: Componente Visual `JobAnalysisCard`

**Files:**
- Create: `components/generator/job-analysis-card.tsx`
- Test: `tests/job-analysis-card.test.ts`

**Interfaces:**
- Produces: `JobAnalysisCard({ analysis: JobAnalysisResult, onProceed: () => void, isProceeding: boolean })`

- [ ] **Step 1: Write test for `JobAnalysisCard`** — `tests/job-analysis-card.test.ts`

Testar renderização dos requisitos atendidos (verde), ausentes (vermelho) e percentual de aderência.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/job-analysis-card.test.ts`
Expected: FAIL (componente inexistente).

- [ ] **Step 3: Implement `components/generator/job-analysis-card.tsx`**

Componente visual rico com:
- Header com cargo e empresa identificados.
- Barra de progresso com porcentagem de compatibilidade estimada.
- Grid com 2 colunas:
  - 🟢 **Requisitos Atendidos** (com evidência encontrada).
  - 🔴 **Gaps / Requisitos Ausentes** (com alerta transparente de integridade).
- Seção expansível para requisitos parciais/desejáveis.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/job-analysis-card.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```bash
git add components/generator/job-analysis-card.tsx tests/job-analysis-card.test.ts
git commit -m "feat(ui): componente JobAnalysisCard para visualizacao de aderencia de vaga"
```

---

### Task 6: Integração no `GeneratorWizard` (Passo 0 + Fluxo 2 Etapas)

**Files:**
- Modify: `components/generator/generator-wizard.tsx`

**Interfaces:**
- Interage com `/api/analyze-job` e `/api/generate`.

- [ ] **Step 1: Implement Passo 0 no Wizard**

Adicionar estado `assistantLevel: 'simple' | 'advanced'` (com padrão `'advanced'` para candidaturas a vagas ou `'simple'` comutável).

- [ ] **Step 2: Implementar fluxo de 2 etapas no Modo Avançado**

Quando `assistantLevel === 'advanced'`:
- Etapa 1: Usuário informa a vaga e clica em "Analisar Vaga e Requisitos". Faz fetch em `/api/analyze-job`.
- Exibe o `JobAnalysisCard` com os requisitos atendidos vs ausentes.
- Etapa 2: Botão "Adequar e Gerar Currículo com Resultados" chama `/api/generate` passando `assistantLevel: 'advanced'` e `jobAnalysis`.

Quando `assistantLevel === 'simple'`:
- Mantém o formulário direto e botão "Gerar Currículo (Modo Rápido)" chamando `/api/generate` com `assistantLevel: 'simple'`.

- [ ] **Step 3: Verify with build & test**

Run: `npx tsc --noEmit && npm test`
Expected: PASS.

- [ ] **Step 4: Commit Task 6**

```bash
git add components/generator/generator-wizard.tsx
git commit -m "feat(generator): integra selecao de modo simples/avancado e diagnostico em 2 etapas"
```

---

### Task 7: Verificação Ponta a Ponta

- [ ] Rodar toda a suíte de testes (`npm test`).
- [ ] Rodar typecheck completo (`npx tsc --noEmit`).
- [ ] Testar no navegador com `npm run dev` ativo:
  - Testar Modo Simples: gera em 1 clique sem seção de resultados.
  - Testar Modo Avançado: insere vaga, clica em analisar, visualiza requisitos atendidos e ausentes, clica em adequar e visualiza currículo gerado com resultados.
