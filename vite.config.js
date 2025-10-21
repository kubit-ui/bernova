/**
 * Vite Configuration for Bernova CSS Framework
 *
 * Builds the main library for Node.js environment.
 * CLI binaries are handled separately to avoid shebang conflicts.
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node16',
    outDir: 'dist',

    lib: {
      entry: resolve(__dirname, 'src/app.js'),
      name: 'Bernova',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },

    rollupOptions: {
      external: [
        'fs',
        'path',
        'fs/promises',
        'url',
        'child_process',
        'os',
        'util',
        'crypto',
        'stream',
        'events',
        'postcss',
        'autoprefixer',
        'cssnano',
        'postcss-preset-env',
        'postcss-font-magician',
        'ora',
        'ts-node',
        'typescript',
      ],

      output: {
        format: 'cjs',
        exports: 'named',
        // Optimizations for smaller bundle size
        compact: true,
        manualChunks: undefined,
        // Remove comments and whitespace
        generatedCode: {
          symbols: false,
          constBindings: true,
        },
      },

      // Tree shaking configuration
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },

    // Enable terser for maximum compression
    minify: 'terser',

    // Terser options for aggressive minification
    terserOptions: {
      compress: {
        dead_code: true,
        drop_console: false, // Keep console for CLI tools
        drop_debugger: true,
        keep_fargs: false,
        unused: true,
        collapse_vars: true,
        reduce_vars: true,
        inline: 2,
        passes: 3, // Multiple passes for better compression
        pure_funcs: [],
        pure_getters: true,
        unsafe: false,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_methods: true,
        unsafe_proto: true,
        warnings: false,
      },
      mangle: {
        toplevel: true,
        keep_fnames: false,
        reserved: [
          'require',
          'module',
          'exports',
          '__dirname',
          '__filename',
          'process',
          'global',
        ],
      },
      format: {
        comments: false,
        beautify: false,
        semicolons: true,
      },
    },

    // Disable sourcemaps for production to reduce size
    sourcemap: false,

    // Clear output directory
    emptyOutDir: true,

    // Additional optimizations
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
