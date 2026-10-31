'use client';

import React from 'react';
import { UserProfile } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';
import { TemplateDensity } from './index';
import { cleanUrlDisplay, createProfileUpdaters } from './template-helpers';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
  density?: TemplateDensity;
}

export function ExecutiveSlateTemplate({
  content,
  onUpdateContent,
  isEditable = true,
  density = 'normal',
}: TemplateProps) {
  const p = content.personalInfo;
  const u = createProfileUpdaters(content, onUpdateContent);

  const isCompact = density === 'compact';
  const isComfortable = density === 'comfortable';

  const sidebarPadding = isCompact ? 'p-5' : isComfortable ? 'p-8' : 'p-6';
  const sidebarSpacing = isCompact ? 'space-y-3' : isComfortable ? 'space-y-5' : 'space-y-4';
  const mainPadding = isCompact ? 'p-5' : isComfortable ? 'p-8' : 'p-6';
  const mainSpacing = isCompact ? 'space-y-2.5' : isComfortable ? 'space-y-5' : 'space-y-3.5';

  return (
    <div className="a4-page flex min-h-[297mm] bg-white font-sans text-xs text-slate-800">
      {/* Coluna Esquerda: Barra Lateral Slate (32% largura) */}
      <aside className={`w-[32%] bg-slate-50 ${sidebarPadding} border-r border-slate-200 flex flex-col justify-between`}>
        <div className={sidebarSpacing}>
          {p.photoUrl && (
            <div className={`flex flex-col items-center ${isCompact ? 'pb-2 mb-0.5' : 'pb-3.5 mb-1'} border-b border-slate-200/70`}>
              <div
                className={`${
                  isCompact ? 'w-[78px] h-[104px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[87px] h-[116px]'
                } overflow-hidden rounded-2xl border-2 border-white shadow-md ring-1 ring-slate-200/80 bg-white`}
              >
                <img src={p.photoUrl} alt={p.fullName || 'Foto de Perfil'} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Contato */}
          <div className="space-y-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
              Contato
            </h2>
            <div className="space-y-1 text-[11px] text-slate-600 break-words">
              {p.email && (
                <div>
                  <InlineText value={p.email} onChange={(v) => u.updatePersonal('email', v)} isEditable={isEditable} />
                </div>
              )}
              {p.phone && (
                <div>
                  <InlineText value={p.phone} onChange={(v) => u.updatePersonal('phone', v)} isEditable={isEditable} />
                </div>
              )}
              {p.location && (
                <div>
                  <InlineText value={p.location} onChange={(v) => u.updatePersonal('location', v)} isEditable={isEditable} />
                </div>
              )}
              {p.linkedinUrl && (
                <div>
                  <InlineText
                    value={cleanUrlDisplay(p.linkedinUrl)}
                    onChange={(v) => u.updatePersonal('linkedinUrl', v)}
                    isEditable={isEditable}
                  />
                </div>
              )}
              {p.githubUrl && (
                <div>
                  <InlineText
                    value={cleanUrlDisplay(p.githubUrl)}
                    onChange={(v) => u.updatePersonal('githubUrl', v)}
                    isEditable={isEditable}
                  />
                </div>
              )}
              {p.portfolioUrl && (
                <div>
                  <InlineText
                    value={cleanUrlDisplay(p.portfolioUrl)}
                    onChange={(v) => u.updatePersonal('portfolioUrl', v)}
                    isEditable={isEditable}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Competências e Tecnologias */}
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
              Competências
            </h2>
            {content.skills.technical?.length > 0 && (
              <div className="text-[10.5px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Técnicas:</span>
                <InlineText
                  value={content.skills.technical.join(', ')}
                  onChange={(v) => u.updateSkillsCategory('technical', v)}
                  isEditable={isEditable}
                />
              </div>
            )}
            {content.skills.toolsAndCloud?.length > 0 && (
              <div className="text-[10.5px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Ferramentas & Cloud:</span>
                <InlineText
                  value={content.skills.toolsAndCloud.join(', ')}
                  onChange={(v) => u.updateSkillsCategory('toolsAndCloud', v)}
                  isEditable={isEditable}
                />
              </div>
            )}
            {content.skills.softSkills?.length > 0 && (
              <div className="text-[10.5px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Interpessoais:</span>
                <InlineText
                  value={content.skills.softSkills.join(', ')}
                  onChange={(v) => u.updateSkillsCategory('softSkills', v)}
                  isEditable={isEditable}
                />
              </div>
            )}
          </div>

          {/* Formação Acadêmica */}
          {content.education.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Formação Acadêmica
              </h2>
              <div className="space-y-2 text-[11px]">
                {content.education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div className="font-bold text-slate-900">
                      <InlineText
                        value={edu.degree}
                        onChange={(v) => u.updateEducationField(idx, 'degree', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    <div className="text-slate-600">
                      <InlineText
                        value={edu.fieldOfStudy}
                        onChange={(v) => u.updateEducationField(idx, 'fieldOfStudy', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      <InlineText
                        value={edu.institution}
                        onChange={(v) => u.updateEducationField(idx, 'institution', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      <InlineText
                        value={edu.endDate}
                        onChange={(v) => u.updateEducationField(idx, 'endDate', v)}
                        isEditable={isEditable}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {content.languages?.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Idiomas
              </h2>
              <div className="space-y-1 text-[11px] text-slate-700">
                {content.languages.map((l, idx) => (
                  <div key={l.id || idx} className="flex justify-between gap-1">
                    <span>
                      <InlineText
                        value={l.language}
                        onChange={(v) => u.updateLanguage(idx, 'language', v)}
                        isEditable={isEditable}
                      />
                    </span>
                    <span className="text-slate-500">
                      <InlineText
                        value={l.level}
                        onChange={(v) => u.updateLanguage(idx, 'level', v)}
                        isEditable={isEditable}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificações */}
          {content.certifications?.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-1">
                Certificações
              </h2>
              <div className="space-y-1.5 text-[10.5px] text-slate-700">
                {content.certifications.map((c, idx) => (
                  <div key={c.id || idx}>
                    <div className="font-semibold text-slate-800">
                      <InlineText
                        value={c.name}
                        onChange={(v) => u.updateCertification(idx, 'name', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    {c.issuer && (
                      <div className="text-slate-500 text-[10px]">
                        <InlineText
                          value={c.issuer}
                          onChange={(v) => u.updateCertification(idx, 'issuer', v)}
                          isEditable={isEditable}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Coluna Direita: Conteúdo Principal (68% largura) */}
      <main className={`w-[68%] ${mainPadding} ${mainSpacing}`}>
        {/* Cabeçalho */}
        <header className={`border-b border-slate-200 ${isCompact ? 'pb-2' : 'pb-3.5'}`}>
          <h1 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold uppercase tracking-tight text-slate-900`}>
            <InlineText value={p.fullName} onChange={(v) => u.updatePersonal('fullName', v)} isEditable={isEditable} />
          </h1>
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold text-blue-900 mt-0.5`}>
            <InlineText value={p.title} onChange={(v) => u.updatePersonal('title', v)} isEditable={isEditable} />
          </p>
        </header>

        {/* Resumo Profissional */}
        {content.summary && (
          <section className="space-y-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Resumo Profissional
            </h2>
            <InlineText
              as="p"
              value={content.summary}
              onChange={u.updateSummary}
              isEditable={isEditable}
              className="text-xs text-slate-700 leading-relaxed"
            />
          </section>
        )}

        {/* Principais Resultados */}
        {content.keyResults?.length > 0 && (
          <section className="space-y-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Principais Resultados
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-slate-700">
              {content.keyResults.map((r, idx) => (
                <li key={idx}>
                  <InlineText value={r} onChange={(v) => u.updateKeyResult(idx, v)} isEditable={isEditable} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Experiência Profissional */}
        {content.experiences.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              Experiência Profissional
            </h2>

            <div className={isCompact ? 'space-y-2.5' : 'space-y-3.5'}>
              {content.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      <InlineText
                        value={exp.role}
                        onChange={(v) => u.updateExperienceField(expIdx, 'role', v)}
                        isEditable={isEditable}
                      />
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      <InlineText
                        value={exp.startDate}
                        onChange={(v) => u.updateExperienceField(expIdx, 'startDate', v)}
                        isEditable={isEditable}
                      />{' '}
                      —{' '}
                      <InlineText
                        value={exp.isCurrent ? 'Presente' : exp.endDate}
                        onChange={(v) => u.updateExperienceField(expIdx, 'endDate', v)}
                        isEditable={isEditable}
                      />
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-blue-800">
                    <InlineText
                      value={exp.company}
                      onChange={(v) => u.updateExperienceField(expIdx, 'company', v)}
                      isEditable={isEditable}
                    />
                    {exp.location && (
                      <>
                        {' • '}
                        <InlineText
                          value={exp.location}
                          onChange={(v) => u.updateExperienceField(expIdx, 'location', v)}
                          isEditable={isEditable}
                        />
                      </>
                    )}
                  </div>

                  <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx}>
                        <InlineText
                          value={h}
                          onChange={(v) => u.updateHighlight(expIdx, hIdx, v)}
                          isEditable={isEditable}
                        />
                      </li>
                    ))}
                  </ul>

                  {exp.technologies?.length > 0 && (
                    <div className="text-[10.5px] text-slate-500 pt-0.5">
                      <span className="font-semibold text-slate-600">Tecnologias: </span>
                      <InlineText
                        value={exp.technologies.join(', ')}
                        onChange={(v) => u.updateExperienceTechs(expIdx, v)}
                        isEditable={isEditable}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projetos Relevantes */}
        {content.projects?.length > 0 && (
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Projetos Relevantes
            </h2>
            <div className="space-y-2">
              {content.projects.map((proj, pIdx) => (
                <div key={proj.id || pIdx}>
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="font-bold text-xs text-slate-900">
                      <InlineText
                        value={proj.name}
                        onChange={(v) => u.updateProjectField(pIdx, 'name', v)}
                        isEditable={isEditable}
                      />
                    </div>
                    {proj.technologies?.length > 0 && (
                      <span className="text-[10px] text-slate-500">
                        <InlineText
                          value={proj.technologies.join(', ')}
                          onChange={(v) => u.updateProjectTechs(pIdx, v)}
                          isEditable={isEditable}
                        />
                      </span>
                    )}
                  </div>
                  <InlineText
                    as="p"
                    value={proj.description}
                    onChange={(v) => u.updateProjectField(pIdx, 'description', v)}
                    isEditable={isEditable}
                    className="text-[11px] text-slate-600"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
