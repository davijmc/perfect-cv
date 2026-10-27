import { describe, it, expect } from 'vitest';
import { cleanHtmlText, parseJobHtml } from '../lib/scraper/job-scraper';

describe('Job Scraper & Sanitizer', () => {
  it('should strip scripts, navs and extract meaningful job description text', () => {
    const raw = `
      <html>
        <head><title>Senior Frontend Engineer - TechCorp</title></head>
        <body>
          <header><nav>Home | Login</nav></header>
          <script>console.log("tracking")</script>
          <main>
            <h1>Senior Frontend Engineer</h1>
            <p>Requisitos: React, TypeScript, Next.js.</p>
            <p>Benefícios: Remoto, Vale refeição.</p>
          </main>
          <footer>Copyright 2026</footer>
        </body>
      </html>
    `;
    const result = parseJobHtml(raw);
    expect(result.isProtected).toBe(false);
    expect(result.description).toContain('Senior Frontend Engineer');
    expect(result.description).toContain('Requisitos: React, TypeScript, Next.js');
    expect(result.description).not.toContain('console.log');
    expect(result.description).not.toContain('Copyright 2026');
  });

  it('should detect login walls and protected pages gracefully', () => {
    const loginWallHtml = `
      <html>
        <body>
          <h1>Sign in to LinkedIn</h1>
          <p>Please enter your email and password to view this profile or job posting.</p>
        </body>
      </html>
    `;
    const result = parseJobHtml(loginWallHtml);
    expect(result.isProtected).toBe(true);
  });
});
