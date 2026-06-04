import { describe, it, expect } from 'vitest';
import { cssPseudoElements } from '../cssPseudoElements.js';

const cases = [
  ['before', 'before'],
  ['after', 'after'],
  ['first_letter', 'first-letter'],
  ['first_line', 'first-line'],
  ['selection', 'selection'],
  ['marker', 'marker'],
  ['backdrop', 'backdrop'],
  ['placeholder', 'placeholder'],
  ['highlight', 'highlight'],
  ['spelling_error', 'spelling-error'],
  ['grammar_error', 'grammar-error'],
  ['target_text', 'target-text'],
  ['part', 'part'],
  ['slotted', 'slotted'],
  ['moz_focus_inner', '-moz-focus-inner'],
  ['moz_progress_bar', '-moz-progress-bar'],
  ['moz_range_thumb', '-moz-range-thumb'],
  ['webkit_scrollbar', '-webkit-scrollbar'],
  ['webkit_slider_thumb', '-webkit-slider-thumb'],
  ['webkit_input_placeholder', '-webkit-input-placeholder'],
  ['file_selector_button', 'file-selector-button'],
  ['cue_region', 'cue-region'],
  ['cue', 'cue'],
];

describe('cssPseudoElements constants', () => {
  it.each(cases)('maps "%s" to "%s"', (key, value) => {
    expect(cssPseudoElements).toHaveProperty(key, value);
  });
});
