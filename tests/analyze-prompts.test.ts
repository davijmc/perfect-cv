import { describe, it, expect } from 'vitest';
import {
  JOB_ANALYZER_SYSTEM_PROMPT,
  buildJobAnalysisPrompt,
  buildGenerateResumeUserPrompt,
} from '../lib/ai/prompts';

describe('JOB_ANALYZER_SYSTEM_PROMPT', () => {
  it('define regras estritas de classificação sem alucinação de evidência', () => {
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('supported');
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('not_supported');
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('partial');
    expect(JOB_ANALYZER_SYSTEM_PROMPT).toContain('NUNCA invente');
  });
});

describe('buildJobAnalysisPrompt', () => {
  it('monta prompt delimitando perfil e vaga', () => {
    const prompt = buildJobAnalysisPrompt({
      profile: { personalInfo: { fullName: 'Davi' }, experiences: [] },
      rawDescription: 'Procuramos dev Go.',
      jobTitle: 'Go Developer',
      company: 'Acme',
    });
    expect(prompt).toContain('Go Developer');
    expect(prompt).toContain('Acme');
    expect(prompt).toContain('<<<VAGA');
    expect(prompt).toContain('Procuramos dev Go.');
  });
});

describe('buildGenerateResumeUserPrompt with assistantLevel', () => {
  it('instrui esvaziamento de keyResults quando assistantLevel for simple', () => {
    const prompt = buildGenerateResumeUserPrompt({
      profile: { summary: 'x' },
      mode: 'job_specific',
      depth: 'lean',
      assistantLevel: 'simple',
    });
    expect(prompt).toContain('MODO SIMPLES');
    expect(prompt).toContain('Deixe o campo keyResults como lista vazia');
  });

  it('inclui contexto de requisitos diagnosticados quando assistantLevel for advanced', () => {
    const prompt = buildGenerateResumeUserPrompt({
      profile: { summary: 'x' },
      mode: 'job_specific',
      depth: 'detailed',
      assistantLevel: 'advanced',
      jobAnalysis: {
        jobTitle: 'Dev',
        summary: 'Foco em Go',
        matchPercentage: 80,
        requirements: [
          { text: 'Docker', category: 'tech', importance: 'required', status: 'supported', evidence: 'Usa Docker diário' },
          { text: 'Kubernetes', category: 'tech', importance: 'required', status: 'not_supported', evidence: '' },
        ],
      },
    });
    expect(prompt).toContain('MODO AVANÇADO');
    expect(prompt).toContain('Docker (supported)');
    expect(prompt).toContain('Kubernetes (not_supported)');
  });
});
