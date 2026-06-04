import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { mkTmp } from '../../../../__tests__/helpers.js';
import { buildStatsDoc } from '../buildStatDoc.utils.js';

const baseDocs = {
  theme1: {
    cssPath: 'styles/theme1.css',
    variables: { doc: "v:'x',", declare: 'v:string;' },
    classNames: { doc: 'BTN:{},', declare: 'BTN:{};' },
    availableComp: { doc: "BTN:'BTN',", declare: "BTN:'BTN';" },
    globalStyles: { doc: "g:'.x',", declare: 'g:string;' },
    mediaQueries: { doc: "m:'',", declare: 'm:string;' },
  },
};

const run = async (overrides = {}) => {
  const tmp = mkTmp('bsd-');
  await buildStatsDoc({
    providerDocs: baseDocs,
    declarationHelp: false,
    compilerType: 'full',
    dir: tmp,
    embedCss: false,
    ...overrides,
  });
  return tmp;
};

const themeFile = (dir, name) => path.join(dir, 'stats', 'theme1', name);

describe('buildStatsDoc', () => {
  it('writes a stats.js file aggregating all themes', async () => {
    const tmp = await run();
    const stats = path.join(tmp, 'stats', 'stats.js');
    expect(fs.existsSync(stats)).toBe(true);
    const content = await fsp.readFile(stats, 'utf8');
    expect(content).toContain('export const cssThemes');
    expect(content).toContain('export const cssClasses');
    expect(content).toContain('export const cssVars');
  });

  it('writes typescript declarations when declarationHelp is true', async () => {
    const tmp = await run({ declarationHelp: true });
    expect(fs.existsSync(path.join(tmp, 'stats', 'stats.d.ts'))).toBe(true);
    expect(fs.existsSync(themeFile(tmp, 'cssClassNames.d.ts'))).toBe(true);
  });

  it.each([
    ['foundation-only', 'cssClassNames.js', false, 'cssVars.js', true],
    ['component-only', 'cssVars.js', false, 'cssClassNames.js', true],
  ])(
    'compilerType=%s: %s exists=%s, %s exists=%s',
    async (compilerType, skipFile, skipExists, keepFile, keepExists) => {
      const tmp = await run({ compilerType });
      expect(fs.existsSync(themeFile(tmp, skipFile))).toBe(skipExists);
      expect(fs.existsSync(themeFile(tmp, keepFile))).toBe(keepExists);
    },
  );

  it.each([
    ['component-only', 'cssClassNames.d.ts', true, 'cssVars.d.ts', false],
    ['foundation-only', 'cssVars.d.ts', true, 'cssClassNames.d.ts', false],
  ])(
    'declarationHelp + compilerType=%s writes %s=%s, %s=%s',
    async (compilerType, keepFile, keepExists, skipFile, skipExists) => {
      const tmp = await run({ declarationHelp: true, compilerType });
      expect(fs.existsSync(themeFile(tmp, keepFile))).toBe(keepExists);
      expect(fs.existsSync(themeFile(tmp, skipFile))).toBe(skipExists);
    },
  );

  it('aggregates multiple themes with declarationHelp', async () => {
    const tmp = mkTmp('bsd-');
    await buildStatsDoc({
      providerDocs: {
        a: { cssPath: 'a.css', variables: { doc: '', declare: '' } },
        b: { cssPath: 'b.css', variables: { doc: '', declare: '' } },
      },
      declarationHelp: true,
      compilerType: 'full',
      dir: tmp,
      embedCss: false,
    });
    const stats = await fsp.readFile(
      path.join(tmp, 'stats', 'stats.d.ts'),
      'utf8',
    );
    expect(stats).toContain('aCssTheme & bCssTheme');
  });

  it('handles themes with missing optional sections', async () => {
    const tmp = mkTmp('bsd-');
    await buildStatsDoc({
      providerDocs: { only: { cssPath: 'only.css' } },
      declarationHelp: false,
      compilerType: 'full',
      dir: tmp,
      embedCss: false,
    });
    expect(fs.existsSync(path.join(tmp, 'stats', 'stats.js'))).toBe(true);
  });
});
