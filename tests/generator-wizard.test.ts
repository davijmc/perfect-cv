import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeneratorWizard } from '../components/generator/generator-wizard';

describe('GeneratorWizard Component', () => {
  it('renderiza as opções de Modo Simples e Modo Avançado', () => {
    const html = renderToStaticMarkup(
      React.createElement(GeneratorWizard, { onGenerated: () => {} })
    );

    expect(html).toContain('Modo Simples');
    expect(html).toContain('Modo Avançado');
    expect(html).toContain('Geração rápida em 1 clique');
    expect(html).toContain('Diagnóstico de requisitos');
  });

  it('renderiza os objetivos do currículo e templates', () => {
    const html = renderToStaticMarkup(
      React.createElement(GeneratorWizard, { onGenerated: () => {} })
    );

    expect(html).toContain('Específico para uma Vaga');
    expect(html).toContain('Modern Minimal');
    expect(html).toContain('Executive Slate');
  });
});
