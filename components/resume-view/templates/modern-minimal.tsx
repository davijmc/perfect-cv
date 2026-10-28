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

export function ModernMinimalTemplate({ 
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

  const pagePadding = isCompact ? 'p-6 sm:p-7' : isComfortable ? 'p-12' : 'p-10';
  const sectionMargin = isCompact ? 'mb-2.5' : isComfortable ? 'mb-6' : 'mb-4';
  const sectionHeaderMb = isCompact ? 'pb-0.5 mb-1' : 'pb-1 mb-2';
  const expSpacing = isCompact ? 'space-y-1.5' : isComfortable ? 'space-y-4' : 'space-y-3';
  const bulletSpacing = isCompact ? 'space-y-0.5 text-[10.5px] leading-snug' : 'space-y-1 text-xs';
  const bodyTextSize = isCompact ? 'text-[10.5px] leading-snug' : 'text-xs leading-normal';

  return (
    <div className={`a4-page ${pagePadding} text-slate-800 font-sans leading-relaxed text-sm bg-white`}>
      {/* Header */}
      <header className={`border-b-2 border-slate-900 ${isCompact ? 'pb-3 mb-3' : isComfortable ? 'pb-5 mb-6' : 'pb-4 mb-4.5'} flex items-start justify-between gap-6`}>
        <div className="flex-1">
          <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-extrabold tracking-tight text-slate-900 uppercase`}>
            <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
          </h1>
          <p className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-blue-700 mt-0.5`}>
            <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
          </p>

          <div className={`flex flex-wrap gap-x-4 gap-y-1 ${isCompact ? 'text-[11px] mt-1.5' : 'text-xs mt-3'} text-slate-600`}>
            {p.location && <span>📍 {p.location}</span>}
            {p.email && <span>✉️ {p.email}</span>}
            {p.phone && <span>📞 {p.phone}</span>}
            {p.linkedinUrl && <span>🔗 {p.linkedinUrl.replace('https://', '')}</span>}
            {p.githubUrl && <span>💻 {p.githubUrl.replace('https://', '')}</span>}
          </div>
        </div>

        {p.photoUrl && (
          <div className="shrink-0 self-center">
            <div className={`${isCompact ? 'w-[75px] h-[100px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[87px] h-[116px]'} rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-50 ring-1 ring-slate-100`}>
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
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            Resumo Profissional
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={updateSummary}
            isEditable={isEditable}
            className={`text-slate-700 ${bodyTextSize}`}
          />
        </section>
      )}

      {/* Principais Resultados */}
      {content.keyResults?.length > 0 && (
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            Principais Resultados
          </h2>
          <ul className={`list-disc list-outside ml-4 text-slate-700 ${bulletSpacing}`}>
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
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            Experiência Profissional
          </h2>

          <div className={expSpacing}>
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900 text-xs">
                    {exp.role} <span className="font-normal text-slate-600">| {exp.company}</span>
                  </h3>
                  <span className="text-[10.5px] text-slate-500 font-mono">
                    {exp.startDate} — {exp.isCurrent ? 'Presente' : exp.endDate}
                  </span>
                </div>

                {exp.location && (
                  <div className="text-[10px] text-slate-500 mb-0.5">{exp.location}</div>
                )}

                <ul className={`list-disc list-outside ml-4 mt-0.5 text-slate-700 ${bulletSpacing}`}>
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
                  <div className="mt-1 text-[10.5px] text-slate-500">
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
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            Formação Acadêmica
          </h2>

          <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
            {content.education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-xs text-slate-900">{edu.degree} em {edu.fieldOfStudy}</span>
                  <div className="text-[10.5px] text-slate-600">{edu.institution}</div>
                </div>
                <span className="text-[10.5px] text-slate-500 font-mono">
                  {edu.startDate && `${edu.startDate} — `}{edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências e Skills */}
      <section className={sectionMargin}>
        <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
          Competências & Tecnologias
        </h2>

        <div className={`space-y-0.5 ${isCompact ? 'text-[11px]' : 'text-xs'} text-slate-700`}>
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
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            Informações Adicionais
          </h2>

          <div className={`grid grid-cols-2 gap-4 ${isCompact ? 'text-[11px]' : 'text-xs'} text-slate-700`}>
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
