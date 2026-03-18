const fs = require('fs').promises;
const path = require('path');
//* from main lib
const { writeDoc, fileExists } = require('../../src/lib');
//* local lib
const {
  modifyThemesPath,
  transpileTo,
  minifyJSFile,
  lowerCaseFirstChar,
  generateEmbedCssContent,
} = require('./utils');
/**
 * Write CSS files
 * @param {object} params
 * @param {string} params.baseOutPath
 * @param {Array<{ name: string, path: string }>} params.cssFiles
 * @param {string} params.rootDir
 * @param {{ css?: string }} params.customOutDirs
 * @param {string} params.dir
 * @returns {Promises<void>}
 */
async function writeCss({
  baseOutPath,
  cssFiles,
  rootDir,
  customOutDirs,
  dir,
}) {
  for (const cssFile of cssFiles) {
    const adaptedOutDir = (() => {
      if (rootDir && !customOutDirs?.css) {
        return path.relative(rootDir, cssFile.path);
      } else if (customOutDirs?.css) {
        return customOutDirs.css;
      }
      return cssFile.path;
    })();
    const currentCssDir = path.resolve(dir, cssFile.path, cssFile.name);
    if (fileExists(dir, currentCssDir)) {
      const cssDocFile = await fs.readFile(currentCssDir, 'utf8');
      const adaptedName = cssFile.name.replace('.min', '');
      await writeDoc(
        path.resolve(baseOutPath, adaptedOutDir, adaptedName),
        cssDocFile,
        adaptedName,
      );
    }
  }
}
/**
 * Copy CSS files to provider directory for link template
 * @param {object} params
 * @param {string} params.dir - Root directory of the project
 * @param {string} params.cssPath - Destination path for CSS files in the provider directory
 * @param {object} params.theme - Theme configuration object containing stylesPath, name, and foreignThemes
 * @returns {Promise<void>}
 */
async function copyCssFiles({ dir, cssPath, theme }) {
  const { stylesPath, foreignThemes } = theme;
  const filePath = path.resolve(dir, stylesPath, `${theme.name}.min.css`);
  if (fileExists(dir, filePath)) {
    const cssContent = await fs.readFile(filePath, 'utf-8');
    const destPath = path.resolve(dir, cssPath, `${theme.name}.css`);
    await writeDoc(destPath, cssContent, `${theme.name}.css`);
  }
  if (
    foreignThemes &&
    Array.isArray(foreignThemes) &&
    foreignThemes.length > 0
  ) {
    for (const fgThm of foreignThemes) {
      const fgFileName = path.basename(fgThm.path);
      const fgFilePath = path.resolve(dir, fgThm.path);
      if (fileExists(dir, fgFilePath)) {
        const fgCssContent = (await fs.readFile(fgFilePath, 'utf-8')).replace(
          /\s+/g,
          ' ',
        );
        const destFgPath = path.resolve(dir, cssPath, fgFileName);
        await writeDoc(destFgPath, fgCssContent, fgFileName);
      }
    }
  }
}
/**
 * Generate embedded CSS content and write it to the provider's stats directory
 * @param {object} params
 * @param {string} params.dir - Root directory of the project
 * @param {object} params.theme - Theme configuration object containing stylesPath, name, and foreignThemes
 * @param {{ name: string, path: string }} params.provider - Provider configuration object containing name and path
 * @returns {Promise<void>}
 */
async function embedCssForProvider({ dir, theme, provider }) {
  const { foreignThemes } = theme;
  const foreignTHM =
    foreignThemes && Array.isArray(foreignThemes) && foreignThemes.length > 0
      ? foreignThemes.reduce((acc, fg) => {
          acc.push({ position: fg.position, path: fg.path });
          return acc;
        }, [])
      : undefined;
  const cssContent = await generateEmbedCssContent({
    dir,
    theme,
    foreignThemes: foreignTHM,
  });
  const cssThemeContent = `export default {'${theme.name}':{css:\`${cssContent}\`}};`;
  const cssThemePath = path.resolve(
    dir,
    provider.path,
    'stats',
    theme.name,
    'cssTheme.js',
  );
  await writeDoc(cssThemePath, cssThemeContent, 'cssTheme.js');
}
/**
 * Rewrite CSS path in stats file to point to the new CSS location in the provider directory
 * @param {object} params
 * @param {string} params.dir - Root directory of the project
 * @param {object} params.theme - Theme configuration object containing stylesPath, name, and foreignThemes
 * @param {string} params.css - New CSS path to be set in the stats file
 * @param {{ name: string, path: string }} params.provider - Provider configuration object containing name and path
 * @returns {Promise<void>}
 */
async function rewriteCssPathInStats({ dir, theme, css, provider }) {
  const cssThemePath = path.resolve(
    dir,
    provider.path,
    'stats',
    theme.name,
    'cssTheme.js',
  );
  const { default: cssThemes } = require(cssThemePath);
  const modifyContent = modifyThemesPath({ cssThemes, cssOutPath: css });
  const cssThemeContent = `export default {${modifyContent}};`;
  await writeDoc(cssThemePath, cssThemeContent, 'cssTheme.js');
}
/**
 * Rewrite the provider template file for the specified provider
 * @param {object} param
 * @param {string} param.dir - The root directory of the project
 * @param {boolean} param.embedCss - Whether to embed CSS or not
 * @param {{ name: string, path: string }} param.provider - The provider configuration object
 * @param {boolean} param.minifyJS - Whether to minify the JS file or not
 * @param {'cjs' | 'esm' | ''} [param.type] - The module type for transpilation ('cjs' or 'esm')
 * @returns {Promise<void>}
 */
async function rewriteProviderTemplate({ dir, embedCss, provider }) {
  const providerTemplateType = embedCss ? 'style' : 'link';
  const providerTemplate = path.resolve(
    __dirname,
    `../../src/lib/generateProvider/template/providerTemplate-${providerTemplateType}.js`,
  );
  let providerTemplateContent = await fs.readFile(providerTemplate, 'utf-8');
  providerTemplateContent = providerTemplateContent.replace(
    /\$_Provider_\$/g,
    provider.name,
  );
  const providerFileName = `${lowerCaseFirstChar(provider.name)}.js`;
  const providerPath = path.resolve(dir, provider.path, providerFileName);
  await writeDoc(providerPath, providerTemplateContent, providerFileName);
}
/**
 * Write JS files in the stats directory of the provider, transpile and minify if needed, and move declaration files if allowed
 * @param {object} params
 * @param {object} params.file - The file object containing name and path
 * @param {string} params.type - The module type for transpilation ('cjs' or 'esm')
 * @param {boolean} params.minifyJS - Whether to minify the JS file or not
 * @param {string} params.outPath - The output path where the JS file should be written
 * @param {string} params.currentPath - The current path of the JS file to be read
 * @param {boolean} [params.preventMoveDTS=false] - Whether to prevent moving declaration files or not
 * @returns {Promise<void>}
 */
async function writeJs({
  file,
  type,
  minifyJS,
  outPath,
  currentPath,
  preventMoveDTS = false,
}) {
  if (file.name.endsWith('.js')) {
    const filePath = path.resolve(currentPath, file.name);
    let fileContent = await fs.readFile(filePath, 'utf-8');
    if (type === 'cjs') {
      fileContent = await transpileTo(fileContent, filePath, true);
    } else if (type === 'esm') {
      fileContent = await transpileTo(fileContent, filePath);
    }
    if (minifyJS) {
      fileContent = await minifyJSFile(fileContent);
    }
    writeDoc(path.join(outPath, file.name), fileContent, file.name);
  }
  if (file.name.endsWith('.d.ts') && !preventMoveDTS) {
    const filePath = path.resolve(currentPath, file.name);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    writeDoc(path.join(outPath, file.name), fileContent, file.name);
  }
}
/**
 * Write JS files in the stats directory of the provider, transpile and minify if needed, and move declaration files if allowed
 * @param {object} param
 * @param {string} param.dir - The root directory of the project
 * @param {string} param.providerPath - The path to the provider directory containing the stats folder
 * @param {string} param.outPath - The output path where the JS files should be written
 * @param {boolean} param.minifyJS - Whether to minify the JS files or not
 * @param {boolean} param.preventMoveDTS - Whether to prevent moving declaration files or not
 * @param {'cjs' | 'esm' | ''} [param.type] - The module type for transpilation ('cjs' or 'esm')
 * @returns {Promise<void>}
 */
async function writeStatsinBuild({
  dir,
  providerPath,
  outPath,
  minifyJS,
  preventMoveDTS,
  type,
}) {
  const stResolve = path.resolve(dir, providerPath, 'stats');
  const providerStats = await fs.readdir(stResolve, { withFileTypes: true });
  for (const dirent of providerStats) {
    if (dirent.isDirectory()) {
      const fResolve = path.resolve(stResolve, dirent.name);
      const directories = await fs.readdir(fResolve, { withFileTypes: true });
      for (file of directories) {
        if (file.isFile()) {
          await writeJs({
            file,
            type,
            minifyJS,
            outPath: path.resolve(dir, outPath, dirent.name),
            currentPath: fResolve,
            preventMoveDTS,
          });
        }
      }
    } else if (dirent.isFile()) {
      await writeJs({
        file: dirent,
        type,
        minifyJS,
        outPath: path.resolve(dir, outPath),
        currentPath: stResolve,
        preventMoveDTS,
      });
    }
  }
}
async function writeToolsInBuild({
  dir,
  toolsPath,
  outPath,
  type,
  minifyJS,
  preventMoveDTS = false,
}) {
  const toolsResolve = path.resolve(dir, toolsPath);
  const toolsFiles = await fs.readdir(toolsResolve, { withFileTypes: true });
  for (const file of toolsFiles) {
    if (file.isFile()) {
      await writeJs({
        file,
        type,
        minifyJS,
        outPath: path.resolve(dir, outPath),
        currentPath: toolsResolve,
        preventMoveDTS,
      });
    }
  }
}

module.exports = {
  writeJs,
  writeCss,
  copyCssFiles,
  embedCssForProvider,
  rewriteCssPathInStats,
  rewriteProviderTemplate,
  writeStatsinBuild,
  writeToolsInBuild,
};
