import { resolve } from 'path';

import { access } from 'fs-extra';

import { gracefulShutdown } from './gracefulShutdown';
import logger from '../logger';

export const runWithESBuildBinaryContext = async <T>(run: () => Promise<T>) => {
  let binaryPath: string | undefined = undefined;

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
        logger.info('Checking for binary in', testBinaryPath);
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
    logger.fatal('No binary for esbuild found');
  }

  const previousPath = process.env.ESBUILD_BINARY_PATH;

  const cleanup = gracefulShutdown(() => {
    process.env.ESBUILD_BINARY_PATH = previousPath;
  });

  process.env.ESBUILD_BINARY_PATH = binaryPath;

  const result = await run();

  process.env.ESBUILD_BINARY_PATH = previousPath;

  cleanup();

  return result;
};
