import { describe, it, expect } from 'vitest';
import { generateThemeRegister } from '../generateThemeRegister.utils.js';

describe('generateThemeRegister', () => {
  it('returns a register with the cssPath', () => {
    const register = generateThemeRegister({ cssPath: 'foo.css' });
    expect(register.cssPath).toBe('foo.css');
  });

  it('registers variables from rootDocs', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      rootDocs: { doc: 'd', declare: 'D' },
    });
    expect(register.variables).toEqual({ doc: 'd', declare: 'D' });
  });

  it('merges rootDocs and foreignVars', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      rootDocs: { doc: 'r', declare: 'R' },
      foreignVars: { doc: 'f', declare: 'F' },
    });
    expect(register.variables.doc).toBe('rf');
    expect(register.variables.declare).toBe('RF');
  });

  it('registers stylesDocs (prov) under classNames', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      stylesDocs: {
        prov: { doc: 'p', declare: 'P' },
        comp: { object: '' },
      },
    });
    expect(register.classNames).toEqual({ doc: 'p', declare: 'P' });
    expect(register.availableComp).toBeUndefined();
  });

  it('registers availableComp when stylesDocs.comp.object exists', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      stylesDocs: {
        prov: { doc: 'p', declare: 'P' },
        comp: { object: 'OBJ' },
      },
    });
    expect(register.availableComp).toEqual({ doc: 'OBJ', declare: 'OBJ' });
  });

  it('registers globalStyles when provided', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      globalDocs: { doc: 'g', declare: 'G' },
    });
    expect(register.globalStyles).toEqual({ doc: 'g', declare: 'G' });
  });

  it('registers mediaQueries when mediaDocs is provided', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      mediaDocs: 'media-config',
    });
    expect(register.mediaQueries).toEqual({
      doc: 'media-config',
      declare: 'media-config',
    });
  });

  it('registers beforeFiles and afterFiles when provided', () => {
    const register = generateThemeRegister({
      cssPath: 'a.css',
      foreignBeforeFiles: '[a]',
      foreignAfterFiles: '[b]',
    });
    expect(register.beforeFiles).toBe('[a]');
    expect(register.afterFiles).toBe('[b]');
  });

  it('omits sections when their inputs are empty', () => {
    const register = generateThemeRegister({ cssPath: 'a.css' });
    expect(register.variables).toBeUndefined();
    expect(register.classNames).toBeUndefined();
    expect(register.availableComp).toBeUndefined();
    expect(register.globalStyles).toBeUndefined();
    expect(register.mediaQueries).toBeUndefined();
    expect(register.beforeFiles).toBeUndefined();
    expect(register.afterFiles).toBeUndefined();
  });
});
