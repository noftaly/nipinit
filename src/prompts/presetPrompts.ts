import { Question } from 'inquirer';
import PresetManager from '../structures/PresetManager';
import { GeneralAnswers, PresetCreationAnswers } from '../types';


export const save: Question = {
  type: 'confirm',
  name: 'save',
  message: 'Do you want to save this preset?',
};


export const presetName = (presetManager: PresetManager, answers: GeneralAnswers): Question => ({
  type: 'input',
  name: 'presetName',
  message: 'What name do you want to give to this preset?',
  default: () => presetManager.createName(answers.userName),
  when: (prefs: PresetCreationAnswers) => prefs.save,
  validate: (input) => {
    if (input.length === 0)
      return 'The preset name has to contain at least 1 character.';
    if (presetManager.findByName(input))
      return 'A preset with this name is already taken.';
    return true;
  },
});
