import { promises as fs } from 'fs';
import path from 'path';

import type FilesData from '../structures/FilesData';
import type { GeneralAnswers, Paths } from '../types';
import { ExtraModulesAnswer } from '../types';
import installDependencies from '../utils/installDependencies';


export default async function installOtherDependencies(
  paths: Paths,
  answers: GeneralAnswers,
  install: boolean,
  filesData: FilesData,
): Promise<void> {
  const dependencies: Set<string> = new Set();

  if (answers.extras.includes(ExtraModulesAnswer.Nodemon)) {
    await fs.writeFile(path.join(paths.project, 'nodemon.json'), filesData.getNodemon());
    dependencies.add('nodemon');
  }
  if (answers.extras.includes(ExtraModulesAnswer.Crossenv))
    dependencies.add('cross-env');
  if (answers.extras.includes(ExtraModulesAnswer.Concurrently))
    dependencies.add('concurrently');

  await installDependencies(install, paths.project, dependencies);
}
