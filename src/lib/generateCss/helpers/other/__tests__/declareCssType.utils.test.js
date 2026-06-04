import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { declareCssType } from '../declareCssType.utils.js';

describe('declareCssType', () => {
  it('writes a generatorType.ts file with CSS type definitions', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dct-'));
    await declareCssType(undefined, tmp);
    const target = path.join(tmp, 'generatorType.ts');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('CssPropsType');
    expect(content).toContain('CssGeneratorType');
    expect(content).not.toContain('MediaScreenType');
  });

  it('omits MediaScreenType when mediaQueries has empty screen', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dct-'));
    await declareCssType({ screen: {} }, tmp);
    const content = await fsp.readFile(path.join(tmp, 'generatorType.ts'), 'utf8');
    expect(content).not.toContain('MediaScreenType');
  });

  it('omits MediaScreenType when mediaQueries has no screen key', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dct-'));
    await declareCssType({}, tmp);
    const content = await fsp.readFile(path.join(tmp, 'generatorType.ts'), 'utf8');
    expect(content).not.toContain('MediaScreenType');
  });

  it('includes MediaScreenType when mediaQueries.screen is provided', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dct-'));
    await declareCssType({ screen: { mobile: true } }, tmp);
    const content = await fsp.readFile(path.join(tmp, 'generatorType.ts'), 'utf8');
    expect(content).toContain('MediaScreenType');
  });
});
