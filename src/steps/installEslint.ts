import { promises as fs } from 'fs';
import path from 'path';

import type FilesData from '../structures/FilesData';
import type { Paths, GeneralAnswers } from '../types';
import getEslintConfigInfo from '../utils/getEslintConfig';
import installDependencies from '../utils/installDependencies';


export default async function installEsLint(
  answers: GeneralAnswers,
  paths: Paths,
  install: boolean,
  filesData: FilesData,
): Promise<void> {
  const useBabelParser = answers.babel;
  const useModules = answers.module;

  const dependencies = new Set(['eslint', ...getEslintConfigInfo(answers.eslint).plugins]);
  if (useBabelParser)
    dependencies.add('@babel/eslint-parser');

  await installDependencies(install, paths.project, dependencies);

  await fs.writeFile(
    path.join(paths.project, `.eslintrc.${useModules ? 'c' : ''}js`),
    filesData.getEslintConfig(),
  );
}
