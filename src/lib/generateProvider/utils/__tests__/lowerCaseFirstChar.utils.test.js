import { describe, it, expect } from 'vitest';
import { lowerCaseFirstChar } from '../lowerCaseFirstChar.utils.js';

describe('lowerCaseFirstChar', () => {
  it('lowercases the first character of a string', () => {
    expect(lowerCaseFirstChar('Provider')).toBe('provider');
  });

  it('keeps the rest of the string intact', () => {
    expect(lowerCaseFirstChar('MyProvider')).toBe('myProvider');
  });

  it('handles already-lowercased strings', () => {
    expect(lowerCaseFirstChar('provider')).toBe('provider');
  });

  it('uses the default value when no arg is passed', () => {
    expect(lowerCaseFirstChar()).toBe('provider');
  });

  it('handles a single character', () => {
    expect(lowerCaseFirstChar('X')).toBe('x');
  });
});
