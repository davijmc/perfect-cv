import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { extractTextFromPdf } from '@/lib/parser/pdf-parser';
import { extractTextFromDocx } from '@/lib/parser/docx-parser';
import { getAIModelInstance } from '@/lib/ai/client';
import { loadConfig } from '@/lib/storage/fs-storage';
import { UserProfileSchema } from '@/lib/ai/schemas';
import { CV_PARSER_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    let extractedText = '';

    if (fileName.endsWith('.pdf')) {
      extractedText = await extractTextFromPdf(buffer);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      extractedText = await extractTextFromDocx(buffer);
    } else if (fileName.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { success: false, message: 'Formato de arquivo não suportado. Envie PDF, DOCX ou TXT.' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Não foi possível extrair texto do arquivo fornecido.' },
        { status: 400 }
      );
    }

    // Carrega configurações de IA
    const config = await loadConfig();
    const activeProvider = config.activeProvider;
    const providerCfg = config.providers[activeProvider];

    if (activeProvider !== 'ollama' && (!providerCfg || !providerCfg.apiKey)) {
      return NextResponse.json(
        {
          success: false,
          extractedText, // Retorna o texto bruto caso o usuário queira copiar
          message: `Configure a chave de API do provedor "${activeProvider}" na aba de Configurações para processar o currículo com IA.`,
        },
        { status: 400 }
      );
    }

    // Processa com a LLM para estruturar no UserProfileSchema
    const model = getAIModelInstance(config);

    const { object: structuredProfile } = await generateObject({
      model,
      schema: UserProfileSchema,
      system: CV_PARSER_SYSTEM_PROMPT,
      prompt: `Analise o currículo bruto a seguir e preencha todos os campos do perfil profissional com rigor e fidelidade:\n\n"""\n${extractedText}\n"""`,
    });

    return NextResponse.json({
      success: true,
      message: 'Currículo processado e dados extraídos com sucesso!',
      profile: structuredProfile,
      rawTextLength: extractedText.length,
    });
  } catch (error: any) {
    console.error('Erro no processamento de upload:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Falha ao processar o currículo com IA.' },
      { status: 500 }
    );
  }
}
