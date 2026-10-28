'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';

import { TemplateDensity } from './index';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
  density?: TemplateDensity;
}

export function NordicWarmTemplate({ 
  content, 
  onUpdateContent, 
  isEditable = true,
  density = 'normal'
}: TemplateProps) {
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

  const isCompact = density === 'compact';
  const isComfortable = density === 'comfortable';

  const pagePadding = isCompact ? 'p-7 sm:p-8' : isComfortable ? 'p-12' : 'p-9';
  const sectionMargin = isCompact ? 'mb-3' : isComfortable ? 'mb-6' : 'mb-4';
  const bulletSpacing = isCompact ? 'space-y-0.5 text-[11px]' : 'space-y-1 text-xs';

  return (
    <div className={`a4-page ${pagePadding} text-[#1c1917] font-sans leading-relaxed text-xs bg-[#fdfbf7]`}>
      {/* Header Escandinavo Refinado */}
      <header className={`border-b border-[#e7e5e4] ${isCompact ? 'pb-3 mb-3' : isComfortable ? 'pb-6 mb-6' : 'pb-4 mb-4.5'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-0.5">
            <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-light tracking-tight text-[#1c1917]`}>
              <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
            </h1>
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-[#78716c]`}>
              <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#78716c] pt-2">
              {p.location && <span>📍 {p.location}</span>}
              {p.email && <span>✉️ {p.email}</span>}
              {p.phone && <span>📞 {p.phone}</span>}
              {p.linkedinUrl && <span>🔗 {p.linkedinUrl.replace('https://', '')}</span>}
            </div>
          </div>

          {p.photoUrl && (
            <div className="shrink-0 self-center">
              <div className={`${isCompact ? 'w-[75px] h-[100px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[87px] h-[116px]'} overflow-hidden rounded-2xl border-2 border-[#d6d3d1] shadow-xs bg-[#f5f5f4]`}>
                <img
                  src={p.photoUrl}
                  alt={p.fullName || 'Foto de Perfil'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Resumo */}
      {content.summary && (
        <section className={sectionMargin}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] mb-1">
            Sobre
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={updateSummary}
            isEditable={isEditable}
            className={`text-[#44403c] ${isCompact ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'}`}
          />
        </section>
      )}

      {/* Principais Resultados */}
      {content.keyResults?.length > 0 && (
        <section className={sectionMargin}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] mb-1">
            Principais Resultados
          </h2>
          <ul className={`list-disc list-outside ml-4 text-[#44403c] ${bulletSpacing}`}>
            {content.keyResults.map((r, idx) => (
              <li key={idx}>
                <InlineText value={r} onChange={(v) => updateKeyResult(idx, v)} isEditable={isEditable} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Experiências */}
      {content.experiences.length > 0 && (
        <section className={sectionMargin}>
          <h2 className={`text-[11px] font-semibold uppercase tracking-widest text-[#a8a29e] border-b border-[#e7e5e4] ${isCompact ? 'pb-0.5 mb-2' : 'pb-1 mb-4'}`}>
            Experiência
          </h2>

          <div className={isCompact ? 'space-y-2.5' : 'space-y-4'}>
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

                <ul className={`list-disc list-outside ml-4 text-[#44403c] ${bulletSpacing}`}>
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
