import { describe, it, expect, vi, afterEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { fileExists } from '../fileExists.utils.js';

describe('fileExists', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns false when dir is missing', () => {
    expect(fileExists('', 'foo.txt')).toBe(false);
  });

  it('returns false when currentPath is missing', () => {
    expect(fileExists('/tmp', '')).toBe(false);
  });

  it('returns true for an existing file', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-'));
    const file = path.join(tmp, 'a.txt');
    fs.writeFileSync(file, 'x');
    expect(fileExists(tmp, 'a.txt')).toBe(true);
  });

  it('returns false for a missing file', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-'));
    expect(fileExists(tmp, 'missing.txt')).toBe(false);
  });

  it('handles filesystem errors gracefully', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const spy = vi.spyOn(fs, 'existsSync').mockImplementation(() => {
      throw new Error('boom');
    });
    expect(fileExists('/tmp', 'a.txt')).toBe(false);
    expect(warn).toHaveBeenCalled();
    spy.mockRestore();
  });
});
