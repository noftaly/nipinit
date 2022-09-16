import chalk from 'chalk';
import { stripIndent } from 'common-tags';

import { EslintConfigAnswer } from '../types';
import * as Logger from './Logger';
import type PresetManager from './PresetManager';

export default class PresetCommand {
  constructor(private readonly _presetManager: PresetManager) {}

  public showPresetList(): void {
    const presets = this._presetManager.getNames();

    if (presets.length === 0) {
      Logger.error('No presets found for nipinit.');
      return;
    }

    Logger.log(chalk.bold.underline(`Found ${presets.length} presets for nipinit:`));
    for (const preset of presets)
      Logger.log(`  ${chalk.grey('-')} ${preset}`);

    Logger.log(chalk.italic(`You can have more informations about a preset with ${chalk.grey('nipinit presets info <preset>')}`));
  }

  public showPresetInfo(name: string): void {
    const preset = this._presetManager.findByName(name);

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
        ${chalk.grey('-')} License: ${chalk.cyan(preset.license)}
        ${chalk.grey('-')} Language used: ${chalk.cyan(preset.language)}
        ${chalk.grey('-')} Use ESLint: ${yn(useEslint)}
          ${useEslint ? `${chalk.grey('-')} ESLint preset: ${chalk.cyan(preset.eslint)}` : ''}
        ${chalk.grey('-')} Other dependencies: ${chalk.cyan(preset.extras.join(', ')) || chalk.red('None')}
    `);
  }

  public removePreset(name: string): void {
    const isValid = this._presetManager.remove(name);
    if (isValid)
      Logger.success(`The presets ${name} was deleted successfully!`);
    else
      Logger.error(`The preset ${name} does not exist.`);
  }
}
