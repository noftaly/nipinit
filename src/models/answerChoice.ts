import { Answers } from 'inquirer';
import { Configuration } from './Configuration';

export interface GeneralAnswers extends Configuration, Answers {
  projectName: string;
}

export interface PresetCreationAnswers extends Answers {
  save: boolean;
  presetName: string;
}
