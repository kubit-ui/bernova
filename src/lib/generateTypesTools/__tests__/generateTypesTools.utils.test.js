import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { generateTypesTools } from '../generateTypesTools.utils.js';

const mkTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gtt-'));

describe('generateTypesTools', () => {
  it('writes a stylesTypes definition file', async () => {
    const tmp = mkTmp();
    await generateTypesTools({
      dir: tmp,
      typesTools: {
        stylesTypes: { name: 'styles', path: 'types' },
      },
      mediaConfig: [],
      stylesDocs: {},
    });
    const target = path.join(tmp, 'types', 'styles.ts');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('CssPropsType');
  });

  it('writes componentsTypes when stylesDocs has data', async () => {
    const tmp = mkTmp();
    await generateTypesTools({
      dir: tmp,
      typesTools: {
        componentsTypes: { name: 'components', path: 'types' },
      },
      mediaConfig: [],
      stylesDocs: {
        comp: { simple: "'BTN'" },
        prov: { declare: 'BTN:{};' },
      },
    });
    const target = path.join(tmp, 'types', 'components.ts');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('ComponentsAvailableComponents');
    expect(content).toContain('ComponentsComponents');
  });

  it('does not write componentsTypes when stylesDocs is empty', async () => {
    const tmp = mkTmp();
    await generateTypesTools({
      dir: tmp,
      typesTools: {
        componentsTypes: { name: 'components', path: 'types' },
      },
      mediaConfig: [],
      stylesDocs: {},
    });
    expect(fs.existsSync(path.join(tmp, 'types', 'components.ts'))).toBe(false);
  });

  it('does nothing when typesTools has no configuration', async () => {
    const tmp = mkTmp();
    await generateTypesTools({
      dir: tmp,
      typesTools: {},
      mediaConfig: [],
      stylesDocs: {},
    });
    expect(fs.existsSync(path.join(tmp, 'types'))).toBe(false);
  });
});
