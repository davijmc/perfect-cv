import { describe, it, expect } from 'vitest';
import { TEMPLATE_CATALOG } from '../components/resume-view/templates';

describe('Resume Template Catalog', () => {
  it('should have exactly 5 distinct professional templates registered', () => {
    const keys = Object.keys(TEMPLATE_CATALOG);
    expect(keys).toHaveLength(5);
    expect(TEMPLATE_CATALOG['modern-minimal']).toBeDefined();
    expect(TEMPLATE_CATALOG['executive-slate']).toBeDefined();
    expect(TEMPLATE_CATALOG['tech-charcoal']).toBeDefined();
    expect(TEMPLATE_CATALOG['classic-serif']).toBeDefined();
    expect(TEMPLATE_CATALOG['nordic-warm']).toBeDefined();
  });
});
