'use client';

import React from 'react';
import { TriangleAlert, X } from 'lucide-react';
import type { UnverifiedClaim, UserProfile } from '@/lib/ai/schemas';

interface UnverifiedClaimsBannerProps {
  claims: UnverifiedClaim[];
  content: UserProfile;
  onDismiss: () => void;
}

function describePath(path: string, content: UserProfile): string {
  if (path === 'summary') return 'Resumo profissional';
  let m = /^keyResults\[(\d+)\]$/.exec(path);
  if (m) return `Principais resultados · item ${Number(m[1]) + 1}`;
  m = /^experiences\[(\d+)\]\.highlights\[(\d+)\]$/.exec(path);
  if (m) {
    const exp = content.experiences[Number(m[1])];
    const label = exp ? `${exp.role} · ${exp.company}` : `Experiência ${Number(m[1]) + 1}`;
    return `${label} · item ${Number(m[2]) + 1}`;
  }
  m = /^projects\[(\d+)\]/.exec(path);
  if (m) return `Projeto · ${content.projects[Number(m[1])]?.name || Number(m[1]) + 1}`;
  return path;
}

export function UnverifiedClaimsBanner({ claims, content, onDismiss }: UnverifiedClaimsBannerProps) {
  if (!claims || claims.length === 0) return null;

  return (
    <div
      id="unverified-claims-banner"
      role="alert"
      className="no-print rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm animate-fadeIn"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Encontramos números que não estão no seu perfil</p>
            <p className="mt-0.5 text-amber-800">
              Confirme ou edite estes trechos antes de exportar. Se o número for real, adicione-o ao seu perfil para que as próximas gerações possam usá-lo.
            </p>
          </div>
        </div>
        <button
          type="button"
          id="dismiss-unverified-claims"
          onClick={onDismiss}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          title="Dispensar aviso"
        >
          <X className="h-3.5 w-3.5" />
          <span>Dispensar</span>
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {claims.map((c, i) => (
          <li key={`${c.path}-${i}`} className="rounded-xl border border-amber-200 bg-white/70 p-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              {describePath(c.path, content)}
            </div>
            <p className="mt-0.5 text-slate-700">“{c.text}”</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {c.numbers.map((n) => (
                <span key={n} className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono font-bold text-amber-900">
                  {n}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
