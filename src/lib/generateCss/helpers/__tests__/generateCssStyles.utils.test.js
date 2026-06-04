import { describe, it, expect } from 'vitest';
import { generateCssStyles } from '../generateCssStyles.utils.js';

describe('generateCssStyles', () => {
  it('returns empty styles for empty source', () => {
    const result = generateCssStyles({ source: {}, prefix: 'bv' });
    expect(result.styles).toBe('');
    expect(result.stylesDocs).toBeDefined();
  });

  it('generates simple component CSS', () => {
    const result = generateCssStyles({
      source: { Button: { color: 'red' } },
      prefix: 'bv',
    });
    expect(result.styles).toContain('.bv-button');
    expect(result.styles).toContain('color: red');
  });

  it('handles nested variant styles', () => {
    const result = generateCssStyles({
      source: {
        Button: {
          color: 'red',
          primary: { color: 'blue' },
        },
      },
      prefix: 'bv',
    });
    expect(result.styles).toContain('.bv-button');
    expect(result.styles).toContain('--primary');
  });

  it('handles pseudo-classes', () => {
    const result = generateCssStyles({
      source: {
        Button: {
          color: 'red',
          $pseudoClasses: { hover: { color: 'blue' } },
        },
      },
      prefix: 'bv',
    });
    expect(result.styles).toContain(':hover');
  });

  it('handles media queries with mediaConfig', () => {
    const result = generateCssStyles({
      source: {
        Button: {
          color: 'red',
          $mediaQueries: {
            mobile: { color: 'green' },
          },
        },
      },
      mediaConfig: [
        { name: 'mobile', type: 'screen', values: { 'min-width': '0' } },
      ],
      prefix: 'bv',
    });
    expect(result.styles).toContain('@media');
  });

  it('handles dynamic values', () => {
    const result = generateCssStyles({
      source: {
        Button: {
          color: '$Primary',
          $dynamicValues: ['$Primary'],
        },
      },
      prefix: 'bv',
    });
    expect(result.styles).toContain('.bv-button');
  });
});
