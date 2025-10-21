#!/usr/bin/env node

/**
 * Bernova Configuration Generator
 *
 * Creates a default bernova.config.json file in the current working directory.
 * This configuration file defines themes, paths, and build settings for Bernova.
 *
 * Usage: bv-config
 *
 * The generated config includes:
 * - Default theme configuration
 * - Foundation, theme, and global styles paths
 * - Media queries configuration
 * - CSS reset and prefix settings
 */

const fs = require('fs').promises;
const path = require('path');

// Default configuration template for new Bernova projects
const config = {
  themes: [
    {
      name: 'default',
      foundations: {
        name: 'FOUNDATIONS',
        path: './src/design/foundations.ts',
      },
      theme: {
        name: 'BERNOVA_STYLES',
        path: './src/design/theme.ts',
      },
      globalStyles: {
        name: 'GLOBAL_STYLES',
        path: './src/design/globalStyles.ts',
      },
      mediaQueries: {
        name: 'MEDIA_QUERIES',
        path: './src/design/mediaQueries.ts',
      },
      resetCss: false,
      prefix: 'kb',
      stylesPath: './src/styles/default',
    },
  ],
};

const configPath = path.resolve(process.cwd(), 'bernova.config.json');

/**
 * Creates a configuration file with the provided data
 * Handles file system errors and provides user feedback via spinner
 *
 * @param {string} filePath - The absolute path where the configuration file will be written
 * @param {Object} data - The configuration data to serialize and write to file
 * @returns {Promise<void>} Resolves when file is successfully written
 */
const writeConfigFile = async (filePath, data) => {
  const { default: ora } = await import('ora');
  const spinner = ora('Creating Bernova configuration file...').start();

  try {
    // Check if config file already exists
    try {
      await fs.access(filePath);
      spinner.warn('Configuration file already exists. Skipping creation.');
      return;
    } catch {
      // File doesn't exist, proceed with creation
    }

    // Write formatted JSON configuration
    const configContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, configContent, 'utf8');

    spinner.succeed(`Configuration file created successfully at: ${filePath}`);
    console.log('\nNext steps:');
    console.log(
      '1. Edit the configuration file to match your project structure'
    );
    console.log(
      '2. Create the specified design files (foundations.ts, theme.ts, etc.)'
    );
    console.log('3. Run "bernova" to compile your styles');
  } catch (error) {
    spinner.fail('Failed to create configuration file.');
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Execute the configuration file creation
writeConfigFile(configPath, config);
