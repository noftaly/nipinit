import chalk from 'chalk';
import { stripIndent } from 'common-tags';

import { EslintConfigAnswer } from '../types';
import Logger from './Logger';
import PresetManager from './PresetManager';


export default class PresetCommand {
  constructor(private presetManager: PresetManager) {}

  showPresetList(): void {
    const presets = this.presetManager.getNames();

    if (presets.length === 0) {
      Logger.error('No presets found for nipinit.');
      return;
    }

    Logger.log(chalk.bold.underline(`Found ${presets.length} presets for nipinit:`));
    for (const preset of presets)
      Logger.log(`  ${chalk.grey('-')} ${preset}`);

    Logger.log(chalk.italic(`You can have more informations about a preset with ${chalk.grey('nipinit presets info <preset>')}`));
  }

  showPresetInfo(name: string): void {
    const preset = this.presetManager.findByName(name);

    if (!preset) {
      Logger.error(`The preset ${name} does not exist.`);
      return;
    }

    const useEslint = preset.eslint !== EslintConfigAnswer.None;
    const yn = (val: unknown): string => (val ? chalk.green('Yes') : chalk.red('No'));

    Logger.log(stripIndent`
      ${chalk.bold.underline(`Informations about the preset ${chalk.cyan(name)}:`)}
        ${chalk.grey('-')} User Name: ${chalk.cyan(preset.userName)}
        ${chalk.grey('-')} Init Git: ${yn(preset.git)}
          ${preset.git ? `${chalk.grey('-')} Init Github files: ${yn(preset.github)}` : ''}
        ${chalk.grey('-')} License: ${chalk.cyan(preset.license)}
        ${chalk.grey('-')} Use ES Modules: ${yn(preset.module)}
        ${chalk.grey('-')} Use babel: ${yn(preset.babel)}
        ${chalk.grey('-')} Use ESLint: ${yn(useEslint)}
          ${useEslint ? `${chalk.grey('-')} ESLint preset: ${chalk.cyan(preset.eslint)}` : ''}
        ${chalk.grey('-')} Other dependencies: ${chalk.cyan(preset.extras.join(', ')) || chalk.red('None')}
    `);
  }

  removePreset(name: string): void {
    const existed = this.presetManager.remove(name);
    if (existed)
      Logger.success(`The presets ${name} was deleted successfully!`);
    else
      Logger.error(`The preset ${name} does not exist.`);
  }
}
