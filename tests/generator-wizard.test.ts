import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeneratorWizard } from '../components/generator/generator-wizard';

describe('GeneratorWizard Component', () => {
  it('inicia diretamente no objetivo do currículo sem exibir modo simples', () => {
    const html = renderToStaticMarkup(
      React.createElement(GeneratorWizard, { onGenerated: () => {} })
    );

    expect(html).toContain('Qual é o objetivo deste currículo?');
    expect(html).not.toContain('Modo Simples');
    expect(html).toContain('Gerar Currículo com Resultados');
  });

  it('renderiza os objetivos do currículo, opção de idioma (Português e Inglês) e templates', () => {
    const html = renderToStaticMarkup(
      React.createElement(GeneratorWizard, { onGenerated: () => {} })
    );

    expect(html).toContain('Específico para uma Vaga');
    expect(html).toContain('Português (PT-BR)');
    expect(html).toContain('Inglês (EN-US)');
    expect(html).toContain('Modern Minimal');
    expect(html).toContain('Executive Slate');
  });
});
