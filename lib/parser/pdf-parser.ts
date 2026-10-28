// @ts-ignore
import { PDFParse } from 'pdf-parse';

/**
 * Extrai texto selecionável de um arquivo PDF
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Arquivo PDF vazio.');
  }

  let parserInstance: any = null;
  try {
    // Suporte tanto ao PDFParse moderno v2 quanto ao fallback funcional
    let ParserClass: any = PDFParse;
    if (!ParserClass) {
      const mod: any = await import('pdf-parse');
      ParserClass = mod.PDFParse || mod.default || mod;
    }

    let text = '';
    if (typeof ParserClass === 'function' && ParserClass.prototype?.getText) {
      // API v2 de pdf-parse: new PDFParse({ data: Buffer/Uint8Array })
      parserInstance = new ParserClass({ data: new Uint8Array(buffer) });
      const result = await parserInstance.getText();
      text = result?.text?.trim() || '';
    } else if (typeof ParserClass === 'function') {
      // API legada v1: pdf(buffer)
      const data = await ParserClass(buffer);
      text = data?.text?.trim() || '';
    } else {
      throw new Error('Módulo de leitura PDF incompatível ou não inicializado.');
    }

    if (text.length === 0) {
      throw new Error(
        'Nenhum texto selecionável encontrado no PDF. O arquivo pode ser uma imagem digitalizada ou escaneada.'
      );
    }

    return text;
  } catch (error: any) {
    if (error.message.includes('imagem digitalizada')) {
      throw error;
    }
    throw new Error(`Falha ao ler arquivo PDF: ${error.message}`);
  } finally {
    if (parserInstance && typeof parserInstance.destroy === 'function') {
      try {
        await parserInstance.destroy();
      } catch {
        // Ignora erro no destroy
      }
    }
  }
}

