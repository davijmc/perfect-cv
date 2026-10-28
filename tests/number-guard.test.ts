import { describe, it, expect } from 'vitest';
import {
  extractNumbers,
  deriveExperienceYears,
  findUnsourcedClaims,
} from '../lib/ai/number-guard';
import { UserProfileSchema, UserProfile } from '../lib/ai/schemas';

const NOW = new Date('2026-10-28T12:00:00Z');

function makeProfile(overrides: Record<string, unknown> = {}): UserProfile {
  return UserProfileSchema.parse({ personalInfo: { fullName: 'Ana' }, ...overrides });
}

const canon = (text: string) => extractNumbers(text).map((t) => t.canonical);

describe('extractNumbers', () => {
  it('normaliza formatos pt-BR, porcentagem, multiplicadores e "x"', () => {
    expect(canon('1.200 usuários')).toEqual(['1200']);
    expect(canon('1,5 ponto')).toEqual(['1.5']);
    expect(canon('reduziu 30%')).toEqual(['30']);
    expect(canon('R$ 50M')).toEqual(['50000000']);
    expect(canon('50 milhões')).toEqual(['50000000']);
    expect(canon('1,5 mil pedidos')).toEqual(['1500']);
    expect(canon('3x mais rápido')).toEqual(['3']);
  });

  it('ignora números colados em letras e não confunde "meses" com milhões', () => {
    expect(canon('AWS S3 e EC2 com OAuth2')).toEqual([]);
    expect(canon('em 5 meses')).toEqual(['5']);
  });

  it('preserva o texto bruto do token', () => {
    expect(extractNumbers('+R$ 50M de ROI').map((t) => t.raw)).toEqual(['50M']);
    expect(extractNumbers('aumentou 40% as vendas').map((t) => t.raw)).toEqual(['40%']);
  });
});

describe('deriveExperienceYears', () => {
  it('calcula floor/ceil do total sem sobreposição', () => {
    const p = makeProfile({
      experiences: [
        { company: 'A', role: 'Dev', startDate: '2020-01', endDate: '', isCurrent: true },
        { company: 'B', role: 'Dev', startDate: '2021-01', endDate: '2022-01' },
      ],
    });
    // 2020-01 → 2026-10 = 81 meses = 6,75 anos
    expect(deriveExperienceYears(p, NOW)).toEqual(expect.arrayContaining([6, 7]));
  });
});

describe('findUnsourcedClaims', () => {
  const source = makeProfile({
    experiences: [
      {
        company: 'Acme',
        role: 'Analista',
        startDate: '2020-01',
        endDate: '',
        isCurrent: true,
        highlights: ['Reduziu o fechamento mensal de 5 para 2 dias com VBA.'],
      },
    ],
  });

  it('aceita números presentes no perfil', () => {
    const generated = makeProfile({
      experiences: [
        { company: 'Acme', role: 'Analista', highlights: ['Reduziu o fechamento de 5 para 2 dias automatizando a conciliação.'] },
      ],
    });
    expect(findUnsourcedClaims(generated, source, NOW)).toEqual([]);
  });

  it('sinaliza número inventado com o path correto', () => {
    const generated = makeProfile({
      experiences: [
        { company: 'Acme', role: 'Analista', highlights: ['Reduziu o fechamento de 5 para 2 dias.', 'Aumentou as vendas em 40%.'] },
      ],
    });
    expect(findUnsourcedClaims(generated, source, NOW)).toEqual([
      { path: 'experiences[0].highlights[1]', text: 'Aumentou as vendas em 40%.', numbers: ['40%'] },
    ]);
  });

  it('aceita anos de experiência derivados das datas', () => {
    const generated = makeProfile({ summary: 'Analista com 6 anos de experiência em finanças.' });
    expect(findUnsourcedClaims(generated, source, NOW)).toEqual([]);
  });

  it('sinaliza o caso "+R$ 50M de ROI" sem fonte em keyResults', () => {
    const generated = makeProfile({ keyResults: ['+R$ 50M em ROI gerado para clientes.'] });
    const claims = findUnsourcedClaims(generated, source, NOW);
    expect(claims).toHaveLength(1);
    expect(claims[0].path).toBe('keyResults[0]');
    expect(claims[0].numbers).toEqual(['50M']);
  });

  it('não aceita "5" solto como fonte de "R$ 5 mil"', () => {
    const generated = makeProfile({ keyResults: ['Economizou R$ 5 mil por mês.'] });
    expect(findUnsourcedClaims(generated, source, NOW)[0]?.numbers).toEqual(['5 mil']);
  });

  it('sinaliza número que só existiria na vaga', () => {
    const junior = makeProfile({
      experiences: [{ company: 'X', role: 'Dev', startDate: '2024-01', endDate: '2025-12' }],
    });
    const generated = makeProfile({ summary: 'Dev com 5 anos de experiência em Kubernetes.' });
    expect(findUnsourcedClaims(generated, junior, NOW)[0]?.numbers).toEqual(['5']);
  });
});
