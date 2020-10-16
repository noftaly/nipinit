import { promises as fs } from 'fs';
import path from 'path';

import getEslintConfig from '../getEslintConfig.js';


async function initGithub(paths, answers) {
  await fs.mkdir(paths.dest.ghFolder);

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
  if (answers.eslint !== "I don't want to use ESLint") {
    await fs.mkdir(path.join(paths.dest.ghFolder, 'workflows'));
    const lintActionContent = (await fs.readFile(paths.data.lintAction, { encoding: 'utf-8' }))
      .replace('<PLUGINS_LIST>', getEslintConfig(answers.eslint).plugins);
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
