# Copiloto de Sugestões de Edição do Perfil - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o Copiloto de Sugestões da IA na aba "Meu Perfil", permitindo auditoria inteligente do histórico profissional, sugestão de habilidades implícitas a adicionar, remoção de redundâncias e correção de redação/impacto, com aprovação, edição e rejeição em linhas interativas.

**Architecture:** A IA analisa o `UserProfile` mestre via `POST /api/profile/suggestions` utilizando `generateObject` do Vercel AI SDK com esquema Zod estrito. As sugestões são aplicadas deterministicamente no perfil por uma função pura `applySuggestionToProfile` e salvas no disco via `POST /api/profile`. A UI fica em uma aba dedicada `✨ Sugestões da IA` dentro do `ProfileForm`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Zod, Vercel AI SDK, Lucide Icons, Vitest.

## Global Constraints

- Zero dependências npm externas adicionais.
- Toda copy voltada para o usuário em português do Brasil (pt-BR).
- Aplicação determinística de mudanças no perfil mestre com persistência automática ao aprovar.
- Cada linha de sugestão deve permitir Aprovar, Editar (inline) e Rejeitar.
- 100% dos testes passando (`npm test`) e zero erros no typecheck (`npx tsc --noEmit`).

---

### Task 1: Schemas de Sugestões de Perfil

**Files:**
- Modify: `lib/ai/schemas.ts`
- Test: `tests/profile-suggestions-schemas.test.ts`

**Interfaces:**
- Produces:
  - `SuggestionTypeEnum: z.ZodEnum`
  - `ProfileSuggestionItemSchema: z.ZodObject`
  - `ProfileSuggestionsResponseSchema: z.ZodObject`
  - `ProfileSuggestionItem: type`
  - `ProfileSuggestionsResponse: type`

- [ ] **Step 1: Write failing test** — `tests/profile-suggestions-schemas.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  SuggestionTypeEnum,
  ProfileSuggestionItemSchema,
  ProfileSuggestionsResponseSchema,
} from '../lib/ai/schemas';

describe('Profile Suggestions Schemas', () => {
  it('valida tipo de sugestão aceitável', () => {
    expect(SuggestionTypeEnum.safeParse('add_skill').success).toBe(true);
    expect(SuggestionTypeEnum.safeParse('grammar_style').success).toBe(true);
    expect(SuggestionTypeEnum.safeParse('remove_skill').success).toBe(true);
    expect(SuggestionTypeEnum.safeParse('invalid_type').success).toBe(false);
  });

  it('valida estrutura de item de sugestão', () => {
    const item = {
      id: 'sug-1',
      type: 'add_skill',
      title: 'Adicionar Docker',
      reason: 'Você mencionou deploys de containers',
      targetField: 'skills.toolsAndCloud',
      suggestedValue: 'Docker',
      skillCategory: 'toolsAndCloud',
    };
    const parsed = ProfileSuggestionItemSchema.safeParse(item);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe('pending');
    }
  });

  it('valida resposta agregada de sugestões', () => {
    const res = {
      overallSummary: 'Perfil muito sólido, apenas 2 habilidades a complementar.',
      suggestions: [
        {
          id: 'sug-2',
          type: 'improve_summary',
          title: 'Fortalecer resumo',
          reason: 'Verbos passivos detectados',
          targetField: 'personalInfo.summary',
          originalValue: 'Sou desenvolvedor',
          suggestedValue: 'Engenheiro de Software com foco em sistemas distribuídos',
        },
      ],
    };
    expect(ProfileSuggestionsResponseSchema.safeParse(res).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/profile-suggestions-schemas.test.ts`
Expected: FAIL (`SuggestionTypeEnum` não definido).

- [ ] **Step 3: Implement in `lib/ai/schemas.ts`**

Adicionar as definições de `SuggestionTypeEnum`, `ProfileSuggestionItemSchema` e `ProfileSuggestionsResponseSchema`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/profile-suggestions-schemas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/ai/schemas.ts tests/profile-suggestions-schemas.test.ts
git commit -m "feat(schemas): adiciona schemas para sugestoes de melhoria no perfil"
```

---

### Task 2: Aplicador Determinístico de Sugestões (`suggestion-applier`)

**Files:**
- Create: `lib/profile/suggestion-applier.ts`
- Test: `tests/suggestion-applier.test.ts`

**Interfaces:**
- Consumes: `UserProfile`, `ProfileSuggestionItem`
- Produces:
  - `applySuggestionToProfile(profile: UserProfile, suggestion: ProfileSuggestionItem, customValue?: string): UserProfile`
  - `revertSuggestionFromProfile(profile: UserProfile, suggestion: ProfileSuggestionItem): UserProfile`

- [ ] **Step 1: Write failing test** — `tests/suggestion-applier.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { UserProfileSchema, UserProfile, ProfileSuggestionItem } from '../lib/ai/schemas';
import { applySuggestionToProfile, revertSuggestionFromProfile } from '../lib/profile/suggestion-applier';

const baseProfile: UserProfile = UserProfileSchema.parse({
  personalInfo: { fullName: 'Davi Dev', summary: 'Desenvolvedor backend júnior.' },
  skills: {
    technical: ['Node.js', 'TypeScript'],
    toolsAndCloud: ['Git'],
    softSkills: ['Comunicação'],
  },
  experiences: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      role: 'Backend Dev',
      startDate: '2023-01',
      endDate: 'Presente',
      highlights: ['Responsável por manter APIs e containers.'],
      technologies: ['Node.js'],
    },
  ],
});

describe('applySuggestionToProfile', () => {
  it('adiciona habilidade sem duplicar caso já exista', () => {
    const sug: ProfileSuggestionItem = {
      id: '1',
      type: 'add_skill',
      title: 'Adicionar Docker',
      reason: 'Citado em containers',
      targetField: 'skills.toolsAndCloud',
      suggestedValue: 'Docker',
      skillCategory: 'toolsAndCloud',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.skills.toolsAndCloud).toContain('Docker');

    // Tentar adicionar novamente não duplica
    const dup = applySuggestionToProfile(updated, sug);
    expect(dup.skills.toolsAndCloud.filter((s) => s.toLowerCase() === 'docker')).toHaveLength(1);
  });

  it('permite customizar valor ao aprovar sugestão de habilidade', () => {
    const sug: ProfileSuggestionItem = {
      id: '2',
      type: 'add_skill',
      title: 'Adicionar Cloud',
      reason: 'Infraestrutura',
      targetField: 'skills.toolsAndCloud',
      suggestedValue: 'AWS',
      skillCategory: 'toolsAndCloud',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug, 'AWS Cloud & Terraform');
    expect(updated.skills.toolsAndCloud).toContain('AWS Cloud & Terraform');
  });

  it('remove habilidade especificada', () => {
    const sug: ProfileSuggestionItem = {
      id: '3',
      type: 'remove_skill',
      title: 'Remover Comunicação',
      reason: 'Genérico',
      targetField: 'skills.softSkills',
      suggestedValue: 'Comunicação',
      skillCategory: 'softSkills',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.skills.softSkills).not.toContain('Comunicação');
  });

  it('atualiza o resumo profissional', () => {
    const sug: ProfileSuggestionItem = {
      id: '4',
      type: 'improve_summary',
      title: 'Aprimorar resumo',
      reason: 'Mais impacto',
      targetField: 'personalInfo.summary',
      originalValue: 'Desenvolvedor backend júnior.',
      suggestedValue: 'Engenheiro de Software Backend focado em sistemas resilientes.',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.personalInfo.summary).toBe('Engenheiro de Software Backend focado em sistemas resilientes.');
  });

  it('atualiza highlight de experiência pelo índice', () => {
    const sug: ProfileSuggestionItem = {
      id: '5',
      type: 'improve_highlight',
      title: 'Verbo de ação forte',
      reason: 'Evitar passividade',
      targetField: 'experiences.highlight',
      targetIndex: 0,
      subIndex: 0,
      originalValue: 'Responsável por manter APIs e containers.',
      suggestedValue: 'Desenvolveu e manteve APIs REST em Node.js com arquitetura de containers.',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.experiences[0].highlights[0]).toBe('Desenvolveu e manteve APIs REST em Node.js com arquitetura de containers.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/suggestion-applier.test.ts`
Expected: FAIL (`applySuggestionToProfile` não encontrado).

- [ ] **Step 3: Implement in `lib/profile/suggestion-applier.ts`**

Implementar manipulação pura de objetos clonados, preservando imutabilidade e aplicando alterações com segurança.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/suggestion-applier.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add lib/profile/suggestion-applier.ts tests/suggestion-applier.test.ts
git commit -m "feat(profile): logica de aplicacao deterministica de sugestoes no perfil"
```

---

### Task 3: Prompts e Endpoint da API `/api/profile/suggestions`

**Files:**
- Modify: `lib/ai/prompts.ts`
- Create: `app/api/profile/suggestions/route.ts`
- Test: `tests/profile-suggestions-prompts.test.ts`

**Interfaces:**
- Produces:
  - `PROFILE_SUGGESTIONS_SYSTEM_PROMPT: string`
  - `buildProfileSuggestionsPrompt(profile: UserProfile): string`
  - `POST /api/profile/suggestions` -> `{ success: true, overallSummary: string, suggestions: ProfileSuggestionItem[] }`

- [ ] **Step 1: Write test for prompts** — `tests/profile-suggestions-prompts.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { PROFILE_SUGGESTIONS_SYSTEM_PROMPT, buildProfileSuggestionsPrompt } from '../lib/ai/prompts';
import { UserProfileSchema } from '../lib/ai/schemas';

describe('Profile Suggestions Prompts', () => {
  it('possui diretrizes de ortografia, adicao e remocao de habilidades', () => {
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('add_skill');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('remove_skill');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('grammar_style');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('improve_highlight');
  });

  it('monta prompt serializando o perfil profissional', () => {
    const profile = UserProfileSchema.parse({
      personalInfo: { fullName: 'Davi Teste' },
      experiences: [],
    });
    const prompt = buildProfileSuggestionsPrompt(profile);
    expect(prompt).toContain('Davi Teste');
    expect(prompt).toContain('personalInfo');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/profile-suggestions-prompts.test.ts`
Expected: FAIL (`PROFILE_SUGGESTIONS_SYSTEM_PROMPT` não existe).

- [ ] **Step 3: Implement prompts in `lib/ai/prompts.ts`**

Adicionar `PROFILE_SUGGESTIONS_SYSTEM_PROMPT` e `buildProfileSuggestionsPrompt`.

- [ ] **Step 4: Implement `app/api/profile/suggestions/route.ts`**

Endpoint que valida a chave de IA, consome o perfil enviado (ou carrega do disco), chama `generateObject` com `ProfileSuggestionsResponseSchema` e retorna as sugestões com IDs gerados.

- [ ] **Step 5: Verify with vitest & tsc**

Run: `npx vitest run tests/profile-suggestions-prompts.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add lib/ai/prompts.ts app/api/profile/suggestions/route.ts tests/profile-suggestions-prompts.test.ts
git commit -m "feat(api): endpoint de sugestoes para o perfil mestre e prompts de auditoria"
```

---

### Task 4: Componente Visual `ProfileSuggestionsTab`

**Files:**
- Create: `components/profile/profile-suggestions-tab.tsx`
- Test: `tests/profile-suggestions-tab.test.ts`

**Interfaces:**
- Produces:
  - `ProfileSuggestionsTab(props: { profile: UserProfile; onApplySuggestion: (suggestion: ProfileSuggestionItem, customValue?: string) => Promise<void>; })`

- [ ] **Step 1: Write test for `ProfileSuggestionsTab`** — `tests/profile-suggestions-tab.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProfileSuggestionsTab } from '../components/profile/profile-suggestions-tab';
import { UserProfileSchema, ProfileSuggestionItem } from '../lib/ai/schemas';

const sampleProfile = UserProfileSchema.parse({
  personalInfo: { fullName: 'Davi' },
});

const initialSuggestions: ProfileSuggestionItem[] = [
  {
    id: 'sug-1',
    type: 'add_skill',
    title: 'Adicionar Docker',
    reason: 'Você mencionou containers em suas experiências.',
    targetField: 'skills.toolsAndCloud',
    suggestedValue: 'Docker',
    skillCategory: 'toolsAndCloud',
    status: 'pending',
  },
  {
    id: 'sug-2',
    type: 'grammar_style',
    title: 'Correção no resumo',
    reason: 'Ajuste de concordância',
    targetField: 'personalInfo.summary',
    originalValue: 'desenvolvedor focado em',
    suggestedValue: 'desenvolvedor focado no desenvolvimento de',
    status: 'pending',
  },
];

describe('ProfileSuggestionsTab', () => {
  it('renderiza botão para analisar perfil e as linhas de sugestão', () => {
    const html = renderToStaticMarkup(
      React.createElement(ProfileSuggestionsTab, {
        profile: sampleProfile,
        initialSuggestions,
        onApplySuggestion: async () => {},
      })
    );

    expect(html).toContain('Analisar Perfil com IA');
    expect(html).toContain('Adicionar Docker');
    expect(html).toContain('Você mencionou containers em suas experiências.');
    expect(html).toContain('Aprovar');
    expect(html).toContain('Editar');
    expect(html).toContain('Rejeitar');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/profile-suggestions-tab.test.ts`
Expected: FAIL (`ProfileSuggestionsTab` não existe).

- [ ] **Step 3: Implement `components/profile/profile-suggestions-tab.tsx`**

Criar componente completo com:
- Header com resumo do perfil e botão "✨ Analisar Perfil com IA".
- Filtros por categoria (Todas, Escrita, Habilidades, Remoções, Impacto).
- Linhas interativas com badges coloridas, comparação antes/depois.
- Botão "Aprovar" com loading/feedback.
- Botão "Editar" que abre campo inline com confirmação ou cancelamento.
- Botão "Rejeitar" que descarta a sugestão.
- Feedback de aplicado com botão "Desfazer".

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/profile-suggestions-tab.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add components/profile/profile-suggestions-tab.tsx tests/profile-suggestions-tab.test.ts
git commit -m "feat(ui): componente ProfileSuggestionsTab com linhas interativas de sugestoes"
```

---

### Task 5: Integração da Aba no `ProfileForm` e na Página `Meu Perfil`

**Files:**
- Modify: `components/profile/profile-form.tsx`
- Test: `tests/profile-form-suggestions.test.ts`

**Interfaces:**
- Updates `ProfileForm` to include `{ id: 'suggestions', label: 'Sugestões da IA', icon: Sparkles }` in tabs.
- Connects `applySuggestionToProfile` with automatic `onSave(updatedProfile)`.

- [ ] **Step 1: Write integration test** — `tests/profile-form-suggestions.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProfileForm } from '../components/profile/profile-form';
import { UserProfileSchema } from '../lib/ai/schemas';

describe('ProfileForm with Suggestions Tab', () => {
  it('renderiza a aba Sugestões da IA na lista de abas', () => {
    const profile = UserProfileSchema.parse({
      personalInfo: { fullName: 'Davi Silva' },
    });
    const html = renderToStaticMarkup(
      React.createElement(ProfileForm, {
        initialProfile: profile,
        onSave: async () => {},
        isSaving: false,
      })
    );
    expect(html).toContain('Sugestões da IA');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/profile-form-suggestions.test.ts`
Expected: FAIL (`Sugestões da IA` não encontrado nas abas).

- [ ] **Step 3: Modify `components/profile/profile-form.tsx`**

1. Adicionar aba `suggestions` no array `tabs`.
2. No render da aba `suggestions`, exibir `<ProfileSuggestionsTab profile={profile} onApplySuggestion={handleApplySuggestion} />`.
3. Em `handleApplySuggestion`, chamar `applySuggestionToProfile` e em seguida `onSave(updated)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/profile-form-suggestions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```bash
git add components/profile/profile-form.tsx tests/profile-form-suggestions.test.ts
git commit -m "feat(profile): integra aba de sugestoes da IA no ProfileForm com autosave"
```

---

### Task 6: Verificação Completa e Build

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: 100% dos testes passando.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Compilação de rotas `/api/profile/suggestions` e `/profile` bem-sucedida.

- [ ] **Step 4: Push to branch**

```bash
git push origin feature/impacto-resultados
```
