import { describe, it, expect } from 'vitest';
import { processMediaConfig } from '../processMediaConfig.util.js';

describe('processMediaConfig', () => {
  it('should generate property strings from media config', () => {
    const result = processMediaConfig({
      mediaConfig: [{ name: 'mobile' }, { name: 'tablet' }],
    });
    expect(result).toContain("mobile: 'mobile'");
    expect(result).toContain("tablet: 'tablet'");
  });

  it('should simplify hyphenated names', () => {
    const result = processMediaConfig({
      mediaConfig: [{ name: 'small-screen' }],
    });
    expect(result).toContain("small_screen: 'small-screen'");
  });

  it('should return empty string for empty config', () => {
    const result = processMediaConfig({ mediaConfig: [] });
    expect(result).toBe('');
  });

  it('should format each entry with proper indentation', () => {
    const result = processMediaConfig({
      mediaConfig: [{ name: 'desktop' }],
    });
    expect(result).toMatch(/^\s{2}desktop/);
  });

  it('should end each entry with comma and newline', () => {
    const result = processMediaConfig({
      mediaConfig: [{ name: 'mobile' }],
    });
    expect(result).toMatch(/,\n$/);
  });

  it('should handle multiple entries', () => {
    const config = [
      { name: 'mobile' },
      { name: 'tablet' },
      { name: 'desktop' },
      { name: 'large-desktop' },
    ];
    const result = processMediaConfig({ mediaConfig: config });
    const lines = result.trim().split('\n');
    expect(lines).toHaveLength(4);
  });
});
