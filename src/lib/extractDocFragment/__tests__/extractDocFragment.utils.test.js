import { describe, it, expect } from 'vitest';
import { extractDocFragment } from '../extractDocFragment.utils.js';

describe('extractDocFragment', () => {
  it('should extract content between matching section markers', () => {
    const doc = '/* HEADER */ body { color: red; } /* HEADER */';
    expect(extractDocFragment({ section: 'HEADER', doc })).toBe(
      'body { color: red; }'
    );
  });

  it('should return empty string when section not found', () => {
    const doc = '/* OTHER */ content /* OTHER */';
    expect(extractDocFragment({ section: 'MISSING', doc })).toBe('');
  });

  it('should handle multiline content between markers', () => {
    const doc =
      '/* START */\n  .class1 { color: red; }\n  .class2 { color: blue; }\n/* START */';
    const result = extractDocFragment({ section: 'START', doc });
    expect(result).toContain('.class1');
    expect(result).toContain('.class2');
  });

  it('should use endSection when provided', () => {
    const doc = '/* BEGIN */ content here /* END */';
    expect(
      extractDocFragment({ section: 'BEGIN', doc, endSection: 'END' })
    ).toBe('content here');
  });

  it('should trim extracted content', () => {
    const doc = '/* SEC */   trimmed   /* SEC */';
    expect(extractDocFragment({ section: 'SEC', doc })).toBe('trimmed');
  });

  it('should return empty string for empty doc', () => {
    expect(extractDocFragment({ section: 'ANY', doc: '' })).toBe('');
  });

  it('should handle section markers with special regex characters', () => {
    const doc = '/* === BERNOVA COMPONENTS === */ css here /* === BERNOVA COMPONENTS === */';
    expect(
      extractDocFragment({
        section: '=== BERNOVA COMPONENTS ===',
        doc,
      })
    ).toBe('css here');
  });
});
