import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { 
  AppConfigSchema, 
  UserProfileSchema, 
  GeneratedResumeSchema 
} from '../lib/ai/schemas';
import { 
  saveConfig, 
  loadConfig, 
  saveProfile, 
  loadProfile, 
  saveResume, 
  listResumes, 
  getResume, 
  deleteResume 
} from '../lib/storage/fs-storage';

describe('Storage & Schema Validation', () => {
  const TEST_RESUME_ID = 'test-cv-uuid-123';

  beforeEach(async () => {
    // Garante que o teste parte de um estado limpo para o ID de teste
    await deleteResume(TEST_RESUME_ID);
  });

  afterAll(async () => {
    await deleteResume(TEST_RESUME_ID);
  });

  it('should validate default config schema and active provider', () => {
    const validConfig = {
      activeProvider: 'gemini',
      providers: {
        gemini: { apiKey: 'test-gemini-key', model: 'gemini-1.5-flash', baseUrl: '' },
      },
    };
    const parsed = AppConfigSchema.safeParse(validConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.activeProvider).toBe('gemini');
      expect(parsed.data.providers.gemini.apiKey).toBe('test-gemini-key');
    }
  });

  it('should save and load application config accurately', async () => {
    const initialConfig = await loadConfig();
    expect(initialConfig).toBeDefined();

    const modified = {
      ...initialConfig,
      activeProvider: 'gemini' as const,
      providers: {
        ...initialConfig.providers,
        gemini: { apiKey: 'my-secret-key-123', model: 'gemini-1.5-pro', baseUrl: '' },
      },
    };

    await saveConfig(modified);
    const reloaded = await loadConfig();
    expect(reloaded.providers.gemini?.apiKey).toBe('my-secret-key-123');
    expect(reloaded.providers.gemini?.model).toBe('gemini-1.5-pro');
  });

  it('should save and load user profile with nested sections', async () => {
    const profile = UserProfileSchema.parse({
      personalInfo: {
        fullName: 'Davi Dev',
        title: 'Engenheiro de Software Sênior',
        email: 'davi@example.com',
        phone: '+55 11 99999-9999',
        location: 'São Paulo, Brasil',
      },
      summary: 'Especialista em TypeScript e IA.',
      experiences: [
        {
          id: 'exp-1',
          company: 'Tech Corp',
          role: 'Tech Lead',
          startDate: '2022-01',
          endDate: 'Presente',
          isCurrent: true,
          location: 'Remoto',
          highlights: ['Liderou time de 10 engenheiros', 'Aumentou conversão em 45%'],
          technologies: ['TypeScript', 'Next.js', 'PostgreSQL'],
        },
      ],
      skills: {
        technical: ['React', 'Node.js', 'Python'],
        toolsAndCloud: ['Docker', 'AWS', 'Vercel'],
        softSkills: ['Liderança', 'Mentoria'],
      },
    });

    await saveProfile(profile);
    const loaded = await loadProfile();
    expect(loaded).not.toBeNull();
    expect(loaded?.personalInfo.fullName).toBe('Davi Dev');
    expect(loaded?.experiences).toHaveLength(1);
    expect(loaded?.experiences[0].company).toBe('Tech Corp');
    expect(loaded?.skills.technical).toContain('React');
  });

  it('should save, list, retrieve and delete generated resumes with templateId', async () => {
    const resume = GeneratedResumeSchema.parse({
      id: TEST_RESUME_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: 'Currículo Tech Lead - Startup X',
      mode: 'job_specific',
      depth: 'detailed',
      templateId: 'tech-charcoal',
      targetRole: 'Tech Lead',
      content: {
        personalInfo: {
          fullName: 'Davi Dev',
          title: 'Tech Lead',
          email: 'davi@example.com',
          phone: '1199999999',
          location: 'São Paulo',
        },
        summary: 'Resumo focado na vaga...',
        experiences: [],
        education: [],
        skills: { technical: [], toolsAndCloud: [], softSkills: [] },
        projects: [],
        certifications: [],
        languages: [],
      },
    });

    await saveResume(resume);

    // Buscar específico
    const fetched = await getResume(TEST_RESUME_ID);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Currículo Tech Lead - Startup X');
    expect(fetched?.templateId).toBe('tech-charcoal');

    // Listar todos
    const all = await listResumes();
    expect(all.some((r) => r.id === TEST_RESUME_ID)).toBe(true);

    // Deletar
    const deleted = await deleteResume(TEST_RESUME_ID);
    expect(deleted).toBe(true);
    const afterDelete = await getResume(TEST_RESUME_ID);
    expect(afterDelete).toBeNull();
  });
});
