/**
 * Return the content wrapper in a typescript interface
 * @param {string} content - string content
 * @param {string} iName - interface`s name
 * @return {string} - wrapped content
 */
const interfaceWrapper = (content, iName) => {
  return `interface ${iName} {${content}}\ndeclare const ${iName}: ${iName};\nexport default ${iName};`;
};

module.exports = { interfaceWrapper };
