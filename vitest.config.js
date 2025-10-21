import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    coverage: {
      all: true,
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        'bundle/',
        'reports/',
        '__reports__/',
        '.prettierrc.js',
        'vitest.config.ts',
        'app/__reports__/test-coverage/lcov-report',
        'eslint.config.js',
        'jest.config.js',
        './src/**/index.ts',
      ],
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: '__reports__/test-coverage',
      thresholds: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    },
    css: false,
    environment: 'jsdom', // Use jsdom for browser-like tests
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    exclude: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      'bundle',
      'reports',
      '__reports__',
    ],
    globals: true,
    include: [
      '**/__tests__/**/*.test.{js,ts,jsx,tsx}',
      '**/?(*.)(spec|test).{js,ts,jsx,tsx}',
    ],
    outputFile: {
      html: '__reports__/report.html',
    },
    reporters: ['default', 'html'],
    setupFiles: '',
  },
});
