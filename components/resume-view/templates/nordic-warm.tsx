'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
}

export function NordicWarmTemplate({ content, onUpdateContent, isEditable = true }: TemplateProps) {
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
    <div className="a4-page p-12 text-[#1c1917] font-sans leading-relaxed text-xs bg-[#fdfbf7]">
      {/* Header Escandinavo Refinado */}
      <header className="border-b border-[#e7e5e4] pb-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-5">
            {p.photoUrl && (
              <img
                src={p.photoUrl}
                alt={p.fullName || 'Foto de Perfil'}
                className="w-20 h-26 sm:w-22 sm:h-28 object-cover rounded-2xl border border-[#d6d3d1] shadow-xs shrink-0"
              />
            )}
            <div>
              <h1 className="text-3xl font-light tracking-tight text-[#1c1917]">
                <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
              </h1>
              <p className="text-sm font-medium text-[#78716c] mt-0.5">
                <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#78716c] space-y-0.5 sm:text-right shrink-0">
            {p.location && <div>{p.location}</div>}
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.linkedinUrl && <div>{p.linkedinUrl.replace('https://', '')}</div>}
          </div>
        </div>
      </header>

      {/* Resumo */}
      {content.summary && (
        <section className="mb-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] mb-1.5">
            Sobre
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={updateSummary}
            isEditable={isEditable}
            className="text-xs text-[#44403c] leading-relaxed"
          />
        </section>
      )}

      {/* Experiências */}
      {content.experiences.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] border-b border-[#e7e5e4] pb-1 mb-4">
            Experiência
          </h2>

          <div className="space-y-5">
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-xs text-[#1c1917]">
                    {exp.role} <span className="font-normal text-[#78716c]">em {exp.company}</span>
                  </span>
                  <span className="text-[10px] text-[#a8a29e]">
                    {exp.startDate} — {exp.isCurrent ? 'Presente' : exp.endDate}
                  </span>
                </div>

                <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-[#44403c]">
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

                {exp.technologies?.length > 0 && (
                  <div className="text-[10px] text-[#78716c] pt-1">
                    {exp.technologies.join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formação Acadêmica & Competências */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#e7e5e4]">
        {content.education.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] mb-2">
              Educação
            </h2>
            <div className="space-y-2">
              {content.education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-medium text-[#1c1917]">{edu.degree}</div>
                  <div className="text-[#78716c] text-[11px]">{edu.institution}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] mb-2">
            Habilidades
          </h2>
          <div className="text-xs text-[#44403c] space-y-1">
            {content.skills.technical?.length > 0 && (
              <div>{content.skills.technical.join(', ')}</div>
            )}
            {content.skills.toolsAndCloud?.length > 0 && (
              <div className="text-[#78716c] text-[11px]">{content.skills.toolsAndCloud.join(', ')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
