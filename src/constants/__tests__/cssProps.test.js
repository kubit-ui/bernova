import { describe, it, expect } from 'vitest';
import { cssProps } from '../cssProps.js';

describe('cssProps constants', () => {
  it('should map scrollbar properties correctly', () => {
    expect(cssProps.scrollbar_width).toBe('scrollbar-width');
    expect(cssProps.scrollbar_color).toBe('scrollbar-color');
    expect(cssProps.scroll_behavior).toBe('scroll-behavior');
  });

  it('should map background properties correctly', () => {
    expect(cssProps.background).toBe('background');
    expect(cssProps.background_color).toBe('background-color');
    expect(cssProps.background_image).toBe('background-image');
    expect(cssProps.background_size).toBe('background-size');
  });

  it('should map border properties correctly', () => {
    expect(cssProps.border).toBe('border');
    expect(cssProps.border_radius).toBe('border-radius');
    expect(cssProps.border_top_left_radius).toBe('border-top-left-radius');
  });

  it('should map flexbox properties correctly', () => {
    expect(cssProps.flex).toBe('flex');
    expect(cssProps.flex_direction).toBe('flex-direction');
    expect(cssProps.justify_content).toBe('justify-content');
    expect(cssProps.align_items).toBe('align-items');
    expect(cssProps.gap).toBe('gap');
  });

  it('should map grid properties correctly', () => {
    expect(cssProps.grid).toBe('grid');
    expect(cssProps.grid_template_columns).toBe('grid-template-columns');
    expect(cssProps.grid_template_rows).toBe('grid-template-rows');
    expect(cssProps.grid_area).toBe('grid-area');
  });

  it('should map position properties correctly', () => {
    expect(cssProps.position).toBe('position');
    expect(cssProps.top).toBe('top');
    expect(cssProps.z_index).toBe('z-index');
  });

  it('should map font properties correctly', () => {
    expect(cssProps.font_family).toBe('font-family');
    expect(cssProps.font_size).toBe('font-size');
    expect(cssProps.font_weight).toBe('font-weight');
  });

  it('should map text properties correctly', () => {
    expect(cssProps.text_align).toBe('text-align');
    expect(cssProps.text_decoration).toBe('text-decoration');
    expect(cssProps.text_transform).toBe('text-transform');
    expect(cssProps.line_height).toBe('line-height');
  });

  it('should map transition properties correctly', () => {
    expect(cssProps.transition).toBe('transition');
    expect(cssProps.transition_property).toBe('transition-property');
    expect(cssProps.transition_duration).toBe('transition-duration');
  });

  it('should map animation properties correctly', () => {
    expect(cssProps.animation).toBe('animation');
    expect(cssProps.animation_name).toBe('animation-name');
    expect(cssProps.animation_duration).toBe('animation-duration');
  });

  it('should map SVG properties correctly', () => {
    expect(cssProps.fill).toBe('fill');
    expect(cssProps.stroke).toBe('stroke');
    expect(cssProps.mask).toBe('mask');
  });

  it('should use underscores in keys and hyphens in values', () => {
    expect(cssProps.overflow_x).toBe('overflow-x');
    expect(cssProps.box_sizing).toBe('box-sizing');
    expect(cssProps.min_width).toBe('min-width');
  });

  it('should contain a large number of CSS properties', () => {
    expect(Object.keys(cssProps).length).toBeGreaterThan(200);
  });
});
