import { promises as fs } from 'fs';
import path from 'path';

import { EslintConfigAnswer } from '../models/ChoiceAnswers';
import { Paths } from '../models/Paths';
import { GeneralAnswers } from '../models/PromptAnswers';
import getEslintConfigInfo from '../utils/getEslintConfig';


export default async function initGithub(paths: Paths, answers: GeneralAnswers): Promise<void> {
  await fs.mkdir(paths.dest.githubFolder);

  // Create issue templates
  await fs.mkdir(paths.dest.issueTemplateFolder);
  await fs.copyFile(
    path.join(paths.data.issueTemplateFolder, 'bug_report.md'),
    path.join(paths.dest.issueTemplateFolder, 'bug_report.md'),
  );
  await fs.copyFile(
    path.join(paths.data.issueTemplateFolder, 'feature_request.md'),
    path.join(paths.dest.issueTemplateFolder, 'feature_request.md'),
  );

  // Create lint action
  if (answers.eslint !== EslintConfigAnswer.None) {
    await fs.mkdir(path.join(paths.dest.githubFolder, 'workflows'));

    const dependencies = [
      ...getEslintConfigInfo(answers.eslint).plugins,
      ...(answers.babel ? ['@babel/eslint-parser', '@babel/core'] : []),
    ];

    let lintActionContent: string = await fs.readFile(paths.data.lintAction, { encoding: 'utf-8' });
    lintActionContent = dependencies.length > 0
      ? lintActionContent.replace('<PLUGINS_LIST>', dependencies.join(' '))
      : lintActionContent.replace(/^ *- name: Install ESLint Configs and Plugins(.|\n)*<PLUGINS_LIST>\n\n/gimu, '');
    await fs.writeFile(paths.dest.lintAction, lintActionContent);
  }

  // Create CHANGELOG.md
  await fs.copyFile(
    path.join(paths.dataDir, 'CHANGELOG.md'),
    path.join(paths.project, 'CHANGELOG.md'),
  );

  // Create CONTRIBUTING.md
  await fs.copyFile(
    path.join(paths.dataDir, 'CONTRIBUTING.md'),
    path.join(paths.project, 'CONTRIBUTING.md'),
  );
}
