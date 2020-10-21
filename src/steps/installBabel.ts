import { promises as fs } from 'fs';
import path from 'path';
import FilesData from '../FilesData';
import { Paths } from '../models/Paths';
import exec from '../utils/exec';


async function installBabel(paths: Paths, install: boolean, filesData: FilesData): Promise<void> {
  if (install)
    await exec('npm i -D @babel/core @babel/node @babel/preset-env', { cwd: paths.project });
  await fs.writeFile(path.join(paths.project, '.babelrc'), filesData.getBabelConfig());
}

export default installBabel;
