import { NextResponse } from 'next/server';
import {
  UserProfileSchema,
  TemplateIdEnum,
  ResumeLanguageEnum,
} from '@/lib/ai/schemas';
import { getProfilePhoto } from '@/lib/storage/fs-storage';
import { renderResumePdfBuffer } from '@/lib/pdf/resume-pdf-document';
import { TemplateDensity } from '@/components/resume-view/templates';

export const dynamic = 'force-dynamic';

function buildSafePdfFilename(title?: string, fullName?: string): string {
  const base = (title || fullName || 'curriculo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'curriculo'}.pdf`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      content,
      templateId,
      density,
      language,
      forceOnePage,
      title,
    } = body;

    const parsedContent = UserProfileSchema.parse(content || {});
    const validTemplateId = TemplateIdEnum.safeParse(templateId).success
      ? templateId
      : 'modern-minimal';
    const validLanguage = ResumeLanguageEnum.safeParse(language).success
      ? language
      : 'pt';
    const validDensity: TemplateDensity =
      density === 'compact' || density === 'comfortable' ? density : 'normal';

    // Se o usuário tiver uma foto de perfil configurada, converte o binário local em Data URI para o PDF
    let photoDataUri: string | undefined;
    if (parsedContent.personalInfo.photoUrl) {
      if (parsedContent.personalInfo.photoUrl.startsWith('data:image/')) {
        photoDataUri = parsedContent.personalInfo.photoUrl;
      } else {
        const storedPhoto = await getProfilePhoto();
        if (storedPhoto) {
          photoDataUri = `data:${storedPhoto.mimeType};base64,${storedPhoto.buffer.toString('base64')}`;
        }
      }
    }

    const pdfBuffer = await renderResumePdfBuffer({
      content: parsedContent,
      templateId: validTemplateId,
      density: validDensity,
      language: validLanguage,
      forceOnePage: Boolean(forceOnePage),
      photoDataUri,
      title: title || parsedContent.personalInfo.fullName,
    });

    const filename = buildSafePdfFilename(title, parsedContent.personalInfo.fullName);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar PDF vetorial:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Falha ao gerar arquivo PDF do currículo.',
      },
      { status: 500 }
    );
  }
}

