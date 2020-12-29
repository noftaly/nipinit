#!/usr/bin/env node

import { program } from 'commander';
import updateNotifier from 'update-notifier';

import CLI from './structures/CLI';
import * as Logger from './structures/Logger';

interface PackageJson {
  name: string;
  version: string;
}

// eslint-disable-next-line import/no-commonjs
const pkg: PackageJson = require('../package.json') as PackageJson;


interface CLIOptions {
  preset: string;
  modules: boolean;
  dumpError: boolean;
}


updateNotifier({ pkg }).notify({ isGlobal: true });
const cli = new CLI();

program
  .version(pkg.version, '-v, --version', 'Output the nipinit version')
  .option('-p, --preset <string>', 'Create a new project with a preset')
  .option('-d, --dump-error', 'Show the full error when one occurs')
  .option('--no-modules', 'Create a new project without installing node modules')
  .option('--no-color', 'Create a new project without showing colors in the CLI')
  .action(async (options: CLIOptions, command?: string) => {
    if (command && command !== 'presets') {
      Logger.error('Unknown argument. Run nipinit -h for help');
    } else if (!command) {
      try {
        await cli.startPrompting(options.preset, options.modules);
      } catch (unknownError: unknown) {
        const error = unknownError as Error;
        Logger.empty(2);
        Logger.error('An error occurred while using nipinit... More information are available below this message.');
        Logger.error('If you think this is a bug, please report it here: https://github.com/noftaly/nipinit, with the "bug" issue template filled correctly.');
        if (options.dumpError) {
          if (options.preset) {
            const preset = cli.presetManager.findByName(options.preset);
            const values = Object.entries(preset).map(([name, value]) => `${name}: ${value}`);
            Logger.info(`Used preset: ${values.join(', ')}`);
          } else {
            Logger.info('Used preset: None');
          }
          Logger.info(`Install modules: ${options.modules || true}`);
          Logger.info(`Node version: ${process.version}`);
          Logger.info(`Nipinit version: ${pkg.version}`);
          console.error(error);
        } else {
          Logger.error(error.message);
          const stacks = error.stack.split('\n').slice(1, 3);
          for (const stack of stacks)
            Logger.error(stack);
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
  .action(cli.presetCommand.showPresetList.bind(cli.presetCommand));
presetsCmd
  .command('info <preset>')
  .description('Get informations about a preset')
  .action(cli.presetCommand.showPresetInfo.bind(cli.presetCommand));
presetsCmd
  .command('remove <preset>')
  .alias('rem')
  .description('Remove a preset')
  .action(cli.presetCommand.removePreset.bind(cli.presetCommand));

program.parse(process.argv);
