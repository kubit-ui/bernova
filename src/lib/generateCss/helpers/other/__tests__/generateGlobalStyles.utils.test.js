import { describe, it, expect } from 'vitest';
import { generateGlobalStyles } from '../generateGlobalStyles.utils.js';

describe('generateGlobalStyles', () => {
  it('produces CSS rules from targets and styles', () => {
    const { globalStyles, globalDocs } = generateGlobalStyles([
      { targets: 'body', styles: { color: 'red' } },
    ]);
    expect(globalStyles).toContain('body { color: red; }');
    expect(globalDocs.doc).toBe('');
    expect(globalDocs.declare).toBe('');
  });

  it('registers documentation for class selectors', () => {
    const { globalStyles, globalDocs } = generateGlobalStyles([
      { targets: '.my-class', styles: { color: 'blue' } },
    ]);
    expect(globalStyles).toContain('.my-class { color: blue; }');
    expect(globalDocs.doc).toContain('my_class');
    expect(globalDocs.doc).toContain("'my-class'");
    expect(globalDocs.declare).toContain('my_class');
  });

  it('handles multiple targets separated by spaces', () => {
    const { globalDocs } = generateGlobalStyles([
      { targets: '.a .b', styles: { color: 'red' } },
    ]);
    expect(globalDocs.doc).toContain('a:');
    expect(globalDocs.doc).toContain('b:');
  });

  it('handles empty global styles array', () => {
    const { globalStyles, globalDocs } = generateGlobalStyles([]);
    expect(globalStyles).toBe('');
    expect(globalDocs.doc).toBe('');
    expect(globalDocs.declare).toBe('');
  });
});
