import { describe, it, expect } from 'vitest';
import { handlerRegister } from '../handlerRegister.utils.js';

describe('handlerRegister', () => {
  it('should process empty register', () => {
    const result = handlerRegister({ register: {}, prefix: 'bnv-' });
    expect(result).toHaveProperty('comp');
    expect(result).toHaveProperty('prov');
    expect(result).toHaveProperty('tools');
  });

  it('should generate component documentation for boolean entries', () => {
    const register = {
      button: { button: true },
    };
    const result = handlerRegister({ register, prefix: 'bnv-' });
    expect(result.tools.doc).toContain('button');
  });

  it('should generate provider documentation for nested objects', () => {
    const register = {
      card: {
        header: true,
        body: true,
      },
    };
    const result = handlerRegister({ register, prefix: 'bnv-' });
    expect(result.prov.doc).toContain('CARD');
    expect(result.prov.doc).toContain('header');
    expect(result.prov.doc).toContain('body');
  });

  it('should handle string value entries', () => {
    const register = {
      theme: { primary: 'blue-500' },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.prov.doc).toContain('primary');
  });

  it('should uppercase first-level component names', () => {
    const register = {
      button: { base: true },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.prov.doc).toContain('BUTTON');
  });

  it('should build component union types', () => {
    const register = {
      button: { base: true },
      card: { base: true },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.comp.simple).toContain('BUTTON');
    expect(result.comp.simple).toContain('CARD');
  });

  it('should handle deeply nested structures', () => {
    const register = {
      nav: {
        $_variant: {
          item: true,
        },
      },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.prov.doc).toContain('NAV');
  });

  it('should generate component object mapping for first level', () => {
    const register = {
      button: { base: true },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.comp.object).toContain('BUTTON');
  });

  it('handles primitive type values: number, boolean, null, undefined', () => {
    const register = {
      comp: {
        $_variant: {
          a: '42',
          b: 'true',
          c: 'false',
          d: 'null',
          e: 'undefined',
        },
      },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.tools.declare).toContain('number');
    expect(result.tools.declare).toContain('boolean');
  });

  it('handles bigint string values', () => {
    const register = {
      comp: { $_var: { a: '123n' } },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.tools.declare).toContain('bigint');
  });

  it('handles primitive value markers like $string$', () => {
    const register = {
      comp: { $_v: { a: '$string$' } },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.tools.declare).toContain('string');
  });

  it('handles function values for dynamic_values keys', () => {
    const register = {
      comp: {
        dynamic_values: () => ({}),
        dynamic_values_type: () => 'string',
      },
    };
    const result = handlerRegister({ register, prefix: '' });
    expect(result.prov.doc).toContain('dynamic_values');
    expect(result.prov.declare).toContain('dynamic_values');
  });

  it('should avoid duplicate tool registrations', () => {
    const register = {
      parent: {
        child: true,
        nested: { child: true },
      },
    };
    const result = handlerRegister({ register, prefix: '' });
    const childOccurrences = result.tools.doc.split('\n').filter(l => l.trim().startsWith('child:'));
    expect(childOccurrences).toHaveLength(1);
  });
});
