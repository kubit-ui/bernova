/**
 * Provider Generation Module for Bernova
 *
 * Generates JavaScript/TypeScript provider utilities that allow applications
 * to consume Bernova-generated CSS classes, variables, and theme data.
 *
 * Creates:
 * - CSS class name mappings
 * - CSS variable exports
 * - Theme switching utilities
 * - TypeScript declarations
 * - Development statistics
 */

const f = require('fs');
const fs = require('fs').promises;
const path = require('path');
const { writeDoc } = require('../writeDoc/writeDoc.utils');
const { compilerTypeValid } = require('../../constants');
const { simplifyName } = require('../simplifyName/simplifyName.utils');

/**
 * Convert the first character of a string to lowercase
 * @param {string} str - input string
 * @return {string} - string with first character in lowecase
 */
const lowerCaseFirstChar = (str = 'provider') => {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Return the content wrapped in an anonymous object
 * to avoid polluting the global scope
 * 
 * @param {string} content - string content
 * @returns {string} - wrapped content
 */
const anonimousWrapper = (content) => {
  return `export default {${content}}`;
}

/**
 * Return the content wrapper in a typescript interface
 * @param {string} content - string content
 * @param {string} iName - interface`s name
 * @return {string} - wrapped content
 */
const interfaceWrapper = (content, iName) => {
  return `export interface ${iName} {${content}}\n`;
}

/**
 * Write a js file required for the provider`s stats
 * 
 * @param {object} param
 * @param {string} param.dir - main root dir
 * @param {string} param.content - file content
 * @param {string} param.fileName - file name
 * @param {string} param.theme - related theme name
 * @param {string | null} param.declare - typescript declare file name
 * @return {void}
 */
const createStatFragment = async ({ dir, content, fileName, theme, declare = null}) => {
  const fileContent = declare ? interfaceWrapper(content, declare) : anonimousWrapper(content);
  const relativePath = `stats/${theme}/${fileName}`;
  const filePath = path.resolve(dir, relativePath);
  await writeDoc(filePath, fileContent, relativePath);
}

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
const buildStatsDoc = async ({ providerDocs, declarationHelp, compilerType, dir }) => {
  const allThemes = Object.entries(providerDocs);
  const allThemesNames = [];
  for (const [theme, values] of allThemes) {
    //? register theme name
    allThemesNames.push(theme);
    //? write foreign css path
    const beforeFilesExists = values.beforeFiles?.length > 0;
    const afterFilesExists = values.afterFiles?.length > 0;
    const beforeKeyValue = beforeFilesExists ? `before:${values.beforeFiles}` : '';
    const afterKeyValue = afterFilesExists ? `after:${values.afterFiles}` : '';
    const foreignsExists = beforeFilesExists || afterFilesExists;
    let foreignKeyValue = foreignsExists ? 'foreign:{' : '';
    foreignKeyValue += beforeKeyValue;
    foreignKeyValue += beforeKeyValue.length && afterKeyValue.length ? ',' : '';
    foreignKeyValue += afterKeyValue;
    foreignKeyValue += foreignsExists ? '}' : '';
    //? write css path
    const cssThemeContent = 'cssPath' in values ? `'${theme}':{css:'${values.cssPath}',${foreignKeyValue}}` : ''; 
    await createStatFragment({ dir, content: cssThemeContent, fileName: 'cssTheme.js', theme });
    if (declarationHelp) {
      const foreignDeclare = 'foreign?:{before?:string[],after?:string[]}';
      const cssThemeDeclareContent = 'cssPath' in values ? `'${theme}':{css:string,${foreignDeclare}}` : '';
      const declareThemeName = `${simplifyName(theme)}CssTheme`;
      await createStatFragment({
        dir,
        content: cssThemeDeclareContent,
        fileName: 'cssTheme.d.ts',
        theme,
        declare: declareThemeName
      })
    }
    if (compilerType !== compilerTypeValid.foundationOnly) {
      //? write css class names [js file]
      const cssClassNamesContent = 'classNames' in values ? `'${theme}':{${values.classNames.doc}}` : '';
      await createStatFragment({ dir, content: cssClassNamesContent, fileName: 'cssClassNames.js', theme });
      //? write css available components [js file]
      const cssAvCompContent = 'availableComp' in values ? `'${theme}':{${values.availableComp.doc}}` : '';
      await createStatFragment({ dir, content: cssAvCompContent, fileName: 'cssAvailableComponents.js', theme });
      if (declarationHelp) {
        //? write css class names [typescript declaration file]
        const cssClNmDeclareContent = 'classNames' in values ? `'${theme}':{${values.classNames.declare}}` : '';
        const declareCssClNm = `${simplifyName(theme)}CssClassNames`;
        await createStatFragment({
          dir,
          content: cssClNmDeclareContent,
          fileName: 'cssClassNames.d.ts',
          theme,
          declare: declareCssClNm
        })
        //? write css available components [typescript declaration file]
        const cssAvCompDeclareContent = 'availableComp' in values ? `'${theme}':{${values.availableComp.declare}}` : '';
        const declareCssAvComp = `${simplifyName(theme)}CssAvailableComponents`;
        await createStatFragment({
          dir,
          content: cssAvCompDeclareContent,
          fileName: 'cssAvailableComponents.d.ts',
          theme,
          declare: declareCssAvComp
        })
      }
    }
    if (compilerType !== compilerTypeValid.componentOnly) {
      //? write css variables [js file]
      const cssVarContent = 'variables' in values ? `'${theme}':{${values.variables.doc}}` : '';
      await createStatFragment({ dir, content: cssVarContent, fileName: 'cssVars.js', theme });
      //? write css global styles [js file]
      const cssGlobalStylesContent = 'globalStyles' in values ? `'${theme}':{${values.globalStyles.doc}}` : '';
      await createStatFragment({ dir, content: cssGlobalStylesContent, fileName: 'cssGlobalStyles.js', theme });
      //? write css media queries [js file]
      const cssMediaQueriesContent = 'mediaQueries' in values ? `'${theme}':{${values.mediaQueries.doc}}` : '';
      await createStatFragment({ dir, content: cssMediaQueriesContent, fileName: 'cssMediaQueries.js', theme });
      if (declarationHelp) {
        //? write css variables [typescript declaration file]
        const cssVarDeclareContent = 'variables' in values ? `'${theme}':{${values.variables.declare}}` : '';
        const declareCssVar = `${simplifyName(theme)}CssVars`;
        await createStatFragment({
          dir,
          content: cssVarDeclareContent,
          fileName: 'cssVars.d.ts',
          theme,
          declare: declareCssVar
        })
        //? write css global styles [typescript declaration file]
        const cssGlobalStylesDeclareContent = 'globalStyles' in values ? `'${theme}':{${values.globalStyles.declare}}` : '';
        const declareCssGlobalStyles = `${simplifyName(theme)}CssGlobalStyles`;
        await createStatFragment({
          dir,
          content: cssGlobalStylesDeclareContent,
          fileName: 'cssGlobalStyles.d.ts',
          theme,
          declare: declareCssGlobalStyles
        })
        //? write css media queries [typescript declaration file]
        const cssMediaQueriesDeclareContent = 'mediaQueries' in values ? `'${theme}':{${values.mediaQueries.declare}}` : '';
        const declareCssMediaQueries = `${simplifyName(theme)}CssMediaQueries`;
        await createStatFragment({
          dir,
          content: cssMediaQueriesDeclareContent,
          fileName: 'cssMediaQueries.d.ts',
          theme,
          declare: declareCssMediaQueries
        })
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
      statsDPieces.toImport += `import type { ${simplifiedName}CssTheme } from './${theme}/cssTheme.d.ts';\n`;
      statsDPieces.toImport += `import type { ${simplifiedName}CssVars } from './${theme}/cssVars.d.ts';\n`;
      statsDPieces.toImport += `import type { ${simplifiedName}CssClassNames } from './${theme}/cssClassNames.d.ts';\n`;
      statsDPieces.toImport += `import type { ${simplifiedName}CssAvailableComponents } from './${theme}/cssAvailableComponents.d.ts';\n`;
      statsDPieces.toImport += `import type { ${simplifiedName}CssGlobalStyles } from './${theme}/cssGlobalStyles.d.ts';\n`;
      statsDPieces.toImport += `import type { ${simplifiedName}CssMediaQueries } from './${theme}/cssMediaQueries.d.ts';\n`;
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
  await writeDoc(path.join(dir, 'stats/stats.js'), statsFileTemplate, 'stats.js');
  if (declarationHelp) {
    statsDPieces.cssThemes += ';';
    statsDPieces.cssVars += ';';
    statsDPieces.cssClassNames += ';';
    statsDPieces.cssAvailableComponents += ';';
    statsDPieces.cssGlobalStyles += ';';
    statsDPieces.cssMediaQueries += ';';
    const statsDFileTemplate = `${statsDPieces.toImport}\n${statsDPieces.cssThemes}\n${statsDPieces.cssVars}\n${statsDPieces.cssClassNames}\n${statsDPieces.cssAvailableComponents}\n${statsDPieces.cssGlobalStyles}\n${statsDPieces.cssMediaQueries}\n`;
    await writeDoc(path.join(dir, 'stats/stats.d.ts'), statsDFileTemplate, 'stats.d.ts');
  }
}

/**
 * Create the Bernova provider file and the stats document
 * 
 * @param {object} param 
 * @param {string} param.dir destination directory
 * @param {object} param.providerDocs provider documentation
 * @param {boolean} param.declarationHelp enable typescript declaration files
 * @param {string} param.providerName provider name
 * @param {string} param.compilerType compiler type
 * @return {void}
 */
const generateProvider = async ({
  dir,
  providerDocs,
  declarationHelp,
  providerName: originalProviderName,
  compilerType,
}) => {
  //? write stats and dependencies documents
  await buildStatsDoc({ providerDocs, declarationHelp, compilerType, dir });
  //? write provider
  const providerDir = path.resolve(__dirname, './template/providerTemplate.js');
  let template = await fs.readFile(providerDir, 'utf8');
  //* customize provider name
  const providerName = lowerCaseFirstChar(originalProviderName);
  template = template.replace(/\$_Provider_\$/g, providerName);
  await writeDoc(`${dir}/${providerName}.js`, template, `${providerName}.js`);

  if (declarationHelp) {
    //? write provider declare document
    const providerDirDeclare = path.resolve(
      __dirname,
      './template/providerTemplate.d.ts'
    );
    let templateDeclare = await fs.readFile(providerDirDeclare, 'utf8');
    templateDeclare = templateDeclare.replace(/\$_Provider_\$/g, providerName);
    await writeDoc(
      `${dir}/${providerName}.d.ts`,
      templateDeclare,
      `${providerName}.d.ts`
    );
  }
};

module.exports = { generateProvider };
