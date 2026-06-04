import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Creates a fresh isolated temporary directory for a test.
 * @param {string} [prefix='bv-test-'] - Optional prefix for the directory name.
 * @returns {string} Absolute path to the new temporary directory.
 */
export const mkTmp = (prefix = 'bv-test-') =>
  fs.mkdtempSync(path.join(os.tmpdir(), prefix));

/**
 * Writes a file inside a directory and returns its absolute path.
 * @param {string} dir - Absolute path to the parent directory.
 * @param {string} fileName - Name of the file to create.
 * @param {string} contents - Contents to write.
 * @returns {string} Absolute path of the written file.
 */
export const writeTmpFile = (dir, fileName, contents) => {
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, contents);
  return filePath;
};
