import { describe, it, expect } from 'vitest';
import { formatRuleName, setForeignRegister } from '../formatRuleName.utils.js';

describe('formatRuleName', () => {
  it('should return theRule directly when provided', () => {
    const result = formatRuleName({ theRule: '.custom-rule' });
    expect(result).toBe('.custom-rule');
  });

  it('should generate base className from key when no parentRule', () => {
    const register = {};
    const result = formatRuleName({
      key: 'Button',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(result).toBe('bnv-button');
  });

  it('should register component when key is provided without parentRule', () => {
    const register = {};
    formatRuleName({
      key: 'Card',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(register).toHaveProperty('card');
    expect(register.card).toHaveProperty('card');
  });

  it('should not register when key is empty', () => {
    const register = {};
    formatRuleName({ key: '', prefix: 'bnv-', register });
    expect(Object.keys(register)).toHaveLength(0);
  });

  it('should handle variant with parentRule containing --', () => {
    const register = {};
    const result = formatRuleName({
      key: 'large',
      parentRule: 'bnv-button--primary',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(result).toBe('bnv-button--large');
  });

  it('should handle _ prefixed keys as target components', () => {
    const register = {};
    const result = formatRuleName({
      key: '_icon',
      parentRule: 'bnv-button',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(result).toBe('bnv-button__icon');
  });

  it('should handle _ prefixed keys with variant', () => {
    const register = {};
    const result = formatRuleName({
      key: '_icon',
      parentRule: 'bnv-button--large',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(result).toContain('_icon');
    expect(result).toContain('--large');
  });

  it('should return prefix with empty key when no parentRule or theRule', () => {
    const result = formatRuleName({ prefix: 'bnv-' });
    expect(result).toBe('bnv-');
  });

  it('should remove brackets from key in class name', () => {
    const register = {};
    const result = formatRuleName({
      key: 'Button[size]',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(result).toBe('bnv-button');
  });
});

describe('formatRuleName - literals and edge cases', () => {
  it('registers literal values without variant', () => {
    const register = {};
    formatRuleName({
      key: 'Button',
      prefix: 'bnv-',
      register,
      hasStyles: true,
      literals: { foo: 'bar', num: 42, nullVal: null },
    });
    expect(register.button).toHaveProperty('foo');
    expect(register.button).toHaveProperty('num');
  });

  it('registers literal values with variant', () => {
    const register = {};
    formatRuleName({
      key: 'large',
      parentRule: 'bnv-button',
      prefix: 'bnv-',
      register,
      hasStyles: true,
      literals: { color: 'red', size: 16, isOn: true, nothing: null },
    });
    expect(register.button).toBeDefined();
    expect(register.button.$_large).toBeDefined();
    expect(register.button.$_large.color).toBe('red');
    expect(register.button.nothing).toBe('$null$');
  });

  it('handles existing component when registering variant', () => {
    const register = {};
    // First register the component
    formatRuleName({
      key: 'Button',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    // Then register a variant - exercises the "regWithoutVariant" branch
    formatRuleName({
      key: 'large',
      parentRule: 'bnv-button',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(register.button).toBeDefined();
  });

  it('handles _ prefixed key on previously registered component', () => {
    const register = { button: { button: 'bnv-button' } };
    formatRuleName({
      key: '_icon',
      parentRule: 'bnv-button--primary',
      prefix: 'bnv-',
      register,
      hasStyles: true,
    });
    expect(register.button).toBeDefined();
  });
});

describe('setForeignRegister', () => {
  it('should merge foreign register into main register', () => {
    const register = {};
    setForeignRegister({
      ruleName: 'component',
      foreignRegister: { foreignKey: 'foreignValue' },
      register,
    });
    expect(register.component).toHaveProperty('foreignKey');
  });

  it('should merge foreign register into variant section', () => {
    const register = {};
    setForeignRegister({
      ruleName: 'component--variant',
      foreignRegister: { foreignKey: 'value' },
      register,
    });
    expect(register.component).toHaveProperty('$_variant');
  });

  it('should preserve existing register entries when merging', () => {
    const register = { component: { existing: 'data' } };
    setForeignRegister({
      ruleName: 'component',
      foreignRegister: { newKey: 'newValue' },
      register,
    });
    expect(register.component).toHaveProperty('existing');
    expect(register.component).toHaveProperty('newKey');
  });
});
