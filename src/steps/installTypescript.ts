import { promises as fs } from 'fs';
import path from 'path';
import type { Paths } from '../types';
import installDependencies from '../utils/installDependencies';


export default async function installTypescript(paths: Paths, install: boolean): Promise<void> {
  const dependencies = new Set(['typescript', '@types/node']);
  await installDependencies(install, paths.project, dependencies);

  await fs.copyFile(
    path.join(paths.dataDir, 'tsconfig.json'),
    path.join(paths.project, 'tsconfig.json'),
  );
  await fs.copyFile(
    path.join(paths.dataDir, 'tsconfig.eslint.json'),
    path.join(paths.project, 'tsconfig.eslint.json'),
  );
}
