import { promises as fs } from 'fs';
import path from 'path';
import type FilesData from '../structures/FilesData';
import type { Paths } from '../types';
import installDependencies from '../utils/installDependencies';


export default async function installTypescript(paths: Paths, install: boolean, filesData: FilesData): Promise<void> {
  const dependencies = new Set(['typescript', '@types/node']);
  await installDependencies(install, paths.project, dependencies);

  await fs.writeFile(path.join(paths.project, 'tsconfig.json'), filesData.getTsConfig());
  await fs.writeFile(path.join(paths.project, 'tsconfig.eslint.json'), filesData.getTsEslintConfig());
}
