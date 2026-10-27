'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/lib/ai/schemas';

interface FileDropzoneProps {
  onProfileExtracted: (profile: UserProfile) => void;
}

export function FileDropzone({ onProfileExtracted }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setStatusMessage(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.profile) {
        onProfileExtracted(data.profile);
        setStatusMessage({
          type: 'success',
          text: `Currículo "${file.name}" lido e campos populados com sucesso! Revise e clique em Salvar Perfil abaixo.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Falha ao processar arquivo com a IA.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: 'Erro no envio do arquivo: ' + err.message,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 scale-[1.01]'
            : 'border-slate-300 bg-slate-50/70 hover:border-blue-500 hover:bg-blue-50/30'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleSelectFile}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md text-blue-600">
            {isUploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="h-7 w-7" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>
                {isUploading ? 'Processando currículo com IA...' : 'Importar de Currículo Existente'}
              </span>
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {isUploading
                ? 'Extraindo histórico, empresas, tecnologias e conquistas para preencher o formulário...'
                : 'Arraste seu arquivo PDF, DOCX ou Word aqui ou clique para selecionar. A IA cuidará de estruturar todo o seu histórico.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-slate-500">
            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5">PDF</span>
            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5">DOCX</span>
            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5">DOC</span>
            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5">TXT</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
