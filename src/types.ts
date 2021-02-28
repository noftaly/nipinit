import type { Answers } from 'inquirer';


export enum LicenseAnswer {
  MIT = 'MIT',
  GPL = 'GPL-v3.0-only',
  ISC = 'ISC',
}

export enum EslintConfigAnswer {
  Noftalint = 'noftalint',
  NoftalintTypescript = 'noftalint/typescript',
  Airbnb = 'airbnb',
  Standard = 'standard',
  Recommended = 'recommended',
  TypescriptRecommended = 'typescript-recommended',
  None = 'none',
}

export enum ExtraModulesAnswer {
  Nodemon = 'nodemon',
  Dotenv = 'dotenv',
  Crossenv = 'cross-env',
  Concurrently = 'concurrently',
}

export enum LanguageAnswer {
  Vanilla = 'vanilla',
  Modules = 'modules',
  Babel = 'babel',
  Typecript = 'typescript',
}

// A configuration is what the user responded, but without project-specific informations
// (the project's name). It is used to be extended by GeneralAnswers an StoredPreset,
// which respectively add the projectName and name (the preset name) properties
export interface Configuration {
  userName: string;
  git: boolean;
  license: LicenseAnswer;
  language: LanguageAnswer;
  eslint: EslintConfigAnswer;
  extras: ExtraModulesAnswer[];
}

export interface ProjectNameAnswers extends Answers {
  projectName: string;
}

export interface GeneralAnswers extends Configuration, ProjectNameAnswers {}

export interface PresetCreationAnswers extends Answers {
  save: boolean;
  presetName: string;
}

export interface StoredPreset extends Configuration {
  name: string;
}

export interface EslintPluginEntry {
  extends: string;
  plugins: string[];
}

export interface Paths {
  project: string;
  dataDir: string;
  dest: {
    gitignore: string;
    githubFolder: string;
    issueTemplateFolder: string;
    lintAction: string;
    buildAction: string;
  };
  data: {
    issueTemplateFolder: string;
    lintAction: string;
    buildAction: string;
    licenses: string;
  };
}
