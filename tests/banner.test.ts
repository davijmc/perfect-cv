import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UnverifiedClaimsBanner } from '../components/resume-view/unverified-claims-banner';
import { UserProfileSchema } from '../lib/ai/schemas';

describe('UnverifiedClaimsBanner', () => {
  const profile = UserProfileSchema.parse({ personalInfo: { fullName: 'Teste' } });

  it('retorna null se não houver claims', () => {
    const html = renderToStaticMarkup(
      React.createElement(UnverifiedClaimsBanner, {
        claims: [],
        content: profile,
        onDismiss: () => {},
      })
    );
    expect(html).toBe('');
  });

  it('renderiza banner no-print com os trechos e números destacados quando houver claims', () => {
    const claims = [
      {
        path: 'keyResults[0]',
        text: '+R$ 50M de ROI gerado para clientes.',
        numbers: ['50M'],
      },
    ];
    const html = renderToStaticMarkup(
      React.createElement(UnverifiedClaimsBanner, {
        claims,
        content: profile,
        onDismiss: () => {},
      })
    );
    expect(html).toContain('no-print');
    expect(html).toContain('Métricas e resultados sugeridos pela IA para você revisar');
    expect(html).toContain('+R$ 50M de ROI gerado para clientes.');
    expect(html).toContain('50M');
    expect(html).toContain('Principais resultados · item 1');
  });
});
