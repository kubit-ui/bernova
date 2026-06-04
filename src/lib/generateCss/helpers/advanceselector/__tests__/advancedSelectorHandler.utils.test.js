import { describe, it, expect } from 'vitest';
import { advancedSelectorHandler } from '../advancedSelectorHandler.utils.js';

describe('advancedSelectorHandler', () => {
  it('should process adjacent selector with $target', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ adjacent: { $target: '.sibling', color: 'red' } }],
      '.parent',
      processSource
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.parent + .sibling');
    expect(calls[0].source).toEqual({ color: 'red' });
  });

  it('should process child selector with $target', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ child: { $target: '.item', display: 'block' } }],
      '.container',
      processSource
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.container > .item');
  });

  it('should process descendant selector', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ descendant: { $target: '.deep', opacity: '1' } }],
      '.wrapper',
      processSource
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.wrapper .deep');
  });

  it('should process near (general sibling) selector', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ near: { $target: '.item', color: 'blue' } }],
      '.base',
      processSource
    );

    expect(calls).toHaveLength(1);
    expect(calls[0].theRule).toBe('.base ~ .item');
  });

  it('should skip concat selector since its value is falsy empty string', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ concat: { $target: '.modifier', font_size: '14px' } }],
      '.element',
      processSource
    );

    expect(calls).toHaveLength(0);
  });

  it('should skip selectors without $target', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ adjacent: { color: 'red' } }],
      '.parent',
      processSource
    );

    expect(calls).toHaveLength(0);
  });

  it('should skip unknown selector types', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ unknown: { $target: '.item', color: 'red' } }],
      '.parent',
      processSource
    );

    expect(calls).toHaveLength(0);
  });

  it('should process multiple selectors in a single entry', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [
        {
          adjacent: { $target: '.a', color: 'red' },
          child: { $target: '.b', display: 'flex' },
        },
      ],
      '.root',
      processSource
    );

    expect(calls).toHaveLength(2);
  });

  it('should exclude $target from the source passed to processSource', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [{ near: { $target: '.item', color: 'blue', margin: '0' } }],
      '.base',
      processSource
    );

    expect(calls[0].source).toEqual({ color: 'blue', margin: '0' });
    expect(calls[0].source).not.toHaveProperty('$target');
  });

  it('should handle multiple array entries', () => {
    const calls = [];
    const processSource = (arg) => calls.push(arg);

    advancedSelectorHandler(
      [
        { adjacent: { $target: '.a', color: 'red' } },
        { child: { $target: '.b', display: 'flex' } },
      ],
      '.root',
      processSource
    );

    expect(calls).toHaveLength(2);
    expect(calls[0].theRule).toBe('.root + .a');
    expect(calls[1].theRule).toBe('.root > .b');
  });
});
