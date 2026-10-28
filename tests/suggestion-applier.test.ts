import { describe, it, expect } from 'vitest';
import { UserProfileSchema, UserProfile, ProfileSuggestionItem } from '../lib/ai/schemas';
import { applySuggestionToProfile, revertSuggestionFromProfile } from '../lib/profile/suggestion-applier';

const baseProfile: UserProfile = UserProfileSchema.parse({
  personalInfo: { fullName: 'Davi Dev', summary: 'Desenvolvedor backend júnior.' },
  skills: {
    technical: ['Node.js', 'TypeScript'],
    toolsAndCloud: ['Git'],
    softSkills: ['Comunicação'],
  },
  experiences: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      role: 'Backend Dev',
      startDate: '2023-01',
      endDate: 'Presente',
      highlights: ['Responsável por manter APIs e containers.'],
      technologies: ['Node.js'],
    },
  ],
});

describe('applySuggestionToProfile', () => {
  it('adiciona habilidade sem duplicar caso já exista', () => {
    const sug: ProfileSuggestionItem = {
      id: '1',
      type: 'add_skill',
      title: 'Adicionar Docker',
      reason: 'Citado em containers',
      targetField: 'skills.toolsAndCloud',
      suggestedValue: 'Docker',
      skillCategory: 'toolsAndCloud',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.skills.toolsAndCloud).toContain('Docker');

    // Tentar adicionar novamente não duplica
    const dup = applySuggestionToProfile(updated, sug);
    expect(dup.skills.toolsAndCloud.filter((s) => s.toLowerCase() === 'docker')).toHaveLength(1);
  });

  it('permite customizar valor ao aprovar sugestão de habilidade', () => {
    const sug: ProfileSuggestionItem = {
      id: '2',
      type: 'add_skill',
      title: 'Adicionar Cloud',
      reason: 'Infraestrutura',
      targetField: 'skills.toolsAndCloud',
      suggestedValue: 'AWS',
      skillCategory: 'toolsAndCloud',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug, 'AWS Cloud & Terraform');
    expect(updated.skills.toolsAndCloud).toContain('AWS Cloud & Terraform');
  });

  it('remove habilidade especificada', () => {
    const sug: ProfileSuggestionItem = {
      id: '3',
      type: 'remove_skill',
      title: 'Remover Comunicação',
      reason: 'Genérico',
      targetField: 'skills.softSkills',
      suggestedValue: 'Comunicação',
      skillCategory: 'softSkills',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.skills.softSkills).not.toContain('Comunicação');
  });

  it('atualiza o resumo profissional', () => {
    const sug: ProfileSuggestionItem = {
      id: '4',
      type: 'improve_summary',
      title: 'Aprimorar resumo',
      reason: 'Mais impacto',
      targetField: 'personalInfo.summary',
      originalValue: 'Desenvolvedor backend júnior.',
      suggestedValue: 'Engenheiro de Software Backend focado em sistemas resilientes.',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.personalInfo.summary).toBe('Engenheiro de Software Backend focado em sistemas resilientes.');
  });

  it('atualiza highlight de experiência pelo índice', () => {
    const sug: ProfileSuggestionItem = {
      id: '5',
      type: 'improve_highlight',
      title: 'Verbo de ação forte',
      reason: 'Evitar passividade',
      targetField: 'experiences.highlight',
      targetIndex: 0,
      subIndex: 0,
      originalValue: 'Responsável por manter APIs e containers.',
      suggestedValue: 'Desenvolveu e manteve APIs REST em Node.js com arquitetura de containers.',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.experiences[0].highlights[0]).toBe('Desenvolveu e manteve APIs REST em Node.js com arquitetura de containers.');
  });

  it('permite reverter uma sugestão aprovada', () => {
    const sug: ProfileSuggestionItem = {
      id: '6',
      type: 'improve_summary',
      title: 'Resumo alterado',
      reason: 'x',
      targetField: 'personalInfo.summary',
      originalValue: 'Desenvolvedor backend júnior.',
      suggestedValue: 'Novo Resumo Proposto',
      status: 'pending',
    };

    const updated = applySuggestionToProfile(baseProfile, sug);
    expect(updated.personalInfo.summary).toBe('Novo Resumo Proposto');

    const reverted = revertSuggestionFromProfile(updated, sug);
    expect(reverted.personalInfo.summary).toBe('Desenvolvedor backend júnior.');
  });
});
