const path = require('node:path');
const { writeDoc } = require('../../writeDoc/writeDoc.utils');
const { interfaceWrapper } = require('./interfaceWrapper.utils');
const { anonimousWrapper } = require('./anonimousWrapper.utils');
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
const createStatFragment = async ({
  dir,
  content,
  fileName,
  theme,
  declare = null,
}) => {
  const fileContent = declare
    ? interfaceWrapper(content, declare)
    : anonimousWrapper(content);
  const relativePath = `stats/${theme}/${fileName}`;
  const filePath = path.resolve(dir, relativePath);
  await writeDoc(filePath, fileContent, relativePath);
};

module.exports = { createStatFragment };
