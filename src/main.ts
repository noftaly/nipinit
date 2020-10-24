#!/usr/bin/env node

import { program } from 'commander';
import updateNotifier from 'update-notifier';

import CLI from './CLI';
import logger from './Logger';
import { CLIOptions } from './models/CLIOptions';


// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-commonjs
const pkg = require('../package.json');

updateNotifier({ pkg }).notify();

const cli = new CLI();

program
  .version(pkg.version, '-v, --version', 'Output the nipinit version')
  .option('-p, --preset <string>', 'Create a new project with a preset')
  .option('-d, --dump-error', 'Show the full error when one occurs')
  .option('--no-modules', 'Create a new project without installing node modules')
  .option('--no-color', 'Create a new project without showing colors in the CLI')
  .action(async (options: CLIOptions, command?: string) => {
    if (command && command !== 'presets') {
      logger.error('Unkown argument. Run nipinit -h for help');
    } else if (!command) {
      try {
        await cli.startPrompting(options.preset, options.modules);
      } catch (err) {
        logger.empty(2);
        logger.error('An error occured while using nipinit... More information are available below this message.');
        logger.error('If you think this is a bug, please report it here: https://github.com/noftaly/nipinit, with the "bug" issue template filled correctly.');
        if (options.dumpError) {
          if (options.preset) {
            const preset = cli.presetManager.findByName(options.preset);
            const values = Object.entries(preset).map(([name, value]) => `${name}: ${value}`);
            logger.info(`Used preset: ${values}`);
          } else {
            logger.info('Used preset: None');
          }
          logger.info(`Install modules: ${options.modules || true}`);
          logger.info(`Node version: ${process.version}`);
          logger.info(`Nipinit version: ${pkg.version}`);
          console.error(err);
        } else {
          logger.error(err.message);
          const stacks = err.stack.split('\n').slice(1, 3);
          for (const stack of stacks)
            logger.error(stack);
        }
        process.exit(1);
      }
    }
  });

const presetsCmd = program
  .command('presets')
  .description('Manage presets');

presetsCmd
  .command('ls')
  .description('List all existing presets')
  .action(cli.presetCommand.showPresetList.bind(cli));
presetsCmd
  .command('info <preset>')
  .description('Get informations about a preset')
  .action(cli.presetCommand.showPresetInfo.bind(cli));
presetsCmd
  .command('remove <preset>')
  .alias('rem')
  .description('Remove a preset')
  .action(cli.presetCommand.removePreset.bind(cli));

program.parse(process.argv);
