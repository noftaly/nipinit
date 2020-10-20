import { promises as fs } from 'fs';
import FilesData from '../FilesData';
import { Paths } from '../models/paths';
import exec from '../utils/exec';


async function initGit(paths: Paths, filesData: FilesData): Promise<void> {
  await exec('git init', { cwd: paths.project });
  await fs.writeFile(paths.dest.gitignore, filesData.getGitIgnore());
}

export default initGit;
