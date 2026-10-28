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
    expect(SuggestionTypeEnum.safeParse('improve_highlight').success).toBe(true);
    expect(SuggestionTypeEnum.safeParse('improve_summary').success).toBe(true);
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
      expect(parsed.data.originalValue).toBeUndefined();
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
