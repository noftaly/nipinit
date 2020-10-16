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

import logger from './Logger.js';
import Preset from './Preset.js';
import db from './database.js';
import {
  getPaths,
  initGit,
  initGithub,
  initNpm,
  createLicense,
  installBabel,
  installEslint,
  installOtherDependencies,
  createOtherFiles,
  configureModule,
  configureScripts,
} from './steps/index.js';
import handleError from './utils/handleError.js';
import structuredClone from './utils/structuredClone.js';


const { oneLineTrim, stripIndent } = commontags;
const { program } = commander;
const require = createRequire(import.meta.url);

// eslint-disable-next-line import/no-commonjs
const pkg = require('../package.json');


async function createNewPreset(answers) {
  const preferences = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'save',
      message: 'Do you want to save this preset?',
    }, {
      type: 'input',
      name: 'presetName',
      message: 'What name do you want to give to this preset?',
      default: async () => {
        let suffix = 1;
        let value = await db.get('presets')
          .find({ name: answers.userName })
          .value();
        while (value) {
          suffix++;
          // eslint-disable-next-line no-await-in-loop
          value = await db.get('presets')
            .find({ name: `${answers.userName}-${suffix}` })
            .value();
        }
        return oneLineTrim`
          ${answers.userName}
          ${suffix > 1 ? `-${suffix}` : ''}
        `;
      },
      when: prefs => prefs.save,
      validate: input => input.length > 0 || 'The preset name has to contain at least 1 character.',
    },
  ]).catch(handleError);

  if (preferences.save) {
    const clonedAnswers = structuredClone(answers);
    const preset = Object.assign(clonedAnswers, { name: preferences.presetName });
    delete preset.projectName;
    await db.get('presets')
      .push(preset)
      .write()
      .catch(handleError);
  }
  return true;
}

async function generateProject(answers, install, usedPreset) {
  const samePresetExists = usedPreset ? false : await Preset.findSame(answers);
  if (!samePresetExists && !usedPreset)
    await createNewPreset(answers);

  const spinner = ora('Creating directory').start();

  const paths = getPaths(answers.projectName);

  // Create project directory
  await fs.mkdir(paths.project);

  // Initialise git
  spinner.text = 'Initializing git';
  if (answers.git)
    await initGit(paths, answers);

  // Initialise .github folder
  spinner.text = 'Creating github files';
  if (answers.github)
    await initGithub(paths, answers);

  // Initialise NPM
  spinner.text = 'Initializing npm';
  let editablePackageJson = await initNpm(paths, answers);

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
    await installEslint(answers, paths, install);

  // Add other dependencies (nodemon...)
  spinner.text = 'Installing other dependencies';
  await installOtherDependencies(paths, answers, install);

  editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });

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
  if (samePresetExists) {
    logger.log('');
    logger.info(`The exact same preset is already saved under the name ${chalk.yellow(samePresetExists[0].name)}.`);
    logger.log(`    Use ${chalk.grey(`nipinit -p ${samePresetExists[0].name}`)} to use it directly, next time!`);
    logger.log('');
  }
  logger.log(stripIndent`
    ${chalk.green.bold('➜')} ${chalk.underline.bold('Your project has been created successully!')}
    You can find it at ${chalk.cyan(`./${answers.projectName}/`)}!

    ${chalk.bold('There is a few more things you may want to do to be ready...')}
        ${chalk.grey('-')} Set the contact method in CONTRIBUTING.md (search for "[INSERT CONTACT METHOD]")
        ${chalk.grey('-')} Update the scripts in package.json to your liking or to use modules you want
        ${chalk.grey('-')} Add/fill/update some package.json entries, such as the repo, the description, keywords...
        ${chalk.grey('-')} Update the TO-DO in README.md
  `);

  logger.log(chalk.green('Have fun!'));
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
    }, {
      type: 'checkbox',
      name: 'extras',
      message: 'What other modules would you like to install?',
      choices: ['nodemon', 'cross-env', 'concurrently'],
      default: ['nodemon', 'cross-env'],
    },
  ];

  if (presetArgument) {
    const preset = await db.get('presets')
      .find({ name: presetArgument })
      .value();
    if (!preset) {
      logger.error('This preset does not exist!');
      logger.log(`    Run ${chalk.grey('nipinit presets ls')} to see all available presets.`);
      return;
    }

    const { projectName } = await inquirer
      .prompt(questions[0])
      .catch(handleError);
    preset.projectName = projectName;

    generateProject(preset, installArgument, true);
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
    if (command) return;

    const preset = options.presets;
    const install = options.modules;
    startPrompting(preset, install);
  });

const presetsCmd = program.command('presets').description('Manage presets');
presetsCmd
  .command('ls')
  .description('List all existing presets')
  .action(Preset.getList);
presetsCmd
  .command('info <preset>')
  .description('Get informations about a preset')
  .action(Preset.getInfo);
presetsCmd
  .command('remove <preset>')
  .alias('rem')
  .description('Remove a preset')
  .action(Preset.remove);

program.parse(process.argv);
