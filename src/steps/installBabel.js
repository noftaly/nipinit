import { promises as fs } from 'fs';
import path from 'path';
import filesContent from '../../data/files.js';
import exec from '../utils/exec.js';


async function installBabel(paths, install) {
  if (install)
    await exec('npm i -D @babel/core @babel/node @babel/preset-env', { cwd: paths.project });
  await fs.writeFile(path.join(paths.project, '.babelrc'), filesContent.babel);
}

export default installBabel;
