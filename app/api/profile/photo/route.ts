import { NextResponse } from 'next/server';
import { 
  getProfilePhoto, 
  saveProfilePhoto, 
  deleteProfilePhoto, 
  loadProfile, 
  saveProfile 
} from '@/lib/storage/fs-storage';

export async function GET() {
  try {
    const photo = await getProfilePhoto();
    if (!photo) {
      return new NextResponse('Foto não encontrada', { status: 404 });
    }

    return new NextResponse(new Uint8Array(photo.buffer), {
      status: 200,
      headers: {
        'Content-Type': photo.mimeType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao carregar foto.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhuma foto enviada.' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'O arquivo enviado deve ser uma imagem (PNG, JPG, WebP).' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const photoUrl = await saveProfilePhoto(buffer, file.type);

    // Atualiza automaticamente o perfil salvo no disco se existir
    const profile = await loadProfile();
    if (profile) {
      profile.personalInfo.photoUrl = photoUrl;
      await saveProfile(profile);
    }

    return NextResponse.json({
      success: true,
      message: 'Foto de perfil salva com sucesso!',
      photoUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao salvar foto de perfil.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await deleteProfilePhoto();

    // Remove a URL do perfil mestre se existir
    const profile = await loadProfile();
    if (profile) {
      profile.personalInfo.photoUrl = '';
      await saveProfile(profile);
    }

    return NextResponse.json({
      success: true,
      message: 'Foto de perfil removida com sucesso.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao remover foto de perfil.' },
      { status: 500 }
    );
  }
}
