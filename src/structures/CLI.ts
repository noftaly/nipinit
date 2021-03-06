import { promises as fs } from 'fs';
import path from 'path';

import chalk from 'chalk';
import { stripIndent } from 'common-tags';
import editJson from 'edit-json-file';
import type { Question } from 'inquirer';
import inquirer from 'inquirer';
import ora from 'ora';

import * as generalPrompts from '../prompts/generalPrompts';
import * as presetPrompts from '../prompts/presetPrompts';
import * as steps from '../steps';
import type {
  GeneralAnswers,
  Paths,
  PresetCreationAnswers,
  ProjectNameAnswers,
  StoredPreset,
} from '../types';
import { EslintConfigAnswer, LanguageAnswer } from '../types';

import getPaths from '../utils/getPaths';
import structuredClone from '../utils/structuredClone';
import * as Logger from './Logger';
import PresetCommand from './PresetCommand';
import PresetManager from './PresetManager';

export default class CLI {
  public readonly presetManager = new PresetManager();
  public readonly presetCommand = new PresetCommand(this.presetManager);

  public get projectNameQuestions(): Array<Question<ProjectNameAnswers>> {
    return [generalPrompts.projectName];
  }

  public get generalQuestions(): Array<Question<GeneralAnswers>> {
    return [
      generalPrompts.projectName,
      generalPrompts.userName,
      generalPrompts.git,
      generalPrompts.license,
      generalPrompts.language,
      generalPrompts.eslint,
      generalPrompts.extras,
    ];
  }

  public async startPrompting(presetArgument: string, installArgument: boolean): Promise<void> {
    // If a preset is provided, we try to find it and create the project with it
    if (presetArgument) {
      const preset = this.presetManager.findByName(presetArgument);
      if (!preset) {
        Logger.error('This preset does not exist!');
        Logger.log(`    Run ${chalk.grey('nipinit presets ls')} to see all available presets.`);
        return;
      }

      const answers: ProjectNameAnswers = await inquirer.prompt(this.projectNameQuestions);
      await this.generateProject({ ...preset, projectName: answers.projectName }, installArgument);
    } else {
      const generalAnswers: GeneralAnswers = await inquirer.prompt(this.generalQuestions);

      const samePreset: StoredPreset = this.presetManager.findSame(generalAnswers);
      if (samePreset) {
        Logger.log('');
        Logger.info(`The exact same preset is already saved under the name ${chalk.yellow(samePreset.name)}.`);
        Logger.log(`    Use ${chalk.grey(`nipinit -p ${samePreset.name}`)} to use it directly, next time!`);
        Logger.log('');
      } else {
        const questions: Array<Question<PresetCreationAnswers>> = [
          presetPrompts.save,
          presetPrompts.presetName(this.presetManager, generalAnswers),
        ];
        const presetCreationAnswers = await inquirer.prompt(questions);
        if (presetCreationAnswers.save) {
          const { projectName, ...configuration } = structuredClone<GeneralAnswers>(generalAnswers);
          this.presetManager.addPreset({ ...configuration, name: presetCreationAnswers.presetName });
        }
      }

      await this.generateProject(generalAnswers, installArgument);
    }
  }

  public async generateProject(answers: GeneralAnswers, install: boolean): Promise<void> {
    const spinner = ora('Creating directory').start();
    const paths: Paths = getPaths(answers.projectName);
    await fs.mkdir(paths.project);

    spinner.text = 'Initializing git';
    if (answers.git)
      await steps.initGit(paths, answers);

    spinner.text = 'Initializing npm';
    let editablePackageJson = await steps.initNpm(paths, answers);

    spinner.text = 'Create the license';
    await steps.createLicense(answers, editablePackageJson, paths);

    spinner.text = 'Installing parser';
    if (answers.language === LanguageAnswer.Babel)
      await steps.installBabel(paths, install);
    else if (answers.language === LanguageAnswer.Typecript)
      await steps.installTypescript(paths, install);

    spinner.text = 'Installing ESLint and its dependencies';
    if (answers.eslint !== EslintConfigAnswer.None)
      await steps.installEslint(answers, paths, install);

    spinner.text = 'Installing other dependencies';
    await steps.installOtherDependencies(paths, answers, install);

    editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });

    spinner.text = 'Adding the last files';
    await steps.createOtherFiles(answers, paths, editablePackageJson);

    spinner.text = 'Configuring modules';
    if (answers.language === LanguageAnswer.Modules)
      steps.configureModule(editablePackageJson);

    spinner.text = 'Configuring scripts';
    steps.configureScripts(editablePackageJson, answers);

    spinner.succeed('Finished successfully!');

    Logger.log(stripIndent`
      \n\n
      ${chalk.green.bold('➜')} ${chalk.underline.bold('Your project has been created successully!')}
      You can find it at ${chalk.cyan(`./${answers.projectName}/`)}!

      ${chalk.bold('There is a few more things you may want to do to be ready...')}
          ${chalk.grey('-')} Set the contact method in CONTRIBUTING.md (search for "[INSERT CONTACT METHOD]")
          ${chalk.grey('-')} Update the scripts in package.json to your liking or to use modules you want
          ${chalk.grey('-')} Add/fill/update some package.json entries, such as the repo, the description, keywords...
          ${chalk.grey('-')} Update the TO-DO in README.md

      ${chalk.green('Happy coding!')}
    `);
  }
}
