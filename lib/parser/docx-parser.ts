import mammoth from 'mammoth';

/**
 * Extrai texto bruto de um arquivo Word (.docx ou .doc)
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Arquivo Word vazio.');
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() || '';
    if (text.length === 0) {
      throw new Error('Nenhum texto encontrado no documento Word.');
    }
    return text;
  } catch (error: any) {
    throw new Error(`Falha ao ler arquivo Word: ${error.message}`);
  }
}
