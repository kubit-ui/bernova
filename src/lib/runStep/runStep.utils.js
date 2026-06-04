const runStep = async ({ spinner, errMsg, sccMsg, fbMsg, condition, cb }) => {
  if (condition) {
    await cb?.();
    spinner.succeed(sccMsg);
  } else {
    fbMsg && spinner.info(fbMsg);
    errMsg && spinner.fail(errMsg);
  }
};

module.exports = { runStep };
