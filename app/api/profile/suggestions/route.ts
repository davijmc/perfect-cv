import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { loadConfig, loadProfile } from '@/lib/storage/fs-storage';
import { getAIModelInstance } from '@/lib/ai/client';
import { 
  ProfileSuggestionsResponseSchema,
  UserProfile,
  UserProfileSchema
} from '@/lib/ai/schemas';
import { 
  PROFILE_SUGGESTIONS_SYSTEM_PROMPT, 
  buildProfileSuggestionsPrompt 
} from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    let targetProfile: UserProfile | null = null;

    // Tenta ler perfil enviado no corpo da requisição
    try {
      const body = await request.json();
      if (body && typeof body === 'object') {
        const parsed = UserProfileSchema.safeParse(body.profile || body);
        if (parsed.success && parsed.data.personalInfo.fullName) {
          targetProfile = parsed.data;
        }
      }
    } catch {
      // Body vazio ou inválido, usará o perfil salvo em disco
    }

    // Se não veio no body, carrega do disco
    if (!targetProfile) {
      targetProfile = await loadProfile();
    }

    if (
      !targetProfile ||
      (!targetProfile.personalInfo.fullName &&
        !targetProfile.summary &&
        targetProfile.experiences.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Preencha ao menos algumas informações básicas no seu perfil (como resumo, experiências ou habilidades) antes de solicitar sugestões da IA.',
        },
        { status: 400 }
      );
    }

    // 2. Carrega configuração da IA
    const config = await loadConfig();
    const activeProvider = config.activeProvider;
    const providerCfg = config.providers[activeProvider];

    if (activeProvider !== 'ollama' && (!providerCfg || !providerCfg.apiKey)) {
      return NextResponse.json(
        {
          success: false,
          message: `Chave de API não configurada para o provedor "${activeProvider}". Acesse a aba "Configurações" para inserir sua chave.`,
        },
        { status: 400 }
      );
    }

    const modelInstance = getAIModelInstance(config);

    // 3. Executa a análise com a LLM
    const userPrompt = buildProfileSuggestionsPrompt(targetProfile);

    const { object } = await generateObject({
      model: modelInstance,
      schema: ProfileSuggestionsResponseSchema,
      system: PROFILE_SUGGESTIONS_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    // Garante IDs únicos e consistentes em cada sugestão
    const suggestionsWithIds = (object.suggestions || []).map((sug, idx) => ({
      ...sug,
      id: sug.id || `sug-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      status: sug.status || 'pending',
    }));

    return NextResponse.json({
      success: true,
      overallSummary: object.overallSummary || 'Análise de perfil concluída com sucesso.',
      suggestions: suggestionsWithIds,
    });
  } catch (error: any) {
    console.error('Erro ao gerar sugestões para o perfil:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Falha ao analisar o perfil com inteligência artificial.',
      },
      { status: 500 }
    );
  }
}
