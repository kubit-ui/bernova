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

const fs = require('fs').promises;
const path = require('path');
const { writeDoc } = require('../writeDoc/writeDoc.utils');
const { buildStatsDoc } = require('./utils/buildStatDoc.utils');
const { lowerCaseFirstChar } = require('./utils/lowerCaseFirstChar.utils');

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
  providerName,
  compilerType,
  embedCss,
}) => {
  //? write stats and dependencies documents
  await buildStatsDoc({
    providerDocs,
    declarationHelp,
    compilerType,
    dir,
    embedCss,
  });
  //? write provider
  const templateDoc = embedCss
    ? 'providerTemplate-style.js'
    : 'providerTemplate-link.js';
  const templateFile = `./template/${templateDoc}`;
  const providerDir = path.resolve(__dirname, templateFile);
  let template = await fs.readFile(providerDir, 'utf8');
  //* customize provider name
  const providerFileName = lowerCaseFirstChar(providerName);
  template = template.replace(/\$_Provider_\$/g, providerName);
  await writeDoc(
    path.join(dir, `${providerFileName}.js`),
    template,
    `${providerFileName}.js`,
  );

  if (declarationHelp) {
    //? write provider declare document
    const providerDirDeclare = path.resolve(
      __dirname,
      './template/providerTemplate.d.ts',
    );
    let templateDeclare = await fs.readFile(providerDirDeclare, 'utf8');
    templateDeclare = templateDeclare.replace(/\$_Provider_\$/g, providerName);
    await writeDoc(
      path.join(dir, `${providerFileName}.d.ts`),
      templateDeclare,
      `${providerFileName}.d.ts`,
    );
  }
};

module.exports = { generateProvider };
