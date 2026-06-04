import { describe, it, expect } from 'vitest';
import { formatClassName } from '../formatClassName.utils.js';

describe('formatClassName', () => {
  it.each([
    ['MyButton', 'mybutton'],
    ['nav_item_active', 'nav-item-active'],
    ['HEADER_TITLE', 'header-title'],
    ['button', 'button'],
    ['', ''],
    ['a_b_c_d', 'a-b-c-d'],
    ['A', 'a'],
  ])('formats "%s" -> "%s"', (input, expected) => {
    expect(formatClassName(input)).toBe(expected);
  });

  it.each([[null], [undefined], [123]])(
    'returns empty string for non-string input %p',
    (input) => {
      expect(formatClassName(input)).toBe('');
    },
  );
});
