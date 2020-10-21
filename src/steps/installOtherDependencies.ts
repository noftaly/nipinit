import { promises as fs } from 'fs';
import path from 'path';

import FilesData from '../FilesData';
import { ExtraModulesAnswer } from '../models/ChoiceAnswers';
import { Paths } from '../models/Paths';
import { GeneralAnswers } from '../models/PromptAnswers';
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
  if (answers.extras.includes(ExtraModulesAnswer.Concurrently) && install)
    await exec('npm i -D concurrently', { cwd: paths.project });
}

export default installOtherDependencies;
