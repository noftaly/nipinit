import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Paths } from '../types';
import installDependencies from '../utils/installDependencies';

export default async function installBabel(paths: Paths, install: boolean): Promise<void> {
  const dependencies = new Set(['@babel/core', '@babel/node', '@babel/preset-env']);

  await installDependencies(install, paths.project, dependencies);

  await fs.copyFile(
    path.join(paths.dataDir, 'babelrc'),
    path.join(paths.project, '.babelrc'),
  );
}
