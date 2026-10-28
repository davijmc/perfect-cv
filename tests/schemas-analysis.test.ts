import { describe, it, expect } from 'vitest';
import {
  JobAnalysisResultSchema,
  GeneratedResumeSchema,
  UserProfileSchema,
} from '../lib/ai/schemas';

describe('JobAnalysisResultSchema', () => {
  it('valida estrutura correta de análise de vaga', () => {
    const raw = {
      jobTitle: 'Desenvolvedor Frontend Sênior',
      company: 'TechCorp',
      summary: 'Vaga focada em React e TypeScript.',
      requirements: [
        {
          text: '5+ anos de experiência com React',
          category: 'tech',
          importance: 'required',
          status: 'supported',
          evidence: 'Atuou 6 anos com React na Acme Corp.',
        },
        {
          text: 'Conhecimento em Rust',
          category: 'tech',
          importance: 'desired',
          status: 'not_supported',
        },
      ],
      matchPercentage: 75,
    };

    const parsed = JobAnalysisResultSchema.parse(raw);
    expect(parsed.jobTitle).toBe('Desenvolvedor Frontend Sênior');
    expect(parsed.requirements).toHaveLength(2);
    expect(parsed.requirements[0].status).toBe('supported');
    expect(parsed.requirements[1].status).toBe('not_supported');
    expect(parsed.matchPercentage).toBe(75);
  });
});

describe('GeneratedResumeSchema with assistantLevel', () => {
  it('suporta assistantLevel simple e advanced com jobAnalysis opcional', () => {
    const resume = GeneratedResumeSchema.parse({
      id: 'test-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'CV Teste',
      mode: 'job_specific',
      depth: 'lean',
      templateId: 'modern-minimal',
      assistantLevel: 'advanced',
      content: UserProfileSchema.parse({ personalInfo: { fullName: 'Davi' } }),
      jobAnalysis: {
        jobTitle: 'Dev',
        requirements: [],
        matchPercentage: 90,
      },
    });

    expect(resume.assistantLevel).toBe('advanced');
    expect(resume.jobAnalysis?.matchPercentage).toBe(90);
  });

  it('tem default simple para assistantLevel', () => {
    const resume = GeneratedResumeSchema.parse({
      id: 'test-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'CV Simples',
      content: UserProfileSchema.parse({ personalInfo: { fullName: 'Davi' } }),
    });

    expect(resume.assistantLevel).toBe('simple');
    expect(resume.jobAnalysis).toBeUndefined();
  });
});
