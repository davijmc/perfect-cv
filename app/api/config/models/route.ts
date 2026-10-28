import { NextResponse } from 'next/server';
import { listGeminiModelsFromApi } from '@/lib/ai/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, apiKey } = body;

    if (provider === 'gemini') {
      const models = await listGeminiModelsFromApi(apiKey);
      return NextResponse.json({ success: true, models });
    }

    return NextResponse.json({ success: true, models: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao listar modelos disponíveis.' },
      { status: 500 }
    );
  }
}
