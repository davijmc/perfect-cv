import { NextResponse } from 'next/server';
import { loadConfig, saveConfig } from '@/lib/storage/fs-storage';
import { AppConfigSchema } from '@/lib/ai/schemas';

export async function GET() {
  try {
    const config = await loadConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao carregar configurações.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentConfig = await loadConfig();

    // Mescla configurações existentes com as novas
    const merged = {
      ...currentConfig,
      ...body,
      providers: {
        ...currentConfig.providers,
        ...(body.providers || {}),
      },
    };

    const valid = AppConfigSchema.parse(merged);
    await saveConfig(valid);

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas localmente com sucesso!',
      config: valid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao salvar configurações.' },
      { status: 400 }
    );
  }
}
