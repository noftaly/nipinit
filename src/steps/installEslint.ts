import { promises as fs } from 'fs';
import path from 'path';

import { oneLine } from 'common-tags';

import FilesData from '../FilesData';
import getEslintConfigInfo from '../getEslintConfig';
import { Paths } from '../models/Paths';
import { GeneralAnswers } from '../models/PromptAnswers';
import exec from '../utils/exec';


async function installEsLint(
  answers: GeneralAnswers,
  paths: Paths,
  install: boolean,
  filesData: FilesData,
): Promise<void> {
  const useBabelParser = answers.babel;
  const useModules = answers.module;

  if (install) {
    if (getEslintConfigInfo(answers.eslint).extends === 'eslint:recommended') {
      await exec('npm i -D eslint');
    } else {
      const fullName = `eslint-config-${getEslintConfigInfo(answers.eslint).extends}`;

      // FIXME: Find a better way to do all of this
      if (process.platform === 'win32') {
        await exec(oneLine`
          npm i -D install-peerdeps
          && npx install-peerdeps --dev ${fullName}
          && npm uninstall install-peerdeps
        `);
      } else {
        await exec(oneLine`
          npm info "${fullName}@latest" peerDependencies --json
          | command sed 's/[\{\},]//g ; s/: /@/g'
          | xargs npm install --save-dev "${fullName}@latest"
        `, { cwd: paths.project });
      }
    }
    if (useBabelParser)
      await exec('npm i -D @babel/eslint-parser', { cwd: paths.project });
  }

  await fs.writeFile(
    path.join(paths.project, `.eslintrc.${useModules ? 'c' : ''}js`),
    filesData.getEslintConfig(),
  );
}

export default installEsLint;
