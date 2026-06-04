import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { compileThemes } from './compileThemes.js';

describe('compileThemes', () => {
  it('returns themeCss and configuration with defaults', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-'));
    const result = compileThemes({
      themeConfig: { prefix: 'bv-' },
      dir: tmp,
    });
    expect(result.name).toBe('bernova');
    expect(result.prefix).toBe('bv-');
    expect(result.themeCss).toEqual({});
  });

  it('loads foundations from a JS file', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-'));
    const file = path.join(tmp, 'f.js');
    fs.writeFileSync(file, 'module.exports = { FOUNDATIONS: { color: "red" } };');
    const result = compileThemes({
      themeConfig: {
        name: 'theme',
        foundations: { path: 'f.js', name: 'FOUNDATIONS' },
      },
      dir: tmp,
    });
    expect(result.themeCss.foundations).toEqual({ color: 'red' });
  });

  it('ignores foundations when file does not exist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-'));
    const result = compileThemes({
      themeConfig: {
        foundations: { path: 'missing.js', name: 'F' },
      },
      dir: tmp,
    });
    expect(result.themeCss.foundations).toBeUndefined();
  });

  it('passes through fonts, resetCss, bvTools, typesTools, foreignThemes', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-'));
    const fonts = { google: [] };
    const result = compileThemes({
      themeConfig: {
        fonts,
        resetCss: true,
        bvTools: { path: 'tools' },
        typesTools: { stylesTypes: {} },
        foreignThemes: [],
        stylesPath: 'styles',
      },
      dir: tmp,
    });
    expect(result.fonts).toBe(fonts);
    expect(result.resetCss).toBe(true);
    expect(result.bvTools).toEqual({ path: 'tools' });
    expect(result.typesTools).toEqual({ stylesTypes: {} });
    expect(result.foreignThemes).toEqual([]);
    expect(result.stylesPath).toBe('styles');
  });

  it('loads theme, global and media when files exist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-'));
    fs.writeFileSync(path.join(tmp, 't.js'), 'module.exports = { T: 1 };');
    fs.writeFileSync(path.join(tmp, 'g.js'), 'module.exports = { G: 2 };');
    fs.writeFileSync(path.join(tmp, 'm.js'), 'module.exports = { M: 3 };');
    const result = compileThemes({
      themeConfig: {
        theme: { path: 't.js', name: 'T' },
        globalStyles: { path: 'g.js', name: 'G' },
        mediaQueries: { path: 'm.js', name: 'M' },
      },
      dir: tmp,
    });
    expect(result.themeCss.theme).toBe(1);
    expect(result.themeCss.global).toBe(2);
    expect(result.themeCss.media).toBe(3);
  });
});
