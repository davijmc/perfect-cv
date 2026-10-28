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

  it('renderiza badge informativa de tipo de sugestão', () => {
    const html = renderToStaticMarkup(
      React.createElement(ProfileSuggestionsTab, {
        profile: sampleProfile,
        initialSuggestions,
        onApplySuggestion: async () => {},
      })
    );

    expect(html).toContain('Adicionar Habilidade');
    expect(html).toContain('Correção de Escrita');
  });
});
