const path = require('path');
const { writeDoc } = require('../../writeDoc/writeDoc.utils');
const { createStatFragment } = require('./createStatFragment.utils');
const { simplifyName } = require('../../simplifyName/simplifyName.utils');
const { buildCssTheme } = require('./buildCssTheme.utils');
const { compilerTypeValid } = require('../../../constants');
/**
 * Generate every js file required for the provide`s stats
 *
 * @interface IProviderDocs {
 *  [themeName: string]: {
 *    cssPath: string,
 *    variables?: { doc: string, declare: string },
 *    classNames?: { doc: string, declare: string },
 *    availableComp?: { doc: string, declare: string },
 *    globalStyles?: { doc: string, declare: string },
 *    mediaQueries?: { doc: string, declare: string }
 *    beforeFiles?: string[],
 *    afterFiles?: string[],
 *  }
 * }
 *
 * @param {object} param
 * @param {string} param.dir - main root dir
 * @param {IProviderDocs} param.providerDoc - provider stats info
 * @param {boolean} param.declarationHelp - prop to handler the create typescript declaration files
 * @param {'foundationOnly' | 'componentOnly' | 'full'} - prop to prevent rewrite unnecessary files
 */
const buildStatsDoc = async ({
  providerDocs,
  declarationHelp,
  compilerType,
  dir,
  embedCss,
}) => {
  const allThemes = Object.entries(providerDocs);
  const allThemesNames = [];
  for (const [theme, values] of allThemes) {
    //? register theme name
    allThemesNames.push(theme);
    //? write foreign css path
    await buildCssTheme({ theme, values, embedCss, declarationHelp, dir });
    if (compilerType !== compilerTypeValid.foundationOnly) {
      //? write css class names [js file]
      const cssClassNamesContent =
        'classNames' in values ? `'${theme}':{${values.classNames.doc}}` : '';
      await createStatFragment({
        dir,
        content: cssClassNamesContent,
        fileName: 'cssClassNames.js',
        theme,
      });
      //? write css available components [js file]
      const cssAvCompContent =
        'availableComp' in values
          ? `'${theme}':{${values.availableComp.doc}}`
          : '';
      await createStatFragment({
        dir,
        content: cssAvCompContent,
        fileName: 'cssAvailableComponents.js',
        theme,
      });
      if (declarationHelp) {
        //? write css class names [typescript declaration file]
        const cssClNmDeclareContent =
          'classNames' in values
            ? `'${theme}':{${values.classNames.declare}}`
            : '';
        const declareCssClNm = `${simplifyName(theme)}CssClassNames`;
        await createStatFragment({
          dir,
          content: cssClNmDeclareContent,
          fileName: 'cssClassNames.d.ts',
          theme,
          declare: declareCssClNm,
        });
        //? write css available components [typescript declaration file]
        const cssAvCompDeclareContent =
          'availableComp' in values
            ? `'${theme}':{${values.availableComp.declare}}`
            : '';
        const declareCssAvComp = `${simplifyName(theme)}CssAvailableComponents`;
        await createStatFragment({
          dir,
          content: cssAvCompDeclareContent,
          fileName: 'cssAvailableComponents.d.ts',
          theme,
          declare: declareCssAvComp,
        });
      }
    }
    if (compilerType !== compilerTypeValid.componentOnly) {
      //? write css variables [js file]
      const cssVarContent =
        'variables' in values ? `'${theme}':{${values.variables.doc}}` : '';
      await createStatFragment({
        dir,
        content: cssVarContent,
        fileName: 'cssVars.js',
        theme,
      });
      //? write css global styles [js file]
      const cssGlobalStylesContent =
        'globalStyles' in values
          ? `'${theme}':{${values.globalStyles.doc}}`
          : '';
      await createStatFragment({
        dir,
        content: cssGlobalStylesContent,
        fileName: 'cssGlobalStyles.js',
        theme,
      });
      //? write css media queries [js file]
      const cssMediaQueriesContent =
        'mediaQueries' in values
          ? `'${theme}':{${values.mediaQueries.doc}}`
          : '';
      await createStatFragment({
        dir,
        content: cssMediaQueriesContent,
        fileName: 'cssMediaQueries.js',
        theme,
      });
      if (declarationHelp) {
        //? write css variables [typescript declaration file]
        const cssVarDeclareContent =
          'variables' in values
            ? `'${theme}':{${values.variables.declare}}`
            : '';
        const declareCssVar = `${simplifyName(theme)}CssVars`;
        await createStatFragment({
          dir,
          content: cssVarDeclareContent,
          fileName: 'cssVars.d.ts',
          theme,
          declare: declareCssVar,
        });
        //? write css global styles [typescript declaration file]
        const cssGlobalStylesDeclareContent =
          'globalStyles' in values
            ? `'${theme}':{${values.globalStyles.declare}}`
            : '';
        const declareCssGlobalStyles = `${simplifyName(theme)}CssGlobalStyles`;
        await createStatFragment({
          dir,
          content: cssGlobalStylesDeclareContent,
          fileName: 'cssGlobalStyles.d.ts',
          theme,
          declare: declareCssGlobalStyles,
        });
        //? write css media queries [typescript declaration file]
        const cssMediaQueriesDeclareContent =
          'mediaQueries' in values
            ? `'${theme}':{${values.mediaQueries.declare}}`
            : '';
        const declareCssMediaQueries = `${simplifyName(theme)}CssMediaQueries`;
        await createStatFragment({
          dir,
          content: cssMediaQueriesDeclareContent,
          fileName: 'cssMediaQueries.d.ts',
          theme,
          declare: declareCssMediaQueries,
        });
      }
    }
  }
  const statsPieces = {
    toImport: '',
    cssThemes: 'export const cssThemes = {',
    cssVars: 'export const cssVars = {',
    cssClassNames: 'export const cssClasses = {',
    cssAvailableComponents: 'export const cssAvailableComponents = {',
    cssGlobalStyles: 'export const cssGlobalStyles = {',
    cssMediaQueries: 'export const cssMediaQueries = {',
  };
  const statsDPieces = {
    toImport: '',
    cssThemes: 'export declare const cssThemes: ',
    cssVars: 'export declare const cssVars: ',
    cssClassNames: 'export declare const cssClasses: ',
    cssAvailableComponents: 'export declare const cssAvailableComponents: ',
    cssGlobalStyles: 'export declare const cssGlobalStyles: ',
    cssMediaQueries: 'export declare const cssMediaQueries: ',
  };
  allThemesNames.forEach((theme, idx) => {
    const simplifiedName = simplifyName(theme);
    statsPieces.toImport += `import ${simplifiedName}CssTheme from './${theme}/cssTheme.js';\n`;
    statsPieces.toImport += `import ${simplifiedName}CssVars from './${theme}/cssVars.js';\n`;
    statsPieces.toImport += `import ${simplifiedName}CssClassNames from './${theme}/cssClassNames.js';\n`;
    statsPieces.toImport += `import ${simplifiedName}CssAvailableComponents from './${theme}/cssAvailableComponents.js';\n`;
    statsPieces.toImport += `import ${simplifiedName}CssGlobalStyles from './${theme}/cssGlobalStyles.js';\n`;
    statsPieces.toImport += `import ${simplifiedName}CssMediaQueries from './${theme}/cssMediaQueries.js';\n`;
    statsPieces.cssThemes += `...${simplifiedName}CssTheme,`;
    statsPieces.cssVars += `...${simplifiedName}CssVars,`;
    statsPieces.cssClassNames += `...${simplifiedName}CssClassNames,`;
    statsPieces.cssAvailableComponents += `...${simplifiedName}CssAvailableComponents,`;
    statsPieces.cssGlobalStyles += `...${simplifiedName}CssGlobalStyles,`;
    statsPieces.cssMediaQueries += `...${simplifiedName}CssMediaQueries,`;
    if (declarationHelp) {
      statsDPieces.toImport += `import type ${simplifiedName}CssTheme from './${theme}/cssTheme.d.ts';\n`;
      statsDPieces.toImport += `import type ${simplifiedName}CssVars from './${theme}/cssVars.d.ts';\n`;
      statsDPieces.toImport += `import type ${simplifiedName}CssClassNames from './${theme}/cssClassNames.d.ts';\n`;
      statsDPieces.toImport += `import type ${simplifiedName}CssAvailableComponents from './${theme}/cssAvailableComponents.d.ts';\n`;
      statsDPieces.toImport += `import type ${simplifiedName}CssGlobalStyles from './${theme}/cssGlobalStyles.d.ts';\n`;
      statsDPieces.toImport += `import type ${simplifiedName}CssMediaQueries from './${theme}/cssMediaQueries.d.ts';\n`;
      if (idx > 0) {
        statsDPieces.cssThemes += ' & ';
        statsDPieces.cssVars += ' & ';
        statsDPieces.cssClassNames += ' & ';
        statsDPieces.cssAvailableComponents += ' & ';
        statsDPieces.cssGlobalStyles += ' & ';
        statsDPieces.cssMediaQueries += ' & ';
      }
      statsDPieces.cssThemes += `${simplifiedName}CssTheme`;
      statsDPieces.cssVars += `${simplifiedName}CssVars`;
      statsDPieces.cssClassNames += `${simplifiedName}CssClassNames`;
      statsDPieces.cssAvailableComponents += `${simplifiedName}CssAvailableComponents`;
      statsDPieces.cssGlobalStyles += `${simplifiedName}CssGlobalStyles`;
      statsDPieces.cssMediaQueries += `${simplifiedName}CssMediaQueries`;
    }
  });
  statsPieces.cssThemes += '}';
  statsPieces.cssVars += '}';
  statsPieces.cssClassNames += '}';
  statsPieces.cssAvailableComponents += '}';
  statsPieces.cssGlobalStyles += '}';
  statsPieces.cssMediaQueries += '}';
  const statsFileTemplate = `${statsPieces.toImport}\n${statsPieces.cssThemes}\n${statsPieces.cssVars}\n${statsPieces.cssClassNames}\n${statsPieces.cssAvailableComponents}\n${statsPieces.cssGlobalStyles}\n${statsPieces.cssMediaQueries}\n`;
  await writeDoc(
    path.join(dir, 'stats/stats.js'),
    statsFileTemplate,
    'stats.js',
  );
  if (declarationHelp) {
    statsDPieces.cssThemes += ';';
    statsDPieces.cssVars += ';';
    statsDPieces.cssClassNames += ';';
    statsDPieces.cssAvailableComponents += ';';
    statsDPieces.cssGlobalStyles += ';';
    statsDPieces.cssMediaQueries += ';';
    const statsDFileTemplate = `${statsDPieces.toImport}\n${statsDPieces.cssThemes}\n${statsDPieces.cssVars}\n${statsDPieces.cssClassNames}\n${statsDPieces.cssAvailableComponents}\n${statsDPieces.cssGlobalStyles}\n${statsDPieces.cssMediaQueries}\n`;
    await writeDoc(
      path.join(dir, 'stats/stats.d.ts'),
      statsDFileTemplate,
      'stats.d.ts',
    );
  }
};

module.exports = { buildStatsDoc };
