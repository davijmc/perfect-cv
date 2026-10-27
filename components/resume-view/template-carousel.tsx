'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Check, Palette } from 'lucide-react';
import { TemplateId } from '@/lib/ai/schemas';
import { TEMPLATE_CATALOG } from './templates';

interface TemplateCarouselProps {
  currentTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export function TemplateCarousel({ currentTemplateId, onSelectTemplate }: TemplateCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const templates = Object.values(TEMPLATE_CATALOG);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="no-print space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Estilo de Formatação do Currículo
          </h3>
          <span className="text-xs text-slate-500">• 5 Variações Profissionais</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={scrollLeft}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Estilo anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Próximo estilo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carrossel de Cards de Estilo */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
      >
        {templates.map((tpl) => {
          const isSelected = currentTemplateId === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelectTemplate(tpl.id)}
              className={`flex-shrink-0 w-52 p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {/* Miniatura visual de silhueta */}
              <div
                className={`h-16 w-full rounded-lg border p-2 flex flex-col justify-between mb-2 shadow-sm ${tpl.previewBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-2 w-16 rounded bg-current opacity-70" />
                  <div className="h-1.5 w-6 rounded bg-current opacity-40" />
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded bg-current opacity-30" />
                  <div className="h-1.5 w-4/5 rounded bg-current opacity-30" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{tpl.name}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{tpl.tagline}</p>
                </div>
                {isSelected && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
