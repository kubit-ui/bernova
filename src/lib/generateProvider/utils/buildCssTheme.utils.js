const fs = require('fs').promises;
const path = require('path');
const { fileExists } = require('../../fileExists/fileExists.utils');
const { simplifyName } = require('../../simplifyName/simplifyName.utils');
const { createStatFragment } = require('./createStatFragment.utils');

const stringToArray = (str) => {
  return eval(str);
};
const getCssText = async (route) => {
  const routeResolve = path.resolve(route);
  return (await fs.readFile(routeResolve, 'utf8')).replace(/\s+/g, ' ');
};
const getForeignCss = async (files) => {
  let cssContent = '';
  for (const file of files) {
    if (!(await fileExists(file))) {
      console.log(`File ${file} does not exist`);
      continue;
    }
    cssContent += await getCssText(file);
  }
  return cssContent;
};

const buildCssTheme = async ({
  theme,
  values,
  embedCss,
  declarationHelp,
  dir,
}) => {
  if (!('cssPath' in values)) {
    return '';
  }
  let cssThemeContent = '';
  const beforeFilesExists = values.beforeFiles?.length > 0;
  const afterFilesExists = values.afterFiles?.length > 0;
  if (embedCss) {
    const beforeArr = beforeFilesExists
      ? stringToArray(values.beforeFiles)
      : [];
    const afterArr = afterFilesExists ? stringToArray(values.afterFiles) : [];
    const beforeContent = await getForeignCss(beforeArr);
    const afterContent = await getForeignCss(afterArr);
    const mainContent = await getCssText(values.cssPath);
    const content = `${beforeContent}${mainContent}${afterContent}`;
    cssThemeContent = `'${theme}':{css:\`${content}\`}`;
  } else {
    //? write foreign css path
    const beforeKeyValue = beforeFilesExists
      ? `before:${values.beforeFiles}`
      : '';
    const afterKeyValue = afterFilesExists ? `after:${values.afterFiles}` : '';
    const foreignsExists = beforeFilesExists || afterFilesExists;
    let foreignKeyValue = foreignsExists ? 'foreign:{' : '';
    foreignKeyValue += beforeKeyValue;
    foreignKeyValue += beforeKeyValue.length && afterKeyValue.length ? ',' : '';
    foreignKeyValue += afterKeyValue;
    foreignKeyValue += foreignsExists ? '}' : '';
    //? write css path
    cssThemeContent = `'${theme}':{css:'${values.cssPath}',${foreignKeyValue}}`;
  }
  await createStatFragment({
    dir,
    content: cssThemeContent,
    fileName: 'cssTheme.js',
    theme,
  });
  if (declarationHelp) {
    const foreignDeclare = embedCss
      ? ''
      : ',foreign?:{before?:string[],after?:string[]}';
    const cssThemeDeclareContent = `'${theme}':{css:string${foreignDeclare}}`;
    const declareThemeName = `${simplifyName(theme)}CssTheme`;
    await createStatFragment({
      dir,
      content: cssThemeDeclareContent,
      fileName: 'cssTheme.d.ts',
      theme,
      declare: declareThemeName,
    });
  }
};

module.exports = { buildCssTheme };
