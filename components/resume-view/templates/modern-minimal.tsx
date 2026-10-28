'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
}

export function ModernMinimalTemplate({ content, onUpdateContent, isEditable = true }: TemplateProps) {
  const p = content.personalInfo;

  const updatePersonal = (field: string, val: string) => {
    if (!onUpdateContent) return;
    onUpdateContent({
      ...content,
      personalInfo: { ...content.personalInfo, [field]: val },
    });
  };

  const updateSummary = (val: string) => {
    if (!onUpdateContent) return;
    onUpdateContent({ ...content, summary: val });
  };

  const updateKeyResult = (idx: number, val: string) => {
    if (!onUpdateContent) return;
    const items = [...(content.keyResults || [])];
    items[idx] = val;
    onUpdateContent({ ...content, keyResults: items });
  };

  const updateHighlight = (expIdx: number, hIdx: number, val: string) => {
    if (!onUpdateContent) return;
    const exps = [...content.experiences];
    exps[expIdx].highlights[hIdx] = val;
    onUpdateContent({ ...content, experiences: exps });
  };

  return (
    <div className="a4-page p-12 text-slate-800 font-sans leading-relaxed text-sm bg-white">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
          </h1>
          <p className="text-base font-semibold text-blue-700 mt-1">
            <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-3">
            {p.location && <span>📍 {p.location}</span>}
            {p.email && <span>✉️ {p.email}</span>}
            {p.phone && <span>📞 {p.phone}</span>}
            {p.linkedinUrl && <span>🔗 {p.linkedinUrl.replace('https://', '')}</span>}
            {p.githubUrl && <span>💻 {p.githubUrl.replace('https://', '')}</span>}
          </div>
        </div>

        {p.photoUrl && (
          <div className="shrink-0 self-center">
            <div className="w-[84px] h-[112px] sm:w-[90px] sm:h-[120px] rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-50 ring-1 ring-slate-100">
              <img
                src={p.photoUrl}
                alt={p.fullName || 'Foto de Perfil'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </header>

      {/* Resumo Profissional */}
      {content.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Resumo Profissional
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={updateSummary}
            isEditable={isEditable}
            className="text-xs text-slate-700 leading-normal"
          />
        </section>
      )}

      {/* Principais Resultados */}
      {content.keyResults?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Principais Resultados
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
            {content.keyResults.map((r, idx) => (
              <li key={idx}>
                <InlineText value={r} onChange={(v) => updateKeyResult(idx, v)} isEditable={isEditable} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Experiência Profissional */}
      {content.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
            Experiência Profissional
          </h2>

          <div className="space-y-4">
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900 text-xs">
                    {exp.role} <span className="font-normal text-slate-600">| {exp.company}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {exp.startDate} — {exp.isCurrent ? 'Presente' : exp.endDate}
                  </span>
                </div>

                {exp.location && (
                  <div className="text-[11px] text-slate-500 mb-1">{exp.location}</div>
                )}

                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
                  {exp.highlights.map((h, hIdx) => (
                    <li key={hIdx}>
                      <InlineText
                        value={h}
                        onChange={(v) => updateHighlight(expIdx, hIdx, v)}
                        isEditable={isEditable}
                      />
                    </li>
                  ))}
                </ul>

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-1.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Tecnologias:</span> {exp.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formação Acadêmica */}
      {content.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
            Formação Acadêmica
          </h2>

          <div className="space-y-2">
            {content.education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-xs text-slate-900">{edu.degree} em {edu.fieldOfStudy}</span>
                  <div className="text-[11px] text-slate-600">{edu.institution}</div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {edu.startDate && `${edu.startDate} — `}{edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências e Skills */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
          Competências & Tecnologias
        </h2>

        <div className="space-y-1 text-xs text-slate-700">
          {content.skills.technical?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Técnicas:</span> {content.skills.technical.join(', ')}
            </div>
          )}
          {content.skills.toolsAndCloud?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Ferramentas & Cloud:</span> {content.skills.toolsAndCloud.join(', ')}
            </div>
          )}
          {content.skills.softSkills?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">Soft Skills:</span> {content.skills.softSkills.join(', ')}
            </div>
          )}
        </div>
      </section>

      {/* Idiomas & Certificações */}
      {(content.languages?.length > 0 || content.certifications?.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Informações Adicionais
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
            {content.languages?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Idiomas: </span>
                {content.languages.map((l) => `${l.language} (${l.level})`).join(', ')}
              </div>
            )}
            {content.certifications?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">Certificações: </span>
                {content.certifications.map((c) => `${c.name} - ${c.issuer}`).join(', ')}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
