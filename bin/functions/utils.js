const fs = require('fs').promises;
const path = require('path');
const babel = require('@babel/core');
const { minify } = require('terser');
/**
 * Modify themes path
 * @param {object} params
 * @param {{ [key: string]: { css: string, foreign: { before: Array<string>, after: Array<string> } } }} params.cssThemes
 * @param {string} params.cssOutPath
 * @returns {string}
 */
function modifyThemesPath({ cssThemes, cssOutPath }) {
  return Object.entries(cssThemes).reduce((acc, [themeName, { foreign }]) => {
    const { before, after } = foreign;
    //* handle before
    const beforeString =
      before && Array.isArray(before) && before.length > 0
        ? before.reduce((bacc, bcurr, bidx) => {
            const foreignDocName = path.basename(bcurr);
            if (bidx > 0) bacc += ', ';
            bacc += `'${cssOutPath}/${foreignDocName}'`;
            return bacc;
          }, '')
        : '';
    //* handle after
    const afterString =
      after && Array.isArray(after) && after.length > 0
        ? after.reduce((aacc, acurr, aidx) => {
            const foreignDocName = path.basename(acurr);
            if (aidx > 0) aacc += ', ';
            aacc += `'${cssOutPath}/${foreignDocName}'`;
            return aacc;
          }, '')
        : '';
    //* build the final string
    const beforeArrayString = `before: [${beforeString}],`;
    const afterArrayString = `after: [${afterString}]`;
    acc += `'${themeName}':{css:'${cssOutPath}/${themeName}.css',foreign:{${beforeArrayString}${afterArrayString}}}`;
    return acc;
  }, '');
}
/**
 * Transpile code to specified module format
 * @param {string} code
 * @param {string} filename
 * @param {boolean} commonjs
 * @returns {Promise<string>}
 */
async function transpileTo(code, filename, commonjs = false) {
  const modules = commonjs ? 'commonjs' : false;
  const result = await babel.transformAsync(code, {
    filename,
    presets: [
      [
        '@babel/preset-env',
        {
          modules,
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  });
  return result.code;
}
/**
 * Minify JavaScript code
 * @param {string} code
 * @returns {Promise<string>}
 */
async function minifyJSFile(code) {
  const result = await minify(code, {
    compress: {
      dead_code: true,
      drop_console: false,
      drop_debugger: true,
      keep_classnames: false,
      keep_fargs: true,
      keep_fnames: false,
      keep_infinity: false,
    },
    mangle: {
      toplevel: false,
    },
    format: {
      comments: false,
    },
  });
  return result.code;
}
/**
 * Push unique entries into a Array
 * @param {Array<string>} fileList
 * @param {{ name: string, path: string }} file
 * @returns {void}
 */
function pushUniqueFile(fileList, file) {
  const fileExists = fileList.some(
    (f) => f.name === file.name && f.path === file.path,
  );
  if (!fileExists) {
    fileList.push(file);
  }
}
/**
 * Overwrite json customOutDirs with the cli customOutDirs
 * @param {object} params
 * @param {object} params.jsonCustomOutDirs
 * @param {object} params.cliCustomOutDirs
 * @returns {object | undefined}
 */
function overwriteCustomOutDirs({ jsonCustomOutDirs, cliCustomOutDirs }) {
  let mergeOutDirs = {};
  if (jsonCustomOutDirs) {
    mergeOutDirs = { ...jsonCustomOutDirs };
  }
  if (cliCustomOutDirs) {
    mergeOutDirs = { ...mergeOutDirs, ...cliCustomOutDirs };
  }
  return Object.keys(mergeOutDirs).length > 0 ? mergeOutDirs : undefined;
}
/**
 * Convert the first character of a string to lowercase
 * @param {string} str - input string
 * @return {string} - string with first character in lowecase
 */
function lowerCaseFirstChar(str = 'provider') {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
/**
 * Generate the full CSS content to be embedded into the provider file
 * @param {object} params
 * @param {string} params.dir - The base directory where the CSS files are located
 * @param {object} params.theme - The theme object containing stylesPath and name
 * @param {Array} params.foreignThemes
 * @returns {Promise<string>} - The full CSS content to be embedded
 */
async function generateEmbedCssContent({ dir, theme, foreignThemes }) {
  //* css file
  const cssFilePath = path.resolve(
    dir,
    theme.stylesPath,
    `${theme.name}.min.css`,
  );
  const cssContent = await fs.readFile(cssFilePath, 'utf-8');
  const foreignCss = { before: '', after: '' };
  if (foreignThemes) {
    for (const fgThm of foreignThemes) {
      const fgContent = await fs.readFile(
        path.resolve(dir, fgThm.path),
        'utf-8',
      );
      foreignCss[fgThm.position] += fgContent.replace(/\s+/g, ' ');
    }
  }
  return foreignCss.before + cssContent + foreignCss.after;
}
/**
 * Object to build the final custom output directories by merging the JSON config and CLI config
 * @param {object} param
 * @param {object} param.jsonConfig - The configuration object read from bernova.config.json
 * @param {object} param.cliConfig - The configuration object obtained from CLI arguments
 * @returns {object} - The merged custom output directories
 */
function buildCustomOutDirs({ jsonConfig, cliConfig }) {
  return {
    baseOutDir: cliConfig?.baseOutDir ?? jsonConfig?.baseOutDir ?? '',
    rootDir: cliConfig?.rootDir ?? jsonConfig?.rootDir ?? undefined,
    preventMoveJS:
      cliConfig?.preventMoveJs ?? jsonConfig?.preventMoveJS ?? false,
    preventMoveDTS:
      cliConfig?.preventMoveDts ?? jsonConfig?.preventMoveDts ?? false,
    types: cliConfig?.types ?? jsonConfig?.types ?? undefined,
    embedCss: cliConfig?.embedCss ?? jsonConfig?.embedCss ?? false,
    customOutDirs: overwriteCustomOutDirs({
      jsonCustomOutDirs: jsonConfig?.customOutDirs,
      cliCustomOutDirs: cliConfig?.customOutDirs,
    }),
  };
}
/**
 * Check if the provided array is iterable and has elements
 * @param {Array<unknown>} arr
 * @returns {boolean}
 */
function isIterableArray(arr) {
  return arr && Array.isArray(arr) && arr.length > 0;
}

module.exports = {
  modifyThemesPath,
  isIterableArray,
  transpileTo,
  minifyJSFile,
  pushUniqueFile,
  overwriteCustomOutDirs,
  lowerCaseFirstChar,
  generateEmbedCssContent,
  buildCustomOutDirs,
};
