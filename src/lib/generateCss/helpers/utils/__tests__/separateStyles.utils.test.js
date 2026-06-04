import { describe, it, expect } from 'vitest';
import { separateStyles } from '../separateStyles.utils.js';

describe('separateStyles', () => {
  it('should separate standard CSS properties into styles', () => {
    const result = separateStyles({ color: 'red', display: 'flex' });
    expect(result.styles).toEqual({ color: 'red', display: 'flex' });
    expect(result.other).toEqual({});
    expect(result.lib).toEqual({});
  });

  it('should separate $ prefixed properties into lib', () => {
    const result = separateStyles({
      $dynamic: 'value',
      $theme: 'dark',
    });
    expect(result.lib).toEqual({ $dynamic: 'value', $theme: 'dark' });
    expect(result.styles).toEqual({});
  });

  it('should separate unknown properties into other', () => {
    const result = separateStyles({
      hover: { color: 'blue' },
      customProp: 'value',
    });
    expect(result.other).toHaveProperty('hover');
    expect(result.other).toHaveProperty('customProp');
  });

  it('should handle mixed property types', () => {
    const result = separateStyles({
      color: 'red',
      $dynamic: 'value',
      hover: { color: 'blue' },
    });
    expect(result.styles).toEqual({ color: 'red' });
    expect(result.lib).toEqual({ $dynamic: 'value' });
    expect(result.other).toHaveProperty('hover');
  });

  it('should return empty objects for empty input', () => {
    const result = separateStyles({});
    expect(result.styles).toEqual({});
    expect(result.lib).toEqual({});
    expect(result.other).toEqual({});
  });

  it('should not include $ properties with falsy values in lib', () => {
    const result = separateStyles({
      $empty: '',
      $zero: 0,
      $nullVal: null,
    });
    expect(result.lib).toEqual({});
    expect(result.other).toHaveProperty('$empty');
    expect(result.other).toHaveProperty('$zero');
    expect(result.other).toHaveProperty('$nullVal');
  });
});
