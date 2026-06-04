const fs = require('node:fs').promises;
const path = require('node:path');
const { fileExists } = require('../../fileExists/fileExists.utils');
const { simplifyName } = require('../../simplifyName/simplifyName.utils');
const { createStatFragment } = require('./createStatFragment.utils');

const stringToArray = str => {
  return JSON.parse(str.replace(/'/g, '"'));
};
const getCssText = async route => {
  const routeResolve = path.resolve(route);
  return (await fs.readFile(routeResolve, 'utf8')).replace(/\s+/g, ' ');
};
const getForeignCss = async files => {
  let cssContent = '';
  for (const file of files) {
    const filePath = path.resolve(file);
    if (!(await fileExists('.', filePath))) {
      console.log(`File ${filePath} does not exist`);
      continue;
    }
    cssContent += await getCssText(filePath);
  }
  return cssContent;
};

const getEmbedCssContent = async ({ theme, values }) => {
  const { beforeFiles, afterFiles } = values;
  const beforeArr = beforeFiles?.length > 0 ? stringToArray(beforeFiles) : [];
  const afterArr = afterFiles?.length > 0 ? stringToArray(afterFiles) : [];
  const [beforeContent, afterContent, mainContent] = await Promise.all([
    getForeignCss(beforeArr),
    getForeignCss(afterArr),
    getCssText(values.cssPath),
  ]);
  const fullContent = `${beforeContent}${mainContent}${afterContent}`;
  return `'${theme}':{css:\`${fullContent}\`}`;
};

const getReferencedCssContent = ({ theme, values }) => {
  const hasBefore = values.beforeFiles?.length > 0;
  const hasAfter = values.afterFiles?.length > 0;
  //? write foreign css path
  const beforeKeyValue = hasBefore ? `before:${values.beforeFiles}` : '';
  const afterKeyValue = hasAfter ? `after:${values.afterFiles}` : '';
  const foreignsExists = hasBefore || hasAfter;
  let foreignKeyValue = foreignsExists ? 'foreign:{' : '';
  foreignKeyValue += beforeKeyValue;
  foreignKeyValue += beforeKeyValue.length && afterKeyValue.length ? ',' : '';
  foreignKeyValue += afterKeyValue;
  foreignKeyValue += foreignsExists ? '}' : '';
  //? write css path
  return `'${theme}':{css:'${values.cssPath}',${foreignKeyValue}}`;
};

const buildCssTheme = async ({ theme, values, embedCss, declarationHelp, dir }) => {
  if (!('cssPath' in values)) {
    return '';
  }
  const cssThemeContent = embedCss ? await getEmbedCssContent({ theme, values }) : getReferencedCssContent({ theme, values });

  await createStatFragment({
    dir,
    content: cssThemeContent,
    fileName: 'cssTheme.js',
    theme,
  });
  if (declarationHelp) {
    const foreignDeclare = embedCss ? '' : ',foreign?:{before?:string[],after?:string[]}';
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
