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

export function ModernMinimalTemplate({
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

  const pagePadding = isCompact ? 'p-6 sm:p-7' : isComfortable ? 'p-12' : 'p-10';
  const sectionMargin = isCompact ? 'mb-2.5' : isComfortable ? 'mb-5' : 'mb-3.5';
  const sectionHeaderMb = isCompact ? 'pb-0.5 mb-1' : 'pb-1 mb-1.5';
  const expSpacing = isCompact ? 'space-y-1.5' : isComfortable ? 'space-y-4' : 'space-y-2.5';
  const bulletSpacing = isCompact ? 'space-y-0.5 text-[10.5px] leading-snug' : 'space-y-1 text-xs';
  const bodyTextSize = isCompact ? 'text-[10.5px] leading-snug' : 'text-xs leading-normal';

  return (
    <div className={`a4-page ${pagePadding} text-slate-800 font-sans leading-relaxed text-sm bg-white`}>
      {/* Header */}
      <header
        className={`border-b-2 border-slate-900 ${
          isCompact ? 'pb-2.5 mb-2.5' : isComfortable ? 'pb-5 mb-5' : 'pb-3.5 mb-4'
        } flex items-start justify-between gap-6`}
      >
        <div className="flex-1">
          <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-extrabold tracking-tight text-slate-900 uppercase`}>
            <InlineText value={p.fullName} onChange={(v) => u.updatePersonal('fullName', v)} isEditable={isEditable} />
          </h1>
          <p className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-blue-700 mt-0.5`}>
            <InlineText value={p.title} onChange={(v) => u.updatePersonal('title', v)} isEditable={isEditable} />
          </p>

          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${isCompact ? 'text-[11px] mt-1.5' : 'text-xs mt-2.5'} text-slate-600`}>
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
                • <InlineText value={cleanUrlDisplay(p.linkedinUrl)} onChange={(v) => u.updatePersonal('linkedinUrl', v)} isEditable={isEditable} />
              </span>
            )}
            {p.githubUrl && (
              <span>
                • <InlineText value={cleanUrlDisplay(p.githubUrl)} onChange={(v) => u.updatePersonal('githubUrl', v)} isEditable={isEditable} />
              </span>
            )}
            {p.portfolioUrl && (
              <span>
                • <InlineText value={cleanUrlDisplay(p.portfolioUrl)} onChange={(v) => u.updatePersonal('portfolioUrl', v)} isEditable={isEditable} />
              </span>
            )}
          </div>
        </div>

        {p.photoUrl && (
          <div className="shrink-0 self-center">
            <div
              className={`${
                isCompact ? 'w-[72px] h-[96px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[84px] h-[112px]'
              } rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-50 ring-1 ring-slate-100`}
            >
              <img src={p.photoUrl} alt={p.fullName || 'Foto de Perfil'} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </header>

      {/* Resumo Profissional */}
      {content.summary && (
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            {labels.summary}
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={u.updateSummary}
            isEditable={isEditable}
            className={`text-slate-700 ${bodyTextSize}`}
          />
        </section>
      )}

      {/* Principais Resultados */}
      {content.keyResults?.length > 0 && (
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            {labels.keyResults}
          </h2>
          <ul className={`list-disc list-outside ml-4 text-slate-700 ${bulletSpacing}`}>
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
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            {labels.experience}
          </h2>

          <div className={expSpacing}>
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx}>
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-bold text-slate-900 text-xs">
                    <InlineText
                      value={exp.role}
                      onChange={(v) => u.updateExperienceField(expIdx, 'role', v)}
                      isEditable={isEditable}
                    />{' '}
                    <span className="font-normal text-slate-600">
                      |{' '}
                      <InlineText
                        value={exp.company}
                        onChange={(v) => u.updateExperienceField(expIdx, 'company', v)}
                        isEditable={isEditable}
                      />
                    </span>
                  </h3>
                  <span className="text-[10.5px] text-slate-500 font-mono shrink-0">
                    <InlineText
                      value={exp.startDate}
                      onChange={(v) => u.updateExperienceField(expIdx, 'startDate', v)}
                      isEditable={isEditable}
                    />{' '}
                    —{' '}
                    <InlineText
                      value={exp.isCurrent ? labels.present : exp.endDate}
                      onChange={(v) => u.updateExperienceField(expIdx, 'endDate', v)}
                      isEditable={isEditable}
                    />
                  </span>
                </div>

                {exp.location && (
                  <div className="text-[10px] text-slate-500 mb-0.5">
                    <InlineText
                      value={exp.location}
                      onChange={(v) => u.updateExperienceField(expIdx, 'location', v)}
                      isEditable={isEditable}
                    />
                  </div>
                )}

                <ul className={`list-disc list-outside ml-4 mt-0.5 text-slate-700 ${bulletSpacing}`}>
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

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-1 text-[10.5px] text-slate-500">
                    <span className="font-semibold text-slate-600">{labels.technologies}: </span>
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
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            {labels.projects}
          </h2>
          <div className={isCompact ? 'space-y-1.5' : 'space-y-2'}>
            {content.projects.map((proj, pIdx) => (
              <div key={proj.id || pIdx}>
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className="font-bold text-xs text-slate-900">
                    <InlineText
                      value={proj.name}
                      onChange={(v) => u.updateProjectField(pIdx, 'name', v)}
                      isEditable={isEditable}
                    />
                  </h3>
                  {proj.technologies?.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">
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
                  className={`text-slate-700 ${bodyTextSize}`}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formação Acadêmica */}
      {content.education.length > 0 && (
        <section className={sectionMargin}>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            {labels.education}
          </h2>

          <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
            {content.education.map((edu, eduIdx) => (
              <div key={edu.id || eduIdx} className="flex justify-between items-baseline gap-2">
                <div>
                  <span className="font-bold text-xs text-slate-900">
                    <InlineText
                      value={edu.degree}
                      onChange={(v) => u.updateEducationField(eduIdx, 'degree', v)}
                      isEditable={isEditable}
                    />{' '}
                    {labels.inPreposition}{' '}
                    <InlineText
                      value={edu.fieldOfStudy}
                      onChange={(v) => u.updateEducationField(eduIdx, 'fieldOfStudy', v)}
                      isEditable={isEditable}
                    />
                  </span>
                  <div className="text-[10.5px] text-slate-600">
                    <InlineText
                      value={edu.institution}
                      onChange={(v) => u.updateEducationField(eduIdx, 'institution', v)}
                      isEditable={isEditable}
                    />
                  </div>
                </div>
                <span className="text-[10.5px] text-slate-500 font-mono shrink-0">
                  {edu.startDate && (
                    <>
                      <InlineText
                        value={edu.startDate}
                        onChange={(v) => u.updateEducationField(eduIdx, 'startDate', v)}
                        isEditable={isEditable}
                      />{' '}
                      —{' '}
                    </>
                  )}
                  <InlineText
                    value={edu.endDate}
                    onChange={(v) => u.updateEducationField(eduIdx, 'endDate', v)}
                    isEditable={isEditable}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências e Tecnologias */}
      <section className={sectionMargin}>
        <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
          {labels.skillsAndTech}
        </h2>

        <div className={`space-y-0.5 ${isCompact ? 'text-[11px]' : 'text-xs'} text-slate-700`}>
          {content.skills.technical?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">{labels.technicalSkills}: </span>
              <InlineText
                value={content.skills.technical.join(', ')}
                onChange={(v) => u.updateSkillsCategory('technical', v)}
                isEditable={isEditable}
              />
            </div>
          )}
          {content.skills.toolsAndCloud?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">{labels.toolsAndCloud}: </span>
              <InlineText
                value={content.skills.toolsAndCloud.join(', ')}
                onChange={(v) => u.updateSkillsCategory('toolsAndCloud', v)}
                isEditable={isEditable}
              />
            </div>
          )}
          {content.skills.softSkills?.length > 0 && (
            <div>
              <span className="font-bold text-slate-900">{labels.softSkills}: </span>
              <InlineText
                value={content.skills.softSkills.join(', ')}
                onChange={(v) => u.updateSkillsCategory('softSkills', v)}
                isEditable={isEditable}
              />
            </div>
          )}
        </div>
      </section>

      {/* Idiomas & Certificações */}
      {(content.languages?.length > 0 || content.certifications?.length > 0) && (
        <section>
          <h2 className={`text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 ${sectionHeaderMb}`}>
            {labels.languagesAndCertifications}
          </h2>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isCompact ? 'text-[11px]' : 'text-xs'} text-slate-700`}>
            {content.languages?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900">{labels.languages}: </span>
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
                <span className="font-bold text-slate-900">{labels.certifications}: </span>
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
                        {' — '}
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
        </section>
      )}
    </div>
  );
}
