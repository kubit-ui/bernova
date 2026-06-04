import { describe, it, expect } from 'vitest';
import { extractValues } from '../extractValues.utils.js';

describe('extractValues', () => {
  it('should convert known CSS properties to CSS string', () => {
    const result = extractValues({
      styles: { color: 'red', display: 'flex' },
    });
    expect(result).toContain('color: red;');
    expect(result).toContain('display: flex;');
  });

  it('should filter out unknown CSS properties', () => {
    const result = extractValues({
      styles: { color: 'red', unknownProp: 'value' },
    });
    expect(result).toContain('color: red;');
    expect(result).not.toContain('unknownProp');
  });

  it('should filter out null and undefined values', () => {
    const result = extractValues({
      styles: { color: null, display: undefined, opacity: '1' },
    });
    expect(result).not.toContain('color');
    expect(result).not.toContain('display');
    expect(result).toContain('opacity: 1;');
  });

  it('should wrap $content values in single quotes', () => {
    const result = extractValues({
      styles: { $content: 'hello' },
    });
    expect(result).toContain("content: 'hello';");
  });

  it('should handle dynamic values with $ placeholders', () => {
    const result = extractValues({
      styles: { color: '$myColor' },
      dynamicValues: { $myColor: 'blue' },
    });
    expect(result).toContain('color: blue;');
  });

  it('should return empty string for empty styles', () => {
    const result = extractValues({ styles: {} });
    expect(result).toBe('');
  });

  it('should handle styles with only unknown properties', () => {
    const result = extractValues({
      styles: { foo: 'bar', baz: 'qux' },
    });
    expect(result).toBe('');
  });

  it('should convert underscore keys to hyphenated CSS properties', () => {
    const result = extractValues({
      styles: { font_size: '16px', line_height: '1.5' },
    });
    expect(result).toContain('font-size: 16px;');
    expect(result).toContain('line-height: 1.5;');
  });

  it('should join multiple properties with spaces', () => {
    const result = extractValues({
      styles: { color: 'red', opacity: '0.5' },
    });
    expect(result).toMatch(/color: red;/);
    expect(result).toMatch(/opacity: 0\.5;/);
  });

  it('should handle values without dynamic replacements when no dynamicValues', () => {
    const result = extractValues({
      styles: { color: '$myVar' },
    });
    expect(result).toContain('color: $myVar;');
  });
});
