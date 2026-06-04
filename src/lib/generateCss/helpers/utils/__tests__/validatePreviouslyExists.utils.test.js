import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { mkTmp, writeTmpFile } from '../../../../../__tests__/helpers.js';
import { validatePreviouslyExists } from '../validatePreviouslyExists.utils.js';

const run = (overrides = {}) =>
  validatePreviouslyExists({
    stylesDir: overrides.stylesDir,
    compilerType: 'full',
    name: 'theme',
    ...overrides,
  });

describe('validatePreviouslyExists', () => {
  it('creates the styles directory when it does not exist', async () => {
    const tmp = mkTmp('vpe-');
    const stylesDir = path.join(tmp, 'styles');
    const res = await run({ stylesDir });
    expect(fs.existsSync(stylesDir)).toBe(true);
    expect(res.cssDir).toContain('theme.css');
    expect(res.cssMinifiedDir).toContain('theme.min.css');
    expect(res.oldData).toBe('');
  });

  it('returns dirs without oldData when full compile', async () => {
    const tmp = mkTmp('vpe-');
    writeTmpFile(tmp, 'theme.css', '/* old */');
    const res = await run({ stylesDir: tmp });
    expect(res.oldData).toBe('');
  });

  it.each([
    [
      'foundation-only',
      '/* === BERNOVA COMPONENTS === */\n.btn{}\n/* === END COMPONENTS === */\n',
      '.btn',
    ],
    [
      'component-only',
      '/* === BERNOVA FOUNDATIONS === */\n:root{}\n/* === END FOUNDATIONS === */\n',
      ':root',
    ],
  ])(
    'extracts the right section when compilerType=%s',
    async (compilerType, content, expectedFragment) => {
      const tmp = mkTmp('vpe-');
      writeTmpFile(tmp, 'theme.css', content);
      const res = await run({ stylesDir: tmp, compilerType });
      expect(res.oldData).toContain(expectedFragment);
    },
  );

  it('returns dirs with empty oldData when compilerType is unknown', async () => {
    const tmp = mkTmp('vpe-');
    writeTmpFile(
      tmp,
      'theme.css',
      '/* === BERNOVA FOUNDATIONS === */ x /* === END FOUNDATIONS === */',
    );
    const res = await run({ stylesDir: tmp, compilerType: 'unknown' });
    expect(res.oldData).toBe('');
  });

  it('returns dirs with empty oldData when CSS file is missing', async () => {
    const tmp = mkTmp('vpe-');
    const res = await run({ stylesDir: tmp, compilerType: 'foundation-only' });
    expect(res.oldData).toBe('');
  });
});
