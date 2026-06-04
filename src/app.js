const path = require('node:path');
const {
  generateBaseCss,
  compileThemes,
  generateCSS,
  compileConfig,
  writeDoc,
  generateProvider,
  processMediaConfig,
  generateThemeRegister,
  generateCssDoc,
  handlerForeignThemes,
} = require('./lib');
const { validatePreviouslyExists, processCssWithPostcss } = require('./lib/generateCss/helpers');
const { compilerTypeValid } = require('./constants');
const { generateTypesTools } = require('./lib/generateTypesTools/generateTypesTools.utils');
const { generateTools } = require('./lib/generateTools/generateTools.utils');
const { runStep } = require('./lib/runStep/runStep.utils');

/**
 * Main function to compile Bernova styles based on configuration
 * Processes themes, generates CSS, and creates necessary files for the styling system

 * @param {string} compilerType - The type of compilation to perform:
 *   - 'foundationOnly': Generate only foundation styles (variables, base styles)
 *   - 'componentOnly': Generate only component/theme styles
 *   - 'full': Generate both foundation and component styles (default)
 * @returns {Promise<void>} Resolves when all styles have been compiled and written
 */
async function bernovaStyles(compilerType) {
  const dir = process.cwd();
  const themeRegister = {};
  const { default: ora } = await import('ora');
  const spinner = ora('Starting BernovaStyled process...').start();

  // Load and validate configuration from bernova.config.json
  const { themes, provider } = await compileConfig({ dir });

  // Process each theme configuration sequentially
  for (const themeConfig of themes) {
    const { themeCss, fonts, resetCss, bvTools, name, stylesPath, typesTools, foreignThemes, prefix } = compileThemes({
      themeConfig,
      dir,
    });

    const baseCss = await generateBaseCss({ fonts, resetCss, stylesPath });

    const { theme, media = [], ...withoutTheme } = themeCss;
    const source = (() => {
      switch (compilerType) {
        case compilerTypeValid.foundationOnly:
          return withoutTheme;
        case compilerTypeValid.componentOnly:
          return { theme, media };
        default:
          return themeCss;
      }
    })();
    const { stylesCss, foundationsCss, stylesDocs, rootDocs, globalDocs } = await generateCSS({
      source,
      baseCss,
      compilerType,
      prefix,
    });

    const stylesDir = path.resolve(dir, stylesPath ?? 'styles');

    const { cssDir, cssMinifiedDir, oldData } = await validatePreviouslyExists({
      stylesDir,
      compilerType,
      name,
    });

    const finalCss = generateCssDoc({
      compilerType,
      stylesCss,
      foundationsCss,
      oldData,
    });

    const cssContent = await processCssWithPostcss(finalCss, false, null);
    const cssMinified = await processCssWithPostcss(finalCss, true, null);

    // Write both regular and minified CSS files
    spinner.start(`Writing CSS to file for theme: ${name}...`);
    await writeDoc(cssDir, cssContent, 'css');
    await writeDoc(cssMinifiedDir, cssMinified, 'css minified');
    spinner.succeed(`CSS written to file for theme: ${name}.`);

    spinner.start(`Compiling register for theme: ${name}...`);
    // Register compilation is handled internally by theme processing
    spinner.succeed(`Register compiled for theme: ${name}.`);

    // Generate TypeScript type definitions if configured
    spinner.start('Verifying types tools...');
    await runStep({
      spinner,
      condition: typesTools,
      sccMsg: `Types tools verified for theme: ${name}.`,
      fbMsg: `No types tools found for theme: ${name}.`,
      cb: async () => {
        await generateTypesTools({
          dir,
          typesTools,
          mediaConfig: media,
          stylesDocs,
        });
      },
    });

    const mediaDocs = media && processMediaConfig({ mediaConfig: media });

    // Generate development tools if configured (bvTools)
    spinner.start(`Processing bvTools for theme: ${name}...`);
    await runStep({
      spinner,
      condition: bvTools,
      sccMsg: `bvTools found for theme: ${name}.`,
      fbMsg: `No bvTools found for theme: ${name}.`,
      cb: async () => {
        await generateTools({
          bvTools,
          compilerType,
          name,
          dir,
          stylesDir,
          stylesDocs,
          rootDocs,
          globalDocs,
          mediaDocs,
        });
      },
    });

    spinner.start(`Generating theme register for theme: ${name}...`);
    await runStep({
      spinner,
      condition: provider,
      sccMsg: `Theme register generated for provider for theme: ${name}`,
      fbMsg: `No provider found for theme: ${name}`,
      cb: async () => {
        const cssPath = path.posix.join(stylesPath ?? 'styles', `${name}.css`);
        const { themeByPosition, variablesExtracted, classesExtracted } = await handlerForeignThemes({ dir, foreignThemes });

        themeRegister[name] = generateThemeRegister({
          cssPath,
          rootDocs,
          stylesDocs,
          globalDocs,
          mediaDocs,
          foreignStyles: classesExtracted,
          foreignVars: variablesExtracted,
          foreignBeforeFiles: themeByPosition.before,
          foreignAfterFiles: themeByPosition.after,
        });
      },
    });
  }

  // Generate React/framework provider if configured
  spinner.start('Provider configuration found, generating tools...');
  await runStep({
    spinner,
    condition: provider,
    sccMsg: 'Provider tools generated successfully.',
    fbMsg: 'No provider found for theme.',
    cb: async () => {
      await generateProvider({
        dir: path.resolve(dir, provider.path),
        providerDocs: themeRegister,
        declarationHelp: provider.declarationHelp,
        providerName: provider.name,
        compilerType,
        embedCss: Boolean(provider.embedCss),
      });
    },
  });
}

module.exports = { bernovaStyles };
