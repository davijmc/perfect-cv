'use client';

import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderGit2, 
  Award, 
  Languages, 
  Plus, 
  Trash2, 
  Sparkles,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Link as LinkIcon
} from 'lucide-react';
import { UserProfile, ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem } from '@/lib/ai/schemas';

interface ProfileFormProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
  isSaving: boolean;
}

export function ProfileForm({ initialProfile, onSave, isSaving }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'other'>('personal');

  // Atualiza estado local quando initialProfile mudar (ex: após upload de CV)
  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Atualizador de Dados Pessoais
  const handlePersonalChange = (field: string, val: string) => {
    setProfile({
      ...profile,
      personalInfo: {
        ...profile.personalInfo,
        [field]: val,
      },
    });
  };

  // Experiências
  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: Math.random().toString(36).substring(2, 9),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      highlights: [''],
      technologies: [],
    };
    setProfile({ ...profile, experiences: [newItem, ...profile.experiences] });
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, val: any) => {
    const updated = [...profile.experiences];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, experiences: updated });
  };

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      experiences: profile.experiences.filter((_, i) => i !== index),
    });
  };

  const addHighlight = (expIndex: number) => {
    const updated = [...profile.experiences];
    updated[expIndex].highlights.push('');
    setProfile({ ...profile, experiences: updated });
  };

  const updateHighlight = (expIndex: number, hIndex: number, text: string) => {
    const updated = [...profile.experiences];
    updated[expIndex].highlights[hIndex] = text;
    setProfile({ ...profile, experiences: updated });
  };

  const removeHighlight = (expIndex: number, hIndex: number) => {
    const updated = [...profile.experiences];
    updated[expIndex].highlights = updated[expIndex].highlights.filter((_, i) => i !== hIndex);
    setProfile({ ...profile, experiences: updated });
  };

  // Tags de tecnologias em experiência
  const addExpTech = (expIndex: number, tech: string) => {
    if (!tech.trim()) return;
    const updated = [...profile.experiences];
    if (!updated[expIndex].technologies.includes(tech.trim())) {
      updated[expIndex].technologies.push(tech.trim());
      setProfile({ ...profile, experiences: updated });
    }
  };

  const removeExpTech = (expIndex: number, tech: string) => {
    const updated = [...profile.experiences];
    updated[expIndex].technologies = updated[expIndex].technologies.filter((t) => t !== tech);
    setProfile({ ...profile, experiences: updated });
  };

  // Educação
  const addEducation = () => {
    const newItem: EducationItem = {
      id: Math.random().toString(36).substring(2, 9),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
    };
    setProfile({ ...profile, education: [...profile.education, newItem] });
  };

  const updateEducation = (index: number, field: keyof EducationItem, val: string) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    setProfile({ ...profile, education: profile.education.filter((_, i) => i !== index) });
  };

  // Habilidades gerais
  const addSkill = (category: 'technical' | 'toolsAndCloud' | 'softSkills', skill: string) => {
    if (!skill.trim()) return;
    const current = profile.skills[category] || [];
    if (!current.includes(skill.trim())) {
      setProfile({
        ...profile,
        skills: {
          ...profile.skills,
          [category]: [...current, skill.trim()],
        },
      });
    }
  };

  const removeSkill = (category: 'technical' | 'toolsAndCloud' | 'softSkills', skill: string) => {
    setProfile({
      ...profile,
      skills: {
        ...profile.skills,
        [category]: (profile.skills[category] || []).filter((s) => s !== skill),
      },
    });
  };

  // Projetos
  const addProject = () => {
    const newItem: ProjectItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      description: '',
      technologies: [],
      link: '',
    };
    setProfile({ ...profile, projects: [...profile.projects, newItem] });
  };

  const updateProject = (index: number, field: keyof ProjectItem, val: any) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, projects: updated });
  };

  const removeProject = (index: number) => {
    setProfile({ ...profile, projects: profile.projects.filter((_, i) => i !== index) });
  };

  // Idiomas
  const addLanguage = () => {
    const newItem: LanguageItem = {
      id: Math.random().toString(36).substring(2, 9),
      language: '',
      level: 'Intermediário',
    };
    setProfile({ ...profile, languages: [...profile.languages, newItem] });
  };

  const updateLanguage = (index: number, field: keyof LanguageItem, val: string) => {
    const updated = [...profile.languages];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, languages: updated });
  };

  const removeLanguage = (index: number) => {
    setProfile({ ...profile, languages: profile.languages.filter((_, i) => i !== index) });
  };

  // Certificações
  const addCertification = () => {
    const newItem: CertificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      issuer: '',
      date: '',
    };
    setProfile({ ...profile, certifications: [...profile.certifications, newItem] });
  };

  const updateCertification = (index: number, field: keyof CertificationItem, val: string) => {
    const updated = [...profile.certifications];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, certifications: updated });
  };

  const removeCertification = (index: number) => {
    setProfile({ ...profile, certifications: profile.certifications.filter((_, i) => i !== index) });
  };

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais & Resumo', icon: User },
    { id: 'experience', label: `Experiência (${profile.experiences.length})`, icon: Briefcase },
    { id: 'education', label: `Educação (${profile.education.length})`, icon: GraduationCap },
    { id: 'skills', label: 'Competências & Skills', icon: Wrench },
    { id: 'projects', label: `Projetos (${profile.projects.length})`, icon: FolderGit2 },
    { id: 'other', label: 'Idiomas & Certificações', icon: Languages },
  ];

  return (
    <div className="space-y-6">
      {/* Abas Superiores do Formulário */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* ABA: DADOS PESSOAIS */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informações Pessoais de Contato
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nome Completo *</label>
                <input
                  type="text"
                  value={profile.personalInfo.fullName || ''}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Título Profissional Atual *</label>
                <input
                  type="text"
                  value={profile.personalInfo.title || ''}
                  onChange={(e) => handlePersonalChange('title', e.target.value)}
                  placeholder="Ex: Engenheiro de Software Sênior | Tech Lead"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">E-mail *</label>
                <input
                  type="email"
                  value={profile.personalInfo.email || ''}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="carlos@exemplo.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={profile.personalInfo.phone || ''}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  placeholder="+55 (11) 98765-4321"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Localização (Cidade, Estado, País)</label>
                <input
                  type="text"
                  value={profile.personalInfo.location || ''}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="Ex: São Paulo, SP - Brasil (ou Remoto)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">URL LinkedIn</label>
                <input
                  type="url"
                  value={profile.personalInfo.linkedinUrl || ''}
                  onChange={(e) => handlePersonalChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/seuperfil"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">URL GitHub / Portfólio</label>
                <input
                  type="url"
                  value={profile.personalInfo.githubUrl || ''}
                  onChange={(e) => handlePersonalChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/seuperfil"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-sm font-bold text-slate-900">Resumo Profissional Geral</label>
              <p className="text-xs text-slate-600">
                Uma síntese de sua bagagem profissional, principais realizações e domínio técnico.
              </p>
              <textarea
                rows={4}
                value={profile.summary || ''}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                placeholder="Ex: Engenheiro de Software com mais de 8 anos de experiência em desenvolvimento full-stack..."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}

        {/* ABA: EXPERIÊNCIAS */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Histórico Profissional</h3>
                <p className="text-xs text-slate-600">Ordene da experiência mais recente para a mais antiga.</p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Cargo</span>
              </button>
            </div>

            {profile.experiences.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Nenhuma experiência cadastrada ainda. Clique em "Adicionar Cargo" ou importe seu currículo acima.
              </div>
            )}

            <div className="space-y-6">
              {profile.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Experiência #{expIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(expIdx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Excluir experiência"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => updateExperience(expIdx, 'role', e.target.value)}
                      placeholder="Cargo (ex: Senior Software Engineer)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(expIdx, 'company', e.target.value)}
                      placeholder="Empresa (ex: Nubank / Google)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                      type="text"
                      value={exp.startDate || ''}
                      onChange={(e) => updateExperience(expIdx, 'startDate', e.target.value)}
                      placeholder="Início (ex: 2021-03)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        disabled={exp.isCurrent}
                        value={exp.isCurrent ? 'Presente' : exp.endDate || ''}
                        onChange={(e) => updateExperience(expIdx, 'endDate', e.target.value)}
                        placeholder="Fim (ex: 2023-11)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 whitespace-nowrap cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent || false}
                          onChange={(e) => updateExperience(expIdx, 'isCurrent', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>Atual</span>
                      </label>
                    </div>
                  </div>

                  {/* Bullet points de conquistas */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Conquistas e Responsabilidades (Bullet Points)
                      </label>
                      <button
                        type="button"
                        onClick={() => addHighlight(expIdx)}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                      >
                        + Adicionar Linha
                      </button>
                    </div>

                    <div className="space-y-2">
                      {exp.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => updateHighlight(expIdx, hIdx, e.target.value)}
                            placeholder="Descreva uma conquista de alto impacto ou responsabilidade..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                          <button
                            type="button"
                            onClick={() => removeHighlight(expIdx, hIdx)}
                            className="text-slate-400 hover:text-rose-500 px-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tecnologias da Experiência */}
                  <div className="space-y-1 pt-2">
                    <label className="text-xs font-bold text-slate-700">Tecnologias Utilizadas neste Cargo</label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {exp.technologies.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeExpTech(expIdx, t)}
                            className="hover:text-blue-950 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="+ Adicionar tech (pressione Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExpTech(expIdx, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: EDUCAÇÃO */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Formação Acadêmica</h3>
                <p className="text-xs text-slate-600">Graduações, pós-graduações e cursos de extensão relevantes.</p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Formação</span>
              </button>
            </div>

            <div className="space-y-4">
              {profile.education.map((edu, eduIdx) => (
                <div key={edu.id || eduIdx} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500">Curso #{eduIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(eduIdx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(eduIdx, 'institution', e.target.value)}
                      placeholder="Instituição (ex: USP / UNICAMP)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(eduIdx, 'degree', e.target.value)}
                      placeholder="Grau (ex: Bacharelado / Pós-Graduação)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => updateEducation(eduIdx, 'fieldOfStudy', e.target.value)}
                      placeholder="Curso / Área (ex: Ciência da Computação)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={edu.startDate || ''}
                        onChange={(e) => updateEducation(eduIdx, 'startDate', e.target.value)}
                        placeholder="Início (ex: 2016)"
                        className="w-1/2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(eduIdx, 'endDate', e.target.value)}
                        placeholder="Fim (ex: 2020)"
                        className="w-1/2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: HABILIDADES */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Competências e Habilidades
            </h3>

            {/* Técnicas */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">
                Linguagens e Frameworks Técnicos
              </label>
              <div className="flex flex-wrap gap-2 items-center rounded-2xl border border-slate-200 p-3 bg-slate-50/50">
                {(profile.skills.technical || []).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 text-blue-900 px-3 py-1 text-xs font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill('technical', s)}
                      className="hover:text-blue-950 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Adicionar (Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill('technical', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Ferramentas e Cloud */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">
                Ferramentas, Cloud & Metodologias
              </label>
              <div className="flex flex-wrap gap-2 items-center rounded-2xl border border-slate-200 p-3 bg-slate-50/50">
                {(profile.skills.toolsAndCloud || []).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-900 px-3 py-1 text-xs font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill('toolsAndCloud', s)}
                      className="hover:text-emerald-950 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Adicionar (Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill('toolsAndCloud', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">
                Soft Skills & Liderança
              </label>
              <div className="flex flex-wrap gap-2 items-center rounded-2xl border border-slate-200 p-3 bg-slate-50/50">
                {(profile.skills.softSkills || []).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 text-purple-900 px-3 py-1 text-xs font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill('softSkills', s)}
                      className="hover:text-purple-950 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Adicionar (Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill('softSkills', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA: PROJETOS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Projetos de Destaque</h3>
                <p className="text-xs text-slate-600">Projetos open-source, estudos de caso ou produtos desenvolvidos.</p>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Projeto</span>
              </button>
            </div>

            <div className="space-y-4">
              {profile.projects.map((proj, projIdx) => (
                <div key={proj.id || projIdx} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500">Projeto #{projIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(projIdx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={proj.name || ''}
                      onChange={(e) => updateProject(projIdx, 'name', e.target.value)}
                      placeholder="Nome do Projeto"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(projIdx, 'link', e.target.value)}
                      placeholder="Link do Projeto (GitHub / URL)"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={proj.description || ''}
                    onChange={(e) => updateProject(projIdx, 'description', e.target.value)}
                    placeholder="Descrição do projeto e impacto gerado..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA: OUTROS (IDIOMAS E CERTIFICAÇÕES) */}
        {activeTab === 'other' && (
          <div className="space-y-8">
            {/* Idiomas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Idiomas</h3>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Adicionar Idioma
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {profile.languages.map((lang, lIdx) => (
                  <div key={lang.id || lIdx} className="flex gap-2 items-center p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => updateLanguage(lIdx, 'language', e.target.value)}
                      placeholder="Idioma (ex: Inglês)"
                      className="w-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => updateLanguage(lIdx, 'level', e.target.value)}
                      className="w-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                    >
                      <option value="Básico">Básico</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                      <option value="Fluente">Fluente</option>
                      <option value="Nativo">Nativo</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLanguage(lIdx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Certificações</h3>
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Adicionar Certificação
                </button>
              </div>

              <div className="space-y-3">
                {profile.certifications.map((cert, cIdx) => (
                  <div key={cert.id || cIdx} className="flex gap-2 items-center p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(cIdx, 'name', e.target.value)}
                      placeholder="Nome da Certificação (ex: AWS Solutions Architect)"
                      className="w-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cIdx, 'issuer', e.target.value)}
                      placeholder="Emissor (ex: Amazon Web Services)"
                      className="w-1/3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => updateCertification(cIdx, 'date', e.target.value)}
                      placeholder="Ano (ex: 2023)"
                      className="w-1/6 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(cIdx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Salvar Perfil no Rodapé do Formulário */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => onSave(profile)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Salvando Perfil...' : 'Salvar Perfil no Disco'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
