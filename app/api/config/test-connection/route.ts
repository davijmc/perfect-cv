import { NextResponse } from 'next/server';
import { testProviderConnection } from '@/lib/ai/client';
import { AIProviderEnum } from '@/lib/ai/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, apiKey, model, baseUrl } = body;

    const validProvider = AIProviderEnum.parse(provider);

    const result = await testProviderConnection(
      validProvider,
      apiKey || '',
      model,
      baseUrl
    );

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao validar conexão com o provedor.' },
      { status: 400 }
    );
  }
}
