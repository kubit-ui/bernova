import { describe, it, expect } from 'vitest';
import { typingStyles } from '../typingStyles.utils.js';

describe('typingStyles', () => {
  it('generates TypeScript type definitions string', () => {
    const result = typingStyles({});
    expect(typeof result).toBe('string');
    expect(result).toContain('export type CssPropsType');
    expect(result).toContain('export type CssPseudoClassesType');
    expect(result).toContain('export type CssPseudoElementsType');
    expect(result).toContain('export type CssAdvancedSelectorsType');
    expect(result).toContain('export type CssLibPropsType');
  });

  it('omits media query types when mediaConfig is missing', () => {
    const result = typingStyles({});
    expect(result).not.toContain('CssLibMediaQueriesType');
  });

  it('includes media query types when mediaConfig has entries', () => {
    const result = typingStyles({
      mediaConfig: [{ name: 'mobile', type: 'screen', values: { 'min-width': '0' } }],
    });
    expect(result).toContain('CssLibMediaQueriesType');
    expect(result).toContain("'mobile'?:");
  });

  it('handles empty array mediaConfig', () => {
    const result = typingStyles({ mediaConfig: [] });
    expect(result).not.toContain('CssLibMediaQueriesType');
  });
});
