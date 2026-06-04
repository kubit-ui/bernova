import { describe, it, expect } from 'vitest';
import { filterGenerateCss } from '../filterGenerateCss.utils.js';

describe('filterGenerateCss', () => {
  it('generates foundations and styles when type is full', () => {
    const res = filterGenerateCss({
      source: {
        foundations: { primary: '#fff' },
        theme: { Button: { color: 'red' } },
      },
      compilerType: 'full',
      baseCss: '/* b */',
      prefix: 'bv',
    });
    expect(res.foundationsCss).toContain(':root');
    expect(res.stylesCss).toContain('button');
    expect(res.rootDocs.doc).toContain('primary');
  });

  it('omits foundations when type is componentOnly', () => {
    const res = filterGenerateCss({
      source: { foundations: { p: '#fff' }, theme: { B: { color: 'red' } } },
      compilerType: 'component-only',
      baseCss: '',
      prefix: 'bv',
    });
    expect(res.foundationsCss).toBe('');
    expect(res.stylesCss).toContain('b');
  });

  it('omits theme when type is foundationOnly', () => {
    const res = filterGenerateCss({
      source: { foundations: { p: '#fff' }, theme: { B: { color: 'red' } } },
      compilerType: 'foundation-only',
      baseCss: '',
      prefix: 'bv',
    });
    expect(res.stylesCss).toBe('');
    expect(res.foundationsCss).toContain(':root');
  });

  it('handles missing foundations and theme gracefully', () => {
    const res = filterGenerateCss({
      source: {},
      compilerType: 'full',
      baseCss: '',
      prefix: '',
    });
    expect(res.foundationsCss).toContain(':root');
    expect(res.stylesCss).toBe('');
  });

  it('uses global styles when provided', () => {
    const res = filterGenerateCss({
      source: {
        foundations: { c: 'red' },
        global: [{ targets: 'body', styles: { color: 'red' } }],
      },
      compilerType: 'full',
      baseCss: '',
      prefix: 'bv',
    });
    expect(res.foundationsCss).toContain('body');
  });
});
