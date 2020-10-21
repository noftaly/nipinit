import { promises as fs } from 'fs';
import path from 'path';

import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import editJson from 'edit-json-file';
import inquirer, { QuestionCollection } from 'inquirer';
import ora from 'ora';

import FilesData from './FilesData';
import logger from './Logger';
import PresetCommand from './PresetCommand';
import PresetManager from './PresetManager';
import { EslintConfigAnswer } from './models/ChoiceAnswers';
import { Paths } from './models/Paths';
import { StoredPreset } from './models/Preset';
import { GeneralAnswers, PresetCreationAnswers, ProjectNameAnswers } from './models/PromptAnswers';
import * as generalPrompts from './prompts/generalPrompts';
import * as presetPrompts from './prompts/presetPrompts';
import * as steps from './steps';
import structuredClone from './utils/structuredClone';

export default class CLI {
  presetManager = new PresetManager();
  presetCommand = new PresetCommand(this.presetManager);

  get projectNameQuestions(): QuestionCollection<ProjectNameAnswers> {
    return [generalPrompts.projectName];
  }

  get generalQuestions(): QuestionCollection<GeneralAnswers> {
    return [
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
  }

  async createNewPreset(generalAnswers: GeneralAnswers): Promise<void> {
    const questions: QuestionCollection<PresetCreationAnswers> = [
      presetPrompts.save,
      presetPrompts.presetName(this.presetManager, generalAnswers),
    ];
    const answers: PresetCreationAnswers = await inquirer.prompt(questions);
    if (answers.save) {
      // Exclude the project name from the answer, to create a preset.
      const { projectName, ...configuration } = structuredClone<GeneralAnswers>(generalAnswers);
      this.presetManager.addPreset({ ...configuration, name: answers.presetName });
    }
  }

  async generateProject(answers: GeneralAnswers, install: boolean): Promise<void> {
    const spinner = ora('Creating directory').start();

    const filesData = new FilesData(
      answers.eslint,
      answers.babel,
      answers.module,
      answers.projectName,
      answers.userName,
      answers.license,
    );
    const paths: Paths = steps.getPaths(answers.projectName);

    // Create project directory
    await fs.mkdir(paths.project);

    spinner.text = 'Initializing git';
    if (answers.git)
      await steps.initGit(paths, filesData);

    spinner.text = 'Creating github files';
    if (answers.github)
      await steps.initGithub(paths, answers);

    spinner.text = 'Initializing NPM';
    let editablePackageJson = await steps.initNpm(paths, answers);

    spinner.text = 'Create the license';
    await steps.createLicense(answers, editablePackageJson, paths);

    spinner.text = 'Installing babel';
    if (answers.babel)
      await steps.installBabel(paths, install, filesData);

    spinner.text = 'Installing ESLint and its dependencies';
    if (answers.eslint !== EslintConfigAnswer.None)
      await steps.installEslint(answers, paths, install, filesData);

    spinner.text = 'Installing other dependencies';
    await steps.installOtherDependencies(paths, answers, install, filesData);

    editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });

    spinner.text = 'Adding the last files';
    await steps.createOtherFiles(filesData, paths, editablePackageJson);

    spinner.text = 'Configuring modules';
    if (answers.module)
      steps.configureModule(editablePackageJson);

    spinner.text = 'Configuring scripts';
    steps.configureScripts(editablePackageJson, answers);

    spinner.succeed('Finished successfully!');

    logger.log(stripIndent`
      \n\n
      ${chalk.green.bold('➜')} ${chalk.underline.bold('Your project has been created successully!')}
      You can find it at ${chalk.cyan(`./${answers.projectName}/`)}!

      ${chalk.bold('There is a few more things you may want to do to be ready...')}
          ${chalk.grey('-')} Set the contact method in CONTRIBUTING.md (search for "[INSERT CONTACT METHOD]")
          ${chalk.grey('-')} Update the scripts in package.json to your liking or to use modules you want
          ${chalk.grey('-')} Add/fill/update some package.json entries, such as the repo, the description, keywords...
          ${chalk.grey('-')} Update the TO-DO in README.md

      ${chalk.green('Have fun!')}
    `);
  }

  async startPrompting(presetArgument: string, installArgument: boolean): Promise<void> {
    // If a preset is provided, we try to find it and create the project with it
    if (presetArgument) {
      const preset = this.presetManager.findByName(presetArgument);
      if (!preset) {
        logger.error('This preset does not exist!');
        logger.log(`    Run ${chalk.grey('nipinit presets ls')} to see all available presets.`);
        return;
      }

      const answers: ProjectNameAnswers = await inquirer.prompt(this.projectNameQuestions);
      this.generateProject({ ...preset, projectName: answers.projectName }, installArgument);
    } else {
      const answers: GeneralAnswers = await inquirer.prompt(this.generalQuestions);

      const samePreset: StoredPreset = this.presetManager.findSame(answers);
      if (samePreset) {
        logger.log('');
        logger.info(`The exact same preset is already saved under the name ${chalk.yellow(samePreset.name)}.`);
        logger.log(`    Use ${chalk.grey(`nipinit -p ${samePreset.name}`)} to use it directly, next time!`);
        logger.log('');
      } else {
        await this.createNewPreset(answers);
      }

      this.generateProject(answers, installArgument);
    }
  }
}
