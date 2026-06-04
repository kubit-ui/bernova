import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateCSS } from '../generateCSS.utils.js';

describe('generateCSS', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns generated CSS parts for a full compile', async () => {
    const result = await generateCSS({
      source: {
        foundations: { primary: '#fff' },
        theme: { Button: { color: 'red' } },
      },
      prefix: 'bv',
      compilerType: 'full',
      baseCss: '/* base */\n',
    });
    expect(result).toHaveProperty('stylesCss');
    expect(result).toHaveProperty('foundationsCss');
    expect(result).toHaveProperty('rootDocs');
    expect(result).toHaveProperty('globalDocs');
    expect(result.foundationsCss).toContain(':root');
    expect(result.stylesCss).toContain('button');
  });

  it('logs and re-throws when filterGenerateCss fails', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      generateCSS({ source: null, prefix: 'bv', compilerType: 'full' }),
    ).rejects.toThrow();
    expect(err).toHaveBeenCalled();
  });
});
