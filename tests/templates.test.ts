import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TEMPLATE_CATALOG } from '../components/resume-view/templates';
import { buildResumeMarkdown } from '../components/resume-view/templates/template-helpers';
import { UserProfileSchema, UserProfile } from '../lib/ai/schemas';

const fullProfile: UserProfile = UserProfileSchema.parse({
  personalInfo: {
    fullName: 'Davi Silva',
    title: 'Engenheiro de Software',
    email: 'davi@example.com',
    phone: '(11) 98888-7777',
    location: 'São Paulo-SP',
    linkedinUrl: 'linkedin.com/in/davisilva',
    githubUrl: 'github.com/davisilva',
    portfolioUrl: 'davisilva.dev',
  },
  summary: 'Resumo com foco em resultados reais.',
  keyResults: ['Reduziu tempo de deploy de 40 para 8 minutos.', 'Economizou R$ 120 mil ao ano.'],
  experiences: [
    {
      company: 'Tech Corp',
      role: 'Dev Senior',
      location: 'Remoto',
      startDate: '2022-01',
      endDate: '2024-01',
      highlights: ['Entregou microsserviços em Go.'],
      technologies: ['Go', 'Kubernetes', 'PostgreSQL'],
    },
  ],
  projects: [
    {
      name: 'Beyond Rocket Design',
      description: 'Sistema de telemetria aeroespacial em tempo real.',
      technologies: ['Python', 'C++'],
      link: 'github.com/davisilva/rocket',
    },
  ],
  education: [
    {
      institution: 'UNIFEI',
      degree: 'Bacharelado',
      fieldOfStudy: 'Engenharia de Computação',
      startDate: '2021',
      endDate: '2026',
    },
  ],
  skills: {
    technical: ['TypeScript', 'Go', 'Python'],
    toolsAndCloud: ['AWS', 'Docker'],
    softSkills: ['Liderança Técnica', 'Comunicação Assertiva'],
  },
  certifications: [
    {
      name: 'Ouro Maratona ICPC',
      issuer: 'SBC',
      date: '2023',
    },
  ],
  languages: [
    {
      language: 'Inglês',
      level: 'Avançado',
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
      const html = renderToStaticMarkup(React.createElement(Component, { content: fullProfile, isEditable: false }));
      expect(html, `Template ${id} deve conter "Principais Resultados"`).toContain('Principais Resultados');
      expect(html).toContain('Reduziu tempo de deploy de 40 para 8 minutos.');
      expect(html).toContain('Economizou R$ 120 mil ao ano.');
    }
  });

  it('omits Principais Resultados when keyResults is empty across all 5 templates', () => {
    const emptyProfile: UserProfile = { ...fullProfile, keyResults: [] };
    for (const [id, t] of Object.entries(TEMPLATE_CATALOG)) {
      const Component = t.component;
      const html = renderToStaticMarkup(React.createElement(Component, { content: emptyProfile, isEditable: false }));
      expect(html, `Template ${id} não deve conter "Principais Resultados" quando vazio`).not.toContain('Principais Resultados');
    }
  });

  it('renders 100% of populated sections (projects, certifications, languages, softSkills, technologies, portfolio) across all 5 templates without emojis', () => {
    for (const [id, t] of Object.entries(TEMPLATE_CATALOG)) {
      const Component = t.component;
      const html = renderToStaticMarkup(
        React.createElement(Component, { content: fullProfile, isEditable: true, onUpdateContent: () => {} })
      );

      // Contato completo incluindo portfolioUrl
      expect(html, `${id} deve exibir portfolioUrl`).toContain('davisilva.dev');
      expect(html, `${id} deve exibir linkedinUrl`).toContain('linkedin.com/in/davisilva');
      expect(html, `${id} deve exibir githubUrl`).toContain('github.com/davisilva');

      // Tecnologias da experiência
      expect(html, `${id} deve exibir technologies da experiência`).toContain('Kubernetes');

      // Projetos Relevantes (sem truncar descrição)
      expect(html, `${id} deve exibir nome do projeto`).toContain('Beyond Rocket Design');
      expect(html, `${id} deve exibir descrição completa do projeto`).toContain(
        'Sistema de telemetria aeroespacial em tempo real.'
      );
      expect(html, `${id} não deve usar classe truncate na descrição do projeto`).not.toContain(
        'truncate">Sistema de telemetria'
      );

      // Skills completas (incluindo softSkills)
      expect(html, `${id} deve exibir softSkills`).toContain('Liderança Técnica');

      // Idiomas e Certificações
      expect(html, `${id} deve exibir idiomas`).toContain('Inglês');
      expect(html, `${id} deve exibir certificações`).toContain('Ouro Maratona ICPC');

      // Ausência de emojis Unicode que quebram parsers ATS
      expect(html, `${id} não deve conter emojis de contato`).not.toMatch(/[📍✉️📞🔗💻]/u);

      // Cabeçalhos ATS padronizados
      expect(html, `${id} deve usar cabeçalho Resumo Profissional`).toContain('Resumo Profissional');
      expect(html, `${id} deve usar cabeçalho Experiência Profissional`).toContain('Experiência Profissional');
    }
  });

  it('renders English ATS section headers across all 5 templates and Markdown when language is "en"', () => {
    for (const [id, t] of Object.entries(TEMPLATE_CATALOG)) {
      const Component = t.component;
      const html = renderToStaticMarkup(
        React.createElement(Component, {
          content: {
            ...fullProfile,
            experiences: [{ ...fullProfile.experiences[0], isCurrent: true }],
          },
          language: 'en',
          isEditable: false,
        })
      );

      expect(html, `${id} should render Professional Summary`).toContain('Professional Summary');
      expect(html, `${id} should render Key Achievements`).toContain('Key Achievements');
      expect(html, `${id} should render Professional Experience`).toContain('Professional Experience');
      expect(html, `${id} should render Relevant Projects`).toContain('Relevant Projects');
      expect(html, `${id} should render Education`).toContain('Education');
      expect(html, `${id} should render Present for current job`).toContain('Present');
      expect(html, `${id} should not render Resumo Profissional when language is en`).not.toContain('Resumo Profissional');
    }

    const mdEn = buildResumeMarkdown(fullProfile, 'en');
    expect(mdEn).toContain('## Professional Summary');
    expect(mdEn).toContain('## Key Achievements');
    expect(mdEn).toContain('## Professional Experience');
    expect(mdEn).toContain('## Relevant Projects');
    expect(mdEn).toContain('## Education');
    expect(mdEn).toContain('## Skills & Technologies');
    expect(mdEn).toContain('## Languages & Certifications');
  });
});
