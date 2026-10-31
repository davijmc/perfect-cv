import React from 'react';
import { TemplateId, UserProfile, ResumeLanguage } from '@/lib/ai/schemas';
import { ModernMinimalTemplate } from './modern-minimal';
import { ExecutiveSlateTemplate } from './executive-slate';
import { TechCharcoalTemplate } from './tech-charcoal';
import { ClassicSerifTemplate } from './classic-serif';
import { NordicWarmTemplate } from './nordic-warm';

export type TemplateDensity = 'compact' | 'normal' | 'comfortable';

export interface TemplateComponentProps {
  content: UserProfile;
  onUpdateContent?: (updated: UserProfile) => void;
  isEditable?: boolean;
  density?: TemplateDensity;
  language?: ResumeLanguage;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  previewBg: string;
  component: React.ComponentType<TemplateComponentProps>;
}

export const TEMPLATE_CATALOG: Record<TemplateId, TemplateDefinition> = {
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    tagline: 'Branco puro, hierarquia linear e 100% amigável para ATS',
    previewBg: 'bg-white text-slate-900 border-slate-200',
    component: ModernMinimalTemplate,
  },
  'executive-slate': {
    id: 'executive-slate',
    name: 'Executive Slate',
    tagline: 'Duas colunas assimétricas com barra lateral suave e acentos navy',
    previewBg: 'bg-slate-50 text-blue-900 border-slate-300',
    component: ExecutiveSlateTemplate,
  },
  'tech-charcoal': {
    id: 'tech-charcoal',
    name: 'Tech Charcoal',
    tagline: 'Cabeçalho escuro executivo e destaque de stack para engenharia',
    previewBg: 'bg-zinc-900 text-white border-zinc-700',
    component: TechCharcoalTemplate,
  },
  'classic-serif': {
    id: 'classic-serif',
    name: 'Classic Serif',
    tagline: 'Estilo Ivy League/Wall Street com tipografia tradicional de prestígio',
    previewBg: 'bg-stone-50 text-stone-900 border-stone-300',
    component: ClassicSerifTemplate,
  },
  'nordic-warm': {
    id: 'nordic-warm',
    name: 'Nordic Warm',
    tagline: 'Minimalismo escandinavo aconchegante em tom areia refinado',
    previewBg: 'bg-[#fdfbf7] text-[#1c1917] border-[#e7e5e4]',
    component: NordicWarmTemplate,
  },
};
