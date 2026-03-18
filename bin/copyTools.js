#!/usr/bin/env node
const { bvBuildScript } = require('./functions/scriptFx');

(async () => {
  try {
    const buildScript = await bvBuildScript();
    await buildScript.copyTools();
    console.log('Tools files copied successfully.');
  } catch (error) {
    console.error('Error copying tools files:', error);
    process.exit(1);
  }
})();
