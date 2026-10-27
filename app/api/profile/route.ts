import { NextResponse } from 'next/server';
import { loadProfile, saveProfile } from '@/lib/storage/fs-storage';
import { UserProfileSchema } from '@/lib/ai/schemas';

export async function GET() {
  try {
    const profile = await loadProfile();
    return NextResponse.json({
      success: true,
      profile: profile || UserProfileSchema.parse({}),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao carregar perfil.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const valid = UserProfileSchema.parse(body);
    await saveProfile(valid);

    return NextResponse.json({
      success: true,
      message: 'Perfil salvo com sucesso no disco!',
      profile: valid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao salvar perfil.' },
      { status: 400 }
    );
  }
}
