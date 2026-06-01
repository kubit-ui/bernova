/**
 * Convert the first character of a string to lowercase
 * @param {string} str - input string
 * @return {string} - string with first character in lowecase
 */
const lowerCaseFirstChar = (str = 'provider') => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

module.exports = { lowerCaseFirstChar };
