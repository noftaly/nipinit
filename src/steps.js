import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import commontags from 'common-tags';
import inquirer from 'inquirer';

import filesContent from '../data/files.js';
import db from './database.js';
import exec from './exec.js';
import getEslintConfig from './getEslintConfig.js';
import getLicense from './getLicense.js';
import handleError from './handleError.js';
import structuredClone from './structuredClone.js';


const { oneLineTrim } = commontags;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function searchForSameConfig(answers) {
  const sameConfig = await db.get('configurations').findSame(answers).value();

  if (!sameConfig) {
    const preferences = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'save',
        message: 'Do you want to save this configuration?',
      }, {
        type: 'input',
        name: 'configName',
        message: 'What name do you want to give to this config?',
        default: async () => {
          let suffix = 1;
          let value = await db.get('configurations')
            .find({ name: answers.userName })
            .value();
          while (value) {
            suffix++;
            // eslint-disable-next-line no-await-in-loop
            value = await db.get('configurations')
              .find({ name: `${answers.userName}-${suffix}` })
              .value();
          }
          return oneLineTrim`
            ${answers.userName}
            ${suffix > 1 ? `-${suffix}` : ''}
          `;
        },
        when: prefs => prefs.save,
        validate: input => input.length > 0 || 'The config name has to contain at least 1 character.',
      },
    ]).catch(handleError);

    if (preferences.save) {
      const clonedAnswers = structuredClone(answers);
      const config = Object.assign(clonedAnswers, { name: preferences.configName });
      delete config.projectName;
      await db.get('configurations')
        .push(config)
        .write()
        .catch(handleError);
    }
  }
  return sameConfig;
}

export function getPaths(projectName) {
  const paths = {};
  paths.project = path.join(process.cwd(), projectName);
  paths.dataDir = path.join(__dirname, '..', 'data');
  paths.dest = {};
  paths.data = {};
  paths.dest.gitignore = path.join(paths.project, '.gitignore');
  paths.dest.ghFolder = path.join(paths.project, '.github');
  paths.dest.issueTemplateFolder = path.join(paths.dest.ghFolder, 'ISSUE_TEMPLATE');
  paths.data.issueTemplateFolder = path.join(paths.dataDir, '.github', 'ISSUE_TEMPLATE');
  paths.data.lintAction = path.join(paths.dataDir, '.github', 'workflows', 'lint.yml');
  paths.dest.lintAction = path.join(paths.dest.ghFolder, 'workflows', 'lint.yml');
  return paths;
}

export async function initGit(paths) {
  await exec('git init', { cwd: paths.project });
  await fs.writeFile(paths.dest.gitignore, filesContent.gitignore);
}

export async function initGithub(paths, answers) {
  await fs.mkdir(paths.dest.ghFolder);

  // Create issue templates
  await fs.mkdir(paths.dest.issueTemplateFolder);
  await fs.copyFile(
    path.join(paths.data.issueTemplateFolder, 'bug_report.md'),
    path.join(paths.dest.issueTemplateFolder, 'bug_report.md'));
  await fs.copyFile(
    path.join(paths.data.issueTemplateFolder, 'feature_request.md'),
    path.join(paths.dest.issueTemplateFolder, 'feature_request.md'));

  // Create lint action
  await fs.mkdir(path.join(paths.dest.ghFolder, 'workflows'));
  const lintActionContent = (await fs.readFile(paths.data.lintAction, { encoding: 'utf-8' }))
    .replace('<PLUGINS_LIST>', getEslintConfig(answers.eslint).plugins);
  await fs.writeFile(paths.dest.lintAction, lintActionContent);

  // Create CHANGELOG.md
  await fs.copyFile(
    path.join(paths.dataDir, 'CHANGELOG.md'),
    path.join(paths.project, 'CHANGELOG.md'));

  // Create CONTRIBUTING.md
  await fs.copyFile(
    path.join(paths.dataDir, 'CONTRIBUTING.md'),
    path.join(paths.project, 'CONTRIBUTING.md'));
}

export async function initNpm(paths, answers, editablePackageJson) {
  await exec('npm init -y', { cwd: paths.project });
  editablePackageJson.set('author', answers.userName);
}

export async function createLicense(answers, editablePackageJson, paths) {
  const license = await getLicense(answers.license, answers.userName, answers.projectName);
  editablePackageJson.set('license', answers.license);
  await fs.writeFile(path.join(paths.project, 'LICENSE'), license);
}

export async function installBabel(paths, install) {
  if (install) await exec('npm i -D @babel/core @babel/node @babel/preset-env', { cwd: paths.project });
  await fs.writeFile(path.join(paths.project, '.babelrc'), filesContent.babel);
}

export async function installESLint(answers, paths, install) {
  if (install) await exec(`npm i -D eslint ${getEslintConfig(answers.eslint).plugins}`, { cwd: paths.project });
  await fs.writeFile(
    path.join(paths.project, '.eslintrc.js'),
    filesContent.eslint(getEslintConfig(answers.eslint).extends),
  );
}

export async function installOtherDeps(paths, install) {
  if (install) await exec('npm i -D nodemon', { cwd: paths.project });
  await fs.writeFile(path.join(paths.project, 'nodemon.json'), filesContent.nodemon);
}

export async function createOtherFiles(answers, paths, editablePackageJson) {
  await fs.writeFile(path.join(paths.project, '.editorconfig'), filesContent.editorconfig);
  await fs.writeFile(path.join(paths.project, 'README.md'), filesContent.readme(answers.projectName, answers.userName));
  editablePackageJson.set('main', './src/main.js');
}

export function configureModule(editablePackageJson) {
  editablePackageJson.set('type', 'module');
  editablePackageJson.set('engines', { node: '>= 14.0.0' });
}

export function configureScripts(editablePackageJson, answers) {
  editablePackageJson.set('scripts.start', `${answers.babel && 'babel-'}node ./src/main.js`);
  editablePackageJson.set('scripts.dev', `nodemon --exec ${answers.babel && 'babel-'}node ./src/main.js`);
  editablePackageJson.set('scripts.lint', 'eslint .');
  editablePackageJson.set('scripts.lint:fix', 'eslint . --fix');
}
