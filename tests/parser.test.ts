import { describe, it, expect } from 'vitest';
import { extractTextFromPdf } from '../lib/parser/pdf-parser';
import { extractTextFromDocx } from '../lib/parser/docx-parser';

describe('Document Text Parsers', () => {
  it('should reject empty buffers gracefully', async () => {
    await expect(extractTextFromPdf(Buffer.from([]))).rejects.toThrow();
    await expect(extractTextFromDocx(Buffer.from([]))).rejects.toThrow();
  });
});
