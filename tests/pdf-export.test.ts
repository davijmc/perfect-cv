import { describe, it, expect } from 'vitest';
import { renderResumePdfBuffer, cleanPdfText } from '../lib/pdf/resume-pdf-document';
import { extractTextFromPdf } from '../lib/parser/pdf-parser';
import { UserProfileSchema, UserProfile, TemplateId } from '../lib/ai/schemas';

const sampleProfile: UserProfile = UserProfileSchema.parse({
  personalInfo: {
    fullName: 'Davi Silva',
    title: 'Engenheiro de Software Sênior',
    email: 'davi@example.com',
    phone: '(11) 98888-7777',
    location: 'São Paulo, SP',
    linkedinUrl: 'linkedin.com/in/davisilva',
    githubUrl: 'github.com/davisilva',
    portfolioUrl: 'davisilva.dev',
  },
  summary:
    'Engenheiro de Software com 6 anos de experiência construindo arquiteturas distribuídas e aplicações web escaláveis.',
  keyResults: [
    'Reduziu o tempo de deploy de 40 para 8 minutos com pipelines CI/CD.',
    'Economizou R$ 120 mil ao ano otimizando instâncias em nuvem AWS.',
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'Tech Corp Brasil',
      role: 'Tech Lead Full Stack',
      location: 'Remoto',
      startDate: '2022-01',
      endDate: 'Presente',
      isCurrent: true,
      highlights: [
        'Arquitetou microsserviços em Go e TypeScript para 500 mil usuários ativos.',
        'Liderou migração de banco de dados PostgreSQL com zero downtime.',
      ],
      technologies: ['TypeScript', 'Go', 'PostgreSQL', 'Kubernetes'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Beyond Rocket Telemetry',
      description: 'Sistema de telemetria aeroespacial em tempo real.',
      technologies: ['Python', 'C++'],
      link: 'github.com/davisilva/rocket',
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'UNIFEI',
      degree: 'Bacharelado',
      fieldOfStudy: 'Engenharia de Computação',
      startDate: '2021',
      endDate: '2026',
    },
  ],
  skills: {
    technical: ['TypeScript', 'Go', 'Python', 'React'],
    toolsAndCloud: ['AWS', 'Docker', 'Kubernetes'],
    softSkills: ['Liderança Técnica', 'Comunicação Assertiva'],
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024',
    },
  ],
  languages: [
    {
      id: 'lang-1',
      language: 'Inglês',
      level: 'Avançado',
    },
  ],
});

const ALL_TEMPLATES: TemplateId[] = [
  'modern-minimal',
  'executive-slate',
  'tech-charcoal',
  'classic-serif',
  'nordic-warm',
];

describe('Vector PDF Engine (renderResumePdfBuffer)', () => {
  it('normalizes exotic whitespace and non-breaking hyphens in cleanPdfText', () => {
    expect(cleanPdfText('Desenvolvedor\u00A0Full\u2011Stack   Sênior')).toBe(
      'Desenvolvedor Full-Stack Sênior'
    );
  });

  it.each(ALL_TEMPLATES)(
    'generates valid vector PDF with 100% selectable and copyable text for template %s',
    async (templateId) => {
      const pdfBuffer = await renderResumePdfBuffer({
        content: sampleProfile,
        templateId,
        density: 'normal',
        language: 'pt',
        forceOnePage: true,
        title: 'Currículo Davi Silva',
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

      const extracted = await extractTextFromPdf(pdfBuffer);

      // Verifica se os textos e frases com acentuação e espaços são extraídos perfeitamente sem colar palavras
      expect(extracted).toContain('davi@example.com');
      expect(extracted).toContain('Tech Corp Brasil');
      expect(extracted).toContain('Tech Lead Full Stack');
      expect(extracted).toContain('Reduziu o tempo de deploy de 40 para 8 minutos');
      expect(extracted).toContain('Arquitetou microsserviços em Go e TypeScript');
      expect(extracted).toContain('Beyond Rocket Telemetry');
      expect(extracted).toContain('Engenharia de Computação');
      expect(extracted).toContain('UNIFEI');
      expect(extracted).toContain('TypeScript, Go, Python, React');
      expect(extracted).toContain('AWS Certified Solutions Architect');
      expect(extracted).toContain('Inglês (Avançado)');
    }
  );

  it('generates English headers and Present label when language is "en"', async () => {
    const pdfBuffer = await renderResumePdfBuffer({
      content: sampleProfile,
      templateId: 'modern-minimal',
      density: 'compact',
      language: 'en',
      forceOnePage: true,
    });

    const extracted = await extractTextFromPdf(pdfBuffer);
    expect(extracted).toContain('PROFESSIONAL SUMMARY');
    expect(extracted).toContain('KEY ACHIEVEMENTS');
    expect(extracted).toContain('PROFESSIONAL EXPERIENCE');
    expect(extracted).toContain('Present');
    expect(extracted).toContain('Bacharelado in Engenharia de Computação');
  });
});
