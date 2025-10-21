#!/usr/bin/env node

/**
 * Complete Minifier for Bernova Build
 *
 * Minifies all JavaScript files in the dist directory using terser:
 * - CLI binary files in dist/bin/
 * - Source files in dist/src/
 * (Vite handles the main library index.js minification)
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function minifyCLIFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Preserve shebang
  const shebangMatch = content.match(/^#!.*/);
  const shebang = shebangMatch ? shebangMatch[0] + '\n' : '';
  const codeToMinify = shebang ? content.slice(shebang.length) : content;

  try {
    const result = await minify(codeToMinify, {
      compress: {
        dead_code: true,
        drop_console: false,
        drop_debugger: true,
        unused: true,
        passes: 2,
      },
      mangle: {
        toplevel: true,
        reserved: ['require', 'module', 'exports', 'process'],
      },
      format: {
        comments: false,
      },
    });

    const minifiedContent = shebang + result.code;

    // Calculate savings
    const originalSize = content.length;
    const minifiedSize = minifiedContent.length;
    const savings = (
      ((originalSize - minifiedSize) / originalSize) *
      100
    ).toFixed(1);

    console.log(
      `🗜️  ${path.basename(
        filePath
      )}: ${originalSize} → ${minifiedSize} bytes (${savings}% smaller)`
    );

    fs.writeFileSync(filePath, minifiedContent);
  } catch (error) {
    console.error(
      `❌ Error minifying ${path.basename(filePath)}:`,
      error.message
    );
  }
}

/**
 * Find all JS files in a directory recursively
 */
function findJSFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const distDir = path.resolve(__dirname, '..', 'dist');

  if (!fs.existsSync(distDir)) {
    console.log('📁 No dist directory found.');
    return;
  }

  console.log('🚀 Minifying all JavaScript files in dist...\n');

  // Find all JS files in dist (including bin and src subdirectories)
  const allJSFiles = findJSFiles(distDir);

  // Exclude the main index.js (already minified by Vite)
  const filesToMinify = allJSFiles.filter(
    (file) =>
      !file.endsWith('dist/index.js') && !file.endsWith('dist/index.js.map')
  );

  if (filesToMinify.length === 0) {
    console.log('📁 No JavaScript files found to minify.');
    return;
  }

  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;

  for (const filePath of filesToMinify) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    totalOriginalSize += originalContent.length;

    await minifyCLIFile(filePath);

    const minifiedContent = fs.readFileSync(filePath, 'utf8');
    totalMinifiedSize += minifiedContent.length;
  }

  const totalSavings = (
    ((totalOriginalSize - totalMinifiedSize) / totalOriginalSize) *
    100
  ).toFixed(1);

  console.log(`\n✨ Complete minification finished!`);
  console.log(`📊 Total: ${totalOriginalSize} → ${totalMinifiedSize} bytes`);
  console.log(
    `💾 Space saved: ${totalSavings}% (${
      totalOriginalSize - totalMinifiedSize
    } bytes)`
  );
  console.log(`📁 Files processed: ${filesToMinify.length}`);
}

main().catch(console.error);
