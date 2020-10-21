import { promises as fs } from 'fs';
import path from 'path';

import getEslintConfigInfo from '../getEslintConfig';
import { EslintConfigAnswer } from '../models/ChoiceAnswers';
import { Paths } from '../models/Paths';
import { GeneralAnswers } from '../models/PromptAnswers';


async function initGithub(paths: Paths, answers: GeneralAnswers): Promise<void> {
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
    const lintActionContent = (await fs.readFile(paths.data.lintAction, { encoding: 'utf-8' }))
      .replace('<PLUGINS_LIST>', getEslintConfigInfo(answers.eslint).plugins);
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

export default initGithub;
