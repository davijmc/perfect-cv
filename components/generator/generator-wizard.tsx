'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Briefcase, 
  Layers, 
  Zap, 
  FileText, 
  Link as LinkIcon, 
  Loader2, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Palette,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { TemplateId, JobAnalysisResult } from '@/lib/ai/schemas';
import { JobAnalysisCard } from './job-analysis-card';

interface GeneratorWizardProps {
  onGenerated: (resume: any) => void;
}

export function GeneratorWizard({ onGenerated }: GeneratorWizardProps) {
  // Modo avançado único com resultados e diagnóstico
  const assistantLevel = 'advanced';

  // Modo de objetivo, profundidade e template
  const [mode, setMode] = useState<'generic' | 'job_specific' | 'from_scratch'>('job_specific');
  const [depth, setDepth] = useState<'lean' | 'detailed'>('lean');
  const [templateId, setTemplateId] = useState<TemplateId>('modern-minimal');

  // Dados da vaga / cargo
  const [targetRole, setTargetRole] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Estados de análise de requisitos da vaga (Modo Avançado)
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResult | null>(null);

  // Estados de scraping e geração
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Extração de link de vaga via scraping
  const handleScrapeJobUrl = async () => {
    if (!jobUrl || !jobUrl.startsWith('http')) {
      setScrapeError('Informe uma URL válida iniciando com http:// ou https://');
      return;
    }
    setIsScraping(true);
    setScrapeError(null);

    try {
      const res = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        if (data.data.isProtected) {
          setScrapeError(data.data.message || 'Página protegida. Cole o texto da vaga abaixo.');
        } else {
          setJobDescription(data.data.description || '');
          if (data.data.title && !targetRole) {
            setTargetRole(data.data.title);
          }
        }
      } else {
        setScrapeError(data.message || 'Não foi possível extrair a vaga do link.');
      }
    } catch (err: any) {
      setScrapeError('Erro ao buscar vaga: ' + err.message);
    } finally {
      setIsScraping(false);
    }
  };

  // Diagnóstico prévio de vaga (Modo Avançado)
  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim() && !jobUrl.trim()) {
      setAnalyzeError('Informe ao menos a descrição ou o link da vaga para realizar o diagnóstico.');
      return;
    }
    setIsAnalyzingJob(true);
    setAnalyzeError(null);

    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawDescription: jobDescription.trim(),
          jobTitle: targetRole.trim() || undefined,
          company: company.trim() || undefined,
          url: jobUrl.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.success && data.analysis) {
        setJobAnalysis(data.analysis);
        if (data.analysis.jobTitle && !targetRole) {
          setTargetRole(data.analysis.jobTitle);
        }
        if (data.analysis.company && !company) {
          setCompany(data.analysis.company);
        }
      } else {
        setAnalyzeError(data.message || 'Falha ao analisar os requisitos da vaga.');
      }
    } catch (err: any) {
      setAnalyzeError('Erro na análise da vaga: ' + err.message);
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  // Geração do currículo final
  const handleGenerate = async (customAnalysis?: JobAnalysisResult | null) => {
    setIsGenerating(true);
    setGenerationError(null);

    const activeAnalysis = customAnalysis !== undefined ? customAnalysis : jobAnalysis;

    try {
      const payload = {
        mode,
        depth,
        templateId,
        assistantLevel,
        jobAnalysis: assistantLevel === 'advanced' ? (activeAnalysis || undefined) : undefined,
        targetRole: targetRole.trim() || undefined,
        targetJobDetails:
          mode === 'job_specific'
            ? {
                company: company.trim() || undefined,
                jobTitle: targetRole.trim() || undefined,
                url: jobUrl.trim() || undefined,
                rawDescription: jobDescription.trim() || undefined,
              }
            : undefined,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.resume) {
        onGenerated(data.resume);
      } else {
        setGenerationError(data.message || 'Falha na geração do currículo.');
      }
    } catch (err: any) {
      setGenerationError('Erro na requisição: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const templatesList: { id: TemplateId; name: string; desc: string; bg: string }[] = [
    { id: 'modern-minimal', name: 'Modern Minimal', desc: 'Branco puro, alta legibilidade ATS', bg: 'bg-white' },
    { id: 'executive-slate', name: 'Executive Slate', desc: 'Duas colunas com barra lateral slate', bg: 'bg-slate-50' },
    { id: 'tech-charcoal', name: 'Tech Charcoal', desc: 'Cabeçalho escuro executivo para tech', bg: 'bg-zinc-900 text-white' },
    { id: 'classic-serif', name: 'Classic Serif', desc: 'Tipografia clássica serifada de prestígio', bg: 'bg-stone-50' },
    { id: 'nordic-warm', name: 'Nordic Warm', desc: 'Minimalismo escandinavo em tom areia', bg: 'bg-[#fdfbf7]' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Escolha do Objetivo do Currículo */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</span>
            <span>Qual é o objetivo deste currículo?</span>
          </h2>
          <p className="text-xs text-slate-600">Selecione como a IA deve adaptar suas experiências e habilidades.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Vaga Específica */}
          <button
            type="button"
            onClick={() => setMode('job_specific')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              mode === 'job_specific'
                ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-3">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Específico para uma Vaga</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Cole o link ou descrição da vaga. A IA calibra palavras-chave para passar com pontuação máxima no ATS.
            </p>
          </button>

          {/* Por Cargo / Área */}
          <button
            type="button"
            onClick={() => {
              setMode('generic');
              setJobAnalysis(null);
            }}
            className={`p-5 rounded-2xl border text-left transition-all ${
              mode === 'generic'
                ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 mb-3">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Por Cargo / Área Alvo</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Informe o cargo pretendido (ex: Tech Lead, Product Manager) para reorganizar os destaques do seu histórico.
            </p>
          </button>

          {/* Do Zero / Geral */}
          <button
            type="button"
            onClick={() => {
              setMode('from_scratch');
              setJobAnalysis(null);
            }}
            className={`p-5 rounded-2xl border text-left transition-all ${
              mode === 'from_scratch'
                ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 mb-3">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Versão Geral Equilibrada</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Gera a melhor versão geral e polida a partir do seu perfil mestre, sem focar em uma vaga em particular.
            </p>
          </button>
        </div>
      </section>

      {/* 2. Detalhes da Vaga ou Cargo Alvo */}
      {mode !== 'from_scratch' && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
            <span>{mode === 'job_specific' ? 'Dados da Vaga Pretendida' : 'Cargo Alvo'}</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Cargo / Título da Vaga</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Ex: Senior Full Stack Engineer"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {mode === 'job_specific' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Empresa (Opcional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Nubank, Mercado Livre, Google"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}
          </div>

          {mode === 'job_specific' && (
            <div className="space-y-4 pt-2">
              {/* Leitura por Link de Vaga */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Link da Vaga (Extração Automática)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Cole aqui o link da vaga (ex: https://gupy.io/... ou https://jobs.lever.co/...)"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={handleScrapeJobUrl}
                    disabled={isScraping || !jobUrl}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {isScraping ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <Zap className="h-4 w-4 text-amber-500" />}
                    <span>Buscar Vaga</span>
                  </button>
                </div>
              </div>

              {scrapeError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{scrapeError}</span>
                </div>
              )}

              {/* Textarea de Descrição e Requisitos da Vaga */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">
                    Descrição & Requisitos da Vaga (Texto)
                  </label>
                  {jobDescription && (
                    <span className="text-[11px] text-emerald-600 font-medium">
                      ✓ Texto carregado ({jobDescription.length} caracteres)
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Cole aqui o texto da vaga, responsabilidades e requisitos técnicos pedidos pelo recrutador..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Fluxo de 2 Etapas do Modo Avançado: Diagnóstico de Requisitos */}
              {assistantLevel === 'advanced' && (
                <div className="pt-2">
                  {jobAnalysis ? (
                    <JobAnalysisCard
                      analysis={jobAnalysis}
                      onProceed={() => handleGenerate(jobAnalysis)}
                      isProceeding={isGenerating}
                      onReset={() => setJobAnalysis(null)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleAnalyzeJob}
                        disabled={isAnalyzingJob || (!jobDescription.trim() && !jobUrl.trim())}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isAnalyzingJob ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            <span>Diagnosticando requisitos e aderência com seu perfil...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span>Diagnosticar Requisitos da Vaga (Ver o que tenho vs o que falta)</span>
                          </>
                        )}
                      </button>

                      {analyzeError && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>{analyzeError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* 3. Nível de Profundidade */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</span>
            <span>Qual o nível de profundidade das descrições?</span>
          </h2>
          <p className="text-xs text-slate-600">Escolha o nível de detalhe que a IA aplicará aos bullet points das suas experiências.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Simples / Enxuto */}
          <button
            type="button"
            onClick={() => setDepth('lean')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              depth === 'lean'
                ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                ⚡ 1 Página Recomendada
              </span>
              {depth === 'lean' && <Check className="h-4 w-4 text-blue-600" />}
            </div>
            <h3 className="font-bold text-slate-900 text-base">Simples & Enxuto</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              2 a 3 bullet points concisos por experiência, com foco direto na ação e no resultado rápido. Perfeito para leitura dinâmica de recrutadores.
            </p>
          </button>

          {/* Detalhado / Profundo */}
          <button
            type="button"
            onClick={() => setDepth('detailed')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              depth === 'detailed'
                ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                🔍 Nível Executivo / Sênior
              </span>
              {depth === 'detailed' && <Check className="h-4 w-4 text-purple-600" />}
            </div>
            <h3 className="font-bold text-slate-900 text-base">Detalhado & Profundo</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              4 a 6 bullet points aprofundados por experiência, detalhando desafios técnicos, arquitetura de sistemas, liderança e métricas de negócio.
            </p>
          </button>
        </div>
      </section>

      {/* 4. Estilo Visual Inicial */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">4</span>
            <span>Escolha o estilo de formatação inicial</span>
          </h2>
          <p className="text-xs text-slate-600">Você poderá alternar livremente entre os 5 estilos no carrossel de visualização.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-5">
          {templatesList.map((tpl) => {
            const isSelected = templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateId(tpl.id)}
                className={`flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className={`h-12 w-full rounded-xl border border-slate-200 mb-2 flex items-center justify-center text-xs font-bold ${tpl.bg}`}>
                    Aa
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{tpl.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{tpl.desc}</p>
                </div>
                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <Check className="h-3 w-3" />
                    <span>Selecionado</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Mensagem de Erro na Geração */}
      {generationError && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{generationError}</span>
        </div>
      )}

      {/* Botão de Ação: Gerar Currículo */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating || isAnalyzingJob}
          className="flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Gerando com Inteligência Artificial...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span>
                {jobAnalysis ? 'Adequar e Gerar Currículo com Resultados' : 'Gerar Currículo com Resultados'}
              </span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
