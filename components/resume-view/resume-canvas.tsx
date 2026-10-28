'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Copy, 
  Download, 
  Save, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Loader2,
  FileText,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { GeneratedResume, TemplateId, UserProfile } from '@/lib/ai/schemas';
import { TemplateCarousel } from './template-carousel';
import { TEMPLATE_CATALOG, TemplateDensity } from './templates';
import { UnverifiedClaimsBanner } from './unverified-claims-banner';

interface ResumeCanvasProps {
  initialResume: GeneratedResume;
  onBack?: () => void;
}

export function ResumeCanvas({ initialResume, onBack }: ResumeCanvasProps) {
  const [resume, setResume] = useState<GeneratedResume>(initialResume);
  const [density, setDensity] = useState<TemplateDensity>(initialResume.depth === 'lean' ? 'compact' : 'normal');
  const [forceOnePage, setForceOnePage] = useState(initialResume.depth === 'lean');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>(0);

  // 297mm em 96 DPI padrão do navegador é 1122.5px
  const A4_HEIGHT_PX = 1122.5;

  useEffect(() => {
    const el = pageContainerRef.current?.querySelector('.a4-page') as HTMLElement | null;
    if (!el) return;

    const measure = () => {
      setPageHeight(el.getBoundingClientRect().height);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [resume, density]);

  const estimatedPages = pageHeight > 0 ? Math.ceil(pageHeight / A4_HEIGHT_PX) : 1;
  const isSinglePage = pageHeight > 0 && pageHeight <= (A4_HEIGHT_PX + 4);
  const fullnessPercentage = Math.min(100, Math.round((pageHeight / A4_HEIGHT_PX) * 100));

  const currentTemplate = TEMPLATE_CATALOG[resume.templateId] || TEMPLATE_CATALOG['modern-minimal'];
  const TemplateRenderer = currentTemplate.component;

  const handleSelectTemplate = async (templateId: TemplateId) => {
    const updated: GeneratedResume = {
      ...resume,
      templateId,
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);

    // Salva a preferência de template no disco em background
    try {
      await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // Falha silenciosa em background
    }
  };

  const handleUpdateContent = (updatedContent: UserProfile) => {
    setResume({
      ...resume,
      content: updatedContent,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveBanner(null);
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume),
      });
      const data = await res.json();
      if (data.success) {
        setSaveBanner('Currículo e edições salvos com sucesso!');
        setTimeout(() => setSaveBanner(null), 4000);
      }
    } catch (err: any) {
      alert('Erro ao salvar alterações: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissClaims = async () => {
    const updated: GeneratedResume = {
      ...resume,
      unverifiedClaims: [],
      updatedAt: new Date().toISOString(),
    };
    setResume(updated);
    try {
      await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // Falha silenciosa em background
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const c = resume.content;
    let md = `# ${c.personalInfo.fullName}\n`;
    md += `**${c.personalInfo.title}**\n\n`;
    md += `* ${c.personalInfo.location || ''} | ${c.personalInfo.email || ''} | ${c.personalInfo.phone || ''}\n`;
    if (c.personalInfo.linkedinUrl) md += `* LinkedIn: ${c.personalInfo.linkedinUrl}\n`;
    if (c.personalInfo.githubUrl) md += `* GitHub: ${c.personalInfo.githubUrl}\n`;
    md += `\n---\n\n## Resumo Profissional\n${c.summary}\n\n`;
    if (c.keyResults?.length > 0) {
      md += `## Principais Resultados\n`;
      c.keyResults.forEach((r) => {
        md += `- ${r}\n`;
      });
      md += `\n`;
    }
    md += `## Experiência Profissional\n`;

    c.experiences.forEach((exp) => {
      md += `\n### ${exp.role} — ${exp.company}\n`;
      md += `*${exp.startDate} - ${exp.isCurrent ? 'Presente' : exp.endDate} | ${exp.location || ''}*\n\n`;
      exp.highlights.forEach((h) => {
        md += `- ${h}\n`;
      });
      if (exp.technologies?.length > 0) {
        md += `*Tecnologias:* ${exp.technologies.join(', ')}\n`;
      }
    });

    if (c.education.length > 0) {
      md += `\n## Formação Acadêmica\n`;
      c.education.forEach((edu) => {
        md += `- **${edu.degree} em ${edu.fieldOfStudy}** — ${edu.institution} (${edu.endDate})\n`;
      });
    }

    if (c.skills.technical?.length > 0) {
      md += `\n## Competências Técnicas\n${c.skills.technical.join(', ')}\n`;
    }

    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Barra de Ações Superior (Oculta na Impressão) */}
      <div className="no-print sticky top-16 z-40 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur-md shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </button>
            )}

            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {resume.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="capitalize">Modo: {resume.mode}</span>
                <span>•</span>
                <span className="capitalize">Profundidade: {resume.depth}</span>
                {resume.createdAt && (
                  <>
                    <span>•</span>
                    <span>Gerado às {new Date(resume.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({new Date(resume.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})</span>
                  </>
                )}
                <span>•</span>
                <span className="font-semibold text-blue-600">Dica: clique em qualquer texto para editar</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Copiar texto estruturado em Markdown"
            >
              {copiedMd ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copiedMd ? 'Copiado!' : 'Markdown'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Baixar arquivo JSON completo"
            >
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Salvar</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
              title="Abrir diálogo de impressão e salvar como PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Linha de Controle de Diagramação e Enquadramento A4 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status da Página A4 */}
            {pageHeight > 0 && (
              isSinglePage ? (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>1 Página A4 perfeita ({fullnessPercentage}% preenchida)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Ocupando {estimatedPages} páginas ({Math.round((pageHeight / A4_HEIGHT_PX) * 100)}% de 1 folha)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDensity('compact');
                      setForceOnePage(true);
                    }}
                    className="ml-1 rounded-md bg-amber-200/70 hover:bg-amber-200 px-2 py-0.5 font-bold text-amber-900 transition-colors cursor-pointer"
                  >
                    Ajustar para 1 página
                  </button>
                </div>
              )
            )}

            {/* Seletor de Densidade */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="px-2 text-[11px] font-semibold text-slate-500">Espaçamento:</span>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  density === 'compact'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Reduz margens e entrelinha para caber em 1 página"
              >
                Compacto (1 Pág)
              </button>
              <button
                type="button"
                onClick={() => setDensity('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  density === 'normal'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  density === 'comfortable'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Confortável
              </button>
            </div>
          </div>

          {/* Opção de travar 1 página estrita no PDF */}
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceOnePage}
              onChange={(e) => setForceOnePage(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-medium text-xs">Forçar 1 página estrita no PDF</span>
          </label>
        </div>
      </div>

      {saveBanner && (
        <div className="no-print flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-fadeIn">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Banner de Números Não Verificados no Perfil */}
      <UnverifiedClaimsBanner
        claims={resume.unverifiedClaims || []}
        content={resume.content}
        onDismiss={handleDismissClaims}
      />

      {/* Carrossel de Estilos Visuais */}
      <TemplateCarousel
        currentTemplateId={resume.templateId}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Folha A4 Renderizada com o Template Ativo */}
      <div 
        id="resume-canvas-wrapper" 
        ref={pageContainerRef}
        className={`resume-canvas-container relative flex justify-center overflow-x-auto py-4 ${forceOnePage ? 'print-force-one-page' : ''}`}
      >
        {/* Linha visual de quebra da página 1 se ultrapassar 1122.5px */}
        {pageHeight > (A4_HEIGHT_PX + 4) && (
          <div
            className="no-print absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-center border-b-2 border-dashed border-rose-400"
            style={{ top: '1138.5px' }}
          >
            <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-0.5 text-[10.5px] font-bold text-rose-700 shadow-xs -mb-2.5">
              ✂️ Fim da Página 1 (297mm A4) • O conteúdo abaixo entrará na página 2
            </span>
          </div>
        )}

        {/* Linha visual de quebra da página 2 se ultrapassar 2245px */}
        {pageHeight > (A4_HEIGHT_PX * 2 + 4) && (
          <div
            className="no-print absolute left-0 right-0 z-30 pointer-events-none flex items-center justify-center border-b-2 border-dashed border-rose-400"
            style={{ top: '2261px' }}
          >
            <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-0.5 text-[10.5px] font-bold text-rose-700 shadow-xs -mb-2.5">
              ✂️ Fim da Página 2 (594mm A4) • O conteúdo abaixo entrará na página 3
            </span>
          </div>
        )}

        <TemplateRenderer
          content={resume.content}
          onUpdateContent={handleUpdateContent}
          isEditable={true}
          density={density}
        />
      </div>

      {/* Escala dinâmica para impressão garantindo 100% de enquadramento em 1 página A4 se forceOnePage estiver ativo */}
      {forceOnePage && pageHeight > A4_HEIGHT_PX && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media print {
                .a4-page {
                  transform: scale(${Math.min(1, A4_HEIGHT_PX / pageHeight).toFixed(4)}) !important;
                  transform-origin: top center !important;
                }
              }
            `,
          }}
        />
      )}
    </div>
  );
}
