import { describe, it, expect } from 'vitest';
import { extractTextFromPdf } from '../lib/parser/pdf-parser';
import { extractTextFromDocx } from '../lib/parser/docx-parser';

describe('Document Text Parsers', () => {
  it('should reject empty buffers gracefully', async () => {
    await expect(extractTextFromPdf(Buffer.from([]))).rejects.toThrow();
    await expect(extractTextFromDocx(Buffer.from([]))).rejects.toThrow();
  });

  it('should extract selectable text from a valid PDF buffer', async () => {
    const minimalPdf = '%PDF-1.4\n' +
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n' +
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n' +
      '4 0 obj << /Length 44 >> stream\n' +
      'BT /F1 24 Tf 100 700 Td (Hello World) Tj ET\n' +
      'endstream\nendobj\n' +
      '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n' +
      'xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000261 00000 n \n0000000355 00000 n \ntrailer << /Size 6 /Root 1 0 R >>\nstartxref\n434\n%%EOF';

    const text = await extractTextFromPdf(Buffer.from(minimalPdf));
    expect(text).toContain('Hello World');
  });
});
