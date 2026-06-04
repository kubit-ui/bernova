import { describe, it, expect } from 'vitest';
import { setDynamicRegister } from '../dynamicValues.utils.js';

describe('setDynamicRegister', () => {
  it('should register dynamic values on the related component', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $color: 'red' },
      register,
      ruleName: 'bnv-button',
      prefix: 'bnv-',
    });
    expect(register).toHaveProperty('button');
    expect(register.button).toHaveProperty('dynamic_values');
    expect(register.button).toHaveProperty('dynamic_values_type');
  });

  it('should extract component name by removing prefix', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $size: '16px' },
      register,
      ruleName: 'prefix-card',
      prefix: 'prefix-',
    });
    expect(register).toHaveProperty('card');
  });

  it('should extract component before -- separator', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $val: '1' },
      register,
      ruleName: 'bnv-button--large',
      prefix: 'bnv-',
    });
    expect(register).toHaveProperty('button');
  });

  it('should extract component before __ separator', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $val: '1' },
      register,
      ruleName: 'bnv-card__header',
      prefix: 'bnv-',
    });
    expect(register).toHaveProperty('card');
  });

  it('should not overwrite existing register entries', () => {
    const register = { button: { existing: true } };
    setDynamicRegister({
      dynamicValues: { $color: 'blue' },
      register,
      ruleName: 'bnv-button',
      prefix: 'bnv-',
    });
    expect(register.button).toHaveProperty('existing');
    expect(register.button).toHaveProperty('dynamic_values');
  });

  it('should create new register entry when component not registered', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $primaryColor: '#ff0000' },
      register,
      ruleName: 'bnv-theme',
      prefix: 'bnv-',
    });
    expect(register).toHaveProperty('theme');
    expect(typeof register.theme.dynamic_values).toBe('function');
    expect(typeof register.theme.dynamic_values_type).toBe('function');
  });

  it('should produce CSS custom properties from dynamic_values function', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $primaryColor: '#ff0000' },
      register,
      ruleName: 'bnv-theme',
      prefix: 'bnv-',
    });
    const result = register.theme.dynamic_values({ $primaryColor: '#ff0000' });
    expect(result).toHaveProperty('string');
    expect(result).toHaveProperty('object');
    expect(result.string).toContain('--primarycolor');
    expect(result.string).toContain('#ff0000');
    expect(result.object).toHaveProperty('--primarycolor', '#ff0000');
  });

  it('should produce TypeScript type from dynamic_values_type function', () => {
    const register = {};
    setDynamicRegister({
      dynamicValues: { $color: 'red', $size: '16px' },
      register,
      ruleName: 'bnv-comp',
      prefix: 'bnv-',
    });
    const typeStr = register.comp.dynamic_values_type();
    expect(typeStr).toContain('$color');
    expect(typeStr).toContain('$size');
    expect(typeStr).toContain('string');
  });
});
