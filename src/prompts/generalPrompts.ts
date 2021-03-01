import fsSync from 'fs';
import path from 'path';
import type {
  CheckboxQuestion,
  ChoiceOptions,
  ListQuestion,
  Question,
} from 'inquirer';
import type { GeneralAnswers } from '../types';
import {
  EslintConfigAnswer,
  ExtraModulesAnswer,
  LanguageAnswer,
  LicenseAnswer,
} from '../types';


export const projectName: Question = {
  type: 'input',
  name: 'projectName',
  message: 'What is your project name?',
  validate: (input: string): string | true => {
    if (input.length === 0)
      return 'The project name has to contain at least 1 character.';
    if (fsSync.existsSync(path.join(process.cwd(), input)))
      return 'This folder already exist.';
    return true;
  },
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

const languageChoice: ChoiceOptions[] = [
  { name: 'TypeScript', value: LanguageAnswer.Typecript },
  { name: 'Node.js modules (Node.js 14+)', value: LanguageAnswer.Modules },
  { name: 'Vanilla Node.js (commonjs modules)', value: LanguageAnswer.Vanilla },
  { name: 'Babel', value: LanguageAnswer.Babel },
];

export const language: ListQuestion = {
  type: 'list',
  name: 'language',
  // TODO: Find a better name than "language" here.
  message: 'What type of language do you want to use?',
  choices: languageChoice,
  default: 'Vanilla Node.js (CommonJS modules)',
};

const eslintJavascriptConfigChoice: ChoiceOptions[] = [
  { name: 'noftalint', value: EslintConfigAnswer.Noftalint },
  { name: 'airbnb', value: EslintConfigAnswer.Airbnb },
  { name: 'standard', value: EslintConfigAnswer.Standard },
  { name: 'recommended', value: EslintConfigAnswer.Recommended },
  { name: "I don't want to use ESLint", value: EslintConfigAnswer.None },
];
const eslintTypescriptConfigChoice: ChoiceOptions[] = [
  { name: 'noftalint (TypeScript)', value: EslintConfigAnswer.NoftalintTypescript },
  { name: 'recommended (TypeScript)', value: EslintConfigAnswer.TypescriptRecommended },
  { name: "I don't want to use ESLint", value: EslintConfigAnswer.None },
];

export const eslint: ListQuestion = {
  type: 'list',
  name: 'eslint',
  message: 'What ESLint configuration do you want?',
  choices: (answers: GeneralAnswers): ChoiceOptions[] =>
    (answers.language === LanguageAnswer.Typecript
      ? eslintTypescriptConfigChoice
      : eslintJavascriptConfigChoice),
  default: 1,
};

const extraModulesChoice: ChoiceOptions[] = [
  { name: 'dotenv', value: ExtraModulesAnswer.Dotenv },
  { name: 'cross-env', value: ExtraModulesAnswer.Crossenv },
  { name: 'nodemon', value: ExtraModulesAnswer.Nodemon },
  { name: 'concurrently', value: ExtraModulesAnswer.Concurrently },
];

export const extras: CheckboxQuestion = {
  type: 'checkbox',
  name: 'extras',
  message: 'What other modules would you like to install?',
  choices: extraModulesChoice,
  default: ['dotenv', 'cross-env'],
};
