const path = require('path');
const { getBernovaBuildArgs, getBaseOutDir } = require('./getFx');
const { readConfigData } = require('../../src/lib');
const {
  copyCssFiles,
  embedCssForProvider,
  rewriteCssPathInStats,
  writeStatsinBuild,
  writeToolsInBuild,
  rewriteProviderTemplate,
} = require('./writeFx');
const { isIterableArray, buildCustomOutDirs } = require('./utils');

async function bvBuildScript() {
  /**
   *  CONFIGURATION
   */
  console.log('Reading configuration...');
  const dir = process.cwd();
  const { themes, provider, compilerOptions } = await readConfigData(
    path.resolve(dir, 'bernova.config.json'),
  );
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
  const { minifyCss, minifyJS, ...jsonConfig } = compilerOptions;
  const {
    css: cssPath,
    tools: toolsPath,
    provider: providerPath,
    ...cliConfig
  } = getBernovaBuildArgs(validArgs);
  const cliCustomOutDirs = (() => {
    const customOutDirs = {};
    if (cssPath) customOutDirs.css = cssPath;
    if (toolsPath) customOutDirs.tools = toolsPath;
    if (providerPath) customOutDirs.provider = providerPath;
    return Object.keys(customOutDirs).length > 0 ? customOutDirs : undefined;
  })();
  const {
    baseOutDir = '',
    rootDir,
    preventMoveJS,
    preventMoveDTS,
    preventProcessJs,
    types,
    embedCss,
    customOutDirs,
  } = buildCustomOutDirs({
    jsonConfig,
    cliConfig: {
      ...cliConfig,
      customOutDirs: cliCustomOutDirs,
    },
  });
  const typesToBuild = isIterableArray(types) ? types : [''];
  console.log('Configuration read successfully');
  /**
   *  FUNCTIONS
   */
  async function preBuildStyles() {
    const css = customOutDirs?.css;
    if (isIterableArray(themes)) {
      for (const theme of themes) {
        if (embedCss) await embedCssForProvider({ dir, theme, provider });
        else if (css)
          await rewriteCssPathInStats({ dir, theme, css, provider });
      }
      await rewriteProviderTemplate({ dir, embedCss, provider });
    }
  }
  async function copyCss() {
    const css = customOutDirs?.css;
    if (isIterableArray(themes)) {
      for (const theme of themes) {
        const finalDist = css ?? theme.stylesPath ?? '';
        const cssPath = path.join(baseOutDir, finalDist);
        await copyCssFiles({ dir, cssPath, theme });
      }
    }
  }
  async function copyStats() {
    let fileOutPath = customOutDirs?.provider ?? provider.path ?? '';
    if (rootDir) {
      fileOutPath = path.relative(rootDir, fileOutPath);
    }
    for (const type of typesToBuild) {
      const fileBaseOutDir = getBaseOutDir({ baseOutDir, type });
      const outPath = path.join(fileBaseOutDir, fileOutPath, 'stats');
      await writeStatsinBuild({
        dir,
        providerPath: provider.path,
        outPath,
        type,
        preventMoveDTS,
        minifyJS,
      });
    }
  }
  async function copyProvider() {
    let fileOutPath = customOutDirs?.provider ?? provider.path ?? '';
    if (rootDir) {
      fileOutPath = path.relative(rootDir, fileOutPath);
    }
    for (const type of typesToBuild) {
      const fileBaseOutDir = getBaseOutDir({ baseOutDir, type });
      const outPath = path.join(fileBaseOutDir, fileOutPath);
      //! --> This logic will be deleted in future versions (the preventProcessJs flag check) <--
      if (!preventProcessJs) {
        await preBuildStyles();
      }
      await writeToolsInBuild({
        dir,
        toolsPath: provider.path,
        outPath,
        preventMoveDTS,
        type,
        minifyJS,
      });
    }
  }
  async function copyTools() {
    if (isIterableArray(themes)) {
      for (const theme of themes) {
        const { bvTools } = theme;
        const toolsPath = bvTools?.path;
        if (toolsPath) {
          let fileOutPath = customOutDirs?.tools ?? toolsPath ?? '';
          if (rootDir) {
            fileOutPath = path.relative(rootDir, fileOutPath);
          }
          for (const type of typesToBuild) {
            const fileBaseOutDir = getBaseOutDir({ baseOutDir, type });
            const outPath = path.join(fileBaseOutDir, fileOutPath);
            await writeToolsInBuild({
              dir,
              toolsPath,
              outPath,
              preventMoveDTS,
              type,
              minifyJS,
            });
          }
        }
      }
    }
  }
  async function fullBuild() {
    console.log('Copying CSS files...');
    await copyCss(cssPath);
    console.log('CSS files copied successfully');

    //! --> This logic will be deleted in future versions (preventMoveJS flag check) <--
    if (preventMoveJS) return;

    console.log('Copying tools files...');
    await copyTools();
    console.log('Tools files copied successfully');

    console.log('Copying provider and stats files...');
    await copyProvider();
    await copyStats();
    console.log('Provider and stats files copied successfully');
  }
  return {
    preBuildStyles,
    copyCss,
    copyStats,
    copyProvider,
    fullBuild,
  };
}

module.exports = { bvBuildScript };
