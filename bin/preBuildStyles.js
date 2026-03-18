#!/usr/bin/env node
const { bvBuildScript } = require('./functions/scriptFx');

(async () => {
  try {
    const buildScript = await bvBuildScript();
    await buildScript.preBuildStyles();
    console.log('Pre-build styles processing completed successfully.');
  } catch (error) {
    console.error('Error during pre-build styles processing:', error);
    process.exit(1);
  }
})();
