import chalk from 'chalk';
import { stripIndent } from 'common-tags';

import logger from './Logger';
import PresetManager from './PresetManager';
import { EslintConfigAnswer } from './models/ChoiceAnswers';


export default class PresetCommand {
  constructor(private presetManager: PresetManager) {}

  showPresetList(): void {
    const presets = this.presetManager.getNames();

    if (presets.length === 0) {
      logger.error('No presets found for nipinit.');
      return;
    }

    logger.log(chalk.bold.underline(`Found ${presets.length} presets for nipinit:`));
    for (const preset of presets)
      logger.log(`  ${chalk.grey('-')} ${preset}`);

    logger.log(chalk.italic(`You can have more informations about a preset with ${chalk.grey('nipinit presets info <preset>')}`));
  }

  showPresetInfo(name: string): void {
    const preset = this.presetManager.findByName(name);

    if (!preset) {
      logger.error(`The preset ${name} does not exist.`);
      return;
    }

    const useEslint = preset.eslint !== EslintConfigAnswer.None;
    const yn = (val: unknown): string => (val ? chalk.green('Yes') : chalk.red('No'));

    logger.log(stripIndent`
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
      logger.success(`The presets ${name} was deleted successfully!`);
    else
      logger.error(`The preset ${name} does not exist.`);
  }
}
