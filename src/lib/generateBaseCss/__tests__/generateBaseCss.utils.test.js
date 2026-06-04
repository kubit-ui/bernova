import { describe, it, expect, vi, afterEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { generateBaseCss } from '../generateBaseCss.utils.js';

describe('generateBaseCss', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns empty string when there are no fonts and no resetCss', async () => {
    const css = await generateBaseCss({ fonts: undefined, resetCss: false });
    expect(css).toBe('');
  });

  it('includes the reset CSS when resetCss is true', async () => {
    const css = await generateBaseCss({ fonts: undefined, resetCss: true });
    expect(css).toContain('html');
    expect(css).toContain('box-sizing');
  });

  it('includes Google font @import when fonts.google is provided', async () => {
    const css = await generateBaseCss({
      fonts: { google: [{ name: 'Roboto', weights: [400] }] },
      resetCss: false,
    });
    expect(css).toContain('@import');
    expect(css).toContain('Roboto');
  });

  it('copies local fonts when fonts.local is provided', async () => {
    const tmpSrc = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-'));
    const tmpOut = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-out-'));
    const srcFile = path.join(tmpSrc, 'foo.ttf');
    fs.writeFileSync(srcFile, 'data');

    const css = await generateBaseCss({
      fonts: { local: [{ name: 'F', files: { 400: srcFile } }] },
      resetCss: false,
      stylesPath: tmpOut,
    });
    expect(css).toContain('@font-face');
    expect(fs.existsSync(path.join(tmpOut, 'fonts', 'foo.ttf'))).toBe(true);
  });
});
