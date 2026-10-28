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

export function TechCharcoalTemplate({ 
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

  const headerPadding = isCompact ? 'p-6' : isComfortable ? 'p-10' : 'p-8';
  const bodyPadding = isCompact ? 'p-6 space-y-3.5' : isComfortable ? 'p-10 space-y-6' : 'p-8 space-y-4.5';
  const bulletSpacing = isCompact ? 'space-y-0.5 text-[11px]' : 'space-y-1 text-xs';

  return (
    <div className="a4-page min-h-[297mm] bg-white font-sans text-xs text-zinc-800">
      {/* Cabeçalho Charcoal / Grafite */}
      <header className={`bg-zinc-900 text-white ${headerPadding}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            {p.photoUrl && (
              <div className={`${isCompact ? 'w-[75px] h-[100px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[87px] h-[116px]'} overflow-hidden rounded-2xl border-2 border-emerald-500/60 shadow-lg shadow-emerald-950/40 shrink-0 bg-zinc-800`}>
                <img
                  src={p.photoUrl}
                  alt={p.fullName || 'Foto de Perfil'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-extrabold tracking-tight text-white`}>
                <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
              </h1>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-mono text-emerald-400 mt-0.5`}>
                &gt; <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
              </p>
            </div>
          </div>

          <div className={`text-[10.5px] font-mono text-zinc-400 space-y-0.5 sm:text-right shrink-0`}>
            {p.location && <div>{p.location}</div>}
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.githubUrl && <div>{p.githubUrl.replace('https://', '')}</div>}
            {p.linkedinUrl && <div>{p.linkedinUrl.replace('https://', '')}</div>}
          </div>
        </div>
      </header>

      {/* Corpo */}
      <div className={bodyPadding}>
        {/* Resumo */}
        {content.summary && (
          <section className="space-y-1">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="text-emerald-500">##</span> Resumo Executivo
            </h2>
            <InlineText
              as="p"
              value={content.summary}
              onChange={updateSummary}
              isEditable={isEditable}
              className={`text-zinc-700 ${isCompact ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'}`}
            />
          </section>
        )}

        {/* Principais Resultados */}
        {content.keyResults?.length > 0 && (
          <section className="space-y-1">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="text-emerald-500">##</span> Principais Resultados
            </h2>
            <ul className={`list-disc list-outside ml-4 text-zinc-700 ${bulletSpacing}`}>
              {content.keyResults.map((r, idx) => (
                <li key={idx}>
                  <InlineText value={r} onChange={(v) => updateKeyResult(idx, v)} isEditable={isEditable} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Stack de Tecnologias */}
        <section className={isCompact ? 'space-y-1' : 'space-y-2'}>
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
            <span className="text-emerald-500">##</span> Stack & Ferramentas
          </h2>
          <div className="flex flex-wrap gap-1">
            {[...(content.skills.technical || []), ...(content.skills.toolsAndCloud || [])].map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-zinc-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Experiências */}
        {content.experiences.length > 0 && (
          <section className={isCompact ? 'space-y-2.5' : 'space-y-4'}>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="text-emerald-500">##</span> Experiência Técnica
            </h2>

            <div className={isCompact ? 'space-y-3' : 'space-y-5'}>
              {content.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-xs text-zinc-900">
                      {exp.role} <span className="font-normal text-zinc-500">@ {exp.company}</span>
                    </div>
                    <span className="font-mono text-[10.5px] text-zinc-500">
                      {exp.startDate} - {exp.isCurrent ? 'Presente' : exp.endDate}
                    </span>
                  </div>

                  <ul className={`list-disc list-outside ml-4 text-zinc-700 ${bulletSpacing}`}>
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
                    <div className="text-[10.5px] font-mono text-zinc-500 pt-0.5">
                      <span className="text-zinc-700 font-semibold">Techs:</span> {exp.technologies.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educação & Projetos */}
        <div className={`grid grid-cols-2 gap-4 ${isCompact ? 'pt-1.5' : 'pt-2'} border-t border-zinc-200`}>
          {content.education.length > 0 && (
            <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Formação
              </h2>
              {content.education.map((edu, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-bold text-zinc-900">{edu.degree}</div>
                  <div className="text-zinc-600">{edu.institution} ({edu.endDate})</div>
                </div>
              ))}
            </div>
          )}

          {content.projects?.length > 0 && (
            <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Projetos
              </h2>
              {content.projects.map((proj, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-bold text-zinc-900">{proj.name}</div>
                  <div className="text-zinc-600 truncate">{proj.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
