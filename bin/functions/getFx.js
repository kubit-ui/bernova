const fs = require('fs').promises;
const path = require('path');
//* local lib
const { pushUniqueFile, lowerCaseFirstChar } = require('./utils');
/**
 *  Get Bernova bv-build args
 * @param {Array<string>} validArgs
 * @returns {Record<string, string> | undefined}
 */
function getBernovaBuildArgs(validArgs) {
  const args = {};
  for (let i = 0; i < process.argv.length; i++) {
    if (validArgs.includes(process.argv[i])) {
      const key = process.argv[i]
        .replace('--', '')
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
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
 * Get JavaScript file to process
 * @param {object} params
 * @param {string} params.dir
 * @param {{ tools: string, provider: string }} param.customOutDirs
 * @param {{ name: string, path: string, declarationHelp?: boolean }} params.provider
 * @param {Array<{ name: string, path: string, bvTools: object }>} params.themes
 * @param {boolean} params.preventMoveDTS
 * @returns {Promise<Array<{ name: string, path: string }>>}
 */
async function getJsFiles({
  dir,
  customOutDirs,
  provider,
  themes,
  preventMoveDTS = false,
}) {
  const jsFiles =
    themes && themes.bvTools
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
            pushUniqueFile(acc, {
              name: cssVariablesName,
              path: toolPath,
              outPath,
            });
            if (hasDeclarationFile) {
              const cssVarsDtsName = 'cssVars.d.ts';
              pushUniqueFile(acc, {
                name: cssVarsDtsName,
                path: toolPath,
                outPath,
              });
            }
          }
          if (cssClassNames) {
            const cssClassNamesName = 'cssClasses.js';
            pushUniqueFile(acc, {
              name: cssClassNamesName,
              path: toolPath,
              outPath,
            });
            if (hasDeclarationFile) {
              const cssClassNamesDtsName = 'cssClasses.d.ts';
              pushUniqueFile(acc, {
                name: cssClassNamesDtsName,
                path: toolPath,
                outPath,
              });
            }
          }
          if (cssMediaQueries) {
            const cssMediaQueriesName = 'cssMediaQueries.js';
            pushUniqueFile(acc, {
              name: cssMediaQueriesName,
              path: toolPath,
              outPath,
            });
            if (hasDeclarationFile) {
              const cssMediaQueriesDtsName = 'cssMediaQueries.d.ts';
              pushUniqueFile(acc, {
                name: cssMediaQueriesDtsName,
                path: toolPath,
                outPath,
              });
            }
          }
          if (cssGlobalStyles) {
            const cssGlobalStylesName = 'cssGlobalStyles.js';
            pushUniqueFile(acc, {
              name: cssGlobalStylesName,
              path: toolPath,
              outPath,
            });
            if (hasDeclarationFile) {
              const cssGlobalStylesDtsName = 'cssGlobalStyles.d.ts';
              pushUniqueFile(acc, {
                name: cssGlobalStylesDtsName,
                path: toolPath,
                outPath,
              });
            }
          }
          if (availableComponents) {
            const availableComponentsName = 'cssAvailableComponents.js';
            pushUniqueFile(acc, {
              name: availableComponentsName,
              path: toolPath,
              outPath,
            });
            if (hasDeclarationFile) {
              const availableComponentsDtsName = 'cssAvailableComponents.d.js';
              pushUniqueFile(acc, {
                name: availableComponentsDtsName,
                path: toolPath,
                outPath,
              });
            }
          }
          return acc;
        }, [])
      : [];
  if (provider) {
    //* provider file
    const providerFileName = `${lowerCaseFirstChar(provider.name)}.js`;
    const providerOutPath = customOutDirs?.provider
      ? customOutDirs.provider
      : provider.path;
    pushUniqueFile(jsFiles, {
      name: providerFileName,
      path: provider.path,
      outPath: providerOutPath,
    });
    //* stats file
    const statsFilePath = path.join(provider.path, 'stats');
    const statsOutPath = customOutDirs?.provider
      ? path.join(customOutDirs.provider, 'stats')
      : statsFilePath;
    const statsFileName = 'stats.js';
    pushUniqueFile(jsFiles, {
      name: statsFileName,
      path: statsFilePath,
      outPath: statsOutPath,
    });
    //* stats data
    const stResolve = path.resolve(dir, statsFilePath);
    const entries = await fs.readdir(stResolve, { withFileTypes: true });
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const registerPath = path.join(statsFilePath, entry.name);
        const registerOutPath = path.join(statsOutPath, entry.name);
        pushUniqueFile(jsFiles, {
          name: 'cssAvailableComponents.js',
          path: registerPath,
          outPath: registerOutPath,
        });
        pushUniqueFile(jsFiles, {
          name: 'cssClassNames.js',
          path: registerPath,
          outPath: registerOutPath,
        });
        pushUniqueFile(jsFiles, {
          name: 'cssGlobalStyles.js',
          path: registerPath,
          outPath: registerOutPath,
        });
        pushUniqueFile(jsFiles, {
          name: 'cssMediaQueries.js',
          path: registerPath,
          outPath: registerOutPath,
        });
        pushUniqueFile(jsFiles, {
          name: 'cssTheme.js',
          path: registerPath,
          outPath: registerOutPath,
        });
        pushUniqueFile(jsFiles, {
          name: 'cssVars.js',
          path: registerPath,
          outPath: registerOutPath,
        });
      }
    });
    //* declaration files
    if (provider.declarationHelp && !preventMoveDTS) {
      //* provider declaration file
      const providerDtsFileName = `${lowerCaseFirstChar(provider.name)}.d.ts`;
      pushUniqueFile(jsFiles, {
        name: providerDtsFileName,
        path: provider.path,
        outPath: providerOutPath,
      });
      //* stats declaration file
      const statsDtsFileName = 'stats.d.ts';
      pushUniqueFile(jsFiles, {
        name: statsDtsFileName,
        path: statsFilePath,
        outPath: statsOutPath,
      });
      entries.forEach((entry) => {
        if (entry.isDirectory()) {
          const registerPath = path.join(statsFilePath, entry.name);
          const registerOutPath = path.join(statsOutPath, entry.name);
          pushUniqueFile(jsFiles, {
            name: 'cssAvailableComponents.d.ts',
            path: registerPath,
            outPath: registerOutPath,
          });
          pushUniqueFile(jsFiles, {
            name: 'cssClassNames.d.ts',
            path: registerPath,
            outPath: registerOutPath,
          });
          pushUniqueFile(jsFiles, {
            name: 'cssGlobalStyles.d.ts',
            path: registerPath,
            outPath: registerOutPath,
          });
          pushUniqueFile(jsFiles, {
            name: 'cssMediaQueries.d.ts',
            path: registerPath,
            outPath: registerOutPath,
          });
          pushUniqueFile(jsFiles, {
            name: 'cssTheme.d.ts',
            path: registerPath,
            outPath: registerOutPath,
          });
          pushUniqueFile(jsFiles, {
            name: 'cssVars.d.ts',
            path: registerPath,
            outPath: registerOutPath,
          });
        }
      });
    }
  }
  return jsFiles;
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
        if (
          foreignThemes &&
          Array.isArray(foreignThemes) &&
          foreignThemes.length > 0
        ) {
          foreignThemes.forEach((foreignThm) => {
            //? foreignThm example
            //?{
            //? "position": "before" | "after",
            //? "name": string,
            //? "path": string, [example: ./fixture/example.css]
            //?}
            const foreignFileName = path.basename(foreignThm.path);
            const foreignFilePath = foreignThm.path
              .replace(foreignFileName, '')
              .trim();
            const foreignFileExists = acc.findIndex(
              (f) => f.name === foreignFileName && f.path === foreignFilePath,
            );
            if (foreignFileExists >= 0) {
              acc[foreignFileExists].parent.push({
                name: styleName,
                position: foreignThm.position,
              });
            } else {
              acc.push({
                name: foreignFileName,
                path: foreignFilePath,
                parent: [{ name: styleName, position: foreignThm.position }],
              });
            }
          });
        }
        return acc;
      }, [])
    : [];
}
/**
 * Get base output directory
 * @param {object} params
 * @param {string} params.baseOutDir
 * @param {Array<'cjs' | 'esm' | '-'>} params.type
 * @returns {string}
 */
function getBaseOutDir({ baseOutDir = '', type = '-' }) {
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
  return baseOutDir ? path.join(baseOutDir, mainFolder) : mainFolder;
}

module.exports = {
  getBernovaBuildArgs,
  getJsFiles,
  getCssFiles,
  getBaseOutDir,
};
