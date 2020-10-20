import { promises as fs } from 'fs';
import path from 'path';

import FilesData from '../FilesData';
import { ExtraModulesAnswer } from '../models/Answers';
import { GeneralAnswers } from '../models/answerChoice';
import { Paths } from '../models/paths';
import exec from '../utils/exec';


async function installOtherDependencies(
  paths: Paths,
  answers: GeneralAnswers,
  install: boolean,
  filesData: FilesData,
): Promise<void> {
  if (answers.extras.includes(ExtraModulesAnswer.Nodemon)) {
    if (install)
      await exec('npm i -D nodemon', { cwd: paths.project });
    await fs.writeFile(path.join(paths.project, 'nodemon.json'), filesData.getNodemon());
  }
  if (answers.extras.includes(ExtraModulesAnswer.Crossenv) && install)
    await exec('npm i -D cross-env', { cwd: paths.project });
  if (answers.extras.includes(ExtraModulesAnswer.Nodemon) && install)
    await exec('npm i -D nodemon', { cwd: paths.project });
}

export default installOtherDependencies;
