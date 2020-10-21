#!/usr/bin/env node
/* eslint-disable node/shebang */

import { promises as fs } from 'fs';
import path from 'path';

import chalk from 'chalk';
import { program } from 'commander';
import { stripIndent } from 'common-tags';
import editJson from 'edit-json-file';
import inquirer, { QuestionCollection } from 'inquirer';
import ora from 'ora';

import * as pkg from '../package.json';
import FilesData from './FilesData';
import logger from './Logger';
import PresetManager from './PresetManager';
import { CLIOptions } from './models/CLIOptions';
import { EslintConfigAnswer } from './models/ChoiceAnswers';
import { Paths } from './models/Paths';
import { StoredPreset } from './models/Preset';
import { GeneralAnswers, PresetCreationAnswers } from './models/PromptAnswers';
import { getPresetList, getPresetInfo, removePreset } from './presetDisplay';
import * as generalPrompts from './prompts/generalPrompts';
import * as presetPrompts from './prompts/presetPrompts';
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
} from './steps/index';
import handleError from './utils/handleError';
import structuredClone from './utils/structuredClone';


const presetManager = new PresetManager();


async function createNewPreset(generalAnswers: GeneralAnswers) {
  const save = (presetName: string): void => {
    // FIXME: Improve this. (with destructuring?)
    const clonedAnswers = structuredClone<GeneralAnswers>(generalAnswers);
    delete clonedAnswers.projectName;
    const preset: StoredPreset = {
      ...clonedAnswers,
      name: presetName,
    };
    presetManager.addPreset(preset);
  };

  const questions: QuestionCollection = [
    presetPrompts.save,
    presetPrompts.presetName(presetManager, generalAnswers),
  ];
  await inquirer
    .prompt(questions)
    .then((answers: PresetCreationAnswers) => answers.save && save(answers.presetName))
    .catch(handleError);
}

async function generateProject(answers: GeneralAnswers, install: boolean) {
  const spinner = ora('Creating directory').start();

  const filesData = new FilesData(
    answers.eslint,
    answers.babel,
    answers.module,
    answers.projectName,
    answers.userName,
    answers.license,
  );
  const paths: Paths = getPaths(answers.projectName);

  // Create project directory
  await fs.mkdir(paths.project);

  // Initialise git
  spinner.text = 'Initializing git';
  if (answers.git)
    await initGit(paths, filesData);

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
    await installBabel(paths, install, filesData);

  // Add eslint
  spinner.text = 'Installing ESLint';
  if (answers.eslint !== EslintConfigAnswer.None)
    await installEslint(answers, paths, install, filesData);

  // Add other dependencies (nodemon...)
  spinner.text = 'Installing other dependencies';
  await installOtherDependencies(paths, answers, install, filesData);

  editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });

  // Add other files (editorconfig, README...)
  spinner.text = 'Adding the last files';
  await createOtherFiles(filesData, paths, editablePackageJson);

  // Update module type
  spinner.text = 'Configuring modules';
  if (answers.module)
    configureModule(editablePackageJson);

  // Set the scripts
  spinner.text = 'Configuring scripts';
  configureScripts(editablePackageJson, answers);

  spinner.succeed('Finished successfully!');

  logger.log('\n\n');
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

async function startPrompting(presetArgument: string, installArgument: boolean) {
  // If a preset is provided, we try to find it and create the project with it
  if (presetArgument) {
    const preset = presetManager.findByName(presetArgument);
    if (!preset) {
      logger.error('This preset does not exist!');
      logger.log(`    Run ${chalk.grey('nipinit presets ls')} to see all available presets.`);
      return;
    }

    const { projectName }: { projectName: string } = await inquirer.prompt([generalPrompts.projectName]);
    generateProject({ ...preset, projectName }, installArgument);
  } else {
    const questions: QuestionCollection<GeneralAnswers> = [
      generalPrompts.projectName,
      generalPrompts.userName,
      generalPrompts.git,
      generalPrompts.github,
      generalPrompts.license,
      generalPrompts.module,
      generalPrompts.babel,
      generalPrompts.eslint,
      generalPrompts.extras,
    ];

    const answers: GeneralAnswers = await inquirer.prompt(questions);

    const samePresetExists: StoredPreset = presetManager.findSame(answers);
    if (!samePresetExists) {
      await createNewPreset(answers);
    } else {
      logger.log('');
      logger.info(`The exact same preset is already saved under the name ${chalk.yellow(samePresetExists.name)}.`);
      logger.log(`    Use ${chalk.grey(`nipinit -p ${samePresetExists.name}`)} to use it directly, next time!`);
      logger.log('');
    }

    generateProject(answers, installArgument);
  }
}

program
  .version(pkg.version, '-v, --version', 'Output the nipinit version')
  .option('-p, --preset <string>', 'Create a new project with a preset')
  .option('--no-modules', 'Create a new project without installing node modules')
  .option('--no-color', 'Create a new project without showing colors in the CLI')
  .action((options: CLIOptions, command?: string) => {
    // If it is a subcommand, then stop here and let the other actions take care of it
    if (command) return;

    // Otherwise, start nipinit!
    const { preset, modules: install } = options;
    startPrompting(preset, install);
  });

const presetsCmd = program.command('presets').description('Manage presets');
presetsCmd
  .command('ls')
  .description('List all existing presets')
  .action(() => getPresetList(presetManager));
presetsCmd
  .command('info <preset>')
  .description('Get informations about a preset')
  .action((name: string) => getPresetInfo(name, presetManager));
presetsCmd
  .command('remove <preset>')
  .alias('rem')
  .description('Remove a preset')
  .action((name: string) => removePreset(name, presetManager));

program.parse(process.argv);
