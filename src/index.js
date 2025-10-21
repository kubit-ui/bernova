// Main entry point for Bernova package
const lib = require('./lib');
const constants = require('./constants');

// Export the main functionality
module.exports = {
  // Library functions
  ...lib,

  // Constants
  ...constants,

  // Direct access to modules
  lib,
  constants,
};
