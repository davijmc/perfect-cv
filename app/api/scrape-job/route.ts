import { NextResponse } from 'next/server';
import { scrapeJobUrl } from '@/lib/scraper/job-scraper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !url.startsWith('http')) {
      return NextResponse.json(
        { success: false, message: 'URL inválida. Forneça um link completo iniciando com http:// ou https://' },
        { status: 400 }
      );
    }

    const result = await scrapeJobUrl(url);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Falha ao buscar conteúdo da vaga.' },
      { status: 500 }
    );
  }
}
