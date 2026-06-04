import { describe, it, expect, afterEach, vi } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { readConfigData, readThemeData } from '../readFile.utils.js';

describe('readConfigData', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads and parses a JSON configuration file', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-'));
    const file = path.join(tmp, 'config.json');
    fs.writeFileSync(file, JSON.stringify({ name: 'bv', value: 1 }));
    const data = await readConfigData(file);
    expect(data).toEqual({ name: 'bv', value: 1 });
  });

  it('throws a helpful error when file does not exist', async () => {
    await expect(readConfigData('/non/existent/file.json')).rejects.toThrow(
      /Configuration file not found/,
    );
  });

  it('throws when JSON is invalid', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-'));
    const file = path.join(tmp, 'bad.json');
    fs.writeFileSync(file, '{not valid json');
    await expect(readConfigData(file)).rejects.toThrow(/Invalid JSON/);
  });

  it('throws when JSON content is not an object', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-'));
    const file = path.join(tmp, 'null.json');
    fs.writeFileSync(file, 'null');
    await expect(readConfigData(file)).rejects.toThrow(/valid JSON object/);
  });
});

describe('readThemeData', () => {
  afterEach(() => vi.restoreAllMocks());

  it('loads named exports from JS modules', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-'));
    const file = path.join(tmp, 'theme.js');
    fs.writeFileSync(file, 'module.exports = { THEME: { color: "red" } };');
    const data = readThemeData({
      theme: { path: file, name: 'THEME' },
    });
    expect(data.theme).toEqual({ color: 'red' });
  });

  it('throws when configuration is missing path or name', () => {
    expect(() =>
      readThemeData({ x: { path: '', name: '' } }),
    ).toThrow(/Cannot load theme data/);
  });

  it('throws when named export is not found', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rf-'));
    const file = path.join(tmp, 'theme2.js');
    fs.writeFileSync(file, 'module.exports = { OTHER: {} };');
    expect(() =>
      readThemeData({ theme: { path: file, name: 'MISSING' } }),
    ).toThrow(/Cannot load theme data/);
  });
});
