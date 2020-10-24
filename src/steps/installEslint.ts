import { promises as fs } from 'fs';
import path from 'path';

import { oneLine } from 'common-tags';

import FilesData from '../FilesData';
import { EslintConfigAnswer, Paths, GeneralAnswers } from '../types';
import exec from '../utils/exec';
import getEslintConfigInfo from '../utils/getEslintConfig';


export default async function installEsLint(
  answers: GeneralAnswers,
  paths: Paths,
  install: boolean,
  filesData: FilesData,
): Promise<void> {
  const useBabelParser = answers.babel;
  const useModules = answers.module;

  if (install) {
    if (answers.eslint === EslintConfigAnswer.Recommended) {
      await exec('npm i -D eslint', { cwd: paths.project });
    } else {
      const fullName = `eslint-config-${getEslintConfigInfo(answers.eslint).extends}`;

      // FIXME: Find a better way to install peer-dependencies
      const command = process.platform === 'win32'
        ? oneLine`
            npm i -D install-peerdeps
            && npx install-peerdeps --dev ${fullName}
            && npm uninstall install-peerdeps
          `
        : oneLine`
            npm info "${fullName}@latest" peerDependencies --json
            | command sed 's/[\{\},]//g ; s/: /@/g'
            | xargs npm install --save-dev "${fullName}@latest"
          `;
      exec(command, { cwd: paths.project });
    }
    if (useBabelParser)
      await exec('npm i -D @babel/eslint-parser', { cwd: paths.project });
  }

  await fs.writeFile(
    path.join(paths.project, `.eslintrc.${useModules ? 'c' : ''}js`),
    filesData.getEslintConfig(),
  );
}
