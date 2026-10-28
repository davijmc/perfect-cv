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
