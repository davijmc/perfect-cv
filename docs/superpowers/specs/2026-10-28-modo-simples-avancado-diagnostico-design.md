# Design Spec: Modos Simples e Avançado (Diagnóstico de Vaga + Adequação Automática)

**Data:** 2026-10-28
**Status:** Aprovado
**Contexto:** Evolução do gerador de currículos para oferecer duas experiências claras: um modo simples (geração direta e enxuta sem resultados) e um modo avançado (diagnóstico estruturado dos requisitos da vaga com destaque para requisitos ausentes/atendidos, geração de resultados comprovados e adequação automática).

---

## 1. Visão Geral

O usuário terá como primeira decisão no assistente de geração a escolha entre dois modos de trabalho:

1. **Modo Simples (Direto)**:
   - Geração rápida em 1 clique.
   - Suporta Vaga Específica, Cargo Alvo ou Geral.
   - Sem painel prévio de diagnóstico.
   - **Sem inclusão de Principais Resultados** (`keyResults` fixo em `[]`).
   - Focado em agilidade máxima e formato padrão.

2. **Modo Avançado (Diagnóstico Estruturado + Resultados)**:
   - Focado em candidaturas direcionadas com alta assertividade.
   - Requer descrição da vaga (colada ou extraída de link).
   - **Etapa 1 (Diagnóstico)**: IA analisa a vaga, estrutura os requisitos e mapeia contra o perfil mestre (`supported`, `partial`, `not_supported`). Apresenta painel visual destacando requisitos atendidos e requisitos ausentes (gaps), sem inventar fatos.
   - **Etapa 2 (Adequação Automática)**: Usuário revisa o diagnóstico e dispara a geração. A IA reorganiza as experiências reais para responder aos requisitos atendidos, extrai até 4 itens para a seção **Principais Resultados** (`keyResults`) e submete o resultado à guarda determinística de números sem fonte.

---

## 2. Modelagem e Schemas (`lib/ai/schemas.ts`)

### 2.1 Schema de Diagnóstico da Vaga (`JobAnalysisSchema`)

```ts
export const RequirementStatusEnum = z.enum(['supported', 'partial', 'not_supported']);
export type RequirementStatus = z.infer<typeof RequirementStatusEnum>;

export const JobRequirementItemSchema = z.object({
  text: z.string(),
  category: z.enum(['tech', 'experience', 'soft_skill', 'education', 'general']).default('general'),
  importance: z.enum(['required', 'desired']).default('required'),
  status: RequirementStatusEnum,
  evidence: z.string().optional().default(''),
});
export type JobRequirementItem = z.infer<typeof JobRequirementItemSchema>;

export const JobAnalysisResultSchema = z.object({
  jobTitle: z.string().default(''),
  company: z.string().optional().default(''),
  summary: z.string().default(''),
  requirements: z.array(JobRequirementItemSchema).default([]),
  matchPercentage: z.number().min(0).max(100).default(0),
});
export type JobAnalysisResult = z.infer<typeof JobAnalysisResultSchema>;
```

### 2.2 Atualização do `GeneratedResumeSchema`
Acrescentar o campo facultativo:
```ts
assistantLevel: z.enum(['simple', 'advanced']).default('simple'),
jobAnalysis: JobAnalysisResultSchema.optional(),
```

---

## 3. Endpoints de Backend

### 3.1 `POST /api/analyze-job`
- **Entrada:** `{ rawDescription: string; jobTitle?: string; company?: string }`
- **Comportamento:**
  1. Carrega o perfil mestre `loadProfile()`.
  2. Executa `generateObject` usando `JOB_ANALYZER_SYSTEM_PROMPT` e `JobAnalysisResultSchema`.
  3. Compara cada requisito explícito da vaga com o perfil mestre, categorizando como:
     - `supported`: há evidência direta no perfil.
     - `partial`: conhecimento correlato ou experiência relacionada.
     - `not_supported`: não consta no perfil atual.
  4. Calcula `matchPercentage` com base na proporção de requisitos obrigatórios atendidos.
  5. Retorna o objeto validado `{ success: true, analysis: JobAnalysisResult }`.

### 3.2 `POST /api/generate`
- **Entrada ampliada:**
  ```ts
  {
    assistantLevel: 'simple' | 'advanced', // default 'simple'
    mode: 'generic' | 'job_specific' | 'from_scratch',
    depth: 'lean' | 'detailed',
    templateId: TemplateId,
    targetRole?: string,
    targetJobDetails?: { ... },
    jobAnalysis?: JobAnalysisResult
  }
  ```
- **Lógica de Geração:**
  - Se `assistantLevel === 'simple'`:
    - Força `keyResults = []` no objeto gerado.
    - Utiliza o prompt que não gera a seção de resultados.
  - Se `assistantLevel === 'advanced'`:
    - Ativa a geração de até 4 itens de `keyResults`.
    - Injeta a matriz de requisitos diagnosticados no prompt para priorizar fatos suportados.
    - Aplica a guarda de números determinística e regeneração de 1 ciclo caso haja números sem fonte.
    - Salva o resultado com `assistantLevel: 'advanced'` e `jobAnalysis`.

---

## 4. Design da Interface do Usuário (`GeneratorWizard`)

### 4.1 Seletor de Modo no Topo
Card duplo interativo:
- **Modo Direto / Simples**: Ícone de raio (⚡). Subtítulo: *"Geração rápida e limpa em 1 clique. Ideal para exportações objetivas sem seção de resultados."*
- **Modo Avançado (Recomendado para vagas)**: Ícone de alvo com IA (🎯). Subtítulo: *"Diagnóstico profundo da vaga, mapeamento de requisitos ausentes e inclusão da seção de Principais Resultados."*

### 4.2 Fluxo do Modo Avançado na UI
1. Campo de Vaga com opção de URL (com botão "Buscar") ou Textarea.
2. Botão principal: **"Analisar Vaga e Requisitos"**.
3. **Painel de Diagnóstico Interativo**:
   - Barra de aderência estimada (`matchPercentage`).
   - Abas ou blocos claros:
     - 🟢 **Requisitos Atendidos** (com badge e trecho de evidência do perfil).
     - 🔴 **Gaps / Requisitos Ausentes** (com aviso didático: *"A IA não inventará experiências para esses itens, garantindo a sua credibilidade em entrevistas."*).
     - 🟡 **Requisitos Parciais**.
4. Opções de Profundidade e Template visual.
5. Botão de ação: **"Adequar e Gerar Currículo com Resultados"**.

---

## 5. Testes Automatizados

1. `tests/analyze-job.test.ts`:
   - Validação do schema `JobAnalysisResultSchema`.
   - Extração e classificação de requisitos (`supported`, `partial`, `not_supported`).
2. `tests/generate-modes.test.ts`:
   - Modo simples: `keyResults` sempre vazio (`[]`).
   - Modo avançado: permite `keyResults` até 4 itens e preserva `jobAnalysis`.
   - Guarda de números continua ativa para ambos.
