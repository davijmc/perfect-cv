'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
}

export function ExecutiveSlateTemplate({ content, onUpdateContent, isEditable = true }: TemplateProps) {
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
    <div className="a4-page flex min-h-[297mm] bg-white font-sans text-xs text-slate-800">
      {/* Coluna Esquerda: Barra Lateral Slate (32% largura) */}
      <aside className="w-[32%] bg-slate-50 p-8 border-r border-slate-200 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Foto de Perfil 3x4 (Facultativo) */}
          {p.photoUrl && (
            <div className="flex flex-col items-center pb-4 mb-1 border-b border-slate-200/70">
              <div className="w-[90px] h-[120px] overflow-hidden rounded-2xl border-2 border-white shadow-md ring-1 ring-slate-200/80 bg-white">
                <img
                  src={p.photoUrl}
                  alt={p.fullName || 'Foto de Perfil'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Contato */}
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
              Contato
            </h2>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              {p.email && <div>✉️ {p.email}</div>}
              {p.phone && <div>📞 {p.phone}</div>}
              {p.location && <div>📍 {p.location}</div>}
              {p.linkedinUrl && (
                <div className="truncate">🔗 {p.linkedinUrl.replace('https://', '')}</div>
              )}
              {p.githubUrl && (
                <div className="truncate">💻 {p.githubUrl.replace('https://', '')}</div>
              )}
            </div>
          </div>

          {/* Competências Técnicas */}
          {content.skills.technical?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Técnicas
              </h2>
              <div className="flex flex-wrap gap-1">
                {content.skills.technical.map((s) => (
                  <span key={s} className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ferramentas e Cloud */}
          {content.skills.toolsAndCloud?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Ferramentas & Cloud
              </h2>
              <div className="flex flex-wrap gap-1">
                {content.skills.toolsAndCloud.map((s) => (
                  <span key={s} className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Formação Acadêmica */}
          {content.education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Educação
              </h2>
              <div className="space-y-2 text-[11px]">
                {content.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.fieldOfStudy}</div>
                    <div className="text-slate-500 text-[10px]">{edu.institution}</div>
                    <div className="text-slate-400 text-[10px]">{edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {content.languages?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Idiomas
              </h2>
              <div className="space-y-1 text-[11px] text-slate-700">
                {content.languages.map((l, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{l.language}</span>
                    <span className="text-slate-500">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Coluna Direita: Conteúdo Principal (68% largura) */}
      <main className="w-[68%] p-8 space-y-6">
        {/* Cabeçalho */}
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
            <InlineText value={p.fullName} onChange={(v) => updatePersonal('fullName', v)} isEditable={isEditable} />
          </h1>
          <p className="text-sm font-semibold text-blue-900 mt-0.5">
            <InlineText value={p.title} onChange={(v) => updatePersonal('title', v)} isEditable={isEditable} />
          </p>
        </header>

        {/* Resumo Profissional */}
        {content.summary && (
          <section className="space-y-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <span>Perfil Executivo</span>
            </h2>
            <InlineText
              as="p"
              value={content.summary}
              onChange={updateSummary}
              isEditable={isEditable}
              className="text-xs text-slate-700 leading-relaxed"
            />
          </section>
        )}

        {/* Experiências */}
        {content.experiences.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              Trajetória Profissional
            </h2>

            <div className="space-y-4">
              {content.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-xs">{exp.role}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {exp.startDate} — {exp.isCurrent ? 'Presente' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-800">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>

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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projetos */}
        {content.projects?.length > 0 && (
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Projetos Principais
            </h2>
            <div className="space-y-2">
              {content.projects.map((proj, pIdx) => (
                <div key={pIdx}>
                  <div className="font-bold text-xs text-slate-900">{proj.name}</div>
                  <p className="text-[11px] text-slate-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
