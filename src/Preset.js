import chalk from 'chalk';
import commontags from 'common-tags';

import logger from './Logger.js';
import db from './database.js';


const { stripIndent } = commontags;

class Preset {
  static async findSame(answers) {
    const samePreset = await db.get('presets').findSame(answers).value();
    return samePreset;
  }

  static async getList() {
    const presets = await db.get('presets').value();
    if (presets.length === 0) {
      logger.error('No presets found for nipinit.');
    } else {
      logger.log(chalk.bold.underline(`Found ${presets.length} presets for nipinit:`));
      for (const preset of presets)
        logger.log(`  ${chalk.grey('-')} ${preset.name}`);

      logger.log(chalk.italic(`You can have more informations about a preset with ${chalk.grey('nipinit presets info <preset>')}`));
    }
  }

  static async getInfo(name) {
    const preset = await db.get('presets')
      .find({ name })
      .value();
    if (!preset) {
      logger.error(`The preset ${name} does not exist.`);
    } else {
      logger.log(stripIndent`
        ${chalk.bold.underline(`Informations about the preset ${chalk.cyan(preset.name)}:`)}
          ${chalk.grey('-')} User Name: ${chalk.cyan(preset.userName)}
          ${chalk.grey('-')} Init Git: ${preset.git ? chalk.green('Yes') : chalk.red('No')}
            ${preset.git ? `${chalk.grey('-')} Init Github files: ${preset.github ? chalk.green('Yes') : chalk.red('No')}` : ''}
          ${chalk.grey('-')} License: ${chalk.cyan(preset.license)}
          ${chalk.grey('-')} Use ES Modules: ${preset.module ? chalk.green('Yes') : chalk.red('No')}
          ${chalk.grey('-')} Use babel: ${preset.babel ? chalk.green('Yes') : chalk.red('No')}
          ${chalk.grey('-')} Use ESLint: ${preset.eslint !== "I don't want to use ESLint" ? chalk.green('Yes') : chalk.red('No')}
            ${preset.eslint !== "I don't want to use ESLint" ? `${chalk.grey('-')} ESLint preset: ${chalk.cyan(preset.eslint)}` : ''}
          ${chalk.grey('-')} Other dependencies: ${chalk.cyan(preset.extras.join(', ')) || chalk.red('None')}
      `);
    }
  }

  static async remove(name) {
    const preset = await db.get('presets')
      .find({ name })
      .value();
    if (!preset) {
      logger.error(`The preset ${name} does not exist.`);
    } else {
      await db.get('presets')
        .remove({ name: preset.name })
        .write();
      logger.success(`The presets ${preset.name} was deleted successfully!`);
    }
  }
}

export default Preset;
