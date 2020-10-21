import { Answers } from 'inquirer';
import { Configuration } from './Configuration';


export interface ProjectNameAnswers extends Answers {
  projectName: string;
}

export interface GeneralAnswers extends Configuration, ProjectNameAnswers {}

export interface PresetCreationAnswers extends Answers {
  save: boolean;
  presetName: string;
}
