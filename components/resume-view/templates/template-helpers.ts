import { UserProfile } from '@/lib/ai/schemas';

export function cleanUrlDisplay(url?: string): string {
  return (url || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function createProfileUpdaters(
  content: UserProfile,
  onUpdateContent?: (updated: UserProfile) => void
) {
  const emit = (next: UserProfile) => {
    if (onUpdateContent) onUpdateContent(next);
  };

  return {
    updatePersonal: (field: keyof UserProfile['personalInfo'], val: string) => {
      emit({
        ...content,
        personalInfo: { ...content.personalInfo, [field]: val },
      });
    },
    updateSummary: (val: string) => {
      emit({ ...content, summary: val });
    },
    updateKeyResult: (idx: number, val: string) => {
      const items = [...(content.keyResults || [])];
      items[idx] = val;
      emit({ ...content, keyResults: items.filter((s) => s.trim().length > 0) });
    },
    updateExperienceField: (
      expIdx: number,
      field: 'role' | 'company' | 'location' | 'startDate' | 'endDate',
      val: string
    ) => {
      const exps = content.experiences.map((e, i) =>
        i === expIdx
          ? {
              ...e,
              [field]: val,
              ...(field === 'endDate' ? { isCurrent: /presente|atual/i.test(val) } : {}),
            }
          : e
      );
      emit({ ...content, experiences: exps });
    },
    updateHighlight: (expIdx: number, hIdx: number, val: string) => {
      const exps = content.experiences.map((e, i) => {
        if (i !== expIdx) return e;
        const highlights = [...e.highlights];
        highlights[hIdx] = val;
        return { ...e, highlights: highlights.filter((s) => s.trim().length > 0) };
      });
      emit({ ...content, experiences: exps });
    },
    updateExperienceTechs: (expIdx: number, csv: string) => {
      const exps = content.experiences.map((e, i) =>
        i === expIdx
          ? {
              ...e,
              technologies: csv
                .split(/[,•·|]+/)
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : e
      );
      emit({ ...content, experiences: exps });
    },
    updateProjectField: (projIdx: number, field: 'name' | 'description' | 'link', val: string) => {
      const projects = (content.projects || []).map((p, i) =>
        i === projIdx ? { ...p, [field]: val } : p
      );
      emit({ ...content, projects });
    },
    updateProjectTechs: (projIdx: number, csv: string) => {
      const projects = (content.projects || []).map((p, i) =>
        i === projIdx
          ? {
              ...p,
              technologies: csv
                .split(/[,•·|]+/)
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : p
      );
      emit({ ...content, projects });
    },
    updateEducationField: (
      eduIdx: number,
      field: 'institution' | 'degree' | 'fieldOfStudy' | 'startDate' | 'endDate',
      val: string
    ) => {
      const education = (content.education || []).map((ed, i) =>
        i === eduIdx ? { ...ed, [field]: val } : ed
      );
      emit({ ...content, education });
    },
    updateSkillsCategory: (category: 'technical' | 'toolsAndCloud' | 'softSkills', csv: string) => {
      emit({
        ...content,
        skills: {
          ...content.skills,
          [category]: csv
            .split(/[,•·|]+/)
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
    },
    updateLanguage: (langIdx: number, field: 'language' | 'level', val: string) => {
      const languages = (content.languages || []).map((l, i) =>
        i === langIdx ? { ...l, [field]: val } : l
      );
      emit({ ...content, languages });
    },
    updateCertification: (certIdx: number, field: 'name' | 'issuer' | 'date', val: string) => {
      const certifications = (content.certifications || []).map((c, i) =>
        i === certIdx ? { ...c, [field]: val } : c
      );
      emit({ ...content, certifications });
    },
  };
}
