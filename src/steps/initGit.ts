import { promises as fs } from 'fs';
import type FilesData from '../structures/FilesData';
import type { Paths } from '../types';
import exec from '../utils/exec';


export default async function initGit(paths: Paths, filesData: FilesData): Promise<void> {
  await exec('git init', { cwd: paths.project });
  await fs.writeFile(paths.dest.gitignore, filesData.getGitIgnore());
}
