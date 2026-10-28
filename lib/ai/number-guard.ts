import type { UserProfile, UnverifiedClaim } from './schemas';

/**
 * Guarda determinística de números: garante que todo número do currículo gerado
 * exista no perfil mestre (ou seja derivado das datas de experiência).
 */

export interface NumericToken {
  raw: string;
  canonical: string;
}

const LETTER = 'A-Za-zÀ-ÿ';
const NUMBER_RE = new RegExp(
  `(?<![${LETTER}\\d])(\\d+(?:[.,]\\d+)*)` + // número
    `(?:\\s?(bilhões|bilhão|bi|milhões|milhão|mil|mi|[kKM]))?` + // multiplicador
    `(%|x(?![${LETTER}]))?` + // sufixo % ou "x"
    `(?![${LETTER}\\d])`,
  'g'
);

const MULTIPLIERS: Record<string, number> = {
  mil: 1e3,
  k: 1e3,
  K: 1e3,
  mi: 1e6,
  M: 1e6,
  milhão: 1e6,
  milhões: 1e6,
  bi: 1e9,
  bilhão: 1e9,
  bilhões: 1e9,
};

function parseNumeric(raw: string): number | null {
  let s = raw;
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) {
    s =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '');
  } else if (hasDot) {
    const parts = s.split('.');
    if (parts.length > 2 || parts.slice(1).every((p) => p.length === 3)) {
      s = parts.join('');
    }
  } else if (hasComma) {
    const parts = s.split(',');
    s = parts.length > 2 ? parts.join('') : s.replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function canonical(n: number): string {
  return String(Math.round(n * 1e6) / 1e6);
}

export function extractNumbers(text: string): NumericToken[] {
  const tokens: NumericToken[] = [];
  if (!text) return tokens;
  for (const m of text.matchAll(NUMBER_RE)) {
    const value = parseNumeric(m[1]);
    if (value === null) continue;
    const mult = m[2] ? MULTIPLIERS[m[2]] ?? 1 : 1;
    tokens.push({ raw: m[0].trim(), canonical: canonical(value * mult) });
  }
  return tokens;
}

function parseYearMonth(s: string): number | null {
  const v = (s || '').trim();
  let m = /^(\d{4})(?:-(\d{1,2}))?/.exec(v);
  if (m) return Number(m[1]) * 12 + (m[2] ? Number(m[2]) - 1 : 0);
  m = /^(\d{1,2})\/(\d{4})$/.exec(v);
  if (m) return Number(m[2]) * 12 + Number(m[1]) - 1;
  return null;
}

/** Durações em anos (floor e ceil) de cada experiência e do total sem sobreposição. */
export function deriveExperienceYears(profile: UserProfile, now: Date = new Date()): number[] {
  const nowM = now.getFullYear() * 12 + now.getMonth();
  const intervals: [number, number][] = [];
  for (const e of profile.experiences ?? []) {
    const start = parseYearMonth(e.startDate);
    const end =
      e.isCurrent || /presente|atual|current/i.test(e.endDate || '')
        ? nowM
        : parseYearMonth(e.endDate);
    if (start === null || end === null || end < start) continue;
    intervals.push([start, end]);
  }
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [curStart, curEnd] = intervals[0];
  for (const [s, e] of intervals.slice(1)) {
    if (s <= curEnd) {
      curEnd = Math.max(curEnd, e);
    } else {
      total += curEnd - curStart;
      [curStart, curEnd] = [s, e];
    }
  }
  total += curEnd - curStart;

  const years = new Set<number>();
  for (const months of [total, ...intervals.map(([s, e]) => e - s)]) {
    years.add(Math.floor(months / 12));
    years.add(Math.ceil(months / 12));
  }
  return [...years];
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'id' || k === 'photoUrl') continue;
      collectStrings(v, out);
    }
  }
}

export function buildSourceNumbers(profile: UserProfile, now: Date = new Date()): Set<string> {
  const strings: string[] = [];
  collectStrings(profile, strings);
  const set = new Set<string>();
  for (const s of strings) {
    for (const t of extractNumbers(s)) {
      set.add(t.canonical);
    }
  }
  for (const y of deriveExperienceYears(profile, now)) {
    set.add(canonical(y));
  }
  return set;
}

export function findUnsourcedClaims(
  generated: UserProfile,
  source: UserProfile,
  now: Date = new Date()
): UnverifiedClaim[] {
  const sourceNumbers = buildSourceNumbers(source, now);
  const fields: { path: string; text: string }[] = [{ path: 'summary', text: generated.summary }];
  (generated.keyResults ?? []).forEach((text, i) =>
    fields.push({ path: `keyResults[${i}]`, text })
  );
  (generated.experiences ?? []).forEach((exp, i) =>
    (exp.highlights ?? []).forEach((text, j) =>
      fields.push({ path: `experiences[${i}].highlights[${j}]`, text })
    )
  );
  (generated.projects ?? []).forEach((p, i) =>
    fields.push({ path: `projects[${i}].description`, text: p.description })
  );

  const claims: UnverifiedClaim[] = [];
  for (const { path, text } of fields) {
    const numbers = extractNumbers(text)
      .filter((t) => !sourceNumbers.has(t.canonical))
      .map((t) => t.raw);
    if (numbers.length > 0) {
      claims.push({ path, text, numbers: [...new Set(numbers)] });
    }
  }
  return claims;
}
