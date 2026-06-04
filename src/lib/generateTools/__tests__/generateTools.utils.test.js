import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { mkTmp } from '../../../__tests__/helpers.js';
import { generateTools } from '../generateTools.utils.js';

const baseArgs = (dir) => ({
  dir,
  bvTools: {
    path: 'tools',
    cssClassNames: true,
    cssVariables: true,
    availableComponents: true,
    cssMediaQueries: true,
    cssGlobalStyles: true,
    declarationHelp: true,
  },
  compilerType: 'full',
  name: 'theme1',
  stylesDocs: {
    tools: { doc: "btn:'btn',", declare: 'btn:string,' },
    comp: { object: "BTN:'BTN',", simple: "'BTN'" },
    prov: { doc: '', declare: '' },
  },
  rootDocs: { doc: "v:'x',", declare: 'v:string;' },
  globalDocs: { doc: "g:'.x',", declare: 'g:string;' },
  mediaDocs: "m:'',",
});

const toolFile = (tmp, name) => path.join(tmp, 'tools', name);

describe('generateTools', () => {
  it('creates JS and d.ts tool files for full compile', async () => {
    const tmp = mkTmp('gt-');
    await generateTools(baseArgs(tmp));
    [
      'cssClasses.js',
      'cssVars.js',
      'cssAvailableComponents.js',
      'cssMediaQueries.js',
      'cssGlobalStyles.js',
      'cssClasses.d.ts',
    ].forEach((file) =>
      expect(fs.existsSync(toolFile(tmp, file))).toBe(true),
    );
  });

  it.each([
    ['foundation-only', 'cssClasses.js', false, 'cssVars.js', true],
    ['component-only', 'cssVars.js', false, 'cssClasses.js', true],
  ])(
    'compilerType=%s: %s=%s, %s=%s',
    async (compilerType, skipFile, skipExists, keepFile, keepExists) => {
      const tmp = mkTmp('gt-');
      await generateTools({ ...baseArgs(tmp), compilerType });
      expect(fs.existsSync(toolFile(tmp, skipFile))).toBe(skipExists);
      expect(fs.existsSync(toolFile(tmp, keepFile))).toBe(keepExists);
    },
  );

  it('skips files when their bvTools flag is disabled', async () => {
    const tmp = mkTmp('gt-');
    const args = baseArgs(tmp);
    args.bvTools = { path: 'tools', declarationHelp: false };
    await generateTools(args);
    expect(fs.existsSync(toolFile(tmp, 'cssClasses.js'))).toBe(false);
  });
});
