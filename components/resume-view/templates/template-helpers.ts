import { UserProfile, ResumeLanguage } from '@/lib/ai/schemas';

export function cleanUrlDisplay(url?: string): string {
  return (url || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export interface TemplateLabels {
  contact: string;
  summary: string;
  keyResults: string;
  experience: string;
  present: string;
  atPreposition: string;
  inPreposition: string;
  technologies: string;
  projects: string;
  education: string;
  skills: string;
  skillsAndTech: string;
  skillsAndQualifications: string;
  technicalSkills: string;
  technicalSkillsFull: string;
  toolsAndCloud: string;
  toolsShort: string;
  softSkills: string;
  softSkillsShort: string;
  languages: string;
  certifications: string;
  languagesAndCertifications: string;
  portfolio: string;
}

const PT_LABELS: TemplateLabels = {
  contact: 'Contato',
  summary: 'Resumo Profissional',
  keyResults: 'Principais Resultados',
  experience: 'Experiência Profissional',
  present: 'Presente',
  atPreposition: 'em',
  inPreposition: 'em',
  technologies: 'Tecnologias',
  projects: 'Projetos Relevantes',
  education: 'Formação Acadêmica',
  skills: 'Competências',
  skillsAndTech: 'Competências & Tecnologias',
  skillsAndQualifications: 'Competências & Qualificações',
  technicalSkills: 'Técnicas',
  technicalSkillsFull: 'Competências Técnicas',
  toolsAndCloud: 'Ferramentas & Cloud',
  toolsShort: 'Ferramentas',
  softSkills: 'Competências Interpessoais',
  softSkillsShort: 'Interpessoais',
  languages: 'Idiomas',
  certifications: 'Certificações',
  languagesAndCertifications: 'Idiomas & Certificações',
  portfolio: 'Portfólio',
};

const EN_LABELS: TemplateLabels = {
  contact: 'Contact',
  summary: 'Professional Summary',
  keyResults: 'Key Achievements',
  experience: 'Professional Experience',
  present: 'Present',
  atPreposition: 'at',
  inPreposition: 'in',
  technologies: 'Technologies',
  projects: 'Relevant Projects',
  education: 'Education',
  skills: 'Skills',
  skillsAndTech: 'Skills & Technologies',
  skillsAndQualifications: 'Skills & Qualifications',
  technicalSkills: 'Technical',
  technicalSkillsFull: 'Technical Skills',
  toolsAndCloud: 'Tools & Cloud',
  toolsShort: 'Tools',
  softSkills: 'Soft Skills',
  softSkillsShort: 'Soft Skills',
  languages: 'Languages',
  certifications: 'Certifications',
  languagesAndCertifications: 'Languages & Certifications',
  portfolio: 'Portfolio',
};

export function getTemplateLabels(language: ResumeLanguage = 'pt'): TemplateLabels {
  return language === 'en' ? EN_LABELS : PT_LABELS;
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
              ...(field === 'endDate' ? { isCurrent: /presente|atual|present|current/i.test(val) } : {}),
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

export function buildResumeMarkdown(c: UserProfile, language: ResumeLanguage = 'pt'): string {
  const labels = getTemplateLabels(language);

  let md = `# ${c.personalInfo.fullName}\n`;
  md += `**${c.personalInfo.title}**\n\n`;
  md += `* ${c.personalInfo.location || ''} | ${c.personalInfo.email || ''} | ${c.personalInfo.phone || ''}\n`;
  if (c.personalInfo.linkedinUrl) md += `* LinkedIn: ${c.personalInfo.linkedinUrl}\n`;
  if (c.personalInfo.githubUrl) md += `* GitHub: ${c.personalInfo.githubUrl}\n`;
  if (c.personalInfo.portfolioUrl) md += `* ${labels.portfolio}: ${c.personalInfo.portfolioUrl}\n`;
  md += `\n---\n\n## ${labels.summary}\n${c.summary}\n\n`;

  if (c.keyResults?.length > 0) {
    md += `## ${labels.keyResults}\n`;
    c.keyResults.forEach((r) => {
      md += `- ${r}\n`;
    });
    md += `\n`;
  }

  if (c.experiences?.length > 0) {
    md += `## ${labels.experience}\n`;
    c.experiences.forEach((exp) => {
      md += `\n### ${exp.role} — ${exp.company}\n`;
      md += `*${exp.startDate} - ${exp.isCurrent ? labels.present : exp.endDate}${exp.location ? ` | ${exp.location}` : ''}*\n\n`;
      exp.highlights.forEach((h) => {
        md += `- ${h}\n`;
      });
      if (exp.technologies?.length > 0) {
        md += `*${labels.technologies}:* ${exp.technologies.join(', ')}\n`;
      }
    });
  }

  if (c.projects?.length > 0) {
    md += `\n## ${labels.projects}\n`;
    c.projects.forEach((proj) => {
      md += `- **${proj.name}**: ${proj.description}`;
      if (proj.technologies?.length > 0) {
        md += ` (${proj.technologies.join(', ')})`;
      }
      md += `\n`;
    });
  }

  if (c.education?.length > 0) {
    md += `\n## ${labels.education}\n`;
    c.education.forEach((edu) => {
      md += `- **${edu.degree} ${labels.inPreposition} ${edu.fieldOfStudy}** — ${edu.institution} (${edu.endDate})\n`;
    });
  }

  if (
    c.skills?.technical?.length > 0 ||
    c.skills?.toolsAndCloud?.length > 0 ||
    c.skills?.softSkills?.length > 0
  ) {
    md += `\n## ${labels.skillsAndTech}\n`;
    if (c.skills.technical?.length > 0) {
      md += `- **${labels.technicalSkills}:** ${c.skills.technical.join(', ')}\n`;
    }
    if (c.skills.toolsAndCloud?.length > 0) {
      md += `- **${labels.toolsAndCloud}:** ${c.skills.toolsAndCloud.join(', ')}\n`;
    }
    if (c.skills.softSkills?.length > 0) {
      md += `- **${labels.softSkills}:** ${c.skills.softSkills.join(', ')}\n`;
    }
  }

  if (c.languages?.length > 0 || c.certifications?.length > 0) {
    md += `\n## ${labels.languagesAndCertifications}\n`;
    if (c.languages?.length > 0) {
      md += `- **${labels.languages}:** ${c.languages.map((l) => `${l.language} (${l.level})`).join(', ')}\n`;
    }
    if (c.certifications?.length > 0) {
      md += `- **${labels.certifications}:** ${c.certifications.map((cert) => `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`).join(' • ')}\n`;
    }
  }

  return md;
}
