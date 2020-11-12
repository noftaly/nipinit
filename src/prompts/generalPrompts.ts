import fsSync from 'fs';
import path from 'path';
import type {
  CheckboxQuestion,
  ChoiceOptions,
  ListQuestion,
  Question,
} from 'inquirer';
import {
  LicenseAnswer,
  EslintConfigAnswer,
  ExtraModulesAnswer,
} from '../types';
import getNodeVersion from '../utils/getNodeVersion';

export const projectName: Question = {
  type: 'input',
  name: 'projectName',
  message: 'What is your project name?',
  validate: async (input: string) => new Promise((resolve, _reject) => {
      if (input.length === 0)
        resolve('The project name has to contain at least 1 character.');
      else if (fsSync.existsSync(path.join(process.cwd(), input)))
        resolve('This folder already exist.');
      else
        resolve(true);
    }),
};

export const userName: Question = {
  type: 'input',
  name: 'userName',
  message: 'What is your username?',
  validate: (input: string) => input.length > 0 || 'The user name has to contain at least 1 character.',
};

export const git: Question = {
  type: 'confirm',
  name: 'git',
  message: 'Would you like to init a git repository?',
  default: true,
};

const licenseChoice: ChoiceOptions[] = [
  { name: 'MIT', value: LicenseAnswer.MIT },
  { name: 'GPL', value: LicenseAnswer.GPL },
  { name: 'ISC', value: LicenseAnswer.ISC },
];

export const license: ListQuestion = {
  type: 'list',
  name: 'license',
  message: 'What license do you want to use?',
  choices: licenseChoice,
  default: 'MIT',
};

export const module: Question = {
  type: 'confirm',
  name: 'module',
  message: 'Would you like to use modules (import/export)?',
  when: () => getNodeVersion().major >= 14,
  default: true,
};

export const babel: Question = {
  type: 'confirm',
  name: 'babel',
  message: 'Would you like to use babel?',
  default: getNodeVersion().major < 14,
};

const eslintConfigChoice: ChoiceOptions[] = [
  { name: 'noftalint', value: EslintConfigAnswer.Noftalint },
  { name: 'airbnb', value: EslintConfigAnswer.Airbnb },
  { name: 'standard', value: EslintConfigAnswer.Standard },
  { name: 'recommended', value: EslintConfigAnswer.Recommended },
  { name: "I don't want to use ESLint", value: EslintConfigAnswer.None },
];

export const eslint: ListQuestion = {
  type: 'list',
  name: 'eslint',
  message: 'What ESLint configuration do you want?',
  choices: eslintConfigChoice,
  default: 'noftalint',
};

const extraModulesChoice: ChoiceOptions[] = [
  { name: 'nodemon', value: ExtraModulesAnswer.Nodemon },
  { name: 'cross-env', value: ExtraModulesAnswer.Crossenv },
  { name: 'concurrently', value: ExtraModulesAnswer.Concurrently },
];

export const extras: CheckboxQuestion = {
  type: 'checkbox',
  name: 'extras',
  message: 'What other modules would you like to install?',
  choices: extraModulesChoice,
  default: ['nodemon', 'cross-env'],
};
