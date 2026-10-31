'use client';

import React from 'react';
import { UserProfile, ResumeLanguage } from '@/lib/ai/schemas';
import { InlineText } from '../inline-text';
import { TemplateDensity } from './index';
import { cleanUrlDisplay, createProfileUpdaters, getTemplateLabels } from './template-helpers';

interface TemplateProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
  density?: TemplateDensity;
  language?: ResumeLanguage;
}

export function TechCharcoalTemplate({
  content,
  onUpdateContent,
  isEditable = true,
  density = 'normal',
  language = 'pt',
}: TemplateProps) {
  const p = content.personalInfo;
  const u = createProfileUpdaters(content, onUpdateContent);
  const labels = getTemplateLabels(language);

  const isCompact = density === 'compact';
  const isComfortable = density === 'comfortable';

  const headerPadding = isCompact ? 'p-5' : isComfortable ? 'p-10' : 'p-7';
  const bodyPadding = isCompact ? 'p-5 space-y-3' : isComfortable ? 'p-10 space-y-5' : 'p-7 space-y-4';
  const bulletSpacing = isCompact ? 'space-y-0.5 text-[11px]' : 'space-y-1 text-xs';

  return (
    <div className="a4-page min-h-[297mm] bg-white font-sans text-xs text-zinc-800">
      {/* Cabeçalho Charcoal / Grafite */}
      <header className={`bg-zinc-900 text-white ${headerPadding}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            {p.photoUrl && (
              <div
                className={`${
                  isCompact ? 'w-[72px] h-[96px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[84px] h-[112px]'
                } overflow-hidden rounded-2xl border-2 border-emerald-500/60 shadow-lg shadow-emerald-950/40 shrink-0 bg-zinc-800`}
              >
                <img src={p.photoUrl} alt={p.fullName || 'Foto de Perfil'} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-extrabold tracking-tight text-white`}>
                <InlineText value={p.fullName} onChange={(v) => u.updatePersonal('fullName', v)} isEditable={isEditable} />
              </h1>
              <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-mono text-emerald-400 mt-0.5`}>
                <InlineText value={p.title} onChange={(v) => u.updatePersonal('title', v)} isEditable={isEditable} />
              </p>
            </div>
          </div>

          <div className="text-[10.5px] font-mono text-zinc-300 space-y-0.5 sm:text-right shrink-0">
            {p.location && (
              <div>
                <InlineText value={p.location} onChange={(v) => u.updatePersonal('location', v)} isEditable={isEditable} />
              </div>
            )}
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
            {p.githubUrl && (
              <div>
                <InlineText
                  value={cleanUrlDisplay(p.githubUrl)}
                  onChange={(v) => u.updatePersonal('githubUrl', v)}
                  isEditable={isEditable}
                />
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
      </header>

      {/* Corpo */}
      <div className={bodyPadding}>
        {/* Resumo Profissional */}
        {content.summary && (
          <section className="space-y-1">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
              {labels.summary}
            </h2>
            <InlineText
              as="p"
              value={content.summary}
              onChange={u.updateSummary}
              isEditable={isEditable}
              className={`text-zinc-700 ${isCompact ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'}`}
            />
          </section>
        )}

        {/* Principais Resultados */}
        {content.keyResults?.length > 0 && (
          <section className="space-y-1">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
              {labels.keyResults}
            </h2>
            <ul className={`list-disc list-outside ml-4 text-zinc-700 ${bulletSpacing}`}>
              {content.keyResults.map((r, idx) => (
                <li key={idx}>
                  <InlineText value={r} onChange={(v) => u.updateKeyResult(idx, v)} isEditable={isEditable} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Competências e Tecnologias */}
        <section className="space-y-1">
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
            {labels.skillsAndTech}
          </h2>
          <div className="space-y-1 text-[11px] text-zinc-700">
            {content.skills.technical?.length > 0 && (
              <div>
                <span className="font-bold text-zinc-900 font-mono">{labels.technicalSkills}: </span>
                <InlineText
                  value={content.skills.technical.join(', ')}
                  onChange={(v) => u.updateSkillsCategory('technical', v)}
                  isEditable={isEditable}
                />
              </div>
            )}
            {content.skills.toolsAndCloud?.length > 0 && (
              <div>
                <span className="font-bold text-zinc-900 font-mono">{labels.toolsAndCloud}: </span>
                <InlineText
                  value={content.skills.toolsAndCloud.join(', ')}
                  onChange={(v) => u.updateSkillsCategory('toolsAndCloud', v)}
                  isEditable={isEditable}
                />
              </div>
            )}
            {content.skills.softSkills?.length > 0 && (
              <div>
                <span className="font-bold text-zinc-900 font-mono">{labels.softSkillsShort}: </span>
                <InlineText
                  value={content.skills.softSkills.join(', ')}
                  onChange={(v) => u.updateSkillsCategory('softSkills', v)}
                  isEditable={isEditable}
                />
              </div>
            )}
          </div>
        </section>

        {/* Experiência Profissional */}
        {content.experiences.length > 0 && (
          <section className={isCompact ? 'space-y-2' : 'space-y-3.5'}>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
              {labels.experience}
            </h2>

            <div className={isCompact ? 'space-y-2.5' : 'space-y-4'}>
              {content.experiences.map((exp, expIdx) => (
                <div key={exp.id || expIdx} className="space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="font-bold text-xs text-zinc-900">
                      <InlineText
                        value={exp.role}
                        onChange={(v) => u.updateExperienceField(expIdx, 'role', v)}
                        isEditable={isEditable}
                      />{' '}
                      <span className="font-normal text-zinc-500">
                        |{' '}
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
                      </span>
                    </div>
                    <span className="font-mono text-[10.5px] text-zinc-500 shrink-0">
                      <InlineText
                        value={exp.startDate}
                        onChange={(v) => u.updateExperienceField(expIdx, 'startDate', v)}
                        isEditable={isEditable}
                      />{' '}
                      -{' '}
                      <InlineText
                        value={exp.isCurrent ? labels.present : exp.endDate}
                        onChange={(v) => u.updateExperienceField(expIdx, 'endDate', v)}
                        isEditable={isEditable}
                      />
                    </span>
                  </div>

                  <ul className={`list-disc list-outside ml-4 text-zinc-700 ${bulletSpacing}`}>
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
                    <div className="text-[10.5px] font-mono text-zinc-500 pt-0.5">
                      <span className="text-zinc-700 font-semibold">{labels.technologies}: </span>
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
          <section className="space-y-1.5">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1">
              {labels.projects}
            </h2>
            <div className="space-y-2">
              {content.projects.map((proj, pIdx) => (
                <div key={proj.id || pIdx} className="text-[11px]">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-zinc-900">
                      <InlineText
                        value={proj.name}
                        onChange={(v) => u.updateProjectField(pIdx, 'name', v)}
                        isEditable={isEditable}
                      />
                    </span>
                    {proj.technologies?.length > 0 && (
                      <span className="font-mono text-[10px] text-zinc-500">
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
                    className="text-zinc-600 leading-snug"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Formação Acadêmica & Idiomas/Certificações */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isCompact ? 'pt-1' : 'pt-2'} border-t border-zinc-200`}>
          {content.education.length > 0 && (
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                {labels.education}
              </h2>
              {content.education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-[11px]">
                  <div className="font-bold text-zinc-900">
                    <InlineText
                      value={edu.degree}
                      onChange={(v) => u.updateEducationField(idx, 'degree', v)}
                      isEditable={isEditable}
                    />{' '}
                    {labels.inPreposition}{' '}
                    <InlineText
                      value={edu.fieldOfStudy}
                      onChange={(v) => u.updateEducationField(idx, 'fieldOfStudy', v)}
                      isEditable={isEditable}
                    />
                  </div>
                  <div className="text-zinc-600">
                    <InlineText
                      value={edu.institution}
                      onChange={(v) => u.updateEducationField(idx, 'institution', v)}
                      isEditable={isEditable}
                    />{' '}
                    (
                    <InlineText
                      value={edu.endDate}
                      onChange={(v) => u.updateEducationField(idx, 'endDate', v)}
                      isEditable={isEditable}
                    />
                    )
                  </div>
                </div>
              ))}
            </div>
          )}

          {(content.languages?.length > 0 || content.certifications?.length > 0) && (
            <div className="space-y-1.5 text-[11px]">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                {labels.languagesAndCertifications}
              </h2>
              {content.languages?.length > 0 && (
                <div className="text-zinc-700">
                  <span className="font-bold text-zinc-900">{labels.languages}: </span>
                  {content.languages.map((l, idx) => (
                    <span key={l.id || idx}>
                      {idx > 0 && ', '}
                      <InlineText
                        value={l.language}
                        onChange={(v) => u.updateLanguage(idx, 'language', v)}
                        isEditable={isEditable}
                      />{' '}
                      (
                      <InlineText
                        value={l.level}
                        onChange={(v) => u.updateLanguage(idx, 'level', v)}
                        isEditable={isEditable}
                      />
                      )
                    </span>
                  ))}
                </div>
              )}
              {content.certifications?.length > 0 && (
                <div className="text-zinc-700">
                  <span className="font-bold text-zinc-900">{labels.certifications}: </span>
                  {content.certifications.map((c, idx) => (
                    <span key={c.id || idx}>
                      {idx > 0 && ' • '}
                      <InlineText
                        value={c.name}
                        onChange={(v) => u.updateCertification(idx, 'name', v)}
                        isEditable={isEditable}
                      />
                      {c.issuer && (
                        <>
                          {' - '}
                          <InlineText
                            value={c.issuer}
                            onChange={(v) => u.updateCertification(idx, 'issuer', v)}
                            isEditable={isEditable}
                          />
                        </>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
