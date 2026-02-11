#!/usr/bin/env node

/**
 * Bernova CLI Entry Point
 *
 * Command-line interface for the Bernova CSS-in-JS compiler.
 * Processes theme configurations and generates CSS output files.
 *
 * Usage:
 *   bernova                    # Compile all (foundation + components)
 *   bernova --full             # Compile all (foundation + components)
 *   bernova --foundation-only   # Compile only CSS variables and base styles
 *   bernova --component-only    # Compile only component classes and utilities
 */

const { bernovaStyles } = require('../src/app.js');
const { compilerTypeValid } = require('../src/constants/compilerType.js');

(async () => {
  try {
    // Parse command line arguments to determine compilation type
    const args =
      process.argv.find(
        (arg) =>
          arg === `--${compilerTypeValid.full}` ||
          arg === `--${compilerTypeValid.foundationOnly}` ||
          arg === `--${compilerTypeValid.componentOnly}`
      ) || `--${compilerTypeValid.full}`;

    // Extract compiler type from argument (remove -- prefix)
    const compilerType = args.replace('--', '');

    // Execute the main compilation process
    await bernovaStyles(compilerType);
  } catch (error) {
    console.error('Error details:', error.message);
    process.exit(1);
  }
})();
