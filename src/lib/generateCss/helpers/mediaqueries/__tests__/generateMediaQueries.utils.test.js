import { describe, it, expect } from 'vitest';
import { generateMediaQueries } from '../generateMediaQueries.utils.js';

describe('generateMediaQueries', () => {
  it('returns empty string for empty register', () => {
    expect(generateMediaQueries({})).toBe('');
  });

  it('wraps each entry in an @media block', () => {
    const css = generateMediaQueries({
      'screen and (min-width: 768px)': '.btn { color: red; }\n',
    });
    expect(css).toContain('@media screen and (min-width: 768px) {');
    expect(css).toContain('.btn { color: red; }');
    expect(css).toContain('}\n');
  });

  it('handles multiple media entries', () => {
    const css = generateMediaQueries({
      'screen and (min-width: 768px)': '.a { color: red; }\n',
      'screen and (max-width: 600px)': '.b { color: blue; }\n',
    });
    expect(css).toContain('@media screen and (min-width: 768px)');
    expect(css).toContain('@media screen and (max-width: 600px)');
  });
});
