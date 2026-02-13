#!/usr/bin/env node

/**
 * Bernova CSS Build Tool
 *
 * Minifies CSS files and outputs them to the specified distribution directory.
 * Reads configuration from bernova.config.json to determine output location.
 *
 * This script:
 * 1. Reads the main CSS file (bernova.css)
 * 2. Minifies it using CleanCSS
 * 3. Outputs the minified version to the configured directory
 *
 * Usage: bv-build
 */

const fs = require('fs').promises;
const path = require('path');
const babel = require('@babel/core');
const { minify } = require('terser');
const {
  extractDocFragment,
  writeDoc,
  fileExists,
  readConfigData,
} = require('../src/lib');

(async () => {
  const dir = process.cwd();
  //* read bernova config
  const config = await readConfigData(path.resolve(dir, 'bernova.config.json'));
  //* validate config
  const { compilerOptions, provider, themes } = config;
  if (!compilerOptions || !provider || !themes) {
    console.error('Invalid configuration: Missing compilerOptions, themes or provider');
    process.exit(1);
  }
  //* destructure compiler options
  //? Compiler Options example
  //? {
  //?   baseOutDir: string,
  //?   rootDir: string,
  //?   minifyCss: boolean,
  //?   minifyJS: boolean,
  //?   preventMoveJS: boolean,
  //?   preventMoveDTS: boolean,
  //?   types: Array<'cjs' | 'esm'>,
  //?   embedCss: boolean,
  //?   customOutDirs: {
  //?     css: string,
  //?     provider: string,
  //?     tools: string,
  //?   },
  //? };
  const {
    baseOutDir: jsonBaseOutDir,
    rootDir: jsonRootDir,
    minifyCss,
    minifyJS,
    preventMoveJS: jsonPreventMoveJS,
    preventMoveDTS: jsonPreventMoveDTS,
    types: jsonTypes,
    embedCss: jsonEmbedCss,
    customOutDirs: jsonCustomOutDirs,
  } = compilerOptions;
  //* Resolve custom output directories
  const {
    baseOutDir: cliBaseOutDir,
    rootDir: cliRootDir,
    types: cliTypes,
    preventMoveJs: cliPreventMoveJS,
    preventMoveDts: cliPreventMoveDTS,
    preventProcessJs = false,
    embedCss: cliEmbedCss,
    ...cliCustomOutDirs
  } = getBernovaBuildArgs();
  const baseOutDir = cliBaseOutDir ?? jsonBaseOutDir ?? '';
  const rootDir = cliRootDir ?? jsonRootDir ?? undefined;
  const preventMoveJS = cliPreventMoveJS ?? jsonPreventMoveJS ?? false;
  const preventMoveDTS = cliPreventMoveDTS ?? jsonPreventMoveDTS ?? false;
  const types = cliTypes ?? jsonTypes ?? undefined;
  const embedCss = cliEmbedCss ?? jsonEmbedCss ?? false;
  const customOutDirs = overwriteCustomOutDirs({ jsonCustomOutDirs, cliCustomOutDirs });
  //* Get CSS files to process
  const cssFiles = getCssFiles({ themes, minifyCss });
  //* Get js files to process
  const jsFiles = !preventProcessJs ? await getJsFiles({ dir, customOutDirs, provider, themes, preventMoveDTS }) : [];
  //* Write files
  const baseOutPath = getBaseOutDir({ baseOutDir });
  if (cssFiles && cssFiles.length > 0 && !embedCss) {
    await writeCss({
      baseOutPath,
      cssFiles,
      rootDir,
      customOutDirs,
      dir,
    });
  }
  if (jsFiles && jsFiles.length > 0) {
    if (types && Array.isArray(types) && types.length > 0) {
      for (const type of types) {
        const baseOutPathWithType = getBaseOutDir({ baseOutDir, type });
        for (const jsFile of jsFiles) {
          await writeJs({
            baseOutPath: baseOutPathWithType,
            jsFile,
            rootDir,
            customOutDirs,
            dir,
            minifyJS,
            preventMoveJS,
            provider,
            type,
            embedCss,
            cssFiles,
          });
        }
      }
    } else {
      for (const jsFile of jsFiles) {
        await writeJs({
          baseOutPath,
          jsFile,
          rootDir,
          customOutDirs,
          dir,
          minifyJS,
          preventMoveJS,
          provider,
          embedCss,
          cssFiles,
        });
      }
    }
  }
})();

/**
 * Write js files
 * @param {object} params
 * @param {string} params.baseOutPath
 * @param {{ name: string, path: string }} params.jsFile
 * @param {string} params.rootDir
 * @param {{ css?: string, provider?: string, tools?: string }} params.customOutDirs
 * @param {string} params.dir
 * @param {boolean} params.minifyJS
 * @param {boolean} params.preventMoveJS
 * @param {{ name: string, path: string, declarationHelp?: boolean }} provider
 * @param {'cjs' | 'esm' | ''} [type]
 * @param {boolean} params.embedCss
 * @param {Array<{ name: string, path: string }>} params.cssFiles
 * @returns {Promises<void>}
 */
async function writeJs({
  baseOutPath,
  jsFile,
  rootDir,
  customOutDirs,
  dir,
  minifyJS,
  preventMoveJS,
  provider,
  type = '',
  embedCss,
  cssFiles,
}) {
  const isDeclarationFile = jsFile.name.endsWith('.d.ts');
  const currentJsDir = path.resolve(dir, jsFile.path, jsFile.name);
  if (!fileExists(dir, currentJsDir)) {
    console.error(`File not found: ${currentJsDir}`);
    return;
  }
  let jsDocFile = await fs.readFile(currentJsDir, 'utf8');
  const processStatsFile = !!customOutDirs?.css || (embedCss && cssFiles.length > 0);
  if (jsFile.name === 'cssTheme.js' && processStatsFile) {
    const block = jsDocFile.replace('export default', '').replaceAll(';', '').trim();
    const cssThemes = new Function(`return (${block})`)();
    if (customOutDirs?.css) {
      const blockModified = modifyThemesPath({ cssThemes, cssOutPath: customOutDirs.css });
      jsDocFile = `export default {\n${blockModified}};\n`;
    } else if (embedCss && cssFiles.length > 0) {
      const crrCssFileName = Object.keys(cssThemes)[0];
      const crrCssFile = cssFiles.find((f) => f.name === `${crrCssFileName}.css` || f.name === `${crrCssFileName}.min.css`);
      if (crrCssFile) {
        const { name: cssFileName, path: cssFilePath } = crrCssFile;
        const crrCssFilePath = path.resolve(dir, cssFilePath, cssFileName);
        const cssFileContent = fileExists(dir, crrCssFilePath)
          ? (await fs.readFile(crrCssFilePath, 'utf8')).replace(/\s+/g, '')
          : '';
        const foreignCss = { before: '', after: '' };
        for (const cssFile of cssFiles) {
          const { name: foreignName, path: foreignPath, parent: foreignParent } = cssFile;
          if (foreignParent) {
            for (const { name: parentName, position: docPosition } of foreignParent) {
              if (parentName === crrCssFileName) {
                const fFilePath = path.resolve(dir, foreignPath, foreignName);
                if (fileExists(dir, fFilePath)) {
                  const fFileContent = (await fs.readFile(fFilePath, 'utf8')).replace(/\s+/g, '');
                  foreignCss[docPosition] += fFileContent;
                }
              }
            }
          }
        }
        const fullCssContent = foreignCss.before + cssFileContent + foreignCss.after;
        jsDocFile = `export default {'${crrCssFileName}':{css:\`${fullCssContent}\`}};`;
      }
    }
  }
  if (jsFile.name === `${provider.name.toLocaleLowerCase()}.js` && embedCss && cssFiles.length > 0) {
    const newMethods = /* js */`
    #linkBuilder = (css, id) => {
      if (typeof document === 'undefined') return;
      let styleElement = document.getElementById(id);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = id;
        styleElement.type = 'text/css';
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = css;
    };
    #handlerThemes = (data) => {
      const { css } = data;
      this.#linkBuilder(css, this.#linkId);
    };
    #cleanUpLinks = () => {
      if (typeof document === 'undefined') return;
      const style = document.getElementById(this.#linkId);
      if (style) style.remove();
    };
    `;
    const providerTemplateDir = '../src/lib/generateProvider/template/providerTemplate.js';
    let providerTemplate = await fs.readFile(path.resolve(__dirname, providerTemplateDir), 'utf8');
    providerTemplate = providerTemplate.replace(/\$_Provider_\$/g, provider.name);
    const match = extractDocFragment({
      section: 'Bernova provider methods',
      doc: providerTemplate,
    });
    jsDocFile = providerTemplate.replace(match, newMethods.trim());
  }
  if (jsFile.name === `${provider.name.toLocaleLowerCase()}.d.ts` && embedCss && cssFiles.length > 0) {
    const newMethods = /* ts */`
    #linkBuilder(css: string, id: string): void;
    #handlerThemes(data: { css: string }): void;
    #cleanUpLinks(): void;
    `;
    const providerTemplateDir = '../src/lib/generateProvider/template/providerTemplate.d.ts';
    let providerTemplate = await fs.readFile(path.resolve(__dirname, providerTemplateDir), 'utf8');
    providerTemplate = providerTemplate.replace(/\$_Provider_\$/g, provider.name);
    const match = extractDocFragment({
      section: 'Bernova provider methods',
      doc: providerTemplate,
    });
    jsDocFile = providerTemplate.replace(match, newMethods.trim());
  }
  if (type === 'cjs' && !isDeclarationFile) {
    jsDocFile = await transpileTo(jsDocFile, currentJsDir, true);
  }
  if (type === 'esm' && !isDeclarationFile) {
    jsDocFile = await transpileTo(jsDocFile, currentJsDir);
  }
  if (minifyJS && !isDeclarationFile) {
    jsDocFile = await minifyJSFile(jsDocFile);
  }
  const adaptedOutDir = path.relative(rootDir || '', jsFile.outPath);
  const finalLocation = preventMoveJS
    ? currentJsDir
    : path.resolve(baseOutPath, adaptedOutDir, jsFile.name);
  await writeDoc(finalLocation, jsDocFile, jsFile.name);
}
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
 * Get base output directory
 * @param {object} params
 * @param {string} params.baseOutDir
 * @param {Array<'cjs' | 'esm' | '-'>} params.type
 * @returns {string}
 */
function getBaseOutDir({ baseOutDir, type = '-' }) {
  const mainFolder = (() => {
    switch (type) {
      case 'cjs':
        return 'cjs';
      case 'esm':
        return 'esm';
      default:
        return '';
    }
  })();
  return path.join(baseOutDir, mainFolder);
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
 * Get CSS files to process
 * @param {object} params
 * @param {Array<{ name: string; stylesPath: string; foreignThemes: Array<string> }>} params.themes
 * @param {boolean} params.minifyCss
 * @returns {Array<string>}
 */
function getCssFiles({ themes, minifyCss }) {
  return themes && Array.isArray(themes) && themes.length > 0
    ? themes.reduce((acc, thm) => {
      const { name: styleName, stylesPath, foreignThemes } = thm;
      //* find css files to process
      if (styleName && stylesPath) {
        const styleFileName = minifyCss
          ? `${styleName}.min.css`
          : `${styleName}.css`;
        pushUniqueFile(acc, { name: styleFileName, path: stylesPath });
      }
      if (foreignThemes && Array.isArray(foreignThemes) && foreignThemes.length > 0) {
        foreignThemes.forEach((foreignThm) => {
          //? foreignThm example
          //?{
          //? "position": "before" | "after",
          //? "name": string,
          //? "path": string, [example: ./fixture/example.css]
          //?}
          const foreignFileName = path.basename(foreignThm.path);
          const foreignFilePath = foreignThm.path.replace(foreignFileName, '').trim();
          const foreignFileExists = acc.findIndex((f) => f.name === foreignFileName && f.path === foreignFilePath);
          if (foreignFileExists >= 0) {
            acc[foreignFileExists].parent.push({ name: styleName, position: foreignThm.position });
          } else {
            acc.push({ name: foreignFileName, path: foreignFilePath, parent: [{ name: styleName, position: foreignThm.position }] });
          }
        });
      }
      return acc;
    }, [])
    : [];
}
/**
 * Get JavaScript file to process
 * @param {object} params
 * @param {string} params.dir 
 * @param {{ tools: string, provider: string }} param.customOutDirs
 * @param {{ name: string, path: string, declarationHelp?: boolean }} params.provider
 * @param {Array<{ name: string, path: string, bvTools: object }>} params.themes
 * @param {boolean} params.preventMoveDTS
 * @returns {Promise<Array<{ name: string, path: string }>>}
 */
async function getJsFiles({ dir, customOutDirs, provider, themes, preventMoveDTS = false }) {
  const jsFiles = themes && themes.bvTools
    ? themes.reduce((acc, { bvTools }) => {
      //* destructure bvTools
      //? bvTools example
      //? {
      //?   path: string;
      //?   declarationHelp?: boolean;
      //?   cssVariables?: boolean;
      //?   cssClassNames?: boolean;
      //?   cssMediaQueries?: boolean;
      //?   cssGlobalStyles?: boolean;
      //?   availableComponents?: boolean;
      //? }
      const {
        path: toolPath,
        declarationHelp,
        cssVariables,
        cssClassNames,
        cssMediaQueries,
        cssGlobalStyles,
        availableComponents,
      } = bvTools;
      const hasDeclarationFile = declarationHelp && !preventMoveDTS;
      const outPath = customOutDirs?.tools ? customOutDirs.tools : toolPath;
      //* Get cssVars file
      if (cssVariables) {
        const cssVariablesName = 'cssVars.js';
        pushUniqueFile(acc, { name: cssVariablesName, path: toolPath, outPath });
        if (hasDeclarationFile) {
          const cssVarsDtsName = 'cssVars.d.ts';
          pushUniqueFile(acc, { name: cssVarsDtsName, path: toolPath, outPath });
        }
      }
      if (cssClassNames) {
        const cssClassNamesName = 'cssClasses.js';
        pushUniqueFile(acc, { name: cssClassNamesName, path: toolPath, outPath });
        if (hasDeclarationFile) {
          const cssClassNamesDtsName = 'cssClasses.d.ts';
          pushUniqueFile(acc, { name: cssClassNamesDtsName, path: toolPath, outPath });
        }
      }
      if (cssMediaQueries) {
        const cssMediaQueriesName = 'cssMediaQueries.js';
        pushUniqueFile(acc, { name: cssMediaQueriesName, path: toolPath, outPath });
        if (hasDeclarationFile) {
          const cssMediaQueriesDtsName = 'cssMediaQueries.d.ts';
          pushUniqueFile(acc, { name: cssMediaQueriesDtsName, path: toolPath, outPath });
        }
      }
      if (cssGlobalStyles) {
        const cssGlobalStylesName = 'cssGlobalStyles.js';
        pushUniqueFile(acc, { name: cssGlobalStylesName, path: toolPath, outPath });
        if (hasDeclarationFile) {
          const cssGlobalStylesDtsName = 'cssGlobalStyles.d.ts';
          pushUniqueFile(acc, { name: cssGlobalStylesDtsName, path: toolPath, outPath });
        }
      }
      if (availableComponents) {
        const availableComponentsName = 'cssAvailableComponents.js';
        pushUniqueFile(acc, { name: availableComponentsName, path: toolPath, outPath });
        if (hasDeclarationFile) {
          const availableComponentsDtsName = 'cssAvailableComponents.d.js';
          pushUniqueFile(acc, { name: availableComponentsDtsName, path: toolPath, outPath });
        }
      }
      return acc;
    }, [])
    : [];
  if (provider) {
    //* provider file
    const providerFileName = `${provider.name.toLocaleLowerCase()}.js`;
    const providerOutPath = customOutDirs?.provider ? customOutDirs.provider : provider.path;
    pushUniqueFile(jsFiles, { name: providerFileName, path: provider.path, outPath: providerOutPath });
    //* stats file
    const statsFilePath = path.join(provider.path, 'stats');
    const statsOutPath = customOutDirs?.provider ? path.join(customOutDirs.provider, 'stats') : statsFilePath;
    const statsFileName = 'stats.js';
    pushUniqueFile(jsFiles, { name: statsFileName, path: statsFilePath, outPath: statsOutPath });
    //* stats data
    const stResolve = path.resolve(dir, statsFilePath);
    const entries = await fs.readdir(stResolve, { withFileTypes: true });
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const registerPath = path.join(statsFilePath, entry.name);
        const registerOutPath = path.join(statsOutPath, entry.name);
        pushUniqueFile(jsFiles, { name: 'cssAvailableComponents.js', path: registerPath, outPath: registerOutPath });
        pushUniqueFile(jsFiles, { name: 'cssClassNames.js', path: registerPath, outPath: registerOutPath });
        pushUniqueFile(jsFiles, { name: 'cssGlobalStyles.js', path: registerPath, outPath: registerOutPath });
        pushUniqueFile(jsFiles, { name: 'cssMediaQueries.js', path: registerPath, outPath: registerOutPath });
        pushUniqueFile(jsFiles, { name: 'cssTheme.js', path: registerPath, outPath: registerOutPath });
        pushUniqueFile(jsFiles, { name: 'cssVars.js', path: registerPath, outPath: registerOutPath });
      }
    })
    //* declaration files
    if (provider.declarationHelp && !preventMoveDTS) {
      //* provider declaration file
      const providerDtsFileName = `${provider.name.toLocaleLowerCase()}.d.ts`;
      pushUniqueFile(jsFiles, { name: providerDtsFileName, path: provider.path, outPath: providerOutPath });
      //* stats declaration file
      const statsDtsFileName = 'stats.d.ts';
      pushUniqueFile(jsFiles, { name: statsDtsFileName, path: statsFilePath, outPath: statsOutPath });
      entries.forEach((entry) => {
        if (entry.isDirectory()) {
          const registerPath = path.join(statsFilePath, entry.name);
          const registerOutPath = path.join(statsOutPath, entry.name);
          pushUniqueFile(jsFiles, { name: 'cssAvailableComponents.d.ts', path: registerPath, outPath: registerOutPath });
          pushUniqueFile(jsFiles, { name: 'cssClassNames.d.ts', path: registerPath, outPath: registerOutPath });
          pushUniqueFile(jsFiles, { name: 'cssGlobalStyles.d.ts', path: registerPath, outPath: registerOutPath });
          pushUniqueFile(jsFiles, { name: 'cssMediaQueries.d.ts', path: registerPath, outPath: registerOutPath });
          pushUniqueFile(jsFiles, { name: 'cssTheme.d.ts', path: registerPath, outPath: registerOutPath });
          pushUniqueFile(jsFiles, { name: 'cssVars.d.ts', path: registerPath, outPath: registerOutPath });
        }
      })
    }
  }
  return jsFiles;
}
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
    const beforeString = before && Array.isArray(before) && before.length > 0
      ? before.reduce((bacc, bcurr, bidx) => {
          const foreignDocName = path.basename(bcurr);
          if (bidx > 0) bacc += ', ';
          bacc += `'${cssOutPath}/${foreignDocName}'`;
          return bacc;
        }, '')
      : '';
    //* handle after
    const afterString = after && Array.isArray(after) && after.length > 0
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
 * Push unique entries into a Array
 * @param {Array<string>} fileList
 * @param {{ name: string, path: string }} file
 * @returns {void}
 */
function pushUniqueFile(fileList, file) {
  const fileExists = fileList.some((f) => f.name === file.name && f.path === file.path);
  if (!fileExists) {
    fileList.push(file);
  }
}
/**
 *  Get Bernova bv-build args
 * @returns {Record<string, string> | undefined}
 */
function getBernovaBuildArgs() {
  const validArgs = [
    '--base-out-dir',
    '--root-dir',
    '--prevent-process-js',
    '--prevent-move-js',
    '--prevent-move-dts',
    '--types',
    '--css',
    '--tools',
    '--provider',
    '--embed-css',
  ];
  const args = {};
  for (let i = 0; i < process.argv.length; i++) {
    if (validArgs.includes(process.argv[i])) {  
      const key = process.argv[i].replace('--', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = process.argv[i + 1];
      args[key] = (() => {
        if (!value || validArgs.includes(value)) {
          return true;
        } else if (value.toLocaleLowerCase() === 'none') {
          return '';
        }
        return value;
      })();
    }
  }
  return args;
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