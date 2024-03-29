import { promises as fs } from 'node:fs';
import path from 'node:path';
import ejs from 'ejs';
import type { GeneralAnswers, Paths } from '../types';
import { LanguageAnswer } from '../types';
import getEslintConfigInfo from '../utils/getEslintConfig';
import installDependencies from '../utils/installDependencies';

export default async function installEsLint(
  answers: GeneralAnswers,
  paths: Paths,
  install: boolean,
): Promise<void> {
  const useBabelParser = answers.language === LanguageAnswer.Babel;
  const useTypescript = answers.language === LanguageAnswer.Typecript;
  const useModules = answers.language === LanguageAnswer.Modules;

  const eslintInfos = getEslintConfigInfo(answers.eslint);
  const dependencies = new Set(['eslint', ...eslintInfos.plugins]);
  if (useBabelParser) {
    dependencies.add('@babel/eslint-parser');
  } else if (useTypescript) {
    dependencies
      .add('@typescript-eslint/parser')
      .add('@typescript-eslint/eslint-plugin');
  }

  await installDependencies(install, paths.project, dependencies);
  const template = await fs.readFile(path.join(paths.dataDir, 'eslintrc.ejs'), { encoding: 'utf8' });
  const rendered = ejs.render(template, {
    babel: useBabelParser,
    typescript: useTypescript,
    eslintExtends: eslintInfos.extends,
    plugins: eslintInfos.plugins,
  });
  await fs.writeFile(
    path.join(paths.project, `.eslintrc.${useModules ? 'c' : ''}js`),
    rendered,
  );
}
