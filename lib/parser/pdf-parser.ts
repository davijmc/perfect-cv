import pdf from 'pdf-parse';

/**
 * Extrai texto selecionável de um arquivo PDF
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Arquivo PDF vazio.');
  }

  try {
    const data = await pdf(buffer);
    const text = data.text?.trim() || '';
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
  }
}
