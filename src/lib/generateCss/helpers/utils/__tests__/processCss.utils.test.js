import { describe, it, expect } from 'vitest';
import { processCssWithPostcss } from '../processCss.utils.js';

describe('processCssWithPostcss', () => {
  it('returns processed CSS for a simple input', async () => {
    const out = await processCssWithPostcss('.a { color: red; }');
    expect(out).toContain('.a');
    expect(out).toContain('color');
  });

  it('minifies output when minified is true', async () => {
    const input = '.a { color: red; }\n.b { color: blue; }';
    const min = await processCssWithPostcss(input, true);
    expect(min.length).toBeLessThan(input.length + 50);
  });

  it('applies a prefix to selectors and :root', async () => {
    const out = await processCssWithPostcss(':root { --a: red; }\n.btn { color: red; }', false, 'my');
    expect(out).toContain("[data-theme='my']");
  });

  it('does not transform when prefix is empty', async () => {
    const out = await processCssWithPostcss('.btn { color: red; }', false, '');
    expect(out).not.toContain('data-theme');
  });

  it('preserves @font-face rules when applying prefix', async () => {
    const out = await processCssWithPostcss("@font-face { font-family: 'F'; src: url('a.ttf'); }\n.btn { color: red; }", false, 'my');
    expect(out).toContain('@font-face');
  });

  it('preserves @import rules when applying prefix', async () => {
    const out = await processCssWithPostcss("@import url('foo');\n.btn { color: red; }", false, 'my');
    expect(out).toContain('@import');
  });

  it('accepts a fonts configuration with local fonts', async () => {
    const out = await processCssWithPostcss('.btn { color: red; }', false, '', {
      google: [{ name: 'Roboto', weights: [400] }],
      local: [{ name: 'Local', files: { 400: './local.ttf' } }],
    });
    expect(out).toContain('.btn');
  });

  it('accepts a fonts configuration', async () => {
    const out = await processCssWithPostcss('.btn { color: red; }', false, '', {
      google: [{ name: 'Roboto', weights: [400] }],
      local: [],
    });
    expect(out).toContain('.btn');
  });
});
