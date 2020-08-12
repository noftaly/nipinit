#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import chalk from 'chalk';
import editJson from 'edit-json-file';
import inquirer from 'inquirer';
import ora from 'ora';

import filesContent from '../data/files.js';
import exec from './exec.js';
import getEslintConfig from './getEslintConfig.js';
import getLicense from './getLicense.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

const install = false;

inquirer
  .prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      validate: input => input.length > 0 || 'The project name has to contain at least 1 character.',
    }, {
      type: 'input',
      name: 'userName',
      message: 'What is your username?',
      validate: input => input.length > 0 || 'The user name has to contain at least 1 character.',
    }, {
      type: 'confirm',
      name: 'git',
      message: 'Would you like to init a git repository?',
      default: true,
    }, {
      type: 'confirm',
      name: 'github',
      message: "Would you like to add github's files? (.github folder)",
      default: true,
      when: answers => answers.git,
    }, {
      type: 'list',
      name: 'license',
      message: 'What license do you want to use?',
      choices: ['MIT', 'GPL-v3.0-only', 'ISC'],
      default: 'MIT',
    }, {
      type: 'confirm',
      name: 'module',
      message: 'Would you like to use modules (import/export)?',
      defualt: true,
    }, {
      type: 'confirm',
      name: 'babel',
      message: 'Would you like to use babel?',
      default: false,
    }, {
      type: 'list',
      name: 'eslint',
      message: 'What ESLint configuration do you want?',
      choices: ['noftalint', 'airbnb', 'standard', 'recommended', "I don't want to use ESLint"],
      default: 'noftalint',
    },
  ]).then(async (answers) => {
    const spinner = ora('Creating directory').start();

    const projectPath = path.join(process.cwd(), answers.projectName);
    const editablePackageJson = editJson(path.join(projectPath, 'package.json'));

    // Create project directory
    await fs.mkdir(projectPath);

    // Initialise git
    if (answers.git) {
      spinner.text = 'Initializing git';
      await exec('git init', { cwd: projectPath });
      await fs.writeFile(path.join(projectPath, '.gitignore'), filesContent.gitignore);
    }

    // Initialise .github folder
    if (answers.github) {
      spinner.text = 'Creating github files';
      const ghFolder = path.join(projectPath, '.github');
      const issueTemplateFolder = path.join(dataDir, '.github', 'ISSUE_TEMPLATE');
      await fs.mkdir(ghFolder);

      // Create issue templates
      await fs.mkdir(path.join(ghFolder, 'ISSUE_TEMPLATE'));
      await fs.copyFile(
        path.join(issueTemplateFolder, 'bug_report.md'),
        path.join(ghFolder, 'ISSUE_TEMPLATE', 'bug_report.md'));
      await fs.copyFile(
        path.join(issueTemplateFolder, 'feature_request.md'),
        path.join(ghFolder, 'ISSUE_TEMPLATE', 'feature_request.md'));

      // Create lint action
      await fs.mkdir(path.join(ghFolder, 'workflows'));
      const lintActionFile = path.join(dataDir, '.github', 'workflows', 'lint.yml');
      const lintActionContent = (await fs.readFile(lintActionFile, { encoding: 'utf-8' }))
        .replace('<PLUGINS_LIST>', getEslintConfig(answers.eslint).plugins);
      await fs.writeFile(path.join(ghFolder, 'workflows', 'lint.yml'), lintActionContent);

      // Create CHANGELOG.md
      await fs.copyFile(
        path.join(dataDir, 'CHANGELOG.md'),
        path.join(projectPath, 'CHANGELOG.md'));

      // Create CONTRIBUTING.md
      await fs.copyFile(
        path.join(dataDir, 'CONTRIBUTING.md'),
        path.join(projectPath, 'CONTRIBUTING.md'));
    }

    // Initialise NPM
    spinner.text = 'Initializing npm';
    await exec('npm init -y', { cwd: projectPath });
    editablePackageJson.set('author', answers.userName);

    // Set license
    spinner.text = 'Create the license';
    const license = await getLicense(answers.license, answers.userName, answers.projectName);
    editablePackageJson.set('license', answers.license);
    await fs.writeFile(path.join(projectPath, 'LICENSE'), license);

    // Add babel
    if (answers.babel) {
      spinner.text = 'Installing babel';
      if (install) await exec('npm i -D @babel/core @babel/node @babel/preset-env', { cwd: projectPath });
      await fs.writeFile(path.join(projectPath, '.babelrc'), filesContent.babel);
    }

    // Add eslint
    if (answers.eslint !== "I don't want to use ESLint") {
      spinner.text = 'Installing ESLint';
      if (install) await exec(`npm i -D eslint ${getEslintConfig(answers.eslint).plugins}`, { cwd: projectPath });
      await fs.writeFile(
        path.join(projectPath, '.eslintrc.js'),
        filesContent.eslint(getEslintConfig(answers.eslint).extends),
      );
    }

    // Add other dependencies (nodemon...)
    spinner.text = 'Installing nodemon';
    if (install) await exec('npm i -D nodemon', { cwd: projectPath });
    await fs.writeFile(path.join(projectPath, 'nodemon.json'), filesContent.nodemon);

    // Add other files (editorconfig, README...)
    spinner.text = 'Adding the last files';
    await fs.writeFile(path.join(projectPath, '.editorconfig'), filesContent.editorconfig);
    await fs.writeFile(path.join(projectPath, 'README.md'), filesContent.readme(answers.projectName, answers.userName));
    editablePackageJson.set('main', './src/main.js');

    // Update module type
    if (answers.module) {
      editablePackageJson.set('type', 'module');
      editablePackageJson.set('engines', { node: '>= 14.0.0' });
    }

    // Set the scripts
    editablePackageJson.set('scripts.start', `${answers.babel && 'babel-'}node ./src/main.js`);
    editablePackageJson.set('scripts.dev', `nodemon --exec ${answers.babel && 'babel-'}node ./src/main.js`);
    editablePackageJson.set('scripts.lint', 'eslint .');
    editablePackageJson.set('scripts.lint:fix', 'eslint . --fix');

    spinner.succeed('Finished successfully!');

    console.log('\n'.repeat(3));
    console.log(`${chalk.green.bold('➜')} ${chalk.underline.bold('Your project has been created successully!')}`);
    console.log(`You can find it at ${chalk.cyan(`./${answers.projectName}/`)}!`);
    console.log();
    console.log(chalk.bold('There is a few more things you may want to do to be ready...'));
    console.log(`    ${chalk.grey('-')} Set the contact method in CONTRIBUTING.md (search for "[INSERT CONTACT METHOD]")`);
    console.log(`    ${chalk.grey('-')} Update the scripts in package.json to your linking or to use module you want`);
    console.log(`    ${chalk.grey('-')} Add/fill/update some package.json entries, such as the repo, the description, keywords...`);
    console.log(`    ${chalk.grey('-')} Update the TO-DO in README.md`);
    console.log();
    console.log(chalk.green('Have fun!'));
  }).catch((error) => {
    console.error('An error occured while prompting questions');
    throw new Error(error);
  });
