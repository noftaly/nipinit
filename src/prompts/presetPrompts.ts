import type { Question } from 'inquirer';
import type PresetManager from '../structures/PresetManager';
import type { GeneralAnswers, PresetCreationAnswers } from '../types';


export const save: Question = {
  type: 'confirm',
  name: 'save',
  message: 'Do you want to save this preset?',
};

export const presetName = (presetManager: PresetManager, answers: GeneralAnswers): Question => ({
  type: 'input',
  name: 'presetName',
  message: 'What name do you want to give to this preset?',
  default: (): string => presetManager.createName(answers.userName),
  when: (prefs: PresetCreationAnswers): boolean => prefs.save,
  validate: (input: string): string | boolean | Promise<string | boolean> => {
    if (input.length === 0)
      return 'The preset name has to contain at least 1 character.';
    if (presetManager.findByName(input))
      return 'A preset with this name is already taken.';
    return true;
  },
});
