import { describe, it, expect } from 'vitest';
import { generateVars } from '../generateVars.utils.js';

describe('generateVars', () => {
  it('generates CSS custom properties from a flat object', () => {
    const { root, rootDocs } = generateVars({
      source: { primary: '#fff' },
      varName: '--theme',
      prefix: 'theme',
    });
    expect(root).toContain('--theme-primary: #fff;');
    expect(rootDocs.doc).toContain('primary');
    expect(rootDocs.declare).toContain('primary');
  });

  it('recursively handles nested objects', () => {
    const { root } = generateVars({
      source: { colors: { primary: '#000' } },
      varName: '--theme',
      prefix: 'theme',
    });
    expect(root).toContain('--theme-colors-primary: #000;');
  });

  it('uses default varName when not provided', () => {
    const { root } = generateVars({
      source: { a: '1' },
      prefix: 'theme',
    });
    expect(root).toContain('--a: 1;');
  });

  it('handles empty source object', () => {
    const { root, rootDocs } = generateVars({
      source: {},
      varName: '--x',
      prefix: 'x',
    });
    expect(root).toBe('');
    expect(rootDocs.doc).toBe('');
    expect(rootDocs.declare).toBe('');
  });

  it('skips deeply nested null values gracefully', () => {
    const { root } = generateVars({
      source: { x: null },
      varName: '--t',
      prefix: 't',
    });
    expect(root).toContain('--t-x: null');
  });

  it('uses var(...) reference in doc output', () => {
    const { rootDocs } = generateVars({
      source: { color: '#fff' },
      varName: '--theme',
      prefix: 'theme',
    });
    expect(rootDocs.doc).toContain("var(--theme-color)");
  });
});
