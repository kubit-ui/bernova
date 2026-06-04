import { describe, it, expect } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { handlerForeignThemes } from '../handlerForeignThemes.utils.js';

describe('handlerForeignThemes', () => {
  it('returns empty structures when no foreign themes are provided', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hft-'));
    const result = await handlerForeignThemes({ dir: tmp, foreignThemes: [] });
    expect(result.themeByPosition).toEqual({ after: '[]', before: '[]' });
    expect(result.classesExtracted).toEqual({ doc: '', declare: '' });
    expect(result.variablesExtracted).toEqual({ doc: '', declare: '' });
  });

  it('skips foreign themes whose files do not exist', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hft-'));
    const result = await handlerForeignThemes({
      dir: tmp,
      foreignThemes: [{ path: 'missing.css', position: 'before', name: 'X' }],
    });
    expect(result.themeByPosition.before).toBe('[]');
  });

  it('extracts CSS variables and class names from a foreign theme', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hft-'));
    const cssFile = path.join(tmp, 'foreign.css');
    fs.writeFileSync(
      cssFile,
      `:root { --my-color: red; --my-color: red; }\n.my-class { color: red; }\n.other-class { color: blue; }`,
    );
    const result = await handlerForeignThemes({
      dir: tmp,
      foreignThemes: [
        { path: 'foreign.css', position: 'before', name: 'My Theme' },
      ],
    });
    expect(result.themeByPosition.before).toContain("'foreign.css'");
    expect(result.variablesExtracted.doc).toContain('my_color');
    expect(result.variablesExtracted.declare).toContain('my_color');
    expect(result.classesExtracted.doc).toContain('MY_THEME');
    expect(result.classesExtracted.doc).toContain('my_class');
  });

  it('joins multiple paths in the same position with a comma', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hft-'));
    fs.writeFileSync(path.join(tmp, 'a.css'), '');
    fs.writeFileSync(path.join(tmp, 'b.css'), '');
    const result = await handlerForeignThemes({
      dir: tmp,
      foreignThemes: [
        { path: 'a.css', position: 'after', name: 'A' },
        { path: 'b.css', position: 'after', name: 'B' },
      ],
    });
    expect(result.themeByPosition.after).toBe("['a.css', 'b.css']");
  });
});
