'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { JobAnalysisResult } from '@/lib/ai/schemas';

export interface JobAnalysisCardProps {
  analysis: JobAnalysisResult;
  onProceed: () => void;
  isProceeding?: boolean;
  onReset?: () => void;
}

export function JobAnalysisCard({
  analysis,
  onProceed,
  isProceeding = false,
  onReset,
}: JobAnalysisCardProps) {
  const supported = analysis.requirements.filter((r) => r.status === 'supported');
  const notSupported = analysis.requirements.filter((r) => r.status === 'not_supported');
  const partial = analysis.requirements.filter((r) => r.status === 'partial');

  const match = Math.max(0, Math.min(100, Math.round(analysis.matchPercentage)));

  const getMatchColor = (pct: number) => {
    if (pct >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (pct >= 45) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = (pct: number) => {
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 45) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header com cargo, empresa e aderência */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            <Sparkles className="w-3.5 h-3.5" />
            Diagnóstico de Aderência à Vaga
          </div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-500" />
            {analysis.jobTitle}
          </h3>
          {analysis.company && (
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {analysis.company}
            </p>
          )}
        </div>

        {/* Badge de Match */}
        <div className="flex flex-col items-start md:items-end">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-bold text-sm ${getMatchColor(match)}`}>
            <span>{match}%</span>
            <span>Aderência Estimada</span>
          </div>
          <div className="w-full md:w-44 bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(match)}`}
              style={{ width: `${match}%` }}
            />
          </div>
        </div>
      </div>

      {/* Resumo da vaga */}
      {analysis.summary && (
        <div className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
          <span className="font-semibold text-slate-800">Foco da Vaga: </span>
          {analysis.summary}
        </div>
      )}

      {/* Grid de Requisitos: Atendidos vs Ausentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna 1: Requisitos Atendidos */}
        <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Requisitos Atendidos ({supported.length})
            </h4>
            <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
              Alinhado
            </span>
          </div>

          {supported.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              Nenhuma evidência explícita encontrada no seu perfil atual para os requisitos principais.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {supported.map((item, idx) => (
                <li key={idx} className="bg-white rounded-lg p-2.5 border border-emerald-100 text-xs shadow-2xs space-y-1">
                  <p className="font-medium text-slate-800">{item.text}</p>
                  {item.evidence && (
                    <p className="text-slate-500 text-[11px] bg-slate-50 rounded px-2 py-1 border border-slate-100">
                      <span className="font-medium text-emerald-700">Evidência:</span> {item.evidence}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna 2: Requisitos a Integrar */}
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Requisitos a Integrar ({notSupported.length})
            </h4>
            <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-medium">
              Adequação IA
            </span>
          </div>

          <div className="text-[11px] text-slate-600 bg-white/90 border border-indigo-100 rounded-lg p-2.5 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Adequação Automática:</strong> Ao gerar o currículo, a IA incorporará estas competências e realizações nas suas experiências para destacá-lo como o melhor candidato para esta vaga. Você poderá revisar e ajustar qualquer detalhe antes de baixar.
            </span>
          </div>

          {notSupported.length === 0 ? (
            <p className="text-xs text-emerald-700 font-medium">
              Parabéns! Seu perfil cobre todos os requisitos essenciais identificados nesta vaga.
            </p>
          ) : (
            <ul className="space-y-2">
              {notSupported.map((item, idx) => (
                <li key={idx} className="bg-white rounded-lg p-2.5 border border-rose-100 text-xs shadow-2xs">
                  <span className="font-medium text-slate-800">{item.text}</span>
                  {item.importance === 'required' && (
                    <span className="ml-1.5 text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                      Obrigatório na vaga
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Requisitos Parciais (se houver) */}
      {partial.length > 0 && (
        <div className="border border-amber-100 bg-amber-50/40 rounded-xl p-3.5 text-xs space-y-2">
          <h4 className="font-semibold text-amber-900 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Requisitos Parciais / Transferíveis ({partial.length})
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {partial.map((item, idx) => (
              <li key={idx} className="bg-white rounded-lg p-2 border border-amber-100">
                <p className="font-medium text-slate-800">{item.text}</p>
                {item.evidence && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.evidence}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ações: Adequar / Resetar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={isProceeding}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Editar dados da vaga
          </button>
        )}

        <button
          type="button"
          onClick={onProceed}
          disabled={isProceeding}
          className="w-full sm:w-auto ml-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isProceeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando currículo adaptado...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Adequar e Gerar Currículo com Resultados</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
