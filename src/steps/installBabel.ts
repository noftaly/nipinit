import { promises as fs } from 'fs';
import path from 'path';
import type FilesData from '../structures/FilesData';
import type { Paths } from '../types';
import installDependencies from '../utils/installDependencies';


export default async function installBabel(paths: Paths, install: boolean, filesData: FilesData): Promise<void> {
  const dependencies = new Set(['@babel/core', '@babel/node', '@babel/preset-env']);

  await installDependencies(install, paths.project, dependencies);

  await fs.writeFile(path.join(paths.project, '.babelrc'), filesData.getBabelConfig());
}
