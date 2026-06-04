import { describe, it, expect, vi } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { buildCssTheme } from '../buildCssTheme.utils.js';

const setup = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bct-'));

describe('buildCssTheme', () => {
  it('returns empty when values has no cssPath', async () => {
    const tmp = setup();
    const result = await buildCssTheme({
      theme: 'a',
      values: {},
      embedCss: false,
      declarationHelp: false,
      dir: tmp,
    });
    expect(result).toBe('');
  });

  it('writes the referenced css theme fragment to disk', async () => {
    const tmp = setup();
    await buildCssTheme({
      theme: 'theme1',
      values: { cssPath: 'styles/theme1.css' },
      embedCss: false,
      declarationHelp: false,
      dir: tmp,
    });
    const target = path.join(tmp, 'stats', 'theme1', 'cssTheme.js');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('theme1');
    expect(content).toContain('styles/theme1.css');
  });

  it('writes a declaration file when declarationHelp is true', async () => {
    const tmp = setup();
    await buildCssTheme({
      theme: 'theme1',
      values: { cssPath: 'styles/theme1.css' },
      embedCss: false,
      declarationHelp: true,
      dir: tmp,
    });
    const target = path.join(tmp, 'stats', 'theme1', 'cssTheme.d.ts');
    expect(fs.existsSync(target)).toBe(true);
  });

  it('embeds CSS content when embedCss is true', async () => {
    const cssDir = setup();
    const cssPath = path.join(cssDir, 'theme1.css');
    fs.writeFileSync(cssPath, '.btn { color: red; }');
    const outDir = setup();
    await buildCssTheme({
      theme: 'theme1',
      values: { cssPath, beforeFiles: '', afterFiles: '' },
      embedCss: true,
      declarationHelp: false,
      dir: outDir,
    });
    const target = path.join(outDir, 'stats', 'theme1', 'cssTheme.js');
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('.btn { color: red; }');
  });

  it('handles embedded CSS with before and after foreign files', async () => {
    const cssDir = setup();
    const mainPath = path.join(cssDir, 'main.css');
    const beforePath = path.join(cssDir, 'before.css');
    const afterPath = path.join(cssDir, 'after.css');
    fs.writeFileSync(mainPath, 'MAIN');
    fs.writeFileSync(beforePath, 'BEFORE');
    fs.writeFileSync(afterPath, 'AFTER');
    const outDir = setup();
    await buildCssTheme({
      theme: 't',
      values: {
        cssPath: mainPath,
        beforeFiles: `['${beforePath}']`,
        afterFiles: `['${afterPath}']`,
      },
      embedCss: true,
      declarationHelp: false,
      dir: outDir,
    });
    const content = await fsp.readFile(path.join(outDir, 'stats', 't', 'cssTheme.js'), 'utf8');
    expect(content).toContain('BEFORE');
    expect(content).toContain('MAIN');
    expect(content).toContain('AFTER');
  });

  it('embedded mode skips foreign files that do not exist', async () => {
    const cssDir = setup();
    const mainPath = path.join(cssDir, 'main.css');
    fs.writeFileSync(mainPath, 'MAIN');
    const outDir = setup();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await buildCssTheme({
      theme: 't',
      values: {
        cssPath: mainPath,
        beforeFiles: `['/non/existent.css']`,
        afterFiles: '',
      },
      embedCss: true,
      declarationHelp: false,
      dir: outDir,
    });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('handles referenced mode with only beforeFiles', async () => {
    const tmp = setup();
    await buildCssTheme({
      theme: 't',
      values: { cssPath: 'a.css', beforeFiles: "['b.css']" },
      embedCss: false,
      declarationHelp: false,
      dir: tmp,
    });
    const content = await fsp.readFile(path.join(tmp, 'stats', 't', 'cssTheme.js'), 'utf8');
    expect(content).toContain('before');
    expect(content).not.toContain('after:');
  });

  it('handles referenced mode with only afterFiles', async () => {
    const tmp = setup();
    await buildCssTheme({
      theme: 't',
      values: { cssPath: 'a.css', afterFiles: "['c.css']" },
      embedCss: false,
      declarationHelp: false,
      dir: tmp,
    });
    const content = await fsp.readFile(path.join(tmp, 'stats', 't', 'cssTheme.js'), 'utf8');
    expect(content).toContain('after');
  });

  it('embedded mode writes declaration without foreign field', async () => {
    const cssDir = setup();
    const mainPath = path.join(cssDir, 'main.css');
    fs.writeFileSync(mainPath, 'MAIN');
    const outDir = setup();
    await buildCssTheme({
      theme: 't',
      values: { cssPath: mainPath },
      embedCss: true,
      declarationHelp: true,
      dir: outDir,
    });
    const content = await fsp.readFile(path.join(outDir, 'stats', 't', 'cssTheme.d.ts'), 'utf8');
    expect(content).not.toContain('foreign?:');
  });

  it('builds foreign before/after key/value sections in referenced mode', async () => {
    const tmp = setup();
    await buildCssTheme({
      theme: 'theme1',
      values: {
        cssPath: 'a.css',
        beforeFiles: "['x.css']",
        afterFiles: "['y.css']",
      },
      embedCss: false,
      declarationHelp: false,
      dir: tmp,
    });
    const content = await fsp.readFile(path.join(tmp, 'stats', 'theme1', 'cssTheme.js'), 'utf8');
    expect(content).toContain('foreign');
    expect(content).toContain('x.css');
    expect(content).toContain('y.css');
  });
});
