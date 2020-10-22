import { EslintConfigAnswer, ExtraModulesAnswer, LicenseAnswer } from './ChoiceAnswers';

// A configuration is what the user responded, but without project-specific informations
// (the project's name). It is used to be extended by GeneralAnswers an StoredPreset,
// which respectively add the projectName and name (the preset name) properties
export interface Configuration {
  userName: string;
  git: boolean,
  github: boolean | null;
  license: LicenseAnswer;
  module: boolean;
  babel: boolean;
  eslint: EslintConfigAnswer;
  extras: ExtraModulesAnswer[];
}
