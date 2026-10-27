'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
}

export function ClassicSerifTemplate({ content, onUpdateContent, isEditable = true }: TemplateProps) {
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

  const updateHighlight = (expIdx: number, hIdx: number, val: string) => {
    if (!onUpdateContent) return;
    const exps = [...content.experiences];
    exps[expIdx].highlights[hIdx] = val;
    onUpdateContent({ ...content, experiences: exps });
  };

  return (
    <div className="a4-page p-12 text-stone-900 font-serif leading-relaxed text-xs bg-[#fafafa]">
      {/* Cabeçalho Centralizado Clássico */}
      <header className="text-center border-b border-stone-400 pb-4 mb-6">
        <h1 className="text-3xl font-normal tracking-wide text-stone-950 font-serif">
          <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
        </h1>
        <p className="text-sm font-sans italic text-stone-700 mt-1">
          <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
        </p>

        <div className="flex justify-center flex-wrap gap-x-3 text-[11px] font-sans text-stone-600 mt-2">
          {p.location && <span>{p.location}</span>}
          {p.email && <span>• {p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.linkedinUrl && <span>• {p.linkedinUrl.replace('https://', '')}</span>}
        </div>
      </header>

      {/* Resumo */}
      {content.summary && (
        <section className="mb-5">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2 text-center">
            Resumo Profissional
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={updateSummary}
            isEditable={isEditable}
            className="text-xs text-stone-800 text-justify leading-relaxed"
          />
        </section>
      )}

      {/* Experiências */}
      {content.experiences.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-3 text-center">
            Experiência Profissional
          </h2>

          <div className="space-y-4">
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx}>
                <div className="flex justify-between items-baseline font-sans">
                  <span className="font-bold text-xs text-stone-950">{exp.company}</span>
                  <span className="text-[11px] italic text-stone-600">
                    {exp.startDate} – {exp.isCurrent ? 'Presente' : exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-stone-700 font-sans italic mb-1">
                  <span>{exp.role}</span>
                  {exp.location && <span>{exp.location}</span>}
                </div>

                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-stone-800">
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formação Acadêmica */}
      {content.education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2 text-center">
            Formação Acadêmica
          </h2>

          <div className="space-y-2">
            {content.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline font-sans text-xs">
                <div>
                  <span className="font-bold text-stone-900">{edu.institution}</span> — {edu.degree} em {edu.fieldOfStudy}
                </div>
                <span className="text-[11px] text-stone-600">{edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências */}
      <section>
        <h2 className="text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-2 text-center">
          Qualificações e Habilidades
        </h2>

        <div className="space-y-1 text-xs font-sans text-stone-800">
          {content.skills.technical?.length > 0 && (
            <div>
              <strong className="text-stone-950">Competências Técnicas:</strong> {content.skills.technical.join(', ')}
            </div>
          )}
          {content.skills.toolsAndCloud?.length > 0 && (
            <div>
              <strong className="text-stone-950">Ferramentas & Ambientes:</strong> {content.skills.toolsAndCloud.join(', ')}
            </div>
          )}
          {content.languages?.length > 0 && (
            <div>
              <strong className="text-stone-950">Idiomas:</strong> {content.languages.map((l) => `${l.language} (${l.level})`).join(', ')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
