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

export function NordicWarmTemplate({
  content,
  onUpdateContent,
  isEditable = true,
  density = 'normal',
}: TemplateProps) {
  const p = content.personalInfo;
  const u = createProfileUpdaters(content, onUpdateContent);

  const isCompact = density === 'compact';
  const isComfortable = density === 'comfortable';

  const pagePadding = isCompact ? 'p-7 sm:p-8' : isComfortable ? 'p-12' : 'p-9';
  const sectionMargin = isCompact ? 'mb-2.5' : isComfortable ? 'mb-5' : 'mb-3.5';
  const bulletSpacing = isCompact ? 'space-y-0.5 text-[11px]' : 'space-y-1 text-xs';

  return (
    <div className={`a4-page ${pagePadding} text-[#1c1917] font-sans leading-relaxed text-xs bg-[#fdfbf7]`}>
      {/* Header Escandinavo Refinado */}
      <header className={`border-b border-[#e7e5e4] ${isCompact ? 'pb-2.5 mb-2.5' : isComfortable ? 'pb-5 mb-5' : 'pb-3.5 mb-4'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-0.5">
            <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-light tracking-tight text-[#1c1917]`}>
              <InlineText value={p.fullName} onChange={(v) => u.updatePersonal('fullName', v)} isEditable={isEditable} />
            </h1>
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-[#78716c]`}>
              <InlineText value={p.title} onChange={(v) => u.updatePersonal('title', v)} isEditable={isEditable} />
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#78716c] pt-1.5">
              {p.location && (
                <span>
                  <InlineText value={p.location} onChange={(v) => u.updatePersonal('location', v)} isEditable={isEditable} />
                </span>
              )}
              {p.email && (
                <span>
                  • <InlineText value={p.email} onChange={(v) => u.updatePersonal('email', v)} isEditable={isEditable} />
                </span>
              )}
              {p.phone && (
                <span>
                  • <InlineText value={p.phone} onChange={(v) => u.updatePersonal('phone', v)} isEditable={isEditable} />
                </span>
              )}
              {p.linkedinUrl && (
                <span>
                  •{' '}
                  <InlineText
                    value={cleanUrlDisplay(p.linkedinUrl)}
                    onChange={(v) => u.updatePersonal('linkedinUrl', v)}
                    isEditable={isEditable}
                  />
                </span>
              )}
              {p.githubUrl && (
                <span>
                  •{' '}
                  <InlineText
                    value={cleanUrlDisplay(p.githubUrl)}
                    onChange={(v) => u.updatePersonal('githubUrl', v)}
                    isEditable={isEditable}
                  />
                </span>
              )}
              {p.portfolioUrl && (
                <span>
                  •{' '}
                  <InlineText
                    value={cleanUrlDisplay(p.portfolioUrl)}
                    onChange={(v) => u.updatePersonal('portfolioUrl', v)}
                    isEditable={isEditable}
                  />
                </span>
              )}
            </div>
          </div>

          {p.photoUrl && (
            <div className="shrink-0 self-center">
              <div
                className={`${
                  isCompact ? 'w-[72px] h-[96px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[84px] h-[112px]'
                } overflow-hidden rounded-2xl border-2 border-[#d6d3d1] shadow-xs bg-[#f5f5f4]`}
              >
                <img src={p.photoUrl} alt={p.fullName || 'Foto de Perfil'} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Resumo Profissional */}
      {content.summary && (
        <section className={sectionMargin}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#78716c] mb-1">
            Resumo Profissional
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={u.updateSummary}
            isEditable={isEditable}
            className={`text-[#44403c] ${isCompact ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'}`}
          />
        </section>
      )}

      {/* Principais Resultados */}
      {content.keyResults?.length > 0 && (
        <section className={sectionMargin}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#78716c] mb-1">
            Principais Resultados
          </h2>
          <ul className={`list-disc list-outside ml-4 text-[#44403c] ${bulletSpacing}`}>
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
        <section className={sectionMargin}>
          <h2
            className={`text-[11px] font-semibold uppercase tracking-widest text-[#78716c] border-b border-[#e7e5e4] ${
              isCompact ? 'pb-0.5 mb-1.5' : 'pb-1 mb-3'
            }`}
          >
            Experiência Profissional
          </h2>

          <div className={isCompact ? 'space-y-2' : 'space-y-3.5'}>
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx} className="space-y-0.5">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-xs text-[#1c1917]">
                    <InlineText
                      value={exp.role}
                      onChange={(v) => u.updateExperienceField(expIdx, 'role', v)}
                      isEditable={isEditable}
                    />{' '}
                    <span className="font-normal text-[#78716c]">
                      em{' '}
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
                  </span>
                  <span className="text-[10px] text-[#78716c] shrink-0">
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

                <ul className={`list-disc list-outside ml-4 text-[#44403c] ${bulletSpacing}`}>
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
                  <div className="text-[10px] text-[#78716c] pt-0.5">
                    <span className="font-semibold">Tecnologias: </span>
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
        <section className={sectionMargin}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#78716c] border-b border-[#e7e5e4] pb-0.5 mb-1.5">
            Projetos Relevantes
          </h2>
          <div className="space-y-1.5">
            {content.projects.map((proj, pIdx) => (
              <div key={proj.id || pIdx}>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-medium text-xs text-[#1c1917]">
                    <InlineText
                      value={proj.name}
                      onChange={(v) => u.updateProjectField(pIdx, 'name', v)}
                      isEditable={isEditable}
                    />
                  </span>
                  {proj.technologies?.length > 0 && (
                    <span className="text-[10px] text-[#78716c]">
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
                  className="text-[#44403c] text-[11px] leading-snug"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formação Acadêmica & Competências */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-[#e7e5e4]">
        {content.education.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#78716c] mb-1.5">
              Formação Acadêmica
            </h2>
            <div className="space-y-1.5">
              {content.education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-xs">
                  <div className="font-medium text-[#1c1917]">
                    <InlineText
                      value={edu.degree}
                      onChange={(v) => u.updateEducationField(idx, 'degree', v)}
                      isEditable={isEditable}
                    />{' '}
                    em{' '}
                    <InlineText
                      value={edu.fieldOfStudy}
                      onChange={(v) => u.updateEducationField(idx, 'fieldOfStudy', v)}
                      isEditable={isEditable}
                    />
                  </div>
                  <div className="text-[#78716c] text-[11px]">
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
          </div>
        )}

        <div className="space-y-2">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#78716c] mb-1">
              Competências & Tecnologias
            </h2>
            <div className="text-[11px] text-[#44403c] space-y-0.5">
              {content.skills.technical?.length > 0 && (
                <div>
                  <strong className="text-[#1c1917]">Técnicas: </strong>
                  <InlineText
                    value={content.skills.technical.join(', ')}
                    onChange={(v) => u.updateSkillsCategory('technical', v)}
                    isEditable={isEditable}
                  />
                </div>
              )}
              {content.skills.toolsAndCloud?.length > 0 && (
                <div>
                  <strong className="text-[#1c1917]">Ferramentas: </strong>
                  <InlineText
                    value={content.skills.toolsAndCloud.join(', ')}
                    onChange={(v) => u.updateSkillsCategory('toolsAndCloud', v)}
                    isEditable={isEditable}
                  />
                </div>
              )}
              {content.skills.softSkills?.length > 0 && (
                <div>
                  <strong className="text-[#1c1917]">Interpessoais: </strong>
                  <InlineText
                    value={content.skills.softSkills.join(', ')}
                    onChange={(v) => u.updateSkillsCategory('softSkills', v)}
                    isEditable={isEditable}
                  />
                </div>
              )}
            </div>
          </div>

          {(content.languages?.length > 0 || content.certifications?.length > 0) && (
            <div className="text-[11px] text-[#44403c] space-y-0.5 pt-1 border-t border-[#e7e5e4]">
              {content.languages?.length > 0 && (
                <div>
                  <strong className="text-[#1c1917]">Idiomas: </strong>
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
                <div>
                  <strong className="text-[#1c1917]">Certificações: </strong>
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
