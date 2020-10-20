import { Question } from 'inquirer';
import PresetManager from '../PresetManager';
import { GeneralAnswers } from '../models/answerChoice';


export const save: Question = {
  type: 'confirm',
  name: 'save',
  message: 'Do you want to save this preset?',
};


export const presetName = (presetManager: PresetManager, answers: GeneralAnswers): Question => ({
  type: 'input',
  name: 'presetName',
  message: 'What name do you want to give to this preset?',
  default: async () => await presetManager.createName(answers.userName),
  when: prefs => prefs.save,
  validate: input => input.length > 0 || 'The preset name has to contain at least 1 character.',
});
