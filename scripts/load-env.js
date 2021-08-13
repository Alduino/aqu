// Sets ESBUILD_BINARY_PATH to the detected path of esbuild.
// Uses the same logic as runWithESBuildBinaryContext.

const { resolve } = require('path');
const { access } = require('fs-extra');

(async () => {
  let binaryPath;

  const nodeModulesDirs = [
    ['..', '..'],
    ['..', 'node_modules'],
  ];

  const binaryDirs = [['esbuild.exe'], ['bin', 'esbuild']];

  for (const nodeModuleDir of nodeModulesDirs) {
    for (const binaryDir of binaryDirs) {
      const dir = [__dirname, ...nodeModuleDir, 'esbuild', ...binaryDir];
      const testBinaryPath = resolve(...dir);

      try {
        await access(testBinaryPath);
        binaryPath = testBinaryPath;
        break;
      } catch {
        // noop
      }
    }

    if (binaryPath) break;
  }

  if (!binaryPath) {
    throw new Error('No binary for esbuild found');
  }

  process.env.ESBUILD_BINARY_PATH = binaryPath;
})();
