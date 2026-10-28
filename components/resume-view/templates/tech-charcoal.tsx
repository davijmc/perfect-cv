'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
}

export function TechCharcoalTemplate({ content, onUpdateContent, isEditable = true }: TemplateProps) {
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
    <div className="a4-page min-h-[297mm] bg-white font-sans text-xs text-zinc-800">
      {/* Cabeçalho Charcoal / Grafite */}
      <header className="bg-zinc-900 text-white p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            {p.photoUrl && (
              <img
                src={p.photoUrl}
                alt={p.fullName || 'Foto de Perfil'}
                className="w-20 h-26 sm:w-22 sm:h-28 object-cover rounded-lg border-2 border-emerald-500/50 shadow-md shrink-0"
              />
            )}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
              </h1>
              <p className="text-sm font-mono text-emerald-400 mt-1">
                &gt; <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 space-y-0.5 sm:text-right shrink-0">
            {p.location && <div>{p.location}</div>}
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.githubUrl && <div>{p.githubUrl.replace('https://', '')}</div>}
            {p.linkedinUrl && <div>{p.linkedinUrl.replace('https://', '')}</div>}
          </div>
        </div>
      </header>

      {/* Corpo */}
      <div className="p-10 space-y-6">
        {/* Resumo */}
        {content.summary && (
          <section className="space-y-1.5">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="text-emerald-500">##</span> Resumo Executivo
            </h2>
            <InlineText
              as="p"
              value={content.summary}
              onChange={updateSummary}
              isEditable={isEditable}
              className="text-xs text-zinc-700 leading-relaxed"
            />
          </section>
        )}

        {/* Stack de Tecnologias */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
            <span className="text-emerald-500">##</span> Stack & Ferramentas
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {[...(content.skills.technical || []), ...(content.skills.toolsAndCloud || [])].map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-zinc-100 border border-zinc-200 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Experiências */}
        {content.experiences.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
              <span className="text-emerald-500">##</span> Experiência Técnica
            </h2>

            <div className="space-y-5">
              {content.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-sm text-zinc-900">
                      {exp.role} <span className="font-normal text-zinc-500">@ {exp.company}</span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {exp.startDate} - {exp.isCurrent ? 'Presente' : exp.endDate}
                    </span>
                  </div>

                  <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-zinc-700">
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
                    <div className="text-[11px] font-mono text-zinc-500 pt-0.5">
                      <span className="text-zinc-700 font-semibold">Techs:</span> {exp.technologies.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educação & Projetos */}
        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-zinc-200">
          {content.education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Formação
              </h2>
              {content.education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-bold text-zinc-900">{edu.degree}</div>
                  <div className="text-zinc-600">{edu.institution} ({edu.endDate})</div>
                </div>
              ))}
            </div>
          )}

          {content.projects?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Projetos
              </h2>
              {content.projects.map((proj, idx) => (
                <div key={idx} className="text-xs">
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
