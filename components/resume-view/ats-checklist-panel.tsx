'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AtsValidationReport } from '@/lib/ai/ats-validator';

export interface AtsChecklistPanelProps {
  report: AtsValidationReport;
  onAddMissingKeyword?: (keyword: string) => void;
}

export function AtsChecklistPanel({ report, onAddMissingKeyword }: AtsChecklistPanelProps) {
  const [isExpanded, setIsExpanded] = useState(report.missingKeywords.length > 0 || report.score < 90);

  const scoreColor =
    report.score >= 85
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : report.score >= 65
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-800 border-rose-200';

  return (
    <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-extrabold text-sm ${scoreColor}`}>
            <ShieldCheck className="h-4 w-4" />
            <span>{report.score}%</span>
            <span className="font-semibold text-xs">Aprovação ATS</span>
          </div>
          <div>
            <p className="font-bold text-slate-900">
              Auditoria Automática de Triagem (ATS & Qualidade)
            </p>
            <p className="text-slate-500 text-[11px]">
              Verificação instantânea de palavras-chave da vaga, estrutura semântica, métricas e dados de contato.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Checklist ATS'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          {/* Grid dos 5 critérios ATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {report.checks.map((check) => (
              <div
                key={check.id}
                className={`rounded-xl border p-2.5 space-y-1 ${
                  check.passed
                    ? 'border-emerald-100 bg-emerald-50/40'
                    : 'border-amber-200 bg-amber-50/60'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  {check.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  )}
                  <span className="truncate">{check.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{check.detail}</p>
              </div>
            ))}
          </div>

          {/* Palavras-chave / Requisitos da Vaga */}
          {(report.matchedKeywords.length > 0 || report.missingKeywords.length > 0) && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
              {report.missingKeywords.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-amber-900 block">
                    Requisitos / Termos da Vaga não detectados literalmente (clique para adicionar às Competências):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {report.missingKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => onAddMissingKeyword?.(kw)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-950 transition-colors cursor-pointer"
                        title="Clique para incluir este termo nas Competências Técnicas do currículo"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {report.matchedKeywords.length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block text-[11px]">
                    Requisitos e Palavras-Chave Confirmados no Currículo ({report.matchedKeywords.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {report.matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[10.5px] font-medium text-emerald-800"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
