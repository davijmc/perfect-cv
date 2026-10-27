'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Download, 
  Save, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Loader2,
  FileText
} from 'lucide-react';
import { GeneratedResume, TemplateId, UserProfile } from '@/lib/ai/schemas';
import { TemplateCarousel } from './template-carousel';
import { TEMPLATE_CATALOG } from './templates';

interface ResumeCanvasProps {
  initialResume: GeneratedResume;
  onBack?: () => void;
}

export function ResumeCanvas({ initialResume, onBack }: ResumeCanvasProps) {
  const [resume, setResume] = useState<GeneratedResume>(initialResume);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

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
    md += `\n---\n\n## Resumo Profissional\n${c.summary}\n\n## Experiência Profissional\n`;

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
      <div className="no-print sticky top-16 z-40 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur-md shadow-md">
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
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="capitalize">Modo: {resume.mode}</span>
              <span>•</span>
              <span className="capitalize">Profundidade: {resume.depth}</span>
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
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
            title="Abrir diálogo de impressão e salvar como PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {saveBanner && (
        <div className="no-print flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-fadeIn">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Carrossel de Estilos Visuais */}
      <TemplateCarousel
        currentTemplateId={resume.templateId}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Folha A4 Renderizada com o Template Ativo */}
      <div className="flex justify-center overflow-x-auto py-4">
        <TemplateRenderer
          content={resume.content}
          onUpdateContent={handleUpdateContent}
          isEditable={true}
        />
      </div>
    </div>
  );
}
