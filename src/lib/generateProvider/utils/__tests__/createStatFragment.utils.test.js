import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { createStatFragment } from '../createStatFragment.utils.js';

describe('createStatFragment', () => {
  it('writes a JS fragment using the anonymous wrapper', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'csf-'));
    await createStatFragment({
      dir: tmp,
      content: "'key':'value'",
      fileName: 'foo.js',
      theme: 'theme1',
    });
    const target = path.join(tmp, 'stats', 'theme1', 'foo.js');
    expect(fs.existsSync(target)).toBe(true);
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('export default');
  });

  it('writes a TypeScript declaration fragment when declare is provided', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'csf-'));
    await createStatFragment({
      dir: tmp,
      content: "'a':string",
      fileName: 'foo.d.ts',
      theme: 'theme1',
      declare: 'FooType',
    });
    const target = path.join(tmp, 'stats', 'theme1', 'foo.d.ts');
    const content = await fsp.readFile(target, 'utf8');
    expect(content).toContain('interface FooType');
    expect(content).toContain('export default FooType');
  });
});
