import { describe, it, expect } from 'vitest';
import { attributeHandler } from '../attributeHandler.utils.js';

describe('attributeHandler', () => {
  it('should process attribute with CSS styles', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    attributeHandler({
      attributes: { disabled: { color: 'grey', opacity: '0.5' } },
      ruleName: '.button',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.button[disabled="true"]');
  });

  it('should lowercase attribute names', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    attributeHandler({
      attributes: { ACTIVE: { color: 'blue' } },
      ruleName: '.item',
      processSource,
    });

    expect(calls[0].theRule).toBe('.item[active="true"]');
  });

  it('should use carry attribute when provided', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    attributeHandler({
      attributes: { small: { font_size: '12px' } },
      ruleName: '.text',
      processSource,
      carry: 'size',
    });

    expect(calls[0].theRule).toBe('.text[size="small"]');
  });

  it('should merge styles and lib properties', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    attributeHandler({
      attributes: { active: { color: 'red', $variable: 'value' } },
      ruleName: '.link',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].source).toHaveProperty('color');
    expect(calls[0].source).toHaveProperty('$variable');
  });

  it('should recursively handle nested attributes', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    attributeHandler({
      attributes: {
        variant: {
          primary: { color: 'blue' },
        },
      },
      ruleName: '.button',
      processSource,
    });

    expect(calls.length).toBeGreaterThan(0);
  });

  it('should not call processSource when no styles or lib exist', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    attributeHandler({
      attributes: {
        group: { nested: { color: 'red' } },
      },
      ruleName: '.container',
      processSource,
    });

    expect(
      calls.some((c) => c.theRule === '.container[group="true"]')
    ).toBe(false);
  });
});
