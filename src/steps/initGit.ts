import { promises as fs } from 'fs';
import path from 'path';

import ejs from 'ejs';

import type { GeneralAnswers, Paths } from '../types';
import { EslintConfigAnswer, LanguageAnswer } from '../types';

import exec from '../utils/exec';
import getEslintConfigInfo from '../utils/getEslintConfig';
import noop from '../utils/noop';


export default async function initGit(paths: Paths, answers: GeneralAnswers): Promise<void> {
  // --- Init GIT ---
  await exec('git init', { cwd: paths.project });

  // Generate .gitignore
  const hasBuildDir = answers.language === LanguageAnswer.Babel || answers.language === LanguageAnswer.Typecript;
  const template = await fs.readFile(path.join(paths.dataDir, 'gitignore.ejs'));
  const rendered = ejs.render(template.toString(), { hasBuildDir });
  await fs.writeFile(paths.dest.gitignore, rendered);

  // Generate .gitattributes
  await fs.copyFile(
    path.join(paths.dataDir, 'gitattributes'),
    path.join(paths.project, '.gitattributes'),
  );

  // --- Init GitHub ---
  await fs.mkdir(paths.dest.githubFolder);

  // Generate issue templates
  await fs.mkdir(paths.dest.issueTemplateFolder);
  await fs.copyFile(
    path.join(paths.data.issueTemplateFolder, 'bug_report.md'),
    path.join(paths.dest.issueTemplateFolder, 'bug_report.md'),
  );
  await fs.copyFile(
    path.join(paths.data.issueTemplateFolder, 'feature_request.md'),
    path.join(paths.dest.issueTemplateFolder, 'feature_request.md'),
  );

  // Generate lint action
  if (answers.eslint !== EslintConfigAnswer.None) {
    await fs.mkdir(path.join(paths.dest.githubFolder, 'workflows'));

    const dependencies = [
      ...getEslintConfigInfo(answers.eslint).plugins,
      ...(answers.babel ? ['@babel/eslint-parser', '@babel/core'] : []),
    ];

    let lintActionContent: string = await fs.readFile(paths.data.lintAction, { encoding: 'utf-8' });
    lintActionContent = dependencies.length > 0
      ? lintActionContent.replace('<PLUGINS_LIST>', dependencies.join(' '))
      : lintActionContent.replace(/^ *- name: Install ESLint Configs and Plugins(?:.|\n)*<PLUGINS_LIST>\n\n/gimu, '');
    await fs.writeFile(paths.dest.lintAction, lintActionContent);
  }

  // Generate build action
  if (answers.language === LanguageAnswer.Typecript || answers.language === LanguageAnswer.Babel) {
    await fs.mkdir(path.join(paths.dest.githubFolder, 'workflows')).catch(noop);

    const buildActionContent: string = await fs.readFile(paths.data.buildAction, { encoding: 'utf-8' });
    await fs.writeFile(paths.dest.buildAction, buildActionContent);
  }

  // Generate CHANGELOG.md
  await fs.copyFile(
    path.join(paths.dataDir, 'CHANGELOG.md'),
    path.join(paths.project, 'CHANGELOG.md'),
  );

  // Generate CONTRIBUTING.md
  await fs.copyFile(
    path.join(paths.dataDir, 'CONTRIBUTING.md'),
    path.join(paths.project, 'CONTRIBUTING.md'),
  );
}
