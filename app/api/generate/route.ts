import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { loadConfig, loadProfile, saveResume } from '@/lib/storage/fs-storage';
import { getAIModelInstance } from '@/lib/ai/client';
import { 
  UserProfileSchema, 
  GeneratedResume, 
  GeneratedResumeSchema,
  TemplateIdEnum
} from '@/lib/ai/schemas';
import { 
  RESUME_GENERATOR_SYSTEM_PROMPT, 
  buildGenerateResumeUserPrompt 
} from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, depth, targetRole, targetJobDetails, templateId } = body;

    // 1. Carrega o perfil profissional mestre
    const masterProfile = await loadProfile();
    if (!masterProfile || !masterProfile.personalInfo.fullName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Seu perfil profissional ainda não foi preenchido. Acesse a aba "Meu Perfil" para cadastrar seus dados ou subir um currículo antigo.',
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
          message: `Chave de API não configurada para o provedor "${activeProvider}". Vá até a aba "Configurações" para inserir sua chave.`,
        },
        { status: 400 }
      );
    }

    const modelInstance = getAIModelInstance(config);

    // 3. Constrói o prompt especializado
    const userPrompt = buildGenerateResumeUserPrompt({
      profile: masterProfile,
      mode: mode || 'generic',
      depth: depth || 'lean',
      targetRole,
      targetJobDetails,
    });

    // 4. Executa a geração estruturada com a LLM
    const { object: tailoredProfile } = await generateObject({
      model: modelInstance,
      schema: UserProfileSchema,
      system: RESUME_GENERATOR_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    // 5. Monta o título do currículo para o histórico
    let title = 'Currículo Profissional';
    if (mode === 'job_specific' && targetJobDetails?.jobTitle) {
      title = `${targetJobDetails.jobTitle}${targetJobDetails.company ? ` - ${targetJobDetails.company}` : ''}`;
    } else if (targetRole) {
      title = `Currículo - ${targetRole}`;
    } else {
      title = `Currículo - ${masterProfile.personalInfo.title || 'Geral'}`;
    }

    const chosenTemplate = TemplateIdEnum.safeParse(templateId).success
      ? templateId
      : 'modern-minimal';

    // 6. Cria o objeto do currículo gerado e salva em data/resumes/[id].json
    const resumeId = `cv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newResume: GeneratedResume = {
      id: resumeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title,
      mode: mode || 'generic',
      depth: depth || 'lean',
      templateId: chosenTemplate,
      targetRole,
      targetJobDetails,
      content: tailoredProfile,
    };

    await saveResume(newResume);

    return NextResponse.json({
      success: true,
      message: 'Currículo gerado e salvo com sucesso!',
      resume: newResume,
    });
  } catch (error: any) {
    console.error('Erro na geração de currículo:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Falha ao gerar o currículo com inteligência artificial.',
      },
      { status: 500 }
    );
  }
}
