import { describe, it, expect } from 'vitest';
import { foreignHandler } from '../foreignHandler.utils.js';

describe('foreignHandler', () => {
  it('returns empty object when input is empty', () => {
    expect(foreignHandler({ foreign: {}, prefix: 'bnv-' })).toEqual({});
  });

  it('skips entries without component', () => {
    const result = foreignHandler({
      foreign: { btn: { name: 'btn' } },
      prefix: 'bnv-',
    });
    expect(result).toEqual({});
  });

  it('produces a structure with the main lowercase name when component has CSS props', () => {
    const result = foreignHandler({
      foreign: {
        btn: {
          name: 'Button',
          component: { color: 'red' },
        },
      },
      prefix: 'bnv-',
    });
    expect(result.btn).toHaveProperty('button');
    expect(result.btn.button).toContain('bnv-button');
  });

  it('handles sub-components prefixed with _', () => {
    const result = foreignHandler({
      foreign: {
        btn: {
          name: 'Button',
          component: { color: 'red', _icon: { color: 'blue' } },
        },
      },
      prefix: 'bnv-',
    });
    expect(result.btn).toHaveProperty('icon');
    expect(result.btn.icon).toContain('button__icon');
  });

  it('handles sub-components inside a variant', () => {
    const result = foreignHandler({
      foreign: {
        btn: {
          name: 'Button',
          variant: 'primary',
          component: {
            primary: { color: 'red', _icon: { color: 'blue' } },
          },
        },
      },
      prefix: 'bnv-',
    });
    expect(result.btn).toHaveProperty('icon');
    expect(result.btn.icon).toContain('icon--primary');
  });

  it('processes nested $foreign at variant level', () => {
    const result = foreignHandler({
      foreign: {
        btn: {
          name: 'Button',
          variant: 'primary',
          component: {
            primary: {
              color: 'red',
              $foreign: {
                child: {
                  name: 'Child',
                  component: { color: 'red' },
                },
              },
            },
          },
        },
      },
      prefix: 'bnv-',
    });
    expect(result.btn).toHaveProperty('$_primary');
    expect(result.btn.$_primary).toHaveProperty('child');
  });

  it('processes top-level $foreign in component', () => {
    const result = foreignHandler({
      foreign: {
        btn: {
          name: 'Button',
          component: {
            color: 'red',
            $foreign: {
              child: { name: 'Child', component: { color: 'red' } },
            },
          },
        },
      },
      prefix: 'bnv-',
    });
    expect(result.btn).toHaveProperty('child');
  });

  it('handles variants with cssProps', () => {
    const result = foreignHandler({
      foreign: {
        btn: {
          name: 'Button',
          variant: 'primary',
          component: {
            primary: { color: 'red' },
            color: 'black',
          },
        },
      },
      prefix: 'bnv-',
    });
    expect(result.btn.button).toContain('bnv-button');
  });
});
