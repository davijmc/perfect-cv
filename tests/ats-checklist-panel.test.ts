import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AtsChecklistPanel } from '../components/resume-view/ats-checklist-panel';
import { buildResumeMarkdown } from '../components/resume-view/templates/template-helpers';
import { UserProfileSchema } from '../lib/ai/schemas';
import type { AtsValidationReport } from '../lib/ai/ats-validator';

describe('AtsChecklistPanel Component', () => {
  it('renderiza pontuação ATS, critérios e palavras-chave presentes e pendentes', () => {
    const sampleReport: AtsValidationReport = {
      score: 88,
      checks: [
        { id: 'contact', label: 'Cabeçalho e Contato ATS', passed: true, detail: 'Completo' },
        { id: 'keywords', label: 'Cobertura de Requisitos & Keywords', passed: false, detail: '2/3 encontrados' },
      ],
      matchedKeywords: ['Python', 'AWS'],
      missingKeywords: ['Apache Spark'],
    };

    const html = renderToStaticMarkup(
      React.createElement(AtsChecklistPanel, {
        report: sampleReport,
        onAddMissingKeyword: () => {},
      })
    );

    expect(html).toContain('88%');
    expect(html).toContain('Aprovação ATS');
    expect(html).toContain('Cabeçalho e Contato ATS');
    expect(html).toContain('Python');
    expect(html).toContain('Apache Spark');
  });
});

describe('buildResumeMarkdown', () => {
  it('inclui todas as seções do perfil (projetos, idiomas, certificações, ferramentas, soft skills e portfólio)', () => {
    const profile = UserProfileSchema.parse({
      personalInfo: {
        fullName: 'Davi Silva',
        title: 'Data Scientist',
        email: 'davi@example.com',
        phone: '1199999999',
        location: 'SP',
        portfolioUrl: 'https://davi.dev',
      },
      summary: 'Resumo forte.',
      keyResults: ['Ganho de 30% em eficiência.'],
      experiences: [
        {
          company: 'A3Data',
          role: 'Data Scientist',
          startDate: '2024',
          endDate: 'Presente',
          isCurrent: true,
          highlights: ['Criou pipeline em Python.'],
          technologies: ['Python', 'Docker'],
        },
      ],
      projects: [
        {
          name: 'Beyond Rocket',
          description: 'Telemetria de foguete.',
          technologies: ['C++'],
        },
      ],
      education: [
        {
          institution: 'UNIFEI',
          degree: 'Bacharelado',
          fieldOfStudy: 'Engenharia de Computação',
          endDate: '2026',
        },
      ],
      skills: {
        technical: ['Python', 'SQL'],
        toolsAndCloud: ['AWS', 'Docker'],
        softSkills: ['Liderança'],
      },
      certifications: [{ name: 'ICPC Ouro', issuer: 'SBC', date: '2023' }],
      languages: [{ language: 'Inglês', level: 'Avançado' }],
    });

    const md = buildResumeMarkdown(profile);
    expect(md).toContain('https://davi.dev');
    expect(md).toContain('## Projetos Relevantes');
    expect(md).toContain('Beyond Rocket');
    expect(md).toContain('AWS, Docker');
    expect(md).toContain('Liderança');
    expect(md).toContain('ICPC Ouro');
    expect(md).toContain('Inglês (Avançado)');
  });
});
