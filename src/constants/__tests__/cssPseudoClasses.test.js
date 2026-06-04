import { describe, it, expect } from 'vitest';
import { cssPseudoClasses } from '../cssPseudoClasses.js';

const cases = [
  ['hover', 'hover'],
  ['focus', 'focus'],
  ['active', 'active'],
  ['focus_visible', 'focus-visible'],
  ['focus_within', 'focus-within'],
  ['enabled', 'enabled'],
  ['disabled', 'disabled'],
  ['checked', 'checked'],
  ['required', 'required'],
  ['valid', 'valid'],
  ['invalid', 'invalid'],
  ['first_child', 'first-child'],
  ['last_child', 'last-child'],
  ['nth_child', 'nth-child'],
  ['only_child', 'only-child'],
  ['is', 'is'],
  ['not', 'not'],
  ['where', 'where'],
  ['has', 'has'],
  ['read_only', 'read-only'],
  ['placeholder_shown', 'placeholder-shown'],
  ['any_link', 'any-link'],
  ['moz_any', '-moz-any'],
  ['moz_focusring', '-moz-focusring'],
  ['webkit_autofill', '-webkit-autofill'],
  ['webkit_scrollbar', '-webkit-scrollbar'],
  ['link', 'link'],
  ['visited', 'visited'],
  ['target', 'target'],
];

describe('cssPseudoClasses constants', () => {
  it.each(cases)('maps "%s" to "%s"', (key, value) => {
    expect(cssPseudoClasses).toHaveProperty(key, value);
  });
});
