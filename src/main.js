#!/usr/bin/env node

import fsSync, { promises as fs } from 'fs';
import path from 'path';

import chalk from 'chalk';
import editJson from 'edit-json-file';
import inquirer from 'inquirer';
import minimist from 'minimist';
import ora from 'ora';

import Logger from './Logger.js';
import db from './database.js';
import handleError from './handleError.js';
import {
  searchForSamePreset,
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
const logger = new Logger();
const install = false;

async function generateProject(answers, usedPreset = false) {
  const samePreset = await searchForSamePreset(answers);

  const spinner = ora('Creating directory').start();

  const paths = getPaths(answers.projectName);
  const editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });

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

  logger.log('\n\n');
  if (samePreset && !usedPreset) {
    logger.log('');
    logger.log(`${chalk.black.bgCyan(' ℹ ')} The exact same preset is already saved under the name ${chalk.yellow(samePreset[0].name)}.`);
    logger.log(`    Use ${chalk.grey(`nipinit -p ${samePreset[0].name}`)} to use it directly, next time!`);
    logger.log('');
  }
  logger.log(`${chalk.green.bold('➜')} ${chalk.underline.bold('Your project has been created successully!')}`);
  logger.log(`You can find it at ${chalk.cyan(`./${answers.projectName}/`)}!`);
  logger.log('');
  logger.log(chalk.bold('There is a few more things you may want to do to be ready...'));
  logger.log(`    ${chalk.grey('-')} Set the contact method in CONTRIBUTING.md (search for "[INSERT CONTACT METHOD]")`);
  logger.log(`    ${chalk.grey('-')} Update the scripts in package.json to your linking or to use module you want`);
  logger.log(`    ${chalk.grey('-')} Add/fill/update some package.json entries, such as the repo, the description, keywords...`);
  logger.log(`    ${chalk.grey('-')} Update the TO-DO in README.md`);
  logger.log('');
  logger.log(chalk.green('Have fun!'));
}

if (argv._[0] === 'presets') {
  if (argv._[1] === 'ls') {
    const presets = await db.get('presets').value();
    if (presets.length === 0) {
      logger.log(`${chalk.bgRed(' ✗ ')} No presets found for nipinit.`);
    } else {
      logger.log(chalk.bold.underline(`Found ${presets.length} presets for nipinit:`));
      for (const preset of presets) {
        logger.log(`  ${chalk.grey('-')} ${preset.name}`);
      }
      logger.log(chalk.italic(`You can have more informations about a preset with ${chalk.grey('nipinit presets info <preset>')}`));
    }
  } else if (argv._[1] === 'remove') {
    const preset = await db.get('presets')
      .find({ name: argv._[2] })
      .value();
    if (!preset) {
      logger.log(`${chalk.bgRed(' ✗ ')} The preset ${argv._[2]} does not exist.`);
    } else {
      await db.get('presets')
        .remove({ name: preset.name })
        .write();
      logger.log(`${chalk.bgGreen(' ✔ ')} The presets ${preset.name} was deleted successfully!`);
    }
  } else if (argv._[1] === 'info') {
    const preset = await db.get('presets')
      .find({ name: argv._[2] })
      .value();
    if (!preset) {
      logger.log(`${chalk.bgRed(' ✗ ')} The preset ${argv._[2]} does not exist.`);
    } else {
      logger.log(chalk.bold.underline(`Informations about the preset ${chalk.cyan(preset.name)}:`));
      logger.log(`    ${chalk.grey('-')} User Name: ${chalk.cyan(preset.userName)}`);
      logger.log(`    ${chalk.grey('-')} Init Git: ${preset.git ? chalk.green('Yes') : chalk.red('No')}`);
      if (preset.git) logger.log(`      ${chalk.grey('-')} Init Github files: ${preset.github ? chalk.green('Yes') : chalk.red('No')}`);
      logger.log(`    ${chalk.grey('-')} License: ${chalk.cyan(preset.license)}`);
      logger.log(`    ${chalk.grey('-')} Use ES Modules: ${preset.module ? chalk.green('Yes') : chalk.red('No')}`);
      logger.log(`    ${chalk.grey('-')} Use babel: ${preset.babel ? chalk.green('Yes') : chalk.red('No')}`);
      logger.log(`    ${chalk.grey('-')} Use ESLint: ${preset.eslint !== "I don't want to use ESLint" ? chalk.green('Yes') : chalk.red('No')}`);
      if (preset.eslint !== "I don't want to use ESLint") logger.log(`      ${chalk.grey('-')} ESLint preseturation: ${chalk.cyan(preset.eslint)}`);
    }
  } else if (argv.h || argv.help) {
    logger.log(`${chalk.bold('nipinit presets')} allows you to manage the presets.`);
    logger.log('');
    logger.log('Available commands:');
    logger.log(`  ${chalk.grey('-')} ${chalk.bold('nipinit presets ls')} ${chalk.italic.grey('List all existing presets')}`);
    logger.log(`  ${chalk.grey('-')} ${chalk.bold('nipinit presets info <preset>')} ${chalk.italic.grey('Get informations about a preset')}`);
    logger.log(`  ${chalk.grey('-')} ${chalk.bold('nipinit presets remove <preset>')} ${chalk.italic.grey('Remove a preset')}`);
  } else {
    logger.log(`${chalk.bgRed(' ✗ ')} Unkown argument: "${argv._[1]}". Use ${chalk.grey('nipinit presets --help')} for help`);
  }
} else if (argv._[0] === 'help') {
  logger.log(`${chalk.bold('Usage:')} nipinit`);
  logger.log('');
  logger.log(chalk.bold('Arguments:'));
  logger.log('  presets [string]         Manage presets');
  logger.log('  help                     Print this page');
  logger.log('');
  logger.log(chalk.bold('Options:'));
  logger.log('  --presets, -p [string]   Create a new project with a preset');
  logger.log('  --no-color               Create a new project without showing colors in the CLI');
  logger.log('');
  logger.log(chalk.bold('Examples:'));
  logger.log('  $ nipinit');
  logger.log('  $ nipinit --preset myPreset --no-color');
  logger.log('  $ nipinit presets --help');
  logger.log('  $ nipinit presets remove myPresets');
} else {
  const presetArgument = argv.p ?? argv.preset;
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      validate(input) {
        const done = this.async();
        if (input.length === 0)
          return done('The project name has to contain at least 1 character.');
        if (fsSync.existsSync(path.join(process.cwd(), input)))
          return done('This folder already exist.');
        return done(null, true);
      },
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

  if (presetArgument) {
    const preset = await db.get('presets')
      .find({ name: presetArgument })
      .value();

    const { projectName } = await inquirer
      .prompt(questions[0])
      .catch(handleError);
    preset.projectName = projectName;

    if (!preset) {
      logger.log(`${chalk.bgRed(' ✗ ')} This preset does not exist!`);
      logger.log(`    Run ${chalk.grey('nipinit presets ls')} to see all available presets.`);
    } else {
      generateProject(preset, true);
    }
  } else {
    inquirer
      .prompt(questions)
      .then(generateProject)
      .catch(handleError);
  }
}
