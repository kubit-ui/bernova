import { describe, it, expect } from 'vitest';
import { interfaceWrapper } from '../interfaceWrapper.utils.js';

describe('interfaceWrapper', () => {
  it('wraps content as a TypeScript interface declaration and default export', () => {
    const result = interfaceWrapper("'a':string", 'Foo');
    expect(result).toContain("interface Foo {'a':string}");
    expect(result).toContain('declare const Foo: Foo;');
    expect(result).toContain('export default Foo;');
  });

  it('handles empty content', () => {
    const result = interfaceWrapper('', 'Bar');
    expect(result).toContain('interface Bar {}');
  });
});
