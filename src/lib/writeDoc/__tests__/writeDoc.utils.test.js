import { describe, it, expect, vi, afterEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { writeDoc } from '../writeDoc.utils.js';

describe('writeDoc', () => {
  afterEach(() => vi.restoreAllMocks());

  it('writes content to a file and creates parent directories', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wd-'));
    const target = path.join(tmp, 'nested', 'deep', 'file.css');
    await writeDoc(target, 'body { color: red; }', 'file.css');
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toBe('body { color: red; }');
  });

  it('resolves source if it is a promise', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wd-'));
    const target = path.join(tmp, 'a.css');
    await writeDoc(target, Promise.resolve('async-content'), 'a.css');
    expect(await fsp.readFile(target, 'utf8')).toBe('async-content');
  });

  it('logs errors and does not throw', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeDoc('/invalid\u0000/path/file.css', 'x', 'x');
    expect(err).toHaveBeenCalled();
  });
});
