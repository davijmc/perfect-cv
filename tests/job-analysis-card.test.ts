import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JobAnalysisCard } from '../components/generator/job-analysis-card';
import { JobAnalysisResult } from '../lib/ai/schemas';

const sampleAnalysis: JobAnalysisResult = {
  jobTitle: 'Desenvolvedor Full Stack Sênior',
  company: 'Tech Solutions Inc',
  summary: 'Vaga focada em TypeScript, React e Node com microsserviços.',
  matchPercentage: 75,
  requirements: [
    {
      text: 'Experiência sólida com React e TypeScript',
      category: 'tech',
      importance: 'required',
      status: 'supported',
      evidence: 'Atuou 3 anos desenvolvendo SPAs em React e TS.',
    },
    {
      text: 'Conhecimento em Docker e Kubernetes',
      category: 'tech',
      importance: 'required',
      status: 'not_supported',
      evidence: '',
    },
    {
      text: 'Experiência com GraphQL',
      category: 'tech',
      importance: 'desired',
      status: 'partial',
      evidence: 'Consumiu APIs GraphQL em projetos pontuais.',
    },
  ],
};

describe('JobAnalysisCard Component', () => {
  it('renderiza título da vaga, empresa, resumo e percentual de aderência', () => {
    const html = renderToStaticMarkup(
      React.createElement(JobAnalysisCard, {
        analysis: sampleAnalysis,
        onProceed: () => {},
        onReset: () => {},
      })
    );

    expect(html).toContain('Desenvolvedor Full Stack Sênior');
    expect(html).toContain('Tech Solutions Inc');
    expect(html).toContain('75%');
    expect(html).toContain('Aderência Estimada');
  });

  it('renderiza requisitos atendidos com suas respectivas evidências', () => {
    const html = renderToStaticMarkup(
      React.createElement(JobAnalysisCard, {
        analysis: sampleAnalysis,
        onProceed: () => {},
      })
    );

    expect(html).toContain('Requisitos Atendidos');
    expect(html).toContain('Experiência sólida com React e TypeScript');
    expect(html).toContain('Atuou 3 anos desenvolvendo SPAs em React e TS.');
  });

  it('renderiza requisitos ausentes com aviso explícito de integridade', () => {
    const html = renderToStaticMarkup(
      React.createElement(JobAnalysisCard, {
        analysis: sampleAnalysis,
        onProceed: () => {},
      })
    );

    expect(html).toContain('Gaps / Requisitos Não Encontrados');
    expect(html).toContain('Conhecimento em Docker e Kubernetes');
    expect(html).toContain('A IA não inventará');
  });

  it('renderiza botão para adequar e gerar currículo', () => {
    const html = renderToStaticMarkup(
      React.createElement(JobAnalysisCard, {
        analysis: sampleAnalysis,
        onProceed: () => {},
      })
    );

    expect(html).toContain('Adequar e Gerar Currículo com Resultados');
  });

  it('exibe estado de carregamento quando isProceeding for true', () => {
    const html = renderToStaticMarkup(
      React.createElement(JobAnalysisCard, {
        analysis: sampleAnalysis,
        onProceed: () => {},
        isProceeding: true,
      })
    );

    expect(html).toContain('Gerando');
  });
});
