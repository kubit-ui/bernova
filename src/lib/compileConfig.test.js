import { describe, it, expect, vi, afterEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { compileConfig } from './compileConfig.js';

describe('compileConfig', () => {
  afterEach(() => vi.restoreAllMocks());

  const writeConfig = (dir, data) => {
    fs.writeFileSync(path.join(dir, 'bernova.config.json'), JSON.stringify(data));
  };

  it('returns themes and provider from a valid config', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
    writeConfig(tmp, {
      themes: [{ name: 'bv' }],
      provider: { name: 'P' },
    });
    const result = await compileConfig({ dir: tmp });
    expect(result.themes).toHaveLength(1);
    expect(result.provider.name).toBe('P');
  });

  it('throws when config file does not exist', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
    await expect(compileConfig({ dir: tmp })).rejects.toThrow();
  });

  it('throws when themes is empty', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
    writeConfig(tmp, { themes: [] });
    await expect(compileConfig({ dir: tmp })).rejects.toThrow(/at least one theme/);
  });

  it('throws when themes is missing', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
    writeConfig(tmp, { provider: { name: 'P' } });
    await expect(compileConfig({ dir: tmp })).rejects.toThrow();
  });

  it('warns but does not throw when tsconfigPath load fails', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
    writeConfig(tmp, {
      themes: [{ name: 'bv' }],
      tsconfigPath: 'no.json',
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await compileConfig({ dir: tmp });
    expect(result.themes).toBeDefined();
    expect(warn).toHaveBeenCalled();
  });

  it('registers tsconfig paths when tsconfig is valid', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-'));
    fs.writeFileSync(
      path.join(tmp, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { baseUrl: '.', paths: {} } }),
    );
    writeConfig(tmp, {
      themes: [{ name: 'bv' }],
      tsconfigPath: 'tsconfig.json',
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await compileConfig({ dir: tmp });
    expect(result.themes).toBeDefined();
    expect(log).toHaveBeenCalled();
  });
});
