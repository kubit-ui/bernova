#!/usr/bin/env node
const { bvBuildScript } = require('./functions/scriptFx');

(async () => {
  try {
    const buildScript = await bvBuildScript();
    await buildScript.copyCss();
    console.log('CSS files copied successfully.');
  } catch (error) {
    console.error('Error copying CSS files:', error);
    process.exit(1);
  }
})();
