import { AIProvider } from '@/lib/ai/schemas';

export interface ProviderMeta {
  id: AIProvider;
  name: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  apiKeyHelpUrl?: string;
  apiKeyHelpText?: string;
  requiresApiKey: boolean;
  supportsBaseUrl: boolean;
  defaultBaseUrl?: string;
  popularModels: string[];
}

export const PROVIDERS_META: ProviderMeta[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Padrão Recomendado',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Excelente raciocínio, alta capacidade de contexto e cota gratuita generosa no Google AI Studio.',
    apiKeyHelpUrl: 'https://aistudio.google.com/app/apikey',
    apiKeyHelpText: 'Obter chave gratuita no Google AI Studio',
    requiresApiKey: true,
    supportsBaseUrl: false,
    popularModels: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'Mais Popular',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Modelos GPT-4o e raciocínio avançado com alta precisão na formatação de dados.',
    apiKeyHelpUrl: 'https://platform.openai.com/api-keys',
    apiKeyHelpText: 'Obter chave na OpenAI Platform',
    requiresApiKey: true,
    supportsBaseUrl: true,
    popularModels: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Escrita Executiva',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Linguagem natural excepcional, estilo executivo refinado e grande aderência a instruções de currículo.',
    apiKeyHelpUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyHelpText: 'Obter chave no Console da Anthropic',
    requiresApiKey: true,
    supportsBaseUrl: false,
    popularModels: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
  },
  {
    id: 'groq',
    name: 'Groq',
    badge: 'Latência Zero',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
    description: 'Velocidade extrema de geração com chips LPU rodando modelos Llama 3 abertos.',
    apiKeyHelpUrl: 'https://console.groq.com/keys',
    apiKeyHelpText: 'Obter chave gratuita no Groq Console',
    requiresApiKey: true,
    supportsBaseUrl: true,
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    popularModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    badge: '100% Offline & Grátis',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Execute modelos de IA diretamente na sua GPU/CPU local, sem custos de API e com privacidade absoluta.',
    apiKeyHelpUrl: 'https://ollama.com/',
    apiKeyHelpText: 'Baixar e instalar Ollama',
    requiresApiKey: false,
    supportsBaseUrl: true,
    defaultBaseUrl: 'http://localhost:11434/v1',
    popularModels: ['llama3.2', 'llama3.1:8b', 'mistral', 'deepseek-r1'],
  },
  {
    id: 'omniRoute',
    name: 'OmniRoute / OpenRouter',
    badge: 'Roteador Unificado',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Acesse centenas de modelos através de uma única chave e URL compatível com OpenAI.',
    apiKeyHelpUrl: 'https://openrouter.ai/keys',
    apiKeyHelpText: 'Obter chave no OpenRouter',
    requiresApiKey: true,
    supportsBaseUrl: true,
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    popularModels: ['anthropic/claude-3.5-sonnet', 'google/gemini-flash-1.5', 'openai/gpt-4o-mini'],
  },
];
