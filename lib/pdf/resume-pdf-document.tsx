import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Link,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import {
  UserProfile,
  TemplateId,
  ResumeLanguage,
} from '@/lib/ai/schemas';
import { TemplateDensity } from '@/components/resume-view/templates';
import {
  cleanUrlDisplay,
  getTemplateLabels,
  TemplateLabels,
} from '@/components/resume-view/templates/template-helpers';

// Desativa hifenização automática no meio de palavras para evitar hifens artificiais ao copiar texto do PDF
Font.registerHyphenationCallback((word) => [word]);

export interface ResumePdfOptions {
  content: UserProfile;
  templateId?: TemplateId;
  density?: TemplateDensity;
  language?: ResumeLanguage;
  forceOnePage?: boolean;
  photoDataUri?: string;
  title?: string;
}

/**
 * Normaliza texto para garantir codificação limpa e espaços reais copiáveis no fluxo PDF
 */
export function cleanPdfText(input?: string | null): string {
  if (!input) return '';
  return String(input)
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u00A0\u202F\u2007]/g, ' ')
    .replace(/[\u2010\u2011\u2012]/g, '-')
    .replace(/[→➔➜▸▹]/g, '->')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function ensureUrlHref(raw?: string): string {
  const clean = cleanPdfText(raw);
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean) || /^mailto:/i.test(clean)) return clean;
  return `https://${clean}`;
}

/**
 * Calcula fator de escala tipográfica real em pontos (pt) para caber em 1 página A4 quando solicitado,
 * sem usar CSS zoom que distorce caixas de seleção de texto.
 */
export function computeAdaptiveScale(
  content: UserProfile,
  density: TemplateDensity = 'normal',
  forceOnePage: boolean = false
): number {
  const baseScale =
    density === 'compact' ? 0.9 : density === 'comfortable' ? 1.06 : 1.0;

  if (!forceOnePage) return baseScale;

  // Estima volume de linhas do currículo
  const expCount = content.experiences?.length || 0;
  const highlightCount = (content.experiences || []).reduce(
    (acc, e) => acc + (e.highlights?.length || 0),
    0
  );
  const keyResultsCount = content.keyResults?.length || 0;
  const projCount = content.projects?.length || 0;
  const eduCount = content.education?.length || 0;
  const summaryLines = Math.ceil((content.summary?.length || 0) / 95);

  const estimatedWeight =
    summaryLines * 1.2 +
    keyResultsCount * 1.4 +
    expCount * 2.6 +
    highlightCount * 1.45 +
    projCount * 2.2 +
    eduCount * 1.5 +
    6;

  if (estimatedWeight <= 28) return Math.min(baseScale, 0.95);
  if (estimatedWeight <= 36) return Math.min(baseScale, 0.88);
  if (estimatedWeight <= 44) return Math.min(baseScale, 0.82);
  return 0.76;
}

interface InternalTemplateProps {
  content: UserProfile;
  labels: TemplateLabels;
  scale: number;
  forceOnePage: boolean;
  photoSrc?: string;
}

function ContactInlineList({
  content,
  color,
  linkColor,
  fontSize,
  fontFamily = 'Helvetica',
  centered = false,
}: {
  content: UserProfile;
  color: string;
  linkColor?: string;
  fontSize: number;
  fontFamily?: string;
  centered?: boolean;
}) {
  const p = content.personalInfo;
  const items: React.ReactNode[] = [];

  if (p.location) {
    items.push(<Text key="loc">{cleanPdfText(p.location)}</Text>);
  }
  if (p.email) {
    const email = cleanPdfText(p.email);
    items.push(
      <Link
        key="email"
        src={`mailto:${email}`}
        style={{ color: linkColor || color, textDecoration: 'none' }}
      >
        {email}
      </Link>
    );
  }
  if (p.phone) {
    items.push(<Text key="phone">{cleanPdfText(p.phone)}</Text>);
  }
  if (p.linkedinUrl) {
    items.push(
      <Link
        key="linkedin"
        src={ensureUrlHref(p.linkedinUrl)}
        style={{ color: linkColor || color, textDecoration: 'none' }}
      >
        {cleanPdfText(cleanUrlDisplay(p.linkedinUrl))}
      </Link>
    );
  }
  if (p.githubUrl) {
    items.push(
      <Link
        key="github"
        src={ensureUrlHref(p.githubUrl)}
        style={{ color: linkColor || color, textDecoration: 'none' }}
      >
        {cleanPdfText(cleanUrlDisplay(p.githubUrl))}
      </Link>
    );
  }
  if (p.portfolioUrl) {
    items.push(
      <Link
        key="portfolio"
        src={ensureUrlHref(p.portfolioUrl)}
        style={{ color: linkColor || color, textDecoration: 'none' }}
      >
        {cleanPdfText(cleanUrlDisplay(p.portfolioUrl))}
      </Link>
    );
  }

  if (items.length === 0) return null;

  return (
    <Text
      style={{
        fontSize,
        fontFamily,
        color,
        lineHeight: 1.4,
        textAlign: centered ? 'center' : 'left',
      }}
    >
      {items.map((node, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 ? ' • ' : ''}
          {node}
        </React.Fragment>
      ))}
    </Text>
  );
}

function BulletItem({
  text,
  fontSize,
  color,
  fontFamily = 'Helvetica',
  spacing = 2,
}: {
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: string;
  spacing?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing,
        paddingLeft: 2,
      }}
    >
      <Text
        style={{
          width: 10,
          fontSize,
          fontFamily,
          color,
          lineHeight: 1.35,
        }}
      >
        {'• '}
      </Text>
      <Text
        style={{
          flex: 1,
          fontSize,
          fontFamily,
          color,
          lineHeight: 1.35,
        }}
      >
        {cleanPdfText(text)}
      </Text>
    </View>
  );
}

/**
 * 1. MODERN MINIMAL PDF TEMPLATE
 */
function ModernMinimalPdfPage({
  content,
  labels,
  scale,
  forceOnePage,
  photoSrc,
}: InternalTemplateProps) {
  const p = content.personalInfo;
  const s = (v: number) => Math.round(v * scale * 100) / 100;

  const styles = StyleSheet.create({
    page: {
      paddingTop: s(28),
      paddingBottom: s(28),
      paddingHorizontal: s(32),
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      color: '#1e293b',
      fontSize: s(9.5),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1.5,
      borderBottomColor: '#0f172a',
      paddingBottom: s(10),
      marginBottom: s(10),
    },
    headerLeft: {
      flex: 1,
      paddingRight: photoSrc ? s(14) : 0,
    },
    name: {
      fontSize: s(20),
      fontFamily: 'Helvetica-Bold',
      color: '#0f172a',
      marginBottom: s(2),
    },
    title: {
      fontSize: s(11),
      fontFamily: 'Helvetica-Bold',
      color: '#1d4ed8',
      marginBottom: s(6),
    },
    photoBox: {
      width: s(60),
      height: s(80),
      borderRadius: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#cbd5e1',
    },
    photo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    section: {
      marginBottom: s(9),
    },
    sectionTitle: {
      fontSize: s(9.5),
      fontFamily: 'Helvetica-Bold',
      color: '#0f172a',
      borderBottomWidth: 0.75,
      borderBottomColor: '#e2e8f0',
      paddingBottom: s(2),
      marginBottom: s(4.5),
    },
    bodyText: {
      fontSize: s(9.2),
      color: '#334155',
      lineHeight: 1.38,
    },
    expBlock: {
      marginBottom: s(6.5),
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: s(1.5),
    },
    expTitleLine: {
      fontSize: s(9.5),
      color: '#0f172a',
      flex: 1,
      paddingRight: 8,
    },
    dateText: {
      fontSize: s(8.5),
      color: '#64748b',
    },
    locationText: {
      fontSize: s(8.2),
      color: '#64748b',
      marginBottom: s(2),
    },
    techLine: {
      fontSize: s(8.4),
      color: '#64748b',
      marginTop: s(1.5),
    },
  });

  return (
    <Page size="A4" style={styles.page} wrap={!forceOnePage}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{cleanPdfText(p.fullName).toUpperCase()}</Text>
          {p.title ? <Text style={styles.title}>{cleanPdfText(p.title)}</Text> : null}
          <ContactInlineList
            content={content}
            color="#475569"
            linkColor="#1d4ed8"
            fontSize={s(8.6)}
          />
        </View>
        {photoSrc ? (
          <View style={styles.photoBox}>
            <Image src={photoSrc} style={styles.photo} />
          </View>
        ) : null}
      </View>

      {/* Resumo Profissional */}
      {content.summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.summary.toUpperCase()}</Text>
          <Text style={styles.bodyText}>{cleanPdfText(content.summary)}</Text>
        </View>
      ) : null}

      {/* Principais Resultados */}
      {content.keyResults && content.keyResults.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.keyResults.toUpperCase()}</Text>
          {content.keyResults.map((r, idx) => (
            <BulletItem
              key={idx}
              text={r}
              fontSize={s(9.2)}
              color="#334155"
              spacing={s(2)}
            />
          ))}
        </View>
      ) : null}

      {/* Experiência Profissional */}
      {content.experiences && content.experiences.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.experience.toUpperCase()}</Text>
          {content.experiences.map((exp, idx) => {
            const endLabel = exp.isCurrent ? labels.present : cleanPdfText(exp.endDate);
            return (
              <View key={exp.id || idx} style={styles.expBlock} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.expTitleLine}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                      {cleanPdfText(exp.role)}
                    </Text>
                    {exp.company ? ` | ${cleanPdfText(exp.company)} ` : ' '}
                  </Text>
                  <Text style={styles.dateText}>
                    {`${cleanPdfText(exp.startDate)} — ${endLabel}`}
                  </Text>
                </View>

                {exp.location ? (
                  <Text style={styles.locationText}>{cleanPdfText(exp.location)}</Text>
                ) : null}

                {(exp.highlights || []).map((h, hIdx) => (
                  <BulletItem
                    key={hIdx}
                    text={h}
                    fontSize={s(9.1)}
                    color="#334155"
                    spacing={s(1.8)}
                  />
                ))}

                {exp.technologies && exp.technologies.length > 0 ? (
                  <Text style={styles.techLine}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', color: '#475569' }}>
                      {`${labels.technologies}: `}
                    </Text>
                    {cleanPdfText(exp.technologies.join(', '))}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Projetos Relevantes */}
      {content.projects && content.projects.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.projects.toUpperCase()}</Text>
          {content.projects.map((proj, pIdx) => (
            <View key={proj.id || pIdx} style={{ marginBottom: s(5) }} wrap={false}>
              <View style={styles.rowBetween}>
                <Text style={styles.expTitleLine}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                    {`${cleanPdfText(proj.name)} `}
                  </Text>
                </Text>
                {proj.technologies && proj.technologies.length > 0 ? (
                  <Text style={styles.dateText}>
                    {cleanPdfText(proj.technologies.join(', '))}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.bodyText}>{cleanPdfText(proj.description)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Formação Acadêmica */}
      {content.education && content.education.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.education.toUpperCase()}</Text>
          {content.education.map((edu, eduIdx) => (
            <View key={edu.id || eduIdx} style={{ marginBottom: s(4) }} wrap={false}>
              <View style={styles.rowBetween}>
                <Text style={styles.expTitleLine}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                    {`${cleanPdfText(edu.degree)} ${labels.inPreposition} ${cleanPdfText(edu.fieldOfStudy)} `}
                  </Text>
                </Text>
                <Text style={styles.dateText}>
                  {edu.startDate
                    ? `${cleanPdfText(edu.startDate)} — ${cleanPdfText(edu.endDate)}`
                    : cleanPdfText(edu.endDate)}
                </Text>
              </View>
              <Text style={{ fontSize: s(8.8), color: '#475569' }}>
                {cleanPdfText(edu.institution)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Competências e Tecnologias */}
      {(content.skills?.technical?.length > 0 ||
        content.skills?.toolsAndCloud?.length > 0 ||
        content.skills?.softSkills?.length > 0) ? (
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>{labels.skillsAndTech.toUpperCase()}</Text>
          {content.skills.technical?.length > 0 ? (
            <Text style={{ ...styles.bodyText, marginBottom: s(2) }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                {`${labels.technicalSkills}: `}
              </Text>
              {cleanPdfText(content.skills.technical.join(', '))}
            </Text>
          ) : null}
          {content.skills.toolsAndCloud?.length > 0 ? (
            <Text style={{ ...styles.bodyText, marginBottom: s(2) }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                {`${labels.toolsAndCloud}: `}
              </Text>
              {cleanPdfText(content.skills.toolsAndCloud.join(', '))}
            </Text>
          ) : null}
          {content.skills.softSkills?.length > 0 ? (
            <Text style={styles.bodyText}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                {`${labels.softSkills}: `}
              </Text>
              {cleanPdfText(content.skills.softSkills.join(', '))}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Idiomas & Certificações */}
      {(content.languages?.length > 0 || content.certifications?.length > 0) ? (
        <View style={{ marginBottom: 0 }} wrap={false}>
          <Text style={styles.sectionTitle}>
            {labels.languagesAndCertifications.toUpperCase()}
          </Text>
          {content.languages?.length > 0 ? (
            <Text style={{ ...styles.bodyText, marginBottom: s(2) }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                {`${labels.languages}: `}
              </Text>
              {cleanPdfText(
                content.languages
                  .map((l) => `${l.language} (${l.level})`)
                  .join(', ')
              )}
            </Text>
          ) : null}
          {content.certifications?.length > 0 ? (
            <Text style={styles.bodyText}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                {`${labels.certifications}: `}
              </Text>
              {cleanPdfText(
                content.certifications
                  .map((c) => `${c.name}${c.issuer ? ` — ${c.issuer}` : ''}`)
                  .join(' • ')
              )}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Page>
  );
}

/**
 * 2. EXECUTIVE SLATE PDF TEMPLATE (2 Colunas: Sidebar Esquerda 32% + Principal 68%)
 */
function ExecutiveSlatePdfPage({
  content,
  labels,
  scale,
  forceOnePage,
  photoSrc,
}: InternalTemplateProps) {
  const p = content.personalInfo;
  const s = (v: number) => Math.round(v * scale * 100) / 100;

  return (
    <Page
      size="A4"
      style={{
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        fontSize: s(9.2),
        color: '#1e293b',
      }}
      wrap={!forceOnePage}
    >
      {/* Barra Lateral Esquerda (32%) */}
      <View
        style={{
          width: '32%',
          backgroundColor: '#f8fafc',
          paddingVertical: s(24),
          paddingHorizontal: s(18),
          borderRightWidth: 1,
          borderRightColor: '#e2e8f0',
        }}
      >
        {photoSrc ? (
          <View
            style={{
              alignItems: 'center',
              marginBottom: s(12),
              paddingBottom: s(10),
              borderBottomWidth: 0.75,
              borderBottomColor: '#e2e8f0',
            }}
          >
            <View
              style={{
                width: s(64),
                height: s(86),
                borderRadius: 6,
                overflow: 'hidden',
                borderWidth: 1.5,
                borderColor: '#ffffff',
              }}
            >
              <Image
                src={photoSrc}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </View>
          </View>
        ) : null}

        {/* Contato */}
        <View style={{ marginBottom: s(12) }}>
          <Text
            style={{
              fontSize: s(8.8),
              fontFamily: 'Helvetica-Bold',
              color: '#1e3a8a',
              borderBottomWidth: 0.75,
              borderBottomColor: '#bfdbfe',
              paddingBottom: s(2),
              marginBottom: s(4),
            }}
          >
            {labels.contact.toUpperCase()}
          </Text>
          {p.email ? (
            <Text style={{ fontSize: s(8.4), marginBottom: s(2) }}>
              <Link
                src={`mailto:${cleanPdfText(p.email)}`}
                style={{ color: '#475569', textDecoration: 'none' }}
              >
                {cleanPdfText(p.email)}
              </Link>
            </Text>
          ) : null}
          {p.phone ? (
            <Text style={{ fontSize: s(8.4), color: '#475569', marginBottom: s(2) }}>
              {cleanPdfText(p.phone)}
            </Text>
          ) : null}
          {p.location ? (
            <Text style={{ fontSize: s(8.4), color: '#475569', marginBottom: s(2) }}>
              {cleanPdfText(p.location)}
            </Text>
          ) : null}
          {p.linkedinUrl ? (
            <Text style={{ fontSize: s(8.4), marginBottom: s(2) }}>
              <Link
                src={ensureUrlHref(p.linkedinUrl)}
                style={{ color: '#1d4ed8', textDecoration: 'none' }}
              >
                {cleanPdfText(cleanUrlDisplay(p.linkedinUrl))}
              </Link>
            </Text>
          ) : null}
          {p.githubUrl ? (
            <Text style={{ fontSize: s(8.4), marginBottom: s(2) }}>
              <Link
                src={ensureUrlHref(p.githubUrl)}
                style={{ color: '#1d4ed8', textDecoration: 'none' }}
              >
                {cleanPdfText(cleanUrlDisplay(p.githubUrl))}
              </Link>
            </Text>
          ) : null}
          {p.portfolioUrl ? (
            <Text style={{ fontSize: s(8.4) }}>
              <Link
                src={ensureUrlHref(p.portfolioUrl)}
                style={{ color: '#1d4ed8', textDecoration: 'none' }}
              >
                {cleanPdfText(cleanUrlDisplay(p.portfolioUrl))}
              </Link>
            </Text>
          ) : null}
        </View>

        {/* Competências */}
        {(content.skills?.technical?.length > 0 ||
          content.skills?.toolsAndCloud?.length > 0 ||
          content.skills?.softSkills?.length > 0) ? (
          <View style={{ marginBottom: s(12) }}>
            <Text
              style={{
                fontSize: s(8.8),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                borderBottomWidth: 0.75,
                borderBottomColor: '#bfdbfe',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.skills.toUpperCase()}
            </Text>
            {content.skills.technical?.length > 0 ? (
              <View style={{ marginBottom: s(4) }}>
                <Text
                  style={{
                    fontSize: s(8.4),
                    fontFamily: 'Helvetica-Bold',
                    color: '#0f172a',
                    marginBottom: s(1),
                  }}
                >
                  {`${labels.technicalSkills}: `}
                </Text>
                <Text style={{ fontSize: s(8.3), color: '#334155', lineHeight: 1.35 }}>
                  {cleanPdfText(content.skills.technical.join(', '))}
                </Text>
              </View>
            ) : null}
            {content.skills.toolsAndCloud?.length > 0 ? (
              <View style={{ marginBottom: s(4) }}>
                <Text
                  style={{
                    fontSize: s(8.4),
                    fontFamily: 'Helvetica-Bold',
                    color: '#0f172a',
                    marginBottom: s(1),
                  }}
                >
                  {`${labels.toolsAndCloud}: `}
                </Text>
                <Text style={{ fontSize: s(8.3), color: '#334155', lineHeight: 1.35 }}>
                  {cleanPdfText(content.skills.toolsAndCloud.join(', '))}
                </Text>
              </View>
            ) : null}
            {content.skills.softSkills?.length > 0 ? (
              <View>
                <Text
                  style={{
                    fontSize: s(8.4),
                    fontFamily: 'Helvetica-Bold',
                    color: '#0f172a',
                    marginBottom: s(1),
                  }}
                >
                  {`${labels.softSkillsShort}: `}
                </Text>
                <Text style={{ fontSize: s(8.3), color: '#334155', lineHeight: 1.35 }}>
                  {cleanPdfText(content.skills.softSkills.join(', '))}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Educação */}
        {content.education && content.education.length > 0 ? (
          <View style={{ marginBottom: s(12) }}>
            <Text
              style={{
                fontSize: s(8.8),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                borderBottomWidth: 0.75,
                borderBottomColor: '#bfdbfe',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.education.toUpperCase()}
            </Text>
            {content.education.map((edu, idx) => (
              <View key={edu.id || idx} style={{ marginBottom: s(5) }}>
                <Text style={{ fontSize: s(8.5), fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                  {cleanPdfText(edu.degree)}
                </Text>
                <Text style={{ fontSize: s(8.3), color: '#475569' }}>
                  {cleanPdfText(edu.fieldOfStudy)}
                </Text>
                <Text style={{ fontSize: s(8), color: '#64748b' }}>
                  {`${cleanPdfText(edu.institution)} (${cleanPdfText(edu.endDate)})`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Idiomas */}
        {content.languages && content.languages.length > 0 ? (
          <View style={{ marginBottom: s(12) }}>
            <Text
              style={{
                fontSize: s(8.8),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                borderBottomWidth: 0.75,
                borderBottomColor: '#bfdbfe',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.languages.toUpperCase()}
            </Text>
            {content.languages.map((l, idx) => (
              <Text
                key={l.id || idx}
                style={{ fontSize: s(8.4), color: '#334155', marginBottom: s(2) }}
              >
                {`${cleanPdfText(l.language)} (${cleanPdfText(l.level)})`}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Certificações */}
        {content.certifications && content.certifications.length > 0 ? (
          <View>
            <Text
              style={{
                fontSize: s(8.8),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                borderBottomWidth: 0.75,
                borderBottomColor: '#bfdbfe',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.certifications.toUpperCase()}
            </Text>
            {content.certifications.map((c, idx) => (
              <View key={c.id || idx} style={{ marginBottom: s(3) }}>
                <Text style={{ fontSize: s(8.4), fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>
                  {cleanPdfText(c.name)}
                </Text>
                {c.issuer ? (
                  <Text style={{ fontSize: s(8), color: '#64748b' }}>
                    {cleanPdfText(c.issuer)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* Coluna Direita Principal (68%) */}
      <View
        style={{
          width: '68%',
          paddingVertical: s(24),
          paddingHorizontal: s(22),
        }}
      >
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
            paddingBottom: s(8),
            marginBottom: s(10),
          }}
        >
          <Text
            style={{
              fontSize: s(18),
              fontFamily: 'Helvetica-Bold',
              color: '#0f172a',
              marginBottom: s(2),
            }}
          >
            {cleanPdfText(p.fullName).toUpperCase()}
          </Text>
          {p.title ? (
            <Text style={{ fontSize: s(10.5), fontFamily: 'Helvetica-Bold', color: '#1e3a8a' }}>
              {cleanPdfText(p.title)}
            </Text>
          ) : null}
        </View>

        {/* Resumo Profissional */}
        {content.summary ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                marginBottom: s(3),
              }}
            >
              {labels.summary.toUpperCase()}
            </Text>
            <Text style={{ fontSize: s(9.1), color: '#334155', lineHeight: 1.38 }}>
              {cleanPdfText(content.summary)}
            </Text>
          </View>
        ) : null}

        {/* Principais Resultados */}
        {content.keyResults && content.keyResults.length > 0 ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                marginBottom: s(3),
              }}
            >
              {labels.keyResults.toUpperCase()}
            </Text>
            {content.keyResults.map((r, idx) => (
              <BulletItem
                key={idx}
                text={r}
                fontSize={s(9)}
                color="#334155"
                spacing={s(1.8)}
              />
            ))}
          </View>
        ) : null}

        {/* Experiência Profissional */}
        {content.experiences && content.experiences.length > 0 ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                borderBottomWidth: 0.75,
                borderBottomColor: '#e2e8f0',
                paddingBottom: s(2),
                marginBottom: s(5),
              }}
            >
              {labels.experience.toUpperCase()}
            </Text>
            {content.experiences.map((exp, idx) => {
              const endLabel = exp.isCurrent ? labels.present : cleanPdfText(exp.endDate);
              return (
                <View key={exp.id || idx} style={{ marginBottom: s(6.5) }} wrap={false}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: s(9.4),
                        fontFamily: 'Helvetica-Bold',
                        color: '#0f172a',
                        flex: 1,
                        paddingRight: 6,
                      }}
                    >
                      {`${cleanPdfText(exp.role)} `}
                    </Text>
                    <Text style={{ fontSize: s(8.2), color: '#64748b' }}>
                      {`${cleanPdfText(exp.startDate)} — ${endLabel}`}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: s(8.6),
                      fontFamily: 'Helvetica-Bold',
                      color: '#1e40af',
                      marginBottom: s(2),
                    }}
                  >
                    {`${cleanPdfText(exp.company)}${exp.location ? ` • ${cleanPdfText(exp.location)}` : ''}`}
                  </Text>
                  {(exp.highlights || []).map((h, hIdx) => (
                    <BulletItem
                      key={hIdx}
                      text={h}
                      fontSize={s(8.9)}
                      color="#334155"
                      spacing={s(1.6)}
                    />
                  ))}
                  {exp.technologies && exp.technologies.length > 0 ? (
                    <Text style={{ fontSize: s(8.2), color: '#64748b', marginTop: s(1) }}>
                      <Text style={{ fontFamily: 'Helvetica-Bold', color: '#475569' }}>
                        {`${labels.technologies}: `}
                      </Text>
                      {cleanPdfText(exp.technologies.join(', '))}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Projetos Relevantes */}
        {content.projects && content.projects.length > 0 ? (
          <View
            style={{
              paddingTop: s(4),
              borderTopWidth: 0.75,
              borderTopColor: '#f1f5f9',
            }}
          >
            <Text
              style={{
                fontSize: s(9),
                fontFamily: 'Helvetica-Bold',
                color: '#1e3a8a',
                marginBottom: s(4),
              }}
            >
              {labels.projects.toUpperCase()}
            </Text>
            {content.projects.map((proj, pIdx) => (
              <View key={proj.id || pIdx} style={{ marginBottom: s(4.5) }} wrap={false}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Text
                    style={{
                      fontSize: s(9),
                      fontFamily: 'Helvetica-Bold',
                      color: '#0f172a',
                      flex: 1,
                    }}
                  >
                    {`${cleanPdfText(proj.name)} `}
                  </Text>
                  {proj.technologies && proj.technologies.length > 0 ? (
                    <Text style={{ fontSize: s(8), color: '#64748b' }}>
                      {cleanPdfText(proj.technologies.join(', '))}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ fontSize: s(8.7), color: '#475569', lineHeight: 1.35 }}>
                  {cleanPdfText(proj.description)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Page>
  );
}

/**
 * 3. TECH CHARCOAL PDF TEMPLATE
 */
function TechCharcoalPdfPage({
  content,
  labels,
  scale,
  forceOnePage,
  photoSrc,
}: InternalTemplateProps) {
  const p = content.personalInfo;
  const s = (v: number) => Math.round(v * scale * 100) / 100;

  return (
    <Page
      size="A4"
      style={{
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        fontSize: s(9.2),
        color: '#27272a',
        paddingBottom: s(24),
      }}
      wrap={!forceOnePage}
    >
      {/* Header Escuro */}
      <View
        style={{
          backgroundColor: '#18181b',
          color: '#ffffff',
          paddingVertical: s(20),
          paddingHorizontal: s(28),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: s(14),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
          {photoSrc ? (
            <View
              style={{
                width: s(58),
                height: s(78),
                borderRadius: 6,
                overflow: 'hidden',
                borderWidth: 1.5,
                borderColor: '#10b981',
                marginRight: s(14),
              }}
            >
              <Image
                src={photoSrc}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: s(19),
                fontFamily: 'Helvetica-Bold',
                color: '#ffffff',
                marginBottom: s(3),
              }}
            >
              {cleanPdfText(p.fullName)}
            </Text>
            {p.title ? (
              <Text
                style={{
                  fontSize: s(10),
                  fontFamily: 'Courier-Bold',
                  color: '#34d399',
                }}
              >
                {cleanPdfText(p.title)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          {p.location ? (
            <Text style={{ fontSize: s(8.2), fontFamily: 'Courier', color: '#d4d4d8', marginBottom: s(1) }}>
              {cleanPdfText(p.location)}
            </Text>
          ) : null}
          {p.email ? (
            <Text style={{ fontSize: s(8.2), fontFamily: 'Courier', marginBottom: s(1) }}>
              <Link
                src={`mailto:${cleanPdfText(p.email)}`}
                style={{ color: '#d4d4d8', textDecoration: 'none' }}
              >
                {cleanPdfText(p.email)}
              </Link>
            </Text>
          ) : null}
          {p.phone ? (
            <Text style={{ fontSize: s(8.2), fontFamily: 'Courier', color: '#d4d4d8', marginBottom: s(1) }}>
              {cleanPdfText(p.phone)}
            </Text>
          ) : null}
          {p.githubUrl ? (
            <Text style={{ fontSize: s(8.2), fontFamily: 'Courier', marginBottom: s(1) }}>
              <Link
                src={ensureUrlHref(p.githubUrl)}
                style={{ color: '#6ee7b7', textDecoration: 'none' }}
              >
                {cleanPdfText(cleanUrlDisplay(p.githubUrl))}
              </Link>
            </Text>
          ) : null}
          {p.linkedinUrl ? (
            <Text style={{ fontSize: s(8.2), fontFamily: 'Courier', marginBottom: s(1) }}>
              <Link
                src={ensureUrlHref(p.linkedinUrl)}
                style={{ color: '#d4d4d8', textDecoration: 'none' }}
              >
                {cleanPdfText(cleanUrlDisplay(p.linkedinUrl))}
              </Link>
            </Text>
          ) : null}
          {p.portfolioUrl ? (
            <Text style={{ fontSize: s(8.2), fontFamily: 'Courier' }}>
              <Link
                src={ensureUrlHref(p.portfolioUrl)}
                style={{ color: '#6ee7b7', textDecoration: 'none' }}
              >
                {cleanPdfText(cleanUrlDisplay(p.portfolioUrl))}
              </Link>
            </Text>
          ) : null}
        </View>
      </View>

      {/* Corpo */}
      <View style={{ paddingHorizontal: s(28) }}>
        {/* Resumo Profissional */}
        {content.summary ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9.2),
                fontFamily: 'Courier-Bold',
                color: '#18181b',
                borderBottomWidth: 0.75,
                borderBottomColor: '#e4e4e7',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.summary.toUpperCase()}
            </Text>
            <Text style={{ fontSize: s(9.1), color: '#3f3f46', lineHeight: 1.38 }}>
              {cleanPdfText(content.summary)}
            </Text>
          </View>
        ) : null}

        {/* Principais Resultados */}
        {content.keyResults && content.keyResults.length > 0 ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9.2),
                fontFamily: 'Courier-Bold',
                color: '#18181b',
                borderBottomWidth: 0.75,
                borderBottomColor: '#e4e4e7',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.keyResults.toUpperCase()}
            </Text>
            {content.keyResults.map((r, idx) => (
              <BulletItem
                key={idx}
                text={r}
                fontSize={s(9)}
                color="#3f3f46"
                spacing={s(1.8)}
              />
            ))}
          </View>
        ) : null}

        {/* Competências e Tecnologias */}
        {(content.skills?.technical?.length > 0 ||
          content.skills?.toolsAndCloud?.length > 0 ||
          content.skills?.softSkills?.length > 0) ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9.2),
                fontFamily: 'Courier-Bold',
                color: '#18181b',
                borderBottomWidth: 0.75,
                borderBottomColor: '#e4e4e7',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.skillsAndTech.toUpperCase()}
            </Text>
            {content.skills.technical?.length > 0 ? (
              <Text style={{ fontSize: s(8.8), color: '#3f3f46', marginBottom: s(2), lineHeight: 1.35 }}>
                <Text style={{ fontFamily: 'Courier-Bold', color: '#18181b' }}>
                  {`${labels.technicalSkills}: `}
                </Text>
                {cleanPdfText(content.skills.technical.join(', '))}
              </Text>
            ) : null}
            {content.skills.toolsAndCloud?.length > 0 ? (
              <Text style={{ fontSize: s(8.8), color: '#3f3f46', marginBottom: s(2), lineHeight: 1.35 }}>
                <Text style={{ fontFamily: 'Courier-Bold', color: '#18181b' }}>
                  {`${labels.toolsAndCloud}: `}
                </Text>
                {cleanPdfText(content.skills.toolsAndCloud.join(', '))}
              </Text>
            ) : null}
            {content.skills.softSkills?.length > 0 ? (
              <Text style={{ fontSize: s(8.8), color: '#3f3f46', lineHeight: 1.35 }}>
                <Text style={{ fontFamily: 'Courier-Bold', color: '#18181b' }}>
                  {`${labels.softSkillsShort}: `}
                </Text>
                {cleanPdfText(content.skills.softSkills.join(', '))}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Experiência Profissional */}
        {content.experiences && content.experiences.length > 0 ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9.2),
                fontFamily: 'Courier-Bold',
                color: '#18181b',
                borderBottomWidth: 0.75,
                borderBottomColor: '#e4e4e7',
                paddingBottom: s(2),
                marginBottom: s(5),
              }}
            >
              {labels.experience.toUpperCase()}
            </Text>
            {content.experiences.map((exp, idx) => {
              const endLabel = exp.isCurrent ? labels.present : cleanPdfText(exp.endDate);
              return (
                <View key={exp.id || idx} style={{ marginBottom: s(6.5) }} wrap={false}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: s(2),
                    }}
                  >
                    <Text style={{ fontSize: s(9.4), color: '#18181b', flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                        {cleanPdfText(exp.role)}
                      </Text>
                      {` | ${cleanPdfText(exp.company)}${exp.location ? ` • ${cleanPdfText(exp.location)}` : ''} `}
                    </Text>
                    <Text style={{ fontSize: s(8.2), fontFamily: 'Courier', color: '#71717a' }}>
                      {`${cleanPdfText(exp.startDate)} - ${endLabel}`}
                    </Text>
                  </View>
                  {(exp.highlights || []).map((h, hIdx) => (
                    <BulletItem
                      key={hIdx}
                      text={h}
                      fontSize={s(9)}
                      color="#3f3f46"
                      spacing={s(1.6)}
                    />
                  ))}
                  {exp.technologies && exp.technologies.length > 0 ? (
                    <Text
                      style={{
                        fontSize: s(8.2),
                        fontFamily: 'Courier',
                        color: '#52525b',
                        marginTop: s(1.5),
                      }}
                    >
                      <Text style={{ fontFamily: 'Courier-Bold' }}>
                        {`${labels.technologies}: `}
                      </Text>
                      {cleanPdfText(exp.technologies.join(', '))}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Projetos Relevantes */}
        {content.projects && content.projects.length > 0 ? (
          <View style={{ marginBottom: s(9) }}>
            <Text
              style={{
                fontSize: s(9.2),
                fontFamily: 'Courier-Bold',
                color: '#18181b',
                borderBottomWidth: 0.75,
                borderBottomColor: '#e4e4e7',
                paddingBottom: s(2),
                marginBottom: s(4),
              }}
            >
              {labels.projects.toUpperCase()}
            </Text>
            {content.projects.map((proj, pIdx) => (
              <View key={proj.id || pIdx} style={{ marginBottom: s(4.5) }} wrap={false}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Text
                    style={{
                      fontSize: s(9),
                      fontFamily: 'Helvetica-Bold',
                      color: '#18181b',
                      flex: 1,
                    }}
                  >
                    {`${cleanPdfText(proj.name)} `}
                  </Text>
                  {proj.technologies && proj.technologies.length > 0 ? (
                    <Text style={{ fontSize: s(8), fontFamily: 'Courier', color: '#71717a' }}>
                      {cleanPdfText(proj.technologies.join(', '))}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ fontSize: s(8.8), color: '#52525b', lineHeight: 1.35 }}>
                  {cleanPdfText(proj.description)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Rodapé 2 Colunas: Educação + Idiomas & Certificações */}
        <View
          style={{
            flexDirection: 'row',
            borderTopWidth: 0.75,
            borderTopColor: '#e4e4e7',
            paddingTop: s(6),
          }}
          wrap={false}
        >
          {content.education && content.education.length > 0 ? (
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={{
                  fontSize: s(9),
                  fontFamily: 'Courier-Bold',
                  color: '#18181b',
                  marginBottom: s(3),
                }}
              >
                {labels.education.toUpperCase()}
              </Text>
              {content.education.map((edu, idx) => (
                <View key={edu.id || idx} style={{ marginBottom: s(3) }}>
                  <Text style={{ fontSize: s(8.6), fontFamily: 'Helvetica-Bold', color: '#18181b' }}>
                    {`${cleanPdfText(edu.degree)} ${labels.inPreposition} ${cleanPdfText(edu.fieldOfStudy)}`}
                  </Text>
                  <Text style={{ fontSize: s(8.3), color: '#52525b' }}>
                    {`${cleanPdfText(edu.institution)} (${cleanPdfText(edu.endDate)})`}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {(content.languages?.length > 0 || content.certifications?.length > 0) ? (
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: s(9),
                  fontFamily: 'Courier-Bold',
                  color: '#18181b',
                  marginBottom: s(3),
                }}
              >
                {labels.languagesAndCertifications.toUpperCase()}
              </Text>
              {content.languages?.length > 0 ? (
                <Text style={{ fontSize: s(8.5), color: '#3f3f46', marginBottom: s(2) }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', color: '#18181b' }}>
                    {`${labels.languages}: `}
                  </Text>
                  {cleanPdfText(
                    content.languages.map((l) => `${l.language} (${l.level})`).join(', ')
                  )}
                </Text>
              ) : null}
              {content.certifications?.length > 0 ? (
                <Text style={{ fontSize: s(8.5), color: '#3f3f46' }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', color: '#18181b' }}>
                    {`${labels.certifications}: `}
                  </Text>
                  {cleanPdfText(
                    content.certifications
                      .map((c) => `${c.name}${c.issuer ? ` - ${c.issuer}` : ''}`)
                      .join(' • ')
                  )}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Page>
  );
}

/**
 * 4. CLASSIC SERIF PDF TEMPLATE
 */
function ClassicSerifPdfPage({
  content,
  labels,
  scale,
  forceOnePage,
  photoSrc,
}: InternalTemplateProps) {
  const p = content.personalInfo;
  const s = (v: number) => Math.round(v * scale * 100) / 100;

  const sectionHeaderStyle = {
    fontSize: s(9.2),
    fontFamily: 'Helvetica-Bold',
    color: '#1c1917',
    borderBottomWidth: 0.75,
    borderBottomColor: '#d6d3d1',
    paddingBottom: s(2),
    marginBottom: s(4.5),
    textAlign: 'center' as const,
  };

  return (
    <Page
      size="A4"
      style={{
        paddingTop: s(28),
        paddingBottom: s(28),
        paddingHorizontal: s(34),
        backgroundColor: '#fafafa',
        fontFamily: 'Times-Roman',
        fontSize: s(9.8),
        color: '#1c1917',
      }}
      wrap={!forceOnePage}
    >
      {/* Cabeçalho Centralizado */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#a8a29e',
          paddingBottom: s(9),
          marginBottom: s(10),
          alignItems: 'center',
        }}
      >
        {photoSrc ? (
          <View
            style={{
              width: s(58),
              height: s(78),
              borderRadius: 6,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#a8a29e',
              marginBottom: s(6),
            }}
          >
            <Image
              src={photoSrc}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </View>
        ) : null}

        <Text
          style={{
            fontSize: s(21),
            fontFamily: 'Times-Roman',
            color: '#0c0a09',
            marginBottom: s(2),
            textAlign: 'center',
          }}
        >
          {cleanPdfText(p.fullName)}
        </Text>
        {p.title ? (
          <Text
            style={{
              fontSize: s(10.5),
              fontFamily: 'Times-Italic',
              color: '#44403c',
              marginBottom: s(5),
              textAlign: 'center',
            }}
          >
            {cleanPdfText(p.title)}
          </Text>
        ) : null}

        <ContactInlineList
          content={content}
          color="#57534e"
          linkColor="#44403c"
          fontSize={s(8.6)}
          fontFamily="Helvetica"
          centered
        />
      </View>

      {/* Resumo Profissional */}
      {content.summary ? (
        <View style={{ marginBottom: s(9) }}>
          <Text style={sectionHeaderStyle}>{labels.summary.toUpperCase()}</Text>
          <Text style={{ fontSize: s(9.5), color: '#292524', lineHeight: 1.38 }}>
            {cleanPdfText(content.summary)}
          </Text>
        </View>
      ) : null}

      {/* Principais Resultados */}
      {content.keyResults && content.keyResults.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text style={sectionHeaderStyle}>{labels.keyResults.toUpperCase()}</Text>
          {content.keyResults.map((r, idx) => (
            <BulletItem
              key={idx}
              text={r}
              fontSize={s(9.4)}
              color="#292524"
              fontFamily="Times-Roman"
              spacing={s(1.8)}
            />
          ))}
        </View>
      ) : null}

      {/* Experiência Profissional */}
      {content.experiences && content.experiences.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text style={sectionHeaderStyle}>{labels.experience.toUpperCase()}</Text>
          {content.experiences.map((exp, idx) => {
            const endLabel = exp.isCurrent ? labels.present : cleanPdfText(exp.endDate);
            return (
              <View key={exp.id || idx} style={{ marginBottom: s(6.5) }} wrap={false}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Text
                    style={{
                      fontSize: s(9.6),
                      fontFamily: 'Helvetica-Bold',
                      color: '#0c0a09',
                    }}
                  >
                    {`${cleanPdfText(exp.company)} `}
                  </Text>
                  <Text
                    style={{
                      fontSize: s(8.6),
                      fontFamily: 'Times-Italic',
                      color: '#57534e',
                    }}
                  >
                    {`${cleanPdfText(exp.startDate)} – ${endLabel}`}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: s(2),
                  }}
                >
                  <Text
                    style={{
                      fontSize: s(9.2),
                      fontFamily: 'Times-Italic',
                      color: '#44403c',
                    }}
                  >
                    {`${cleanPdfText(exp.role)} `}
                  </Text>
                  {exp.location ? (
                    <Text
                      style={{
                        fontSize: s(8.4),
                        fontFamily: 'Times-Italic',
                        color: '#57534e',
                      }}
                    >
                      {cleanPdfText(exp.location)}
                    </Text>
                  ) : null}
                </View>

                {(exp.highlights || []).map((h, hIdx) => (
                  <BulletItem
                    key={hIdx}
                    text={h}
                    fontSize={s(9.3)}
                    color="#292524"
                    fontFamily="Times-Roman"
                    spacing={s(1.6)}
                  />
                ))}

                {exp.technologies && exp.technologies.length > 0 ? (
                  <Text
                    style={{
                      fontSize: s(8.5),
                      fontFamily: 'Helvetica',
                      color: '#57534e',
                      marginTop: s(1),
                    }}
                  >
                    <Text style={{ fontFamily: 'Helvetica-Bold', color: '#292524' }}>
                      {`${labels.technologies}: `}
                    </Text>
                    {cleanPdfText(exp.technologies.join(', '))}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Projetos Relevantes */}
      {content.projects && content.projects.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text style={sectionHeaderStyle}>{labels.projects.toUpperCase()}</Text>
          {content.projects.map((proj, pIdx) => (
            <View key={proj.id || pIdx} style={{ marginBottom: s(4.5) }} wrap={false}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Text
                  style={{
                    fontSize: s(9.4),
                    fontFamily: 'Helvetica-Bold',
                    color: '#0c0a09',
                  }}
                >
                  {`${cleanPdfText(proj.name)} `}
                </Text>
                {proj.technologies && proj.technologies.length > 0 ? (
                  <Text
                    style={{
                      fontSize: s(8.5),
                      fontFamily: 'Times-Italic',
                      color: '#57534e',
                    }}
                  >
                    {cleanPdfText(proj.technologies.join(', '))}
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontSize: s(9.2), color: '#292524', lineHeight: 1.35 }}>
                {cleanPdfText(proj.description)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Formação Acadêmica */}
      {content.education && content.education.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text style={sectionHeaderStyle}>{labels.education.toUpperCase()}</Text>
          {content.education.map((edu, idx) => (
            <View
              key={edu.id || idx}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: s(3),
              }}
              wrap={false}
            >
              <Text style={{ fontSize: s(9.2), fontFamily: 'Helvetica', color: '#1c1917', flex: 1 }}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                  {cleanPdfText(edu.institution)}
                </Text>
                {` — ${cleanPdfText(edu.degree)} ${labels.inPreposition} ${cleanPdfText(edu.fieldOfStudy)} `}
              </Text>
              <Text style={{ fontSize: s(8.5), fontFamily: 'Helvetica', color: '#57534e' }}>
                {cleanPdfText(edu.endDate)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Competências, Idiomas e Certificações */}
      <View wrap={false}>
        <Text style={sectionHeaderStyle}>
          {labels.skillsAndQualifications.toUpperCase()}
        </Text>
        <View style={{ fontFamily: 'Helvetica', fontSize: s(8.9), color: '#292524' }}>
          {content.skills.technical?.length > 0 ? (
            <Text style={{ marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0c0a09' }}>
                {`${labels.technicalSkillsFull}: `}
              </Text>
              {cleanPdfText(content.skills.technical.join(', '))}
            </Text>
          ) : null}
          {content.skills.toolsAndCloud?.length > 0 ? (
            <Text style={{ marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0c0a09' }}>
                {`${labels.toolsAndCloud}: `}
              </Text>
              {cleanPdfText(content.skills.toolsAndCloud.join(', '))}
            </Text>
          ) : null}
          {content.skills.softSkills?.length > 0 ? (
            <Text style={{ marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0c0a09' }}>
                {`${labels.softSkills}: `}
              </Text>
              {cleanPdfText(content.skills.softSkills.join(', '))}
            </Text>
          ) : null}
          {content.languages?.length > 0 ? (
            <Text style={{ marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0c0a09' }}>
                {`${labels.languages}: `}
              </Text>
              {cleanPdfText(
                content.languages.map((l) => `${l.language} (${l.level})`).join(', ')
              )}
            </Text>
          ) : null}
          {content.certifications?.length > 0 ? (
            <Text style={{ lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0c0a09' }}>
                {`${labels.certifications}: `}
              </Text>
              {cleanPdfText(
                content.certifications
                  .map((c) => `${c.name}${c.issuer ? ` - ${c.issuer}` : ''}`)
                  .join(' • ')
              )}
            </Text>
          ) : null}
        </View>
      </View>
    </Page>
  );
}

/**
 * 5. NORDIC WARM PDF TEMPLATE
 */
function NordicWarmPdfPage({
  content,
  labels,
  scale,
  forceOnePage,
  photoSrc,
}: InternalTemplateProps) {
  const p = content.personalInfo;
  const s = (v: number) => Math.round(v * scale * 100) / 100;

  return (
    <Page
      size="A4"
      style={{
        paddingTop: s(28),
        paddingBottom: s(28),
        paddingHorizontal: s(32),
        backgroundColor: '#fdfbf7',
        fontFamily: 'Helvetica',
        fontSize: s(9.2),
        color: '#1c1917',
      }}
      wrap={!forceOnePage}
    >
      {/* Header Escandinavo */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#e7e5e4',
          paddingBottom: s(10),
          marginBottom: s(10),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, paddingRight: photoSrc ? s(14) : 0 }}>
          <Text
            style={{
              fontSize: s(20),
              fontFamily: 'Helvetica',
              color: '#1c1917',
              marginBottom: s(2),
            }}
          >
            {cleanPdfText(p.fullName)}
          </Text>
          {p.title ? (
            <Text
              style={{
                fontSize: s(10.5),
                fontFamily: 'Helvetica-Bold',
                color: '#78716c',
                marginBottom: s(6),
              }}
            >
              {cleanPdfText(p.title)}
            </Text>
          ) : null}
          <ContactInlineList
            content={content}
            color="#78716c"
            linkColor="#57534e"
            fontSize={s(8.5)}
          />
        </View>

        {photoSrc ? (
          <View
            style={{
              width: s(58),
              height: s(78),
              borderRadius: 6,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#d6d3d1',
            }}
          >
            <Image
              src={photoSrc}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </View>
        ) : null}
      </View>

      {/* Resumo Profissional */}
      {content.summary ? (
        <View style={{ marginBottom: s(9) }}>
          <Text
            style={{
              fontSize: s(8.8),
              fontFamily: 'Helvetica-Bold',
              color: '#78716c',
              marginBottom: s(3),
            }}
          >
            {labels.summary.toUpperCase()}
          </Text>
          <Text style={{ fontSize: s(9.1), color: '#44403c', lineHeight: 1.38 }}>
            {cleanPdfText(content.summary)}
          </Text>
        </View>
      ) : null}

      {/* Principais Resultados */}
      {content.keyResults && content.keyResults.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text
            style={{
              fontSize: s(8.8),
              fontFamily: 'Helvetica-Bold',
              color: '#78716c',
              marginBottom: s(3),
            }}
          >
            {labels.keyResults.toUpperCase()}
          </Text>
          {content.keyResults.map((r, idx) => (
            <BulletItem
              key={idx}
              text={r}
              fontSize={s(9)}
              color="#44403c"
              spacing={s(1.8)}
            />
          ))}
        </View>
      ) : null}

      {/* Experiência Profissional */}
      {content.experiences && content.experiences.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text
            style={{
              fontSize: s(8.8),
              fontFamily: 'Helvetica-Bold',
              color: '#78716c',
              borderBottomWidth: 0.75,
              borderBottomColor: '#e7e5e4',
              paddingBottom: s(2),
              marginBottom: s(5),
            }}
          >
            {labels.experience.toUpperCase()}
          </Text>
          {content.experiences.map((exp, idx) => {
            const endLabel = exp.isCurrent ? labels.present : cleanPdfText(exp.endDate);
            return (
              <View key={exp.id || idx} style={{ marginBottom: s(6.5) }} wrap={false}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: s(2),
                  }}
                >
                  <Text style={{ fontSize: s(9.3), color: '#1c1917', flex: 1, paddingRight: 8 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                      {cleanPdfText(exp.role)}
                    </Text>
                    <Text style={{ color: '#78716c' }}>
                      {` ${labels.atPreposition} ${cleanPdfText(exp.company)}${exp.location ? ` • ${cleanPdfText(exp.location)}` : ''} `}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: s(8.2), color: '#78716c' }}>
                    {`${cleanPdfText(exp.startDate)} — ${endLabel}`}
                  </Text>
                </View>

                {(exp.highlights || []).map((h, hIdx) => (
                  <BulletItem
                    key={hIdx}
                    text={h}
                    fontSize={s(9)}
                    color="#44403c"
                    spacing={s(1.6)}
                  />
                ))}

                {exp.technologies && exp.technologies.length > 0 ? (
                  <Text style={{ fontSize: s(8.2), color: '#78716c', marginTop: s(1) }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                      {`${labels.technologies}: `}
                    </Text>
                    {cleanPdfText(exp.technologies.join(', '))}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Projetos Relevantes */}
      {content.projects && content.projects.length > 0 ? (
        <View style={{ marginBottom: s(9) }}>
          <Text
            style={{
              fontSize: s(8.8),
              fontFamily: 'Helvetica-Bold',
              color: '#78716c',
              borderBottomWidth: 0.75,
              borderBottomColor: '#e7e5e4',
              paddingBottom: s(2),
              marginBottom: s(4),
            }}
          >
            {labels.projects.toUpperCase()}
          </Text>
          {content.projects.map((proj, pIdx) => (
            <View key={proj.id || pIdx} style={{ marginBottom: s(4.5) }} wrap={false}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Text
                  style={{
                    fontSize: s(9.2),
                    fontFamily: 'Helvetica-Bold',
                    color: '#1c1917',
                    flex: 1,
                  }}
                >
                  {`${cleanPdfText(proj.name)} `}
                </Text>
                {proj.technologies && proj.technologies.length > 0 ? (
                  <Text style={{ fontSize: s(8.2), color: '#78716c' }}>
                    {cleanPdfText(proj.technologies.join(', '))}
                  </Text>
                ) : null}
              </View>
              <Text style={{ fontSize: s(8.8), color: '#44403c', lineHeight: 1.35 }}>
                {cleanPdfText(proj.description)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Rodapé 2 Colunas: Educação & Competências */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 0.75,
          borderTopColor: '#e7e5e4',
          paddingTop: s(7),
        }}
        wrap={false}
      >
        {content.education && content.education.length > 0 ? (
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text
              style={{
                fontSize: s(8.8),
                fontFamily: 'Helvetica-Bold',
                color: '#78716c',
                marginBottom: s(3),
              }}
            >
              {labels.education.toUpperCase()}
            </Text>
            {content.education.map((edu, idx) => (
              <View key={edu.id || idx} style={{ marginBottom: s(3.5) }}>
                <Text style={{ fontSize: s(8.8), fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                  {`${cleanPdfText(edu.degree)} ${labels.inPreposition} ${cleanPdfText(edu.fieldOfStudy)}`}
                </Text>
                <Text style={{ fontSize: s(8.4), color: '#78716c' }}>
                  {`${cleanPdfText(edu.institution)} (${cleanPdfText(edu.endDate)})`}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: s(8.8),
              fontFamily: 'Helvetica-Bold',
              color: '#78716c',
              marginBottom: s(3),
            }}
          >
            {labels.skillsAndTech.toUpperCase()}
          </Text>
          {content.skills.technical?.length > 0 ? (
            <Text style={{ fontSize: s(8.5), color: '#44403c', marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                {`${labels.technicalSkills}: `}
              </Text>
              {cleanPdfText(content.skills.technical.join(', '))}
            </Text>
          ) : null}
          {content.skills.toolsAndCloud?.length > 0 ? (
            <Text style={{ fontSize: s(8.5), color: '#44403c', marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                {`${labels.toolsShort}: `}
              </Text>
              {cleanPdfText(content.skills.toolsAndCloud.join(', '))}
            </Text>
          ) : null}
          {content.skills.softSkills?.length > 0 ? (
            <Text style={{ fontSize: s(8.5), color: '#44403c', marginBottom: s(2), lineHeight: 1.35 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                {`${labels.softSkillsShort}: `}
              </Text>
              {cleanPdfText(content.skills.softSkills.join(', '))}
            </Text>
          ) : null}

          {(content.languages?.length > 0 || content.certifications?.length > 0) ? (
            <View
              style={{
                borderTopWidth: 0.75,
                borderTopColor: '#e7e5e4',
                paddingTop: s(3),
                marginTop: s(2),
              }}
            >
              {content.languages?.length > 0 ? (
                <Text style={{ fontSize: s(8.5), color: '#44403c', marginBottom: s(2) }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                    {`${labels.languages}: `}
                  </Text>
                  {cleanPdfText(
                    content.languages.map((l) => `${l.language} (${l.level})`).join(', ')
                  )}
                </Text>
              ) : null}
              {content.certifications?.length > 0 ? (
                <Text style={{ fontSize: s(8.5), color: '#44403c' }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1c1917' }}>
                    {`${labels.certifications}: `}
                  </Text>
                  {cleanPdfText(
                    content.certifications
                      .map((c) => `${c.name}${c.issuer ? ` - ${c.issuer}` : ''}`)
                      .join(' • ')
                  )}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Page>
  );
}

/**
 * Documento PDF Vetorial Principal do Perfect CV
 */
export function ResumePdfDocument({
  content,
  templateId = 'modern-minimal',
  density = 'normal',
  language = 'pt',
  forceOnePage = false,
  photoDataUri,
  title,
}: ResumePdfOptions) {
  const labels = getTemplateLabels(language);
  const scale = computeAdaptiveScale(content, density, forceOnePage);
  const photoSrc =
    photoDataUri ||
    (content.personalInfo.photoUrl?.startsWith('data:image/')
      ? content.personalInfo.photoUrl
      : undefined);

  const pageProps: InternalTemplateProps = {
    content,
    labels,
    scale,
    forceOnePage,
    photoSrc,
  };

  return (
    <Document
      title={cleanPdfText(title || content.personalInfo.fullName || 'Curriculo')}
      author={cleanPdfText(content.personalInfo.fullName)}
      subject={cleanPdfText(content.personalInfo.title)}
      creator="Perfect CV"
      producer="Perfect CV Vector PDF Engine"
    >
      {templateId === 'executive-slate' ? (
        <ExecutiveSlatePdfPage {...pageProps} />
      ) : templateId === 'tech-charcoal' ? (
        <TechCharcoalPdfPage {...pageProps} />
      ) : templateId === 'classic-serif' ? (
        <ClassicSerifPdfPage {...pageProps} />
      ) : templateId === 'nordic-warm' ? (
        <NordicWarmPdfPage {...pageProps} />
      ) : (
        <ModernMinimalPdfPage {...pageProps} />
      )}
    </Document>
  );
}

/**
 * Renderiza o currículo diretamente para um Buffer PDF vetorial com texto 100% selecionável e copiável
 */
export async function renderResumePdfBuffer(options: ResumePdfOptions): Promise<Buffer> {
  const element = React.createElement(ResumePdfDocument, options);
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
