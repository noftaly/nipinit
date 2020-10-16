import { promises as fs } from 'fs';
import path from 'path';

import commontags from 'common-tags';

import filesContent from '../../data/files.js';
import getEslintConfig from '../getEslintConfig.js';
import exec from '../utils/exec.js';


const { oneLine } = commontags;

async function installEsLint(answers, paths, install) {
  const useBabelParser = answers.babel;
  const useModules = answers.module;

  if (install) {
    if (getEslintConfig(answers.eslint).extends === 'eslint:recommended') {
      await exec('npm i -D eslint');
    } else {
      const fullName = `eslint-config-${getEslintConfig(answers.eslint).extends}`;

      if (process.platform === 'win32') {
        // FIXME: Find a better way to do this
        // FIXME: This won't work in npm < 5
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
    filesContent.eslint(getEslintConfig(answers.eslint).extends, useBabelParser, useModules),
  );
}

export default installEsLint;
