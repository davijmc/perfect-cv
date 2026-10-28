import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TEMPLATE_CATALOG } from '../components/resume-view/templates';
import { UserProfileSchema, UserProfile } from '../lib/ai/schemas';

const baseProfile: UserProfile = UserProfileSchema.parse({
  personalInfo: { fullName: 'Davi Silva', title: 'Engenheiro de Software' },
  summary: 'Resumo com foco em resultados reais.',
  keyResults: ['Reduziu tempo de deploy de 40 para 8 minutos.', 'Economizou R$ 120 mil ao ano.'],
  experiences: [
    {
      company: 'Tech Corp',
      role: 'Dev Senior',
      startDate: '2022-01',
      endDate: '2024-01',
      highlights: ['Entregou microsserviços em Go.'],
    },
  ],
});

describe('Resume Template Catalog', () => {
  it('should have exactly 5 distinct professional templates registered', () => {
    const keys = Object.keys(TEMPLATE_CATALOG);
    expect(keys).toHaveLength(5);
    expect(TEMPLATE_CATALOG['modern-minimal']).toBeDefined();
    expect(TEMPLATE_CATALOG['executive-slate']).toBeDefined();
    expect(TEMPLATE_CATALOG['tech-charcoal']).toBeDefined();
    expect(TEMPLATE_CATALOG['classic-serif']).toBeDefined();
    expect(TEMPLATE_CATALOG['nordic-warm']).toBeDefined();
  });

  it('renders Principais Resultados when keyResults is populated across all 5 templates', () => {
    for (const [id, t] of Object.entries(TEMPLATE_CATALOG)) {
      const Component = t.component;
      const html = renderToStaticMarkup(React.createElement(Component, { content: baseProfile, isEditable: false }));
      expect(html, `Template ${id} deve conter "Principais Resultados"`).toContain('Principais Resultados');
      expect(html).toContain('Reduziu tempo de deploy de 40 para 8 minutos.');
      expect(html).toContain('Economizou R$ 120 mil ao ano.');
    }
  });

  it('omits Principais Resultados when keyResults is empty across all 5 templates', () => {
    const emptyProfile: UserProfile = { ...baseProfile, keyResults: [] };
    for (const [id, t] of Object.entries(TEMPLATE_CATALOG)) {
      const Component = t.component;
      const html = renderToStaticMarkup(React.createElement(Component, { content: emptyProfile, isEditable: false }));
      expect(html, `Template ${id} não deve conter "Principais Resultados" quando vazio`).not.toContain('Principais Resultados');
    }
  });
});
