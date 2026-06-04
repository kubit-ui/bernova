import { describe, it, expect } from 'vitest';
import { formattedStatKey } from '../formattedStatKey.utils.js';

describe('formattedStatKey', () => {
  it.each([
    ['$_component', 'component'],
    ['my class', 'my_class'],
    ['block__element', 'block_element'],
    ['component--variant', 'component_variant'],
    ['nav-item', 'nav_item'],
    ['$_component--name', 'component_name'],
    ['simple', 'simple'],
    ['', ''],
    ['a--b--c', 'a_b_-c'],
    ['$_', ''],
  ])('transforms "%s" -> "%s"', (input, expected) => {
    expect(formattedStatKey(input)).toBe(expected);
  });
});
