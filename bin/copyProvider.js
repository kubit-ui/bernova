#!/usr/bin/env node
const { bvBuildScript } = require('./functions/scriptFx');

(async () => {
  try {
    const buildScript = await bvBuildScript();
    await buildScript.copyProvider();
    await buildScript.copyStats();
    console.log('Provider files copied successfully.');
  } catch (error) {
    console.error('Error copying provider files:', error);
    process.exit(1);
  }
})();
