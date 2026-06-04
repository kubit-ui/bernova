import { describe, it, expect } from 'vitest';
import { mediaQueriesHandler } from '../mediaQueriesHandler.utils.js';

describe('mediaQueriesHandler', () => {
  it('builds media query CSS using config breakpoints', () => {
    const mediaRegister = {};
    mediaQueriesHandler({
      config: [
        {
          name: 'mobile',
          type: 'screen',
          values: { 'min-width': '320px' },
        },
      ],
      mediaQueries: {
        mobile: { color: 'red' },
      },
      parentRule: 'bv-button',
      mediaRegister,
    });
    const keys = Object.keys(mediaRegister);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys[0]).toContain('screen');
  });

  it('uses inline $type/$values when no related config is found', () => {
    const mediaRegister = {};
    mediaQueriesHandler({
      config: [],
      mediaQueries: {
        custom: {
          $type: 'screen',
          $values: { 'max-width': '600px' },
          color: 'blue',
        },
      },
      parentRule: 'bv-card',
      mediaRegister,
    });
    expect(Object.keys(mediaRegister).length).toBeGreaterThan(0);
  });

  it('ignores empty media style objects', () => {
    const mediaRegister = {};
    mediaQueriesHandler({
      config: [],
      mediaQueries: { mobile: {} },
      parentRule: 'bv',
      mediaRegister,
    });
    expect(Object.keys(mediaRegister)).toHaveLength(0);
  });

  it('handles nested pseudo, attributes and advancedSelectors inside media queries', () => {
    const mediaRegister = {};
    mediaQueriesHandler({
      config: [{ name: 'm', type: 'screen', values: { 'min-width': '0' } }],
      mediaQueries: {
        m: {
          base: {
            color: 'red',
            $pseudoClasses: { hover: { color: 'blue' } },
            $pseudoElements: { before: { color: 'green' } },
            $attributes: { 'data-foo': { color: 'pink' } },
            $advancedSelectors: [{ '>': { $target: 'span', color: 'red' } }],
          },
        },
      },
      parentRule: 'bv-comp',
      mediaRegister,
    });
    const value = Object.values(mediaRegister)[0];
    expect(value).toBeDefined();
  });

  it('skips non-object media style entries', () => {
    const mediaRegister = {};
    mediaQueriesHandler({
      config: [],
      mediaQueries: { m: 'string-not-object' },
      parentRule: 'bv-a',
      mediaRegister,
    });
    expect(Object.keys(mediaRegister)).toHaveLength(0);
  });

  it('appends CSS when the same media key is processed twice', () => {
    const mediaRegister = {};
    const args = {
      config: [{ name: 'm', type: 'screen', values: { 'min-width': '320px' } }],
      mediaQueries: { m: { color: 'red' } },
      parentRule: 'bv-a',
      mediaRegister,
    };
    mediaQueriesHandler(args);
    mediaQueriesHandler({ ...args, parentRule: 'bv-b' });
    const value = Object.values(mediaRegister)[0];
    expect(value.length).toBeGreaterThan(0);
  });
});
