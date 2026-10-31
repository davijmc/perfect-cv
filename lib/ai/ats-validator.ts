import type { GeneratedResume, UserProfile } from './schemas';
import { extractNumbers } from './number-guard';

export interface AtsCheckItem {
  id: 'contact' | 'sections' | 'metrics' | 'action_verbs' | 'keywords';
  label: string;
  passed: boolean;
  detail: string;
}

export interface AtsValidationReport {
  score: number;
  checks: AtsCheckItem[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'entre',
  'na', 'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por',
  'que', 'se', 'sem', 'sob', 'sobre', 'sua', 'suas', 'seu', 'seus', 'um', 'uma', 'uns', 'umas',
  'conhecimento', 'conhecimentos', 'experiencia', 'familiaridade', 'nocoes', 'interesse',
  'capacidade', 'habilidade', 'habilidades', 'dominio', 'atuar', 'disponibilidade', 'perfil',
  'boa', 'bom', 'forte', 'solida', 'solido', 'completo', 'completa', 'cursos', 'area', 'areas',
  'nivel', 'anos', 'ano', 'minimo', 'desejavel', 'obrigatorio', 'requisito', 'requisitos',
]);

const PASSIVE_PATTERNS = /\b(respons[aá]vel por|participei de|ajudei a|auxiliei na|trabalhei com)\b/i;

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildResumeCorpus(content: UserProfile): string {
  const parts: string[] = [
    content.personalInfo.fullName,
    content.personalInfo.title,
    content.personalInfo.location,
    content.summary,
    ...(content.keyResults || []),
    ...(content.skills.technical || []),
    ...(content.skills.toolsAndCloud || []),
    ...(content.skills.softSkills || []),
  ];

  for (const exp of content.experiences || []) {
    parts.push(exp.role, exp.company, exp.location, ...(exp.highlights || []), ...(exp.technologies || []));
  }
  for (const proj of content.projects || []) {
    parts.push(proj.name, proj.description, ...(proj.technologies || []));
  }
  for (const edu of content.education || []) {
    parts.push(edu.degree, edu.fieldOfStudy, edu.institution);
  }
  for (const cert of content.certifications || []) {
    parts.push(cert.name, cert.issuer);
  }
  for (const lang of content.languages || []) {
    parts.push(lang.language, lang.level);
  }

  return normalizeText(parts.filter(Boolean).join(' | '));
}

function isRequirementPresentInCorpus(requirementText: string, normalizedCorpus: string): boolean {
  const normReq = normalizeText(requirementText).trim();
  if (!normReq) return true;

  if (normalizedCorpus.includes(normReq)) {
    return true;
  }

  const tokens = normReq
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  if (tokens.length === 0) return true;

  const matchedCount = tokens.filter((token) => normalizedCorpus.includes(token)).length;
  const threshold = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.6);

  return matchedCount >= threshold;
}

export function evaluateAtsCompliance(resume: GeneratedResume): AtsValidationReport {
  const c = resume.content;
  const p = c.personalInfo;
  const corpus = buildResumeCorpus(c);

  // 1. Dados de Contato Essenciais (15 pts)
  const hasName = Boolean(p.fullName?.trim());
  const hasEmail = Boolean(p.email?.trim());
  const hasPhone = Boolean(p.phone?.trim());
  const hasLocation = Boolean(p.location?.trim());
  const contactPassed = hasName && hasEmail && hasPhone && hasLocation;
  const contactScore =
    (hasName ? 4 : 0) + (hasEmail ? 5 : 0) + (hasPhone ? 3 : 0) + (hasLocation ? 3 : 0);

  // 2. Estrutura & Seções Padrão ATS (20 pts)
  const hasTitle = Boolean(p.title?.trim());
  const hasSummary = Boolean(c.summary && c.summary.trim().length >= 60);
  const hasExperiences = (c.experiences?.length || 0) > 0;
  const hasEducation = (c.education?.length || 0) > 0;
  const hasSkills =
    (c.skills?.technical?.length || 0) + (c.skills?.toolsAndCloud?.length || 0) >= 3;
  const sectionsPassed = hasTitle && hasSummary && hasExperiences && hasEducation && hasSkills;
  const sectionsScore =
    (hasTitle ? 4 : 0) +
    (hasSummary ? 4 : 0) +
    (hasExperiences ? 5 : 0) +
    (hasEducation ? 3 : 0) +
    (hasSkills ? 4 : 0);

  // 3. Densidade de Impacto e Métricas (15 pts)
  const metricStrings = [
    c.summary,
    ...(c.keyResults || []),
    ...(c.experiences || []).flatMap((e) => e.highlights || []),
  ];
  const totalNumbers = metricStrings.reduce(
    (acc, str) => acc + extractNumbers(str || '').length,
    0
  );
  const metricsPassed = totalNumbers >= 2;
  const metricsScore = totalNumbers >= 3 ? 15 : totalNumbers >= 1 ? 8 : 0;

  // 4. Assertividade e Verbos de Ação (10 pts)
  const allHighlights = (c.experiences || []).flatMap((e) => e.highlights || []);
  const passiveCount = allHighlights.filter((h) => PASSIVE_PATTERNS.test(h)).length;
  const actionVerbsPassed = allHighlights.length > 0 && passiveCount === 0;
  const actionVerbsScore =
    allHighlights.length === 0 ? 0 : passiveCount === 0 ? 10 : Math.max(4, 10 - passiveCount * 3);

  // 5. Cobertura de Palavras-Chave e Requisitos da Vaga (40 pts)
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const requirements = resume.jobAnalysis?.requirements || [];

  let keywordsScore = 40;
  let keywordsPassed = true;
  let keywordsDetail = 'Todas as competências e palavras-chave da vaga estão presentes no currículo.';

  if (requirements.length > 0) {
    for (const req of requirements) {
      const label = req.text.trim();
      if (!label) continue;
      if (isRequirementPresentInCorpus(label, corpus)) {
        matchedKeywords.push(label);
      } else {
        missingKeywords.push(label);
      }
    }
    const totalReqs = matchedKeywords.length + missingKeywords.length;
    const ratio = totalReqs > 0 ? matchedKeywords.length / totalReqs : 1;
    keywordsScore = Math.round(ratio * 40);
    keywordsPassed = missingKeywords.length === 0;
    keywordsDetail = keywordsPassed
      ? `${matchedKeywords.length}/${totalReqs} requisitos da vaga mapeados no texto do currículo.`
      : `${matchedKeywords.length}/${totalReqs} requisitos encontrados (${missingKeywords.length} pendente(s) para revisão).`;
  } else if (resume.targetRole?.trim()) {
    const rolePresent = isRequirementPresentInCorpus(resume.targetRole, corpus);
    if (rolePresent) {
      matchedKeywords.push(resume.targetRole.trim());
      keywordsScore = 40;
      keywordsPassed = true;
      keywordsDetail = `Cargo alvo "${resume.targetRole}" devidamente destacado no currículo.`;
    } else {
      missingKeywords.push(resume.targetRole.trim());
      keywordsScore = 20;
      keywordsPassed = false;
      keywordsDetail = `Cargo alvo "${resume.targetRole}" não encontrado literalmente no título ou resumo.`;
    }
  } else {
    keywordsDetail = 'Currículo geral estruturado com palavras-chave técnicas padronizadas.';
  }

  const checks: AtsCheckItem[] = [
    {
      id: 'contact',
      label: 'Cabeçalho e Contato ATS',
      passed: contactPassed,
      detail: contactPassed
        ? 'Nome, e-mail, telefone e localização preenchidos e extraíveis.'
        : 'Preencha nome, e-mail, telefone e localização para evitar descarte em triagem.',
    },
    {
      id: 'sections',
      label: 'Seções Essenciais Padronizadas',
      passed: sectionsPassed,
      detail: sectionsPassed
        ? 'Título, Resumo, Experiência, Formação e Competências presentes.'
        : 'Alguma seção essencial (Resumo, Experiência, Formação ou Skills) está vazia ou muito curta.',
    },
    {
      id: 'metrics',
      label: 'Resultados e Métricas Quantificadas',
      passed: metricsPassed,
      detail: metricsPassed
        ? `${totalNumbers} indicadores numéricos de impacto identificados no currículo.`
        : 'Adicione números ou percentuais de impacto nos resultados ou experiências.',
    },
    {
      id: 'action_verbs',
      label: 'Bullets com Verbos de Ação Ativos',
      passed: actionVerbsPassed,
      detail: actionVerbsPassed
        ? 'Descrições iniciadas por verbos fortes, sem expressões passivas.'
        : 'Evite expressões passivas como "responsável por" ou "ajudei a" nos bullets.',
    },
    {
      id: 'keywords',
      label: 'Cobertura de Requisitos & Keywords',
      passed: keywordsPassed,
      detail: keywordsDetail,
    },
  ];

  const totalScore = Math.min(
    100,
    Math.max(0, contactScore + sectionsScore + metricsScore + actionVerbsScore + keywordsScore)
  );

  return {
    score: totalScore,
    checks,
    matchedKeywords,
    missingKeywords,
  };
}
