import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { generateProvider } from '../generateProvider.utils.js';

const docs = {
  theme1: {
    cssPath: 'styles/theme1.css',
    classNames: { doc: '', declare: '' },
  },
};

describe('generateProvider', () => {
  it('writes the provider JS file from the link template', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gp-'));
    await generateProvider({
      dir: tmp,
      providerDocs: docs,
      declarationHelp: false,
      providerName: 'MyProvider',
      compilerType: 'full',
      embedCss: false,
    });
    const target = path.join(tmp, 'myProvider.js');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('export class MyProvider');
  });

  it('writes the provider JS file from the embed (style) template', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gp-'));
    const cssPath = path.join(tmp, 'theme1.css');
    fs.writeFileSync(cssPath, '.btn{color:red}');
    await generateProvider({
      dir: tmp,
      providerDocs: {
        theme1: {
          cssPath,
          classNames: { doc: '', declare: '' },
        },
      },
      declarationHelp: false,
      providerName: 'Embed',
      compilerType: 'full',
      embedCss: true,
    });
    const target = path.join(tmp, 'embed.js');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('export class Embed');
  });
});
