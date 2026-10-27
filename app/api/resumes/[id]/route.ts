import { NextResponse } from 'next/server';
import { getResume, saveResume, deleteResume } from '@/lib/storage/fs-storage';
import { GeneratedResumeSchema } from '@/lib/ai/schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resume = await getResume(id);

    if (!resume) {
      return NextResponse.json(
        { success: false, message: 'Currículo não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, resume });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao buscar currículo.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = {
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    const valid = GeneratedResumeSchema.parse(updated);
    await saveResume(valid);

    return NextResponse.json({
      success: true,
      message: 'Currículo atualizado com sucesso!',
      resume: valid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao atualizar currículo.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteResume(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Currículo não encontrado para exclusão.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Currículo excluído com sucesso!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao excluir currículo.' },
      { status: 500 }
    );
  }
}
