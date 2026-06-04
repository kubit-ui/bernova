import { describe, it, expect, vi, afterEach } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { mkTmp, writeTmpFile } from '../../../__tests__/helpers.js';
import { copyLocalFonts } from '../copyLocalFonts.utils.js';

describe('copyLocalFonts', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs a message when no local fonts are configured', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const out = mkTmp('clf-');
    await copyLocalFonts(undefined, out);
    await copyLocalFonts([], out);
    expect(log).toHaveBeenCalled();
  });

  it('copies local font files to the output directory', async () => {
    const tmpSrc = mkTmp('clf-src-');
    const tmpOut = mkTmp('clf-out-');
    const srcFile = writeTmpFile(tmpSrc, 'font.ttf', 'font-data');

    await copyLocalFonts([{ name: 'Custom', files: { 400: srcFile } }], tmpOut);

    const dest = path.join(tmpOut, 'fonts', 'font.ttf');
    expect(await fsp.readFile(dest, 'utf8')).toBe('font-data');
  });

  it('catches filesystem errors', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const out = mkTmp('clf-out-');
    await copyLocalFonts([{ name: 'X', files: { 400: path.join(out, 'missing-font.ttf') } }], out);
    expect(err).toHaveBeenCalled();
  });
});
