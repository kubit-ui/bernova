/**
 * Vite Configuration for Bernova CSS Framework
 *
 * Modern build configuration with dual package support (ESM + CJS)
 * Optimized for lightweight, versatile distribution
 */

import cssnano from 'cssnano';
import fs from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';
import path from 'path';
import postcss from 'postcss';
import { minify } from 'terser';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Constants
const EMPTY_LENGTH = 0;
const SECOND_INDEX = 1;

/**
 * Plugin to copy and minify CSS files to dist/styles
 */
const copyCSSPlugin = (): any => {
  const cssProcessor = postcss([
    cssnano({
      preset: [
        'default',
        {
          discardComments: { removeAll: true },
          minifyFontValues: true,
          minifyGradients: true,
          normalizeWhitespace: true,
          reduceTransforms: true,
        },
      ],
    }),
  ]);

  return {
    name: 'copy-css-assets',
    async closeBundle() {
      const stylesPattern = path.resolve(__dirname, 'src/styles/**/*.css');
      const stylesOut = path.resolve(__dirname, 'dist/styles');

      const files = glob.sync(stylesPattern);

      if (files.length > EMPTY_LENGTH) {
        fs.mkdirSync(stylesOut, { recursive: true });

        for (const file of files) {
          const relPath = path.relative(
            path.resolve(__dirname, 'src/styles'),
            file
          );
          const destPath = path.join(stylesOut, relPath);
          const destDir = path.dirname(destPath);

          fs.mkdirSync(destDir, { recursive: true });

          // Copy original CSS
          fs.copyFileSync(file, destPath);

          // Create minified version
          const minifiedPath = destPath.replace('.css', '.min.css');
          try {
            const cssContent = fs.readFileSync(file, 'utf-8');
            const result = await cssProcessor.process(cssContent, {
              from: file,
              to: minifiedPath,
            });
            fs.writeFileSync(minifiedPath, result.css);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(
              `[copy-css-assets] ⚠ Error minifying ${relPath}:`,
              error
            );
            fs.copyFileSync(file, minifiedPath);
          }
        }

        // eslint-disable-next-line no-console
        console.log(
          `[copy-css-assets] ✓ Copied and minified ${files.length} CSS files to ./dist/styles/`
        );
      }
    },
  };
};

/**
 * Plugin to copy and minify CLI binaries
 */
const copyCLIBinariesPlugin = (): any => {
  return {
    name: 'copy-cli-binaries',
    async closeBundle() {
      const binDir = path.resolve(__dirname, 'bin');
      const distBinDir = path.resolve(__dirname, 'dist/bin');

      if (!fs.existsSync(binDir)) {
        return;
      }

      fs.mkdirSync(distBinDir, { recursive: true });

      const binFiles = fs
        .readdirSync(binDir)
        .filter((file) => file.endsWith('.js'));

      for (const file of binFiles) {
        const srcPath = path.join(binDir, file);
        const destPath = path.join(distBinDir, file);

        // Read the source file
        let code = fs.readFileSync(srcPath, 'utf-8');

        // Keep the shebang if present
        const shebangMatch = code.match(/^#!.+\n/);
        const shebang = shebangMatch ? shebangMatch[0] : '';
        const codeWithoutShebang = shebang ? code.slice(shebang.length) : code;

        try {
          // Minify the code (excluding shebang)
          const minified = await minify(codeWithoutShebang, {
            compress: {
              dead_code: true,
              drop_console: false, // Keep console for CLI
              drop_debugger: true,
              pure_funcs: [],
            },
            format: {
              comments: false,
            },
            mangle: {
              toplevel: false, // Don't mangle top-level for CLI
            },
          });

          // Combine shebang with minified code
          const finalCode = shebang + (minified.code || codeWithoutShebang);
          fs.writeFileSync(destPath, finalCode);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(`[copy-cli-binaries] ⚠ Error minifying ${file}:`, error);
          fs.copyFileSync(srcPath, destPath);
        }

        // Make executable
        fs.chmodSync(destPath, 0o755);
      }

      // eslint-disable-next-line no-console
      console.log(
        `[copy-cli-binaries] ✓ Copied and minified ${binFiles.length} CLI binaries`
      );
    },
  };
};

/**
 * Plugin to copy and minify source files (for compatibility)
 * Removes all comments including JSDoc for maximum compression
 */
const copySourcePlugin = (): any => {
  return {
    name: 'copy-source',
    async closeBundle() {
      const srcDir = path.resolve(__dirname, 'src');
      const distSrcDir = path.resolve(__dirname, 'dist/src');
      let minifiedCount = 0;

      const copyAndMinifyRecursive = async (
        src: string,
        dest: string
      ): Promise<void> => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            // Skip test directories
            if (
              ['__tests__', '__mocks__', '__fixtures__'].includes(entry.name)
            ) {
              continue;
            }
            await copyAndMinifyRecursive(srcPath, destPath);
          } else {
            // Skip test files and markdown
            if (entry.name.endsWith('.test.js') || entry.name.endsWith('.md')) {
              continue;
            }

            // Minify .js files, copy others as-is
            if (entry.name.endsWith('.js')) {
              try {
                const code = fs.readFileSync(srcPath, 'utf-8');
                const minified = await minify(code, {
                  compress: {
                    dead_code: true,
                    drop_console: false, // Keep console for library
                    drop_debugger: true,
                    passes: 2,
                    pure_getters: true,
                    unsafe_arrows: true,
                    unsafe_comps: true,
                  },
                  mangle: false, // Don't mangle for source compatibility
                  format: {
                    comments: false, // Remove ALL comments including JSDoc
                    beautify: false,
                  },
                });

                fs.writeFileSync(destPath, minified.code || code);
                minifiedCount++;
              } catch (error) {
                // eslint-disable-next-line no-console
                console.warn(
                  `[copy-source] ⚠ Error minifying ${entry.name}:`,
                  error
                );
                fs.copyFileSync(srcPath, destPath);
              }
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }
      };

      await copyAndMinifyRecursive(srcDir, distSrcDir);

      // eslint-disable-next-line no-console
      console.log(
        `[copy-source] ✓ Copied and minified ${minifiedCount} source files (comments removed)`
      );
    },
  };
};

/**
 * Plugin to remove test files from distribution
 */
const removeTestFilesPlugin = (): any => {
  return {
    name: 'remove-test-files',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');

      // Remove test directories
      const testDirs = glob.sync(`${distDir}/**/__tests__`, { absolute: true });
      testDirs.forEach((dir) => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      });

      // Remove test files
      const testFiles = glob.sync(`${distDir}/**/*.test.{js,d.ts}`, {
        absolute: true,
      });
      testFiles.forEach((file) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });

      const removed = testDirs.length + testFiles.length;
      if (removed > EMPTY_LENGTH) {
        // eslint-disable-next-line no-console
        console.log(
          `[remove-test-files] ✓ Removed ${removed} test files and directories`
        );
      }
    },
  };
};

/**
 * Vite configuration for building the library
 */
export default defineConfig(({ mode }) => ({
  build: {
    target: 'node18',
    outDir: 'dist',
    minify: 'terser',

    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'Bernova',
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
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
        preserveModules: false,
        generatedCode: {
          constBindings: true,
          symbols: false,
        },
      },

      // Tree shaking configuration
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },

    // Terser options for maximum compression
    // Eliminates ALL comments including JSDoc for CLI usage
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
        pure_getters: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_methods: true,
        unsafe_proto: true,
        // Additional aggressive optimizations
        booleans_as_integers: false,
        ecma: 2020,
        evaluate: true,
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: false,
        join_vars: true,
        loops: true,
        negate_iife: true,
        properties: true,
        reduce_funcs: true,
        sequences: true,
        side_effects: true,
        switches: true,
        toplevel: true,
        typeofs: true,
        unsafe: false, // Keep false for CLI reliability
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
        comments: false, // Remove ALL comments (JSDoc, inline, etc.)
        beautify: false,
        semicolons: true,
        wrap_iife: false,
        wrap_func_args: false,
      },
      // Remove all annotations and decorators
      keep_classnames: false,
      keep_fnames: false,
    },

    // Sourcemap only in development
    sourcemap: mode !== 'production',

    // Clear output directory
    emptyOutDir: true,

    // Additional optimizations
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  plugins: [
    dts({
      exclude: [
        'src/**/__tests__',
        'src/**/*.test.*',
        'src/**/__mocks__',
        'src/**/__fixtures__',
      ],
      insertTypesEntry: true,
      outDir: 'dist/types',
      rollupTypes: true,
      tsconfigPath: './tsconfig.build.json',
    }),
    copyCSSPlugin(),
    copyCLIBinariesPlugin(),
    copySourcePlugin(),
    removeTestFilesPlugin(),
  ],
}));
