import { promises as fs } from 'fs';
import filesContent from '../../data/files.js';
import exec from '../utils/exec.js';


async function initGit(paths, answers) {
  await exec('git init', { cwd: paths.project });
  await fs.writeFile(paths.dest.gitignore, filesContent.gitignore(answers.babel));
}

export default initGit;
