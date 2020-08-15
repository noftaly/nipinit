#!/usr/bin/env node

import fsSync, { promises as fs } from 'fs';
import { createRequire } from 'module';
import path from 'path';

import chalk from 'chalk';
import commander from 'commander';
import commontags from 'common-tags';
import editJson from 'edit-json-file';
import inquirer from 'inquirer';
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


const { stripIndent } = commontags;
const { program } = commander;
const require = createRequire(import.meta.url);

// eslint-disable-next-line import/no-commonjs
const pkg = require('../package.json');

const logger = new Logger();

async function generateProject(answers, install, usedPreset) {
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
    logger.info(`The exact same preset is already saved under the name ${chalk.yellow(samePreset[0].name)}.`);
    logger.log(`    Use ${chalk.grey(`nipinit -p ${samePreset[0].name}`)} to use it directly, next time!`);
    logger.log('');
  }
  logger.log(stripIndent`
    ${chalk.green.bold('➜')} ${chalk.underline.bold('Your project has been created successully!')}
    You can find it at ${chalk.cyan(`./${answers.projectName}/`)}!

    ${chalk.bold('There is a few more things you may want to do to be ready...')}
        ${chalk.grey('-')} Set the contact method in CONTRIBUTING.md (search for "[INSERT CONTACT METHOD]")
        ${chalk.grey('-')} Update the scripts in package.json to your linking or to use module you want
        ${chalk.grey('-')} Add/fill/update some package.json entries, such as the repo, the description, keywords...
        ${chalk.grey('-')} Update the TO-DO in README.md
  `);

  logger.log(chalk.green('Have fun!'));
}

async function presetList() {
  const presets = await db.get('presets').value();
  if (presets.length === 0) {
    logger.error('No presets found for nipinit.');
  } else {
    logger.log(chalk.bold.underline(`Found ${presets.length} presets for nipinit:`));
    for (const preset of presets) {
      logger.log(`  ${chalk.grey('-')} ${preset.name}`);
    }
    logger.log(chalk.italic(`You can have more informations about a preset with ${chalk.grey('nipinit presets info <preset>')}`));
  }
}

async function presetRemove(name) {
  const preset = await db.get('presets')
    .find({ name })
    .value();
  if (!preset) {
    logger.error(`The preset ${name} does not exist.`);
  } else {
    await db.get('presets')
      .remove({ name: preset.name })
      .write();
    logger.success(`The presets ${preset.name} was deleted successfully!`);
  }
}

async function presetInfo(name) {
  const preset = await db.get('presets')
    .find({ name })
    .value();
  if (!preset) {
    logger.error(`The preset ${name} does not exist.`);
  } else {
    logger.log(stripIndent`
      ${chalk.bold.underline(`Informations about the preset ${chalk.cyan(preset.name)}:`)}
        ${chalk.grey('-')} User Name: ${chalk.cyan(preset.userName)}
        ${chalk.grey('-')} Init Git: ${preset.git ? chalk.green('Yes') : chalk.red('No')}
          ${preset.git ? `${chalk.grey('-')} Init Github files: ${preset.github ? chalk.green('Yes') : chalk.red('No')}` : ''}
        ${chalk.grey('-')} License: ${chalk.cyan(preset.license)}
        ${chalk.grey('-')} Use ES Modules: ${preset.module ? chalk.green('Yes') : chalk.red('No')}
        ${chalk.grey('-')} Use babel: ${preset.babel ? chalk.green('Yes') : chalk.red('No')}
        ${chalk.grey('-')} Use ESLint: ${preset.eslint !== "I don't want to use ESLint" ? chalk.green('Yes') : chalk.red('No')}
          ${preset.eslint !== "I don't want to use ESLint" ? `${chalk.grey('-')} ESLint preseturation: ${chalk.cyan(preset.eslint)}` : ''}
    `);
  }
}

async function startPrompting(presetArgument, installArgument) {
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
      logger.error('This preset does not exist!');
      logger.log(`    Run ${chalk.grey('nipinit presets ls')} to see all available presets.`);
    } else {
      generateProject(preset, installArgument, true);
    }
  } else {
    inquirer
      .prompt(questions)
      .then(answers => generateProject(answers, installArgument, false))
      .catch(handleError);
  }
}

program
  .version(pkg.version, '-v, --version', 'Output the nipinit version')
  .option('-p, --presets <string>', 'Create a new project with a preset')
  .option('--no-modules', 'Create a new project without installing node modules')
  .option('--no-color', 'Create a new project without showing colors in the CLI')
  .action((options, command) => {
    if (!command) {
      const preset = options.presets;
      const install = options.modules;
      startPrompting(preset, install);
    }
  });

const presetsCmd = program.command('presets').description('Manage presets');
presetsCmd
  .command('ls')
  .description('List all existing presets')
  .action(presetList);
presetsCmd
  .command('info <preset>')
  .description('Get informations about a preset')
  .action(presetInfo);
presetsCmd
  .command('remove <preset>')
  .alias('rem')
  .description('Remove a preset')
  .action(presetRemove);

program.parse(process.argv);
