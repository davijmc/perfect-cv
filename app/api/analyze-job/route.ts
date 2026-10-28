import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { loadConfig, loadProfile } from '@/lib/storage/fs-storage';
import { getAIModelInstance } from '@/lib/ai/client';
import { JobAnalysisResultSchema } from '@/lib/ai/schemas';
import { 
  JOB_ANALYZER_SYSTEM_PROMPT, 
  buildJobAnalysisPrompt 
} from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawDescription, jobTitle, company } = body;

    if (!rawDescription || typeof rawDescription !== 'string' || !rawDescription.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'A descrição da vaga é obrigatória para realizar o diagnóstico de requisitos.',
        },
        { status: 400 }
      );
    }

    // 1. Carrega o perfil profissional mestre do candidato
    const masterProfile = await loadProfile();
    if (!masterProfile || !masterProfile.personalInfo.fullName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Seu perfil profissional ainda não foi preenchido. Acesse a aba "Meu Perfil" para cadastrar seus dados antes de analisar vagas.',
        },
        { status: 400 }
      );
    }

    // 2. Carrega configuração e provedor de IA
    const config = await loadConfig();
    const activeProvider = config.activeProvider;
    const providerCfg = config.providers[activeProvider];

    if (activeProvider !== 'ollama' && (!providerCfg || !providerCfg.apiKey)) {
      return NextResponse.json(
        {
          success: false,
          message: `Chave de API não configurada para o provedor "${activeProvider}". Vá até a aba "Configurações" para inserir sua chave.`,
        },
        { status: 400 }
      );
    }

    const modelInstance = getAIModelInstance(config);

    // 3. Monta o prompt de análise de compatibilidade
    const userPrompt = buildJobAnalysisPrompt({
      profile: masterProfile,
      rawDescription: rawDescription.trim(),
      jobTitle: jobTitle?.trim() || undefined,
      company: company?.trim() || undefined,
    });

    // 4. Executa a extração e classificação estruturada
    const { object: analysis } = await generateObject({
      model: modelInstance,
      schema: JobAnalysisResultSchema,
      system: JOB_ANALYZER_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    // 5. Normaliza e recalibra porcentagem de correspondência para consistência
    let matchPercentage = analysis.matchPercentage;
    if (analysis.requirements.length > 0) {
      const requiredItems = analysis.requirements.filter((r) => r.importance === 'required');
      const targetPool = requiredItems.length > 0 ? requiredItems : analysis.requirements;
      
      const supportedCount = targetPool.filter((r) => r.status === 'supported').length;
      const partialCount = targetPool.filter((r) => r.status === 'partial').length;
      
      const calculatedScore = Math.round(
        ((supportedCount * 1.0 + partialCount * 0.5) / targetPool.length) * 100
      );
      matchPercentage = Math.min(100, Math.max(0, calculatedScore));
    }

    const finalAnalysis = {
      ...analysis,
      jobTitle: analysis.jobTitle || jobTitle || 'Vaga Sem Título',
      company: analysis.company || company || '',
      matchPercentage,
    };

    return NextResponse.json({
      success: true,
      analysis: finalAnalysis,
    });
  } catch (error: any) {
    console.error('Erro na análise da vaga:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Falha ao analisar a vaga com inteligência artificial.',
      },
      { status: 500 }
    );
  }
}
