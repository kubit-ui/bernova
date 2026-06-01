/**
 * Return the content wrapped in an anonymous object
 * to avoid polluting the global scope
 *
 * @param {string} content - string content
 * @returns {string} - wrapped content
 */
const anonimousWrapper = (content) => {
  return `export default {${content}}`;
};

module.exports = { anonimousWrapper };
