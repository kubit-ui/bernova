const path = require('path');
const fs = require('fs/promises');

/**
 * Writes CSS content to a specified directory.
 * Ensures that the directory exists before writing the file.
 *
 * @param {string} dir - The directory where the CSS file will be written.
 * @param {string | Promise<string>} source - The CSS content to write.
 */
const writeDoc = async (dir, source, docName) => {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(dir), { recursive: true });

    // Resolve the source if it's a Promise
    const cssContent = await Promise.resolve(source);

    // Write the CSS content to the file
    await fs.writeFile(dir, cssContent);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { writeDoc };
