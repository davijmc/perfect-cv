'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Library, 
  Search, 
  FileText, 
  Sparkles, 
  Calendar, 
  Clock,
  Trash2, 
  Copy, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { GeneratedResume } from '@/lib/ai/schemas';
import { TEMPLATE_CATALOG } from '@/components/resume-view/templates';

export default function ResumesLibraryPage() {
  const [resumes, setResumes] = useState<GeneratedResume[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes');
      const data = await res.json();
      if (data.success && data.resumes) {
        setResumes(data.resumes);
      }
    } catch (err) {
      console.error('Erro ao carregar currículos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o currículo "${title}"?`)) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.message || 'Erro ao excluir.');
      }
    } catch (err: any) {
      alert('Erro na requisição: ' + err.message);
    }
  };

  const handleDuplicate = async (original: GeneratedResume) => {
    try {
      const copy: GeneratedResume = {
        ...original,
        id: `cv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: `${original.title} (Cópia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy),
      });

      const data = await res.json();
      if (data.success) {
        setResumes((prev) => [copy, ...prev]);
      }
    } catch (err: any) {
      alert('Erro ao duplicar: ' + err.message);
    }
  };

  const filteredResumes = resumes.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.targetRole && r.targetRole.toLowerCase().includes(q)) ||
      (r.targetJobDetails?.company && r.targetJobDetails.company.toLowerCase().includes(q))
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Library className="h-8 w-8 text-blue-600" />
            <span>Biblioteca de Currículos</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Acesse, edite e exporte todas as versões e variações de currículos geradas.
          </p>
        </div>

        <Link
          href="/generator"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Novo Currículo</span>
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cargo, empresa ou título..."
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Lista de Currículos */}
      {filteredResumes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-slate-400 mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {search ? 'Nenhum currículo encontrado para a busca' : 'Nenhum currículo gerado ainda'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? 'Tente buscar com outros termos ou limpe a busca.'
                : 'Acesse o Gerador para criar seu primeiro currículo sob medida para uma vaga.'}
            </p>
          </div>
          {!search && (
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ir para o Gerador</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((cv) => {
            const templateMeta = TEMPLATE_CATALOG[cv.templateId] || TEMPLATE_CATALOG['modern-minimal'];
            const createdDateObj = new Date(cv.createdAt || cv.updatedAt);
            const formattedDate = createdDateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = createdDateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={cv.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  {/* Badges de Metadados */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                    <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5">
                      {templateMeta.name}
                    </span>
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 capitalize">
                      {cv.mode === 'job_specific' ? 'Vaga Alvo' : cv.mode === 'generic' ? 'Cargo Alvo' : 'Geral'}
                    </span>
                    <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 capitalize">
                      {cv.depth === 'lean' ? 'Enxuto' : 'Detalhado'}
                    </span>
                  </div>

                  {/* Título & Cargo */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cv.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Gerado em {formattedDate} às {formattedTime}</span>
                    </p>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(cv)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Duplicar currículo"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cv.id, cv.title)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir currículo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <Link
                    href={`/generator?id=${cv.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all"
                  >
                    <span>Abrir & Exportar</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
