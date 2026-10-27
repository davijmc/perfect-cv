import * as cheerio from 'cheerio';

export interface ScrapedJobResult {
  title?: string;
  company?: string;
  description: string;
  isProtected: boolean;
  message?: string;
}

const LOGIN_WALL_PATTERNS = [
  /sign in to/i,
  /fazer login/i,
  /faça login/i,
  /access denied/i,
  /cloudflare/i,
  /attention required/i,
  /verify you are a human/i,
  /security check/i,
  /login to view/i,
  /inscreva-se para ver/i,
];

/**
 * Remove tags desnecessárias e limpa o texto HTML
 */
export function cleanHtmlText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header, noscript, svg, iframe, form, button').remove();

  // Tenta encontrar o conteúdo principal
  const mainContent = $('main, article, [role="main"], .job-description, #job-details, .description').first();
  const text = (mainContent.length > 0 ? mainContent.text() : $('body').text()) || '';

  // Limpa espaços duplicados e quebras de linha excessivas
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/(\r\n|\n|\r){3,}/g, '\n\n')
    .trim();
}

/**
 * Faz a análise semântica do HTML da vaga
 */
export function parseJobHtml(html: string): ScrapedJobResult {
  const $ = cheerio.load(html);

  // Tenta extrair o título
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    '';

  // Verifica barreiras de autenticação ou proteção
  const bodyText = $('body').text();
  const isProtected =
    LOGIN_WALL_PATTERNS.some((pattern) => pattern.test(bodyText)) ||
    cleanHtmlText(html).length < 100;

  if (isProtected) {
    return {
      title,
      description: '',
      isProtected: true,
      message:
        'A página desta vaga exige autenticação (login) ou possui proteção anti-bot. Por favor, copie e cole o texto da vaga no campo abaixo.',
    };
  }

  const description = cleanHtmlText(html);

  return {
    title,
    description,
    isProtected: false,
  };
}

/**
 * Busca e extrai os dados de uma URL de vaga
 */
export async function scrapeJobUrl(url: string): Promise<ScrapedJobResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      return {
        description: '',
        isProtected: true,
        message: `O site retornou status ${response.status}. Cole a descrição da vaga manualmente no campo de texto.`,
      };
    }

    const html = await response.text();
    return parseJobHtml(html);
  } catch (error: any) {
    return {
      description: '',
      isProtected: true,
      message: `Não foi possível acessar a URL informada (${error.message}). Cole a descrição da vaga manualmente no campo de texto.`,
    };
  }
}
