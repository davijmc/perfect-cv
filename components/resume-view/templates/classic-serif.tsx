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

export function ClassicSerifTemplate({
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
    <div className={`a4-page ${pagePadding} text-stone-900 font-serif leading-relaxed text-xs bg-[#fafafa]`}>
      {/* Cabeçalho Centralizado Clássico */}
      <header
        className={`border-b border-stone-400 ${
          isCompact ? 'pb-2.5 mb-2.5' : isComfortable ? 'pb-5 mb-5' : 'pb-3.5 mb-4'
        } text-center`}
      >
        {p.photoUrl && (
          <div className={`flex justify-center ${isCompact ? 'mb-2' : 'mb-3.5'}`}>
            <div
              className={`${
                isCompact ? 'w-[72px] h-[96px]' : isComfortable ? 'w-[96px] h-[128px]' : 'w-[84px] h-[112px]'
              } overflow-hidden rounded-2xl border-2 border-stone-400/80 p-0.5 bg-white shadow-xs`}
            >
              <img
                src={p.photoUrl}
                alt={p.fullName || 'Foto de Perfil'}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </div>
        )}

        <h1 className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-normal tracking-wide text-stone-950 font-serif`}>
          <InlineText value={p.fullName} onChange={(v) => u.updatePersonal('fullName', v)} isEditable={isEditable} />
        </h1>
        <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-sans italic text-stone-700 mt-0.5`}>
          <InlineText value={p.title} onChange={(v) => u.updatePersonal('title', v)} isEditable={isEditable} />
        </p>

        <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-[11px] font-sans text-stone-600 mt-2">
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
      </header>

      {/* Resumo Profissional */}
      {content.summary && (
        <section className={sectionMargin}>
          <h2
            className={`text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 ${
              isCompact ? 'pb-0.5 mb-1' : 'pb-1 mb-1.5'
            } text-center`}
          >
            Resumo Profissional
          </h2>
          <InlineText
            as="p"
            value={content.summary}
            onChange={u.updateSummary}
            isEditable={isEditable}
            className={`text-stone-800 text-justify ${isCompact ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'}`}
          />
        </section>
      )}

      {/* Principais Resultados */}
      {content.keyResults?.length > 0 && (
        <section className={sectionMargin}>
          <h2
            className={`text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 ${
              isCompact ? 'pb-0.5 mb-1' : 'pb-1 mb-1.5'
            } text-center`}
          >
            Principais Resultados
          </h2>
          <ul className={`list-disc list-outside ml-4 text-stone-800 ${bulletSpacing}`}>
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
            className={`text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 ${
              isCompact ? 'pb-0.5 mb-1.5' : 'pb-1 mb-2.5'
            } text-center`}
          >
            Experiência Profissional
          </h2>

          <div className={isCompact ? 'space-y-2' : 'space-y-3.5'}>
            {content.experiences.map((exp, expIdx) => (
              <div key={exp.id || expIdx}>
                <div className="flex justify-between items-baseline font-sans gap-2">
                  <span className="font-bold text-xs text-stone-950">
                    <InlineText
                      value={exp.company}
                      onChange={(v) => u.updateExperienceField(expIdx, 'company', v)}
                      isEditable={isEditable}
                    />
                  </span>
                  <span className="text-[10.5px] italic text-stone-600 shrink-0">
                    <InlineText
                      value={exp.startDate}
                      onChange={(v) => u.updateExperienceField(expIdx, 'startDate', v)}
                      isEditable={isEditable}
                    />{' '}
                    –{' '}
                    <InlineText
                      value={exp.isCurrent ? 'Presente' : exp.endDate}
                      onChange={(v) => u.updateExperienceField(expIdx, 'endDate', v)}
                      isEditable={isEditable}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[10.5px] text-stone-700 font-sans italic mb-0.5">
                  <span>
                    <InlineText
                      value={exp.role}
                      onChange={(v) => u.updateExperienceField(expIdx, 'role', v)}
                      isEditable={isEditable}
                    />
                  </span>
                  {exp.location && (
                    <span>
                      <InlineText
                        value={exp.location}
                        onChange={(v) => u.updateExperienceField(expIdx, 'location', v)}
                        isEditable={isEditable}
                      />
                    </span>
                  )}
                </div>

                <ul className={`list-disc list-outside ml-4 text-stone-800 ${bulletSpacing}`}>
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
                  <div className="mt-0.5 text-[10.5px] font-sans text-stone-600">
                    <strong className="text-stone-800">Tecnologias: </strong>
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
          <h2
            className={`text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 ${
              isCompact ? 'pb-0.5 mb-1' : 'pb-1 mb-1.5'
            } text-center`}
          >
            Projetos Relevantes
          </h2>
          <div className="space-y-1.5">
            {content.projects.map((proj, pIdx) => (
              <div key={proj.id || pIdx}>
                <div className="flex justify-between items-baseline font-sans gap-2">
                  <strong className="text-xs text-stone-950">
                    <InlineText
                      value={proj.name}
                      onChange={(v) => u.updateProjectField(pIdx, 'name', v)}
                      isEditable={isEditable}
                    />
                  </strong>
                  {proj.technologies?.length > 0 && (
                    <span className="text-[10.5px] italic text-stone-600">
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
                  className="text-stone-800 text-[11px] leading-snug"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formação Acadêmica */}
      {content.education.length > 0 && (
        <section className={sectionMargin}>
          <h2
            className={`text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 ${
              isCompact ? 'pb-0.5 mb-1' : 'pb-1 mb-1.5'
            } text-center`}
          >
            Formação Acadêmica
          </h2>

          <div className={isCompact ? 'space-y-1' : 'space-y-1.5'}>
            {content.education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline font-sans text-xs gap-2">
                <div>
                  <span className="font-bold text-stone-900">
                    <InlineText
                      value={edu.institution}
                      onChange={(v) => u.updateEducationField(idx, 'institution', v)}
                      isEditable={isEditable}
                    />
                  </span>{' '}
                  —{' '}
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
                <span className="text-[10.5px] text-stone-600 shrink-0">
                  <InlineText
                    value={edu.endDate}
                    onChange={(v) => u.updateEducationField(idx, 'endDate', v)}
                    isEditable={isEditable}
                  />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competências, Idiomas e Certificações */}
      <section>
        <h2 className="text-[11px] font-sans font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 mb-1.5 text-center">
          Competências & Qualificações
        </h2>

        <div className="space-y-1 text-xs font-sans text-stone-800">
          {content.skills.technical?.length > 0 && (
            <div>
              <strong className="text-stone-950">Competências Técnicas: </strong>
              <InlineText
                value={content.skills.technical.join(', ')}
                onChange={(v) => u.updateSkillsCategory('technical', v)}
                isEditable={isEditable}
              />
            </div>
          )}
          {content.skills.toolsAndCloud?.length > 0 && (
            <div>
              <strong className="text-stone-950">Ferramentas & Cloud: </strong>
              <InlineText
                value={content.skills.toolsAndCloud.join(', ')}
                onChange={(v) => u.updateSkillsCategory('toolsAndCloud', v)}
                isEditable={isEditable}
              />
            </div>
          )}
          {content.skills.softSkills?.length > 0 && (
            <div>
              <strong className="text-stone-950">Competências Interpessoais: </strong>
              <InlineText
                value={content.skills.softSkills.join(', ')}
                onChange={(v) => u.updateSkillsCategory('softSkills', v)}
                isEditable={isEditable}
              />
            </div>
          )}
          {content.languages?.length > 0 && (
            <div>
              <strong className="text-stone-950">Idiomas: </strong>
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
              <strong className="text-stone-950">Certificações: </strong>
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
      </section>
    </div>
  );
}
