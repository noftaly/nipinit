import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { GeneralAnswers, Paths } from '../types';
import { ExtraModulesAnswer } from '../types';
import installDependencies from '../utils/installDependencies';

export default async function installOtherDependencies(
  paths: Paths,
  answers: GeneralAnswers,
  install: boolean,
): Promise<void> {
  const dependencies = new Set<string>();

  if (answers.extras.includes(ExtraModulesAnswer.Nodemon)) {
    await fs.copyFile(
      path.join(paths.dataDir, 'nodemon.json'),
      path.join(paths.project, 'nodemon.json'),
    );
    dependencies.add('nodemon');
  }
  if (answers.extras.includes(ExtraModulesAnswer.Crossenv))
    dependencies.add('cross-env');
  if (answers.extras.includes(ExtraModulesAnswer.Concurrently))
    dependencies.add('concurrently');

  await installDependencies(install, paths.project, dependencies);
}
