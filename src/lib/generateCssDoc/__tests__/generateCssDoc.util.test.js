import { describe, it, expect } from 'vitest';
import { generateCssDoc } from '../generateCssDoc.util.js';

describe('generateCssDoc', () => {
  it('wraps foundations and components in section markers (full)', () => {
    const result = generateCssDoc({
      compilerType: 'full',
      stylesCss: '.btn{}',
      foundationsCss: ':root{}',
    });
    expect(result).toContain('/* === BERNOVA FOUNDATIONS === */');
    expect(result).toContain('/* === END FOUNDATIONS === */');
    expect(result).toContain('/* === BERNOVA COMPONENTS === */');
    expect(result).toContain('/* === END COMPONENTS === */');
    expect(result).toContain(':root{}');
    expect(result).toContain('.btn{}');
  });

  it('uses oldData for components when foundationOnly', () => {
    const result = generateCssDoc({
      compilerType: 'foundation-only',
      stylesCss: 'NEW',
      foundationsCss: ':root{}',
      oldData: 'OLD_COMPONENTS',
    });
    expect(result).toContain(':root{}');
    expect(result).toContain('OLD_COMPONENTS');
    expect(result).not.toContain('NEW');
  });

  it('uses oldData for foundations when componentOnly', () => {
    const result = generateCssDoc({
      compilerType: 'component-only',
      stylesCss: '.btn{}',
      foundationsCss: 'NEW_FOUNDATION',
      oldData: 'OLD_FOUNDATION',
    });
    expect(result).toContain('OLD_FOUNDATION');
    expect(result).toContain('.btn{}');
    expect(result).not.toContain('NEW_FOUNDATION');
  });

  it('defaults oldData to empty string', () => {
    const result = generateCssDoc({
      compilerType: 'foundation-only',
      stylesCss: 'NEW',
      foundationsCss: ':root{}',
    });
    expect(result).toContain(':root{}');
  });
});
