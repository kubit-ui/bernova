import { describe, it, expect } from 'vitest';
import { anonimousWrapper } from '../anonimousWrapper.utils.js';

describe('anonimousWrapper', () => {
  it('wraps content in an export default object literal', () => {
    expect(anonimousWrapper("'a':1")).toBe("export default {'a':1}");
  });

  it('handles empty content', () => {
    expect(anonimousWrapper('')).toBe('export default {}');
  });
});
