import { describe, it, expect } from 'vitest';
import { evaluateAtsCompliance } from '../lib/ai/ats-validator';
import { GeneratedResumeSchema } from '../lib/ai/schemas';

describe('evaluateAtsCompliance (ATS Deterministic Validator)', () => {
  const buildSampleResume = (overrides: Record<string, any> = {}) =>
    GeneratedResumeSchema.parse({
      id: 'cv-test-1',
      createdAt: '2026-10-30T12:00:00Z',
      updatedAt: '2026-10-30T12:00:00Z',
      title: 'Senior Data Scientist - Acme',
      assistantLevel: 'advanced',
      mode: 'job_specific',
      depth: 'lean',
      templateId: 'modern-minimal',
      targetRole: 'Senior Data Scientist',
      jobAnalysis: {
        jobTitle: 'Senior Data Scientist',
        company: 'Acme',
        summary: 'Vaga focada em Python, AWS e Machine Learning.',
        matchPercentage: 100,
        requirements: [
          { text: 'Python', category: 'tech', importance: 'required', status: 'supported', evidence: '' },
          { text: 'Machine Learning', category: 'tech', importance: 'required', status: 'supported', evidence: '' },
          { text: 'Docker e AWS', category: 'tech', importance: 'required', status: 'supported', evidence: '' },
        ],
      },
      content: {
        personalInfo: {
          fullName: 'Davi Moreira',
          title: 'Senior Data Scientist',
          email: 'davi@example.com',
          phone: '(37) 99999-9999',
          location: 'Itajubá-MG',
          linkedinUrl: 'linkedin.com/in/davi',
          githubUrl: 'github.com/davi',
        },
        summary:
          'Senior Data Scientist com 4 anos de experiência projetando modelos de Machine Learning em Python e arquiteturas escaláveis em AWS e Docker, gerando redução de 35% em custos operacionais.',
        keyResults: [
          'Reduziu em 35% o tempo de inferência de modelos de Machine Learning em produção na AWS.',
          'Automatizou pipelines de dados com Python e Docker para mais de 50 mil usuários.',
        ],
        experiences: [
          {
            id: 'exp-1',
            company: 'A3Data',
            role: 'Data Scientist',
            startDate: '2024-01',
            endDate: 'Presente',
            isCurrent: true,
            location: 'Remoto',
            highlights: [
              'Desenvolveu modelos preditivos de Machine Learning em Python, aumentando a precisão em 22%.',
              'Implementou microsserviços conteinerizados com Docker na nuvem AWS.',
            ],
            technologies: ['Python', 'Machine Learning', 'Docker', 'AWS'],
          },
        ],
        education: [
          {
            id: 'edu-1',
            institution: 'UNIFEI',
            degree: 'Bacharelado',
            fieldOfStudy: 'Engenharia de Computação',
            startDate: '2021-01',
            endDate: '2026-12',
          },
        ],
        skills: {
          technical: ['Python', 'Machine Learning', 'SQL', 'Scikit-Learn'],
          toolsAndCloud: ['AWS', 'Docker', 'Git'],
          softSkills: ['Liderança Técnica', 'Problem Solving'],
        },
        projects: [],
        certifications: [],
        languages: [{ id: 'l-1', language: 'Inglês', level: 'Avançado' }],
      },
      ...overrides,
    });

  it('aprova com pontuação alta (>= 90) um currículo completo e alinhado a todos os requisitos da vaga', () => {
    const resume = buildSampleResume();
    const report = evaluateAtsCompliance(resume);

    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.missingKeywords).toHaveLength(0);
    expect(report.matchedKeywords).toEqual(
      expect.arrayContaining(['Python', 'Machine Learning', 'Docker e AWS'])
    );
    expect(report.checks.every((c) => c.passed)).toBe(true);
  });

  it('identifica palavras-chave e requisitos da vaga ausentes no currículo', () => {
    const resume = buildSampleResume({
      jobAnalysis: {
        jobTitle: 'Data Engineer',
        company: 'Acme',
        summary: '',
        matchPercentage: 60,
        requirements: [
          { text: 'Python', category: 'tech', importance: 'required', status: 'supported', evidence: '' },
          { text: 'Apache Spark', category: 'tech', importance: 'required', status: 'not_supported', evidence: '' },
          { text: 'Snowflake', category: 'tech', importance: 'desired', status: 'not_supported', evidence: '' },
        ],
      },
    });

    const report = evaluateAtsCompliance(resume);
    expect(report.matchedKeywords).toContain('Python');
    expect(report.missingKeywords).toContain('Apache Spark');
    expect(report.missingKeywords).toContain('Snowflake');
    expect(report.score).toBeLessThan(90);
  });

  it('sinaliza falha estrutural quando faltam dados de contato ou métricas de impacto', () => {
    const resume = buildSampleResume();
    resume.content.personalInfo.email = '';
    resume.content.personalInfo.phone = '';
    resume.content.keyResults = [];
    resume.content.summary = 'Resumo curto sem números.';
    resume.content.experiences[0].highlights = ['Trabalhou no sistema interno da empresa.'];

    const report = evaluateAtsCompliance(resume);
    const contactCheck = report.checks.find((c) => c.id === 'contact');
    const metricsCheck = report.checks.find((c) => c.id === 'metrics');

    expect(contactCheck?.passed).toBe(false);
    expect(metricsCheck?.passed).toBe(false);
  });
});

