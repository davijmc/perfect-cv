import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, LanguageModel } from 'ai';
import { AIProvider, AppConfig } from '@/lib/ai/schemas';

/**
 * Modelos padrão recomendados por provedor
 */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-3.8-flash',
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-latest',
  groq: 'llama-3.3-70b-versatile',
  ollama: 'llama3.2',
  omniRoute: 'anthropic/claude-3.5-sonnet',
};

/**
 * URLs base padrão para provedores compatíveis com OpenAI
 */
export const DEFAULT_BASE_URLS: Partial<Record<AIProvider, string>> = {
  groq: 'https://api.groq.com/openai/v1',
  ollama: 'http://localhost:11434/v1',
  omniRoute: 'https://openrouter.ai/api/v1',
};

/**
 * Resolve o model ID final para um provedor
 */
export function resolveModelId(provider: AIProvider, model?: string): string {
  if (model && model.trim().length > 0) {
    return model.trim();
  }
  return DEFAULT_MODELS[provider] || 'gemini-3.8-flash';
}

/**
 * Cria a instância do modelo de linguagem de acordo com a configuração ativa
 */
export function getAIModelInstance(config: AppConfig): any {
  const provider = config.activeProvider;
  const providerCfg = config.providers[provider] || { apiKey: '', model: '', baseUrl: '' };
  const modelId = resolveModelId(provider, providerCfg.model);

  switch (provider) {
    case 'gemini': {
      const apiKey = providerCfg.apiKey || process.env.GEMINI_API_KEY || '';
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }

    case 'openai': {
      const apiKey = providerCfg.apiKey || process.env.OPENAI_API_KEY || '';
      const openai = createOpenAI({
        apiKey,
        baseURL: providerCfg.baseUrl || undefined,
      });
      return openai(modelId);
    }

    case 'anthropic': {
      const apiKey = providerCfg.apiKey || process.env.ANTHROPIC_API_KEY || '';
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }

    case 'groq': {
      const apiKey = providerCfg.apiKey || process.env.GROQ_API_KEY || '';
      const groq = createOpenAI({
        baseURL: providerCfg.baseUrl || DEFAULT_BASE_URLS.groq,
        apiKey,
      });
      return groq(modelId);
    }

    case 'ollama': {
      // Ollama local não requer chave de API obrigatória
      const ollama = createOpenAI({
        baseURL: providerCfg.baseUrl || DEFAULT_BASE_URLS.ollama,
        apiKey: providerCfg.apiKey || 'ollama',
      });
      return ollama(modelId);
    }

    case 'omniRoute': {
      const apiKey = providerCfg.apiKey || process.env.OPENROUTER_API_KEY || '';
      const omni = createOpenAI({
        baseURL: providerCfg.baseUrl || DEFAULT_BASE_URLS.omniRoute,
        apiKey,
      });
      return omni(modelId);
    }

    default: {
      const google = createGoogleGenerativeAI({ apiKey: providerCfg.apiKey || '' });
      return google(DEFAULT_MODELS.gemini);
    }
  }
}

/**
 * Testa a conexão com o provedor fazendo uma chamada leve de ping
 */
export async function testProviderConnection(
  provider: AIProvider,
  apiKey: string,
  model?: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const modelId = resolveModelId(provider, model);
    let modelInstance: any;

    if (provider === 'gemini') {
      if (!apiKey) throw new Error('Chave de API do Gemini não informada.');
      const google = createGoogleGenerativeAI({ apiKey });
      modelInstance = google(modelId);
    } else if (provider === 'openai') {
      if (!apiKey) throw new Error('Chave de API da OpenAI não informada.');
      const openai = createOpenAI({ apiKey, baseURL: baseUrl || undefined });
      modelInstance = openai(modelId);
    } else if (provider === 'anthropic') {
      if (!apiKey) throw new Error('Chave de API da Anthropic não informada.');
      const anthropic = createAnthropic({ apiKey });
      modelInstance = anthropic(modelId);
    } else if (provider === 'groq') {
      if (!apiKey) throw new Error('Chave de API do Groq não informada.');
      const groq = createOpenAI({ baseURL: baseUrl || DEFAULT_BASE_URLS.groq, apiKey });
      modelInstance = groq(modelId);
    } else if (provider === 'ollama') {
      const ollama = createOpenAI({
        baseURL: baseUrl || DEFAULT_BASE_URLS.ollama,
        apiKey: apiKey || 'ollama',
      });
      modelInstance = ollama(modelId);
    } else if (provider === 'omniRoute') {
      if (!apiKey) throw new Error('Chave de API do OmniRoute / OpenRouter não informada.');
      const omni = createOpenAI({
        baseURL: baseUrl || DEFAULT_BASE_URLS.omniRoute,
        apiKey,
      });
      modelInstance = omni(modelId);
    } else {
      throw new Error(`Provedor ${provider} desconhecido.`);
    }

    // Ping leve com prompt de 1 token
    const result = await generateText({
      model: modelInstance,
      prompt: 'Responda apenas com a palavra: OK',
    });

    if (result && result.text) {
      return {
        success: true,
        message: `Conexão bem-sucedida com ${provider} (${modelId})!`,
      };
    }

    return {
      success: true,
      message: `Conexão estabelecida com ${provider} (${modelId}).`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Falha ao conectar com o provedor de IA.',
    };
  }
}

/**
 * Consulta o endpoint ModelService.ListModels da API do Google Gemini
 * e retorna os modelos disponíveis que suportam o método generateContent.
 */
export async function listGeminiModelsFromApi(apiKey?: string): Promise<string[]> {
  const fallback = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  if (!apiKey || apiKey.trim().length === 0) {
    return fallback;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
    const res = await fetch(url);
    if (!res.ok) {
      return fallback;
    }

    const data = await res.json();
    if (!data.models || !Array.isArray(data.models)) {
      return fallback;
    }

    // Filtra modelos disponíveis que suportam generateContent
    const supported = data.models
      .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => m.name.replace(/^models\//, ''))
      .filter((name: string) => !name.includes('embedding') && !name.includes('aqa'));

    // Pega os 3 mais relevantes (dando preferência aos modelos flash e pro)
    const priority = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const matched = priority.filter((p) => supported.includes(p));
    const others = supported.filter((s: string) => !matched.includes(s));

    const finalTop3 = [...matched, ...others].slice(0, 3);
    return finalTop3.length > 0 ? finalTop3 : fallback;
  } catch (error) {
    console.warn('Erro ao chamar ModelService.ListModels:', error);
    return fallback;
  }
}

