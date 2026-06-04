import { describe, it, expect } from 'vitest';
import { cssAdvancedSelectors } from '../cssAdvancedSelectors.js';

describe('cssAdvancedSelectors constants', () => {
  it('should have all required selector types', () => {
    expect(cssAdvancedSelectors).toHaveProperty('adjacent');
    expect(cssAdvancedSelectors).toHaveProperty('child');
    expect(cssAdvancedSelectors).toHaveProperty('descendant');
    expect(cssAdvancedSelectors).toHaveProperty('near');
    expect(cssAdvancedSelectors).toHaveProperty('concat');
    expect(cssAdvancedSelectors).toHaveProperty('column');
  });

  it('should have correct adjacent sibling selector', () => {
    expect(cssAdvancedSelectors.adjacent).toBe(' + ');
  });

  it('should have correct child selector', () => {
    expect(cssAdvancedSelectors.child).toBe(' > ');
  });

  it('should have correct descendant selector', () => {
    expect(cssAdvancedSelectors.descendant).toBe(' ');
  });

  it('should have correct general sibling selector', () => {
    expect(cssAdvancedSelectors.near).toBe(' ~ ');
  });

  it('should have correct concat selector without space', () => {
    expect(cssAdvancedSelectors.concat).toBe('');
  });

  it('should have correct column combinator', () => {
    expect(cssAdvancedSelectors.column).toBe(' || ');
  });

  it('should have exactly 6 selector types', () => {
    expect(Object.keys(cssAdvancedSelectors)).toHaveLength(6);
  });
});
