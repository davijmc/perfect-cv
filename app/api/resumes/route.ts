import { NextResponse } from 'next/server';
import { listResumes, saveResume } from '@/lib/storage/fs-storage';
import { GeneratedResumeSchema } from '@/lib/ai/schemas';

export async function GET() {
  try {
    const resumes = await listResumes();
    return NextResponse.json({ success: true, resumes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao listar currículos.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const valid = GeneratedResumeSchema.parse(body);
    await saveResume(valid);

    return NextResponse.json({
      success: true,
      message: 'Currículo salvo com sucesso!',
      resume: valid,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao salvar currículo.' },
      { status: 400 }
    );
  }
}
