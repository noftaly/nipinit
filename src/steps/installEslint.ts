import { promises as fs } from 'fs';
import path from 'path';

import type FilesData from '../structures/FilesData';
import type { GeneralAnswers, Paths } from '../types';
import { LanguageAnswer } from '../types';
import getEslintConfigInfo from '../utils/getEslintConfig';
import installDependencies from '../utils/installDependencies';


export default async function installEsLint(
  answers: GeneralAnswers,
  paths: Paths,
  install: boolean,
  filesData: FilesData,
): Promise<void> {
  const useBabelParser = answers.language === LanguageAnswer.Babel;
  const useTypescript = answers.language === LanguageAnswer.Typecript;
  const useModules = answers.language === LanguageAnswer.Modules;

  const dependencies = new Set(['eslint', ...getEslintConfigInfo(answers.eslint).plugins]);
  if (useBabelParser) {
    dependencies.add('@babel/eslint-parser');
  } else if (useTypescript) {
    dependencies
      .add('@typescript-eslint/parser')
      .add('@typescript-eslint/eslint-plugin');
  }

  await installDependencies(install, paths.project, dependencies);

  await fs.writeFile(
    path.join(paths.project, `.eslintrc.${useModules ? 'c' : ''}js`),
    useTypescript ? filesData.getEslintTypescriptConfig() : filesData.getEslintConfig(),
  );
}
