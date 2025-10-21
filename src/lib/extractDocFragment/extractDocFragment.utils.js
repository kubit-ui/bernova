/**
 * CSS Documentation Fragment Extractor for Bernova
 *
 * Extracts specific sections from CSS documentation using comment markers.
 * Used for partial compilation to preserve existing CSS sections.
 */

/**
 * Extracts a specific section from CSS documentation using regex matching
 * Looks for content between matching comment markers
 *
 * @param {string} section - Name of the section to extract
 * @param {string} doc - CSS document content to search in
 * @returns {string} Extracted section content (trimmed) or empty string if not found
 */
const extractDocFragment = ({ section, doc }) => {
  // Create regex pattern to match section markers
  const matcher = new RegExp(
    `/\\* ${section} \\*/([\\s\\S]*?)/\\* ${section} \\*/`
  );
  const match = doc.match(matcher);
  return match ? match[1].trim() : '';
};

module.exports = { extractDocFragment };
