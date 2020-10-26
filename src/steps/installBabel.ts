import { promises as fs } from 'fs';
import path from 'path';
import type FilesData from '../structures/FilesData';
import type { Paths } from '../types';
import exec from '../utils/exec';


export default async function installBabel(paths: Paths, install: boolean, filesData: FilesData): Promise<void> {
  if (install)
    await exec('npm i -D @babel/core @babel/node @babel/preset-env', { cwd: paths.project });
  await fs.writeFile(path.join(paths.project, '.babelrc'), filesData.getBabelConfig());
}
