# Adequação Total à Vaga, Compatibilidade ATS e Edição Completa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir que o Perfect CV gere currículos 100% alinhados à vaga pretendida (sem contradições nos prompts), exiba todas as seções sem ruídos para sistemas ATS nos 5 templates, permita edição inline de todos os campos no Canvas e valide deterministicamente a aprovação ATS em tempo real.

**Architecture:** Pipeline unificado direto (Abordagem A) com prompts enxutos separando âncoras fatuais imutáveis (empresas, datas, instituições) de zonas de adequação total (título, resumo, resultados, highlights, tecnologias, skills e projetos), auto-diagnóstico no Wizard quando o usuário pular etapas, padronização semântica ATS e edição completa nos 5 templates React, e módulo puro `lib/ai/ats-validator.ts` integrado ao `ResumeCanvas`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Vercel AI SDK (`ai`), Zod, Vitest.

## Global Constraints

- Nomes de empresas, datas de experiência e instituições de ensino do perfil mestre são âncoras imutáveis; título, resumo, `keyResults`, bullets, tecnologias e skills devem cobrir integralmente os requisitos da vaga.
- Zero chamadas extras de LLM para validação ATS: o cálculo de aderência ATS deve ser 100% determinístico e instantâneo em código (`lib/ai/ats-validator.ts`).
- Todos os 5 templates (`modern-minimal`, `executive-slate`, `tech-charcoal`, `classic-serif`, `nordic-warm`) devem renderizar todas as seções preenchidas do `UserProfile`, sem emojis Unicode na camada de texto e com títulos de seção padronizados para ATS.
- Todos os campos exibidos na folha A4 devem ser editáveis via `InlineText`.

---

### Task 1: Prompts Sem Contradições e Fluxo Automático de Vaga

**Files:**
- Modify: `lib/ai/prompts.ts`
- Modify: `app/api/generate/route.ts`
- Modify: `components/generator/generator-wizard.tsx`
- Test: `tests/prompts.test.ts`
- Test: `tests/analyze-prompts.test.ts`
- Test: `tests/generator-wizard.test.ts`

**Interfaces:**
- Modify `RESUME_GENERATOR_SYSTEM_PROMPT` and `buildGenerateResumeUserPrompt` in `lib/ai/prompts.ts` (remove `buildRetryFeedback`).
- Update `GeneratorWizard` in `components/generator/generator-wizard.tsx` to auto-scrape URL if description is empty and auto-analyze job if `jobAnalysis` is null before generating in `job_specific` mode.

- [ ] **Step 1: Atualizar testes de prompts para exigir separação de Âncoras Imutáveis vs Adequação Total e ausência de contradição**
- [ ] **Step 2: Rodar testes de prompts para verificar falha (RED)**
- [ ] **Step 3: Atualizar `lib/ai/prompts.ts`, `app/api/generate/route.ts` e `components/generator/generator-wizard.tsx`**
- [ ] **Step 4: Rodar testes para verificar aprovação (GREEN) e fazer commit**

---

### Task 2: Validador e Auditor ATS Determinístico (`lib/ai/ats-validator.ts`)

**Files:**
- Create: `lib/ai/ats-validator.ts`
- Test: `tests/ats-validator.test.ts`

**Interfaces:**
- Produces `evaluateAtsCompliance(resume: GeneratedResume): AtsValidationReport`, `AtsCheckItem`, `AtsValidationReport`.

- [ ] **Step 1: Escrever testes unitários abrangentes em `tests/ats-validator.test.ts` (RED)**
- [ ] **Step 2: Rodar `npx vitest run tests/ats-validator.test.ts` para confirmar falha**
- [ ] **Step 3: Implementar `lib/ai/ats-validator.ts` (GREEN)**
- [ ] **Step 4: Rodar testes para confirmar aprovação e fazer commit**

---

### Task 3: Completude 100%, Semântica ATS e Edição Inline Total nos 5 Templates

**Files:**
- Modify: `components/resume-view/templates/modern-minimal.tsx`
- Modify: `components/resume-view/templates/executive-slate.tsx`
- Modify: `components/resume-view/templates/tech-charcoal.tsx`
- Modify: `components/resume-view/templates/classic-serif.tsx`
- Modify: `components/resume-view/templates/nordic-warm.tsx`
- Test: `tests/templates.test.ts`

**Interfaces:**
- All 5 templates consume `TemplateComponentProps` (`content`, `onUpdateContent`, `isEditable`, `density`) and render all sections (`personalInfo` with `portfolioUrl`, `summary`, `keyResults`, `experiences` with `technologies`, `projects`, `education`, `skills.technical`, `skills.toolsAndCloud`, `skills.softSkills`, `languages`, `certifications`) with standard ATS headers, zero contact emojis, and full `InlineText` editing.

- [ ] **Step 1: Expandir `tests/templates.test.ts` para verificar todas as seções, ausência de emojis e cabeçalhos ATS nos 5 templates (RED)**
- [ ] **Step 2: Rodar `npx vitest run tests/templates.test.ts` para confirmar falha**
- [ ] **Step 3: Atualizar os 5 templates com todas as seções, cabeçalhos ATS, sem emojis e edição inline completa (GREEN)**
- [ ] **Step 4: Rodar `npx vitest run tests/templates.test.ts` e fazer commit**

---

### Task 4: Painel Checklist ATS no Canvas e Correção de Exportação PDF/Markdown

**Files:**
- Create: `components/resume-view/ats-checklist-panel.tsx`
- Modify: `components/resume-view/resume-canvas.tsx`
- Modify: `app/globals.css`
- Test: `tests/ats-checklist-panel.test.ts`

**Interfaces:**
- `AtsChecklistPanel` consumes `report: AtsValidationReport` and `onAddKeyword?: (keyword: string) => void`.
- `ResumeCanvas` renders `AtsChecklistPanel`, updates `handleCopyMarkdown` with all sections, and fixes `.print-force-one-page` scaling without clipping.

- [ ] **Step 1: Escrever teste `tests/ats-checklist-panel.test.ts` (RED)**
- [ ] **Step 2: Rodar `npx vitest run tests/ats-checklist-panel.test.ts` para confirmar falha**
- [ ] **Step 3: Implementar `components/resume-view/ats-checklist-panel.tsx`, atualizar `components/resume-view/resume-canvas.tsx` e `app/globals.css` (GREEN)**
- [ ] **Step 4: Rodar suíte completa de testes (`npm test`) e `npx tsc --noEmit`, e fazer commit**
