'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Pencil, 
  Undo2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Wrench, 
  FileText, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { UserProfile, ProfileSuggestionItem, SuggestionType } from '@/lib/ai/schemas';

export interface ProfileSuggestionsTabProps {
  profile: UserProfile;
  initialSuggestions?: ProfileSuggestionItem[];
  onApplySuggestion: (suggestion: ProfileSuggestionItem, customValue?: string) => Promise<void>;
  onRevertSuggestion?: (suggestion: ProfileSuggestionItem) => Promise<void>;
}

export function ProfileSuggestionsTab({
  profile,
  initialSuggestions = [],
  onApplySuggestion,
  onRevertSuggestion,
}: ProfileSuggestionsTabProps) {
  const [suggestions, setSuggestions] = useState<ProfileSuggestionItem[]>(initialSuggestions);
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro de categorias
  const [selectedFilter, setSelectedFilter] = useState<'all' | SuggestionType>('all');

  // Estado de edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState<string>('');

  // Estados de ação por item (loading)
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        if (data.overallSummary) {
          setOverallSummary(data.overallSummary);
        }
      } else {
        setError(data.message || 'Falha ao analisar o perfil com IA.');
      }
    } catch (err: any) {
      setError('Erro na requisição: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (item: ProfileSuggestionItem) => {
    setEditingId(item.id);
    setEditedValue(item.suggestedValue);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedValue('');
  };

  const handleApprove = async (item: ProfileSuggestionItem, customVal?: string) => {
    setProcessingId(item.id);
    try {
      const valueToApply = customVal !== undefined ? customVal : item.suggestedValue;
      await onApplySuggestion(item, valueToApply);

      // Marca a sugestão como aceita
      setSuggestions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'accepted', suggestedValue: valueToApply } : s))
      );
      setEditingId(null);
    } catch (err: any) {
      alert('Erro ao aplicar sugestão: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (item: ProfileSuggestionItem) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, status: 'rejected' } : s))
    );
    if (editingId === item.id) {
      setEditingId(null);
    }
  };

  const handleRevert = async (item: ProfileSuggestionItem) => {
    if (!onRevertSuggestion) return;
    setProcessingId(item.id);
    try {
      await onRevertSuggestion(item);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'pending' } : s))
      );
    } catch (err: any) {
      alert('Erro ao desfazer sugestão: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;

  const filteredSuggestions = suggestions.filter((s) => {
    if (selectedFilter === 'all') return true;
    return s.type === selectedFilter;
  });

  const getTypeBadge = (type: SuggestionType) => {
    switch (type) {
      case 'add_skill':
        return {
          label: '➕ Adicionar Habilidade',
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'remove_skill':
        return {
          label: '➖ Remover Habilidade',
          style: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'grammar_style':
        return {
          label: '✍️ Correção de Escrita',
          style: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'improve_highlight':
        return {
          label: '🚀 Impacto na Experiência',
          style: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'improve_summary':
        return {
          label: '📝 Aprimorar Resumo',
          style: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      default:
        return {
          label: 'Sugestão',
          style: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Botão Principal */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Copiloto de Perfil Mestre
          </div>
          <h3 className="text-xl font-bold text-slate-900">Sugestões Inteligentes de Edição</h3>
          <p className="text-xs text-slate-600 max-w-2xl">
            A IA analisa seu histórico para apontar correções ortográficas, propor habilidades implícitas que você domina e fortalecer verbos de ação para gerar currículos ainda mais fortes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analisando seu perfil...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Analisar Perfil com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Resumo Geral da IA (se houver) */}
      {overallSummary && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Diagnóstico Geral do Perfil:
          </span>
          <p className="leading-relaxed">{overallSummary}</p>
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Filtros e Contadores */}
      {suggestions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({suggestions.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('add_skill')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'add_skill'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ➕ Habilidades
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('remove_skill')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'remove_skill'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              ➖ Remoções
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('grammar_style')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'grammar_style'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              ✍️ Escrita
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('improve_highlight')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'improve_highlight'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              🚀 Impacto
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <span>{pendingCount} pendente(s)</span>
            {acceptedCount > 0 && <span className="text-emerald-600 ml-2">✓ {acceptedCount} aplicada(s)</span>}
          </div>
        </div>
      )}

      {/* Lista de Sugestões em Linhas */}
      {suggestions.length === 0 && !isLoading ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
          <div className="mx-auto w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">Nenhuma sugestão carregada ainda</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Clique no botão acima <strong>"Analisar Perfil com IA"</strong> para auditar seu cadastro e obter recomendações de escrita e habilidades.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((item) => {
            const badge = getTypeBadge(item.type);
            const isEditing = editingId === item.id;
            const isProcessing = processingId === item.id;
            const isAccepted = item.status === 'accepted';
            const isRejected = item.status === 'rejected';

            if (isRejected) {
              return null; // Oculta sugestões rejeitadas da lista principal
            }

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4.5 transition-all text-xs space-y-3 shadow-2xs ${
                  isAccepted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Linha de Cabeçalho: Badge + Título */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${badge.style}`}>
                      {badge.label}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{item.title}</h5>
                  </div>

                  {isAccepted && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aplicado ao perfil
                    </span>
                  )}
                </div>

                {/* Justificativa da IA */}
                <p className="text-slate-600 leading-relaxed text-xs">
                  <span className="font-medium text-slate-800">Por que sugerimos: </span>
                  {item.reason}
                </p>

                {/* Comparativo Antes vs Depois (ou Modo de Edição) */}
                {isEditing ? (
                  <div className="bg-slate-50 rounded-xl p-3 border border-indigo-200 space-y-2">
                    <label className="text-[11px] font-bold text-indigo-900 block">
                      Editar valor sugerido antes de aprovar:
                    </label>
                    <textarea
                      rows={2}
                      value={editedValue}
                      onChange={(e) => setEditedValue(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200 cursor-pointer font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(item, editedValue)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                      >
                        Salvar e Aprovar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5">
                    {item.originalValue && (
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Atual no perfil: </span>
                        <span className="line-through text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.originalValue}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-slate-900">
                      <span className="font-semibold text-slate-700">Sugestão proposta: </span>
                      <span className="font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {item.suggestedValue}
                      </span>
                    </div>
                  </div>
                )}

                {/* Barra de Ações da Linha */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    Alvo: <span className="font-mono text-slate-600">{item.targetField}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      onRevertSuggestion && (
                        <button
                          type="button"
                          onClick={() => handleRevert(item)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Desfazer</span>
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReject(item)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rejeitar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Aprovar</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
