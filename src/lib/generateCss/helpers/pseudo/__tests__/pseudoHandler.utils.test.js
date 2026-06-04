import { describe, it, expect } from 'vitest';
import { pseudoHandler } from '../pseudoHandler.utils.js';

describe('pseudoHandler', () => {
  it('should process hover pseudo-class', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: { hover: { color: 'blue' } },
      ruleName: '.button',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.button:hover');
    expect(calls[0].source).toHaveProperty('color');
  });

  it('should process focus pseudo-class', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: { focus: { outline: '1px solid blue' } },
      ruleName: '.input',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.input:focus');
  });

  it('should handle pseudo-class with $target parameter', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: { nth_child: { $target: '2n', color: 'red' } },
      ruleName: '.list-item',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.list-item:nth-child(2n)');
  });

  it('should process before pseudo-element', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: { before: { $content: 'prefix' } },
      ruleName: '.label',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.label::before');
  });

  it('should process after pseudo-element', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: { after: { $content: 'suffix' } },
      ruleName: '.tag',
      processSource,
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.tag::after');
  });

  it('should handle multiple pseudo entries', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: {
        hover: { color: 'red' },
        focus: { color: 'blue' },
      },
      ruleName: '.link',
      processSource,
    });

    expect(calls).toHaveLength(2);
  });

  it('should handle nested pseudo-classes recursively', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: {
        hover: {
          color: 'red',
          focus: { outline: 'none' },
        },
      },
      ruleName: '.element',
      processSource,
    });

    expect(calls.length).toBeGreaterThan(0);
  });

  it('uses an empty pseudo string when the pseudo key is unknown', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);
    pseudoHandler({
      pseudoData: { unknownPseudo: { color: 'red' } },
      ruleName: '.x',
      processSource,
    });
    expect(calls[0].theRule).toBe('.x');
  });

  it('does not recurse when there is no nested pseudo', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);
    pseudoHandler({
      pseudoData: { hover: { color: 'red' } },
      ruleName: '.x',
      processSource,
    });
    expect(calls).toHaveLength(1);
  });

  it('should not call processSource when no styles exist', () => {
    const calls = [];
    const processSource = arg => calls.push(arg);

    pseudoHandler({
      pseudoData: {
        hover: { unknownNestedKey: { color: 'red' } },
      },
      ruleName: '.elem',
      processSource,
    });

    expect(calls.every(c => c.theRule !== '.elem:hover')).toBe(true);
  });
});
