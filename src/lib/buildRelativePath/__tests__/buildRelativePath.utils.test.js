import { describe, it, expect } from 'vitest';
import { buildRelativePath } from '../buildRelativePath.utils.js';

describe('buildRelativePath', () => {
  it.each([
    ['dir to dir', '/project/src', '/project/lib', '../lib'],
    ['file to file', '/project/src/index.js', '/project/lib/utils.js', '../lib/utils.js'],
    ['dir to file', '/project/src', '/project/src/utils.js', 'utils.js'],
    ['file to dir', '/project/src/index.js', '/project/lib', '../lib'],
    ['same directory', '/project/src', '/project/src', '.'],
    ['deeply nested paths', '/a/b/c/d/file.js', '/a/x/y/target.js', '../../../x/y/target.js'],
    [
      'paths without file extensions',
      '/project/src/components',
      '/project/src/utils',
      '../utils',
    ],
  ])('builds relative path: %s', (_label, from, to, expected) => {
    expect(buildRelativePath({ from, to })).toBe(expected);
  });
});
