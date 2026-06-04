import { describe, it, expect } from 'vitest';
import { processDynamicProps } from '../processDynamic.utils.js';

describe('processDynamicProps', () => {
  it('returns an object mapping $-prefixed keys to var() expressions', () => {
    const result = processDynamicProps(['$Color', '$Size']);
    expect(result).toEqual({
      $Color: 'var(--color)',
      $Size: 'var(--size)',
    });
  });

  it('lowercases the variable name and strips the $', () => {
    const result = processDynamicProps(['$MyVar']);
    expect(result.$MyVar).toBe('var(--myvar)');
  });

  it('returns undefined for non-array input', () => {
    expect(processDynamicProps(undefined)).toBeUndefined();
    expect(processDynamicProps({})).toBeUndefined();
    expect(processDynamicProps(null)).toBeUndefined();
  });

  it('handles empty array', () => {
    expect(processDynamicProps([])).toEqual({});
  });
});
