import { describe, it, expect } from 'vitest';
import { generateCssFonts } from '../generateCssFonts.utils.js';

describe('generateCssFonts', () => {
  it('returns empty string when no fonts provided', () => {
    expect(generateCssFonts({})).toBe('');
    expect(generateCssFonts(undefined)).toBe('');
  });

  it('generates @import for Google fonts', () => {
    const css = generateCssFonts({
      google: [{ name: 'Open Sans', weights: [400, 700] }],
    });
    expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700");
  });

  it('generates @font-face for local fonts', () => {
    const css = generateCssFonts({
      local: [
        {
          name: 'Custom',
          files: { 400: './my-font.ttf' },
        },
      ],
    });
    expect(css).toContain('@font-face');
    expect(css).toContain("font-family: 'Custom'");
    expect(css).toContain('my-font.ttf');
    expect(css).toContain('font-weight: 400');
  });

  it('combines google and local fonts', () => {
    const css = generateCssFonts({
      google: [{ name: 'Roboto', weights: [300] }],
      local: [{ name: 'Local', files: { 400: './local.ttf' } }],
    });
    expect(css).toContain('@import');
    expect(css).toContain('@font-face');
  });
});
