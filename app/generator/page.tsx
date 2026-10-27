'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { GeneratorWizard } from '@/components/generator/generator-wizard';
import { ResumeCanvas } from '@/components/resume-view/resume-canvas';
import { GeneratedResume } from '@/lib/ai/schemas';

function GeneratorContent() {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get('id');

  const [activeResume, setActiveResume] = useState<GeneratedResume | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se tiver um ID na URL, busca o currículo do disco
  useEffect(() => {
    if (resumeIdParam) {
      setIsLoading(true);
      fetch(`/api/resumes/${resumeIdParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.resume) {
            setActiveResume(data.resume);
          }
        })
        .catch((err) => console.error('Erro ao carregar currículo:', err))
        .finally(() => setIsLoading(false));
    }
  }, [resumeIdParam]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Se já tiver um currículo gerado ou selecionado, exibe o Canvas com o Carrossel e Edição
  if (activeResume) {
    return (
      <ResumeCanvas
        initialResume={activeResume}
        onBack={() => setActiveResume(null)}
      />
    );
  }

  // Caso contrário, exibe o Wizard de Geração
  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <span>Gerador Inteligente de Currículo</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Personalize seu currículo com inteligência artificial para cargos ou vagas específicas, otimizando para os sistemas de triagem ATS.
        </p>
      </div>

      <GeneratorWizard onGenerated={(resume) => setActiveResume(resume)} />
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <GeneratorContent />
    </Suspense>
  );
}
