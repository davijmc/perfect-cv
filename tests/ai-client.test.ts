import { describe, it, expect } from 'vitest';
import { resolveModelId, getAIModelInstance, listGeminiModelsFromApi } from '../lib/ai/client';
import { AppConfigSchema } from '../lib/ai/schemas';

describe('AI Client Multi-Provider Resolution', () => {
  it('should resolve default models for each provider when model is empty', () => {
    expect(resolveModelId('gemini', '')).toBe('gemini-3.8-flash');
    expect(resolveModelId('openai', '')).toBe('gpt-4o');
    expect(resolveModelId('anthropic', '')).toBe('claude-3-5-sonnet-latest');
    expect(resolveModelId('groq', '')).toBe('llama-3.3-70b-versatile');
    expect(resolveModelId('ollama', '')).toBe('llama3.2');
  });

  it('should use user specified model when provided', () => {
    expect(resolveModelId('gemini', 'gemini-2.0-flash')).toBe('gemini-2.0-flash');
    expect(resolveModelId('openai', 'o3-mini')).toBe('o3-mini');
  });

  it('should instantiate model without throwing configuration errors', () => {
    const config = AppConfigSchema.parse({
      activeProvider: 'gemini',
      providers: {
        gemini: { apiKey: 'dummy-api-key', model: 'gemini-2.0-flash', baseUrl: '' },
      },
    });

    const modelInstance = getAIModelInstance(config);
    expect(modelInstance).toBeDefined();
    expect(modelInstance.modelId).toBe('gemini-2.0-flash');
  });

  it('should return exactly 3 suggested models from listGeminiModelsFromApi fallback when no key', async () => {
    const models = await listGeminiModelsFromApi('');
    expect(models).toHaveLength(3);
    expect(models).toContain('gemini-2.0-flash');
    expect(models).toContain('gemini-1.5-flash');
    expect(models).toContain('gemini-1.5-pro');
  });
});
