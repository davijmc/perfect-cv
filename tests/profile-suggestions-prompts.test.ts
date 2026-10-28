import { describe, it, expect } from 'vitest';
import { PROFILE_SUGGESTIONS_SYSTEM_PROMPT, buildProfileSuggestionsPrompt } from '../lib/ai/prompts';
import { UserProfileSchema } from '../lib/ai/schemas';

describe('Profile Suggestions Prompts', () => {
  it('possui diretrizes de ortografia, adicao e remocao de habilidades', () => {
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('add_skill');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('remove_skill');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('grammar_style');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('improve_highlight');
    expect(PROFILE_SUGGESTIONS_SYSTEM_PROMPT).toContain('overallSummary');
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
