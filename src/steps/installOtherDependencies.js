import { promises as fs } from 'fs';
import path from 'path';

import filesContent from '../../data/files.js';
import exec from '../utils/exec.js';


async function installOtherDependencies(paths, install, answers) {
  if (answers.nodemon) {
    if (install)
      await exec('npm i -D nodemon', { cwd: paths.project });
    await fs.writeFile(path.join(paths.project, 'nodemon.json'), filesContent.nodemon);
  }
  if (answers['cross-env'] && install)
    await exec('npm i -D cross-env', { cwd: paths.project });
  if (answers.concurrently && install)
    await exec('npm i -D nodemon', { cwd: paths.project });
}

export default installOtherDependencies;
