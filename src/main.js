#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

import chalk from 'chalk';
import editJson from 'edit-json-file';
import inquirer from 'inquirer';
import minimist from 'minimist';
import ora from 'ora';

import db from './database.js';
import handleError from './handleError.js';
import {
  searchForSameConfig,
  getPaths,
  initGit,
  initGithub,
  initNpm,
  createLicense,
  installBabel,
  installESLint,
  installOtherDeps,
  createOtherFiles,
  configureModule,
  configureScripts,
} from './steps.js';

const argv = minimist(process.argv.slice(2));
const install = false;

async function generateProject(answers, usedConfig = false) {
  console.log('DEBUG: generateProject -> projectName', answers.projectName, typeof answers.projectName);
  const sameConfig = await searchForSameConfig(answers);

  const spinner = ora('Creating directory').start();

  const paths = getPaths(answers.projectName);
  const editablePackageJson = editJson(path.join(paths.project, 'package.json'));

  // Create project directory
  await fs.mkdir(paths.project);

  // Initialise git
  spinner.text = 'Initializing git';
  if (answers.git)
    await initGit(paths);

  // Initialise .github folder
  spinner.text = 'Creating github files';
  if (answers.github)
    await initGithub(paths, answers);

  // Initialise NPM
  spinner.text = 'Initializing npm';
  await initNpm(paths, answers, editablePackageJson);

  // Set license
  spinner.text = 'Create the license';
  await createLicense(answers, editablePackageJson, paths);

  // Add babel
  spinner.text = 'Installing babel';
  if (answers.babel)
    await installBabel(paths, install);

  // Add eslint
  spinner.text = 'Installing ESLint';
  if (answers.eslint !== "I don't want to use ESLint")
    installESLint(answers, paths, install);

  // Add other dependencies (nodemon...)
  spinner.text = 'Installing other dependencies';
  await installOtherDeps(paths, install);

  // Add other files (editorconfig, README...)
  spinner.text = 'Adding the last files';
  await createOtherFiles(answers, paths, editablePackageJson);

  // Update module type
  spinner.text = 'Configuring modules';
  if (answers.module)
    configureModule(editablePackageJson);

  // Set the scripts
  spinner.text = 'Configuring scripts';
  configureScripts(editablePackageJson, answers);

  spinner.succeed('Finished successfully!');

  console.log('\n\n');
  if (sameConfig && !usedConfig) {
    console.log();
    console.log(`${chalk.black.bgCyan(' ℹ ')} The exact same config is already saved under the name ${chalk.yellow(sameConfig[0].name)}.`);
    console.log(`    Use ${chalk.grey(`nipinit -c ${sameConfig[0].name}`)} to use it directly, next time!`);
    console.log();
  }
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
}

if (argv._[0] === 'config') {
  if (argv._[1] === 'ls') {
    const configurations = await db.get('configurations').value();
    if (configurations.length === 0) {
      console.log(`${chalk.bgRed(' ✗ ')} No configuration found for nipinit.`);
    } else {
      console.log(chalk.bold.underline(`Found ${configurations.length} configurations for nipinit:`));
      for (const config of configurations) {
        console.log(`  ${chalk.grey('-')} ${config.name}`);
      }
      console.log(chalk.italic(`You can have more informations about a config with ${chalk.grey('nipinit config info <config>')}`));
    }
  } else if (argv._[1] === 'remove') {
    const config = await db.get('configurations')
      .find({ name: argv._[2] })
      .value();
    if (!config) {
      console.log(`${chalk.bgRed(' ✗ ')} The configuration ${argv._[2]} does not exist.`);
    } else {
      await db.get('configurations')
        .remove({ name: config.name })
        .write();
      console.log(`${chalk.bgGreen(' ✔ ')} The configuration ${config.name} was deleted successfully!`);
    }
  } else if (argv._[1] === 'info') {
    const config = await db.get('configurations')
      .find({ name: argv._[2] })
      .value();
    if (!config) {
      console.log(`${chalk.bgRed(' ✗ ')} The configuration ${argv._[2]} does not exist.`);
    } else {
      console.log(chalk.bold.underline(`Informations about the configuration ${chalk.cyan(config.name)}:`));
      console.log(`    ${chalk.grey('-')} User Name: ${chalk.cyan(config.userName)}`);
      console.log(`    ${chalk.grey('-')} Init Git: ${config.git ? chalk.green('Yes') : chalk.red('No')}`);
      if (config.git) console.log(`      ${chalk.grey('-')} Init Github files: ${config.github ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`    ${chalk.grey('-')} License: ${chalk.cyan(config.license)}`);
      console.log(`    ${chalk.grey('-')} Use ES Modules: ${config.module ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`    ${chalk.grey('-')} Use babel: ${config.babel ? chalk.green('Yes') : chalk.red('No')}`);
      console.log(`    ${chalk.grey('-')} Use ESLint: ${config.eslint !== "I don't want to use ESLint" ? chalk.green('Yes') : chalk.red('No')}`);
      if (config.eslint !== "I don't want to use ESLint") console.log(`      ${chalk.grey('-')} ESLint configuration: ${chalk.cyan(config.eslint)}`);
    }
  } else if (argv.h || argv.help) {
    console.log(`${chalk.bold('nipinit config')} allows you to manage the configurations.`);
    console.log();
    console.log('Available commands:');
    console.log(`  ${chalk.grey('-')} ${chalk.bold('nipinit config ls')} ${chalk.italic.grey('List all existing configurations')}`);
    console.log(`  ${chalk.grey('-')} ${chalk.bold('nipinit config info <config>')} ${chalk.italic.grey('Get informations about a configuration')}`);
    console.log(`  ${chalk.grey('-')} ${chalk.bold('nipinit config remove <config>')} ${chalk.italic.grey('Remove a configuration')}`);
  } else {
    console.log(`${chalk.bgRed(' ✗ ')} Unkown argument: "${argv._[1]}". Use ${chalk.grey('nipinit config --help')} for help`);
  }
} else {
  const configArgument = argv.c ?? argv.config;
  const questions = [
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
  ];

  if (configArgument) {
    const config = await db.get('configurations')
      .find({ name: configArgument })
      .value();

    const { projectName } = await inquirer
      .prompt(questions[0])
      .catch(handleError);
    config.projectName = projectName;

    if (!config) {
      console.log(`${chalk.bgRed(' ✗ ')} This configuration does not exist!`);
      console.log(`    Run ${chalk.grey('nipinit config ls')} to see all available configurations.`);
    } else {
      generateProject(config, true);
    }
  } else {
    inquirer
      .prompt(questions)
      .then((a) => {
        console.log('DEBUG: prompt -> projectName', a.projectName, typeof a.projectName);
        generateProject(a);
      })
      .catch(handleError);
  }
}
