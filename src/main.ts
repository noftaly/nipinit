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
  .option('--no-modules', 'Create a new project without installing node modules')
  .option('--dump-error, -d', 'Show the full error when one occurs')
  .option('--no-color', 'Create a new project without showing colors in the CLI')
  .action(async (options: CLIOptions, command?: string) => {
    // If it is a subcommand, then stop here and let the other actions take care of it
    if (command) return;

    try {
      await cli.startPrompting(options.preset, options.modules);
    } catch (err) {
      logger.empty(2);
      logger.error('An error occured while using nipinit... More information are available below this message.');
      if (options.dumpError) {
        console.log('Used preset:', options.preset || 'None');
        console.log('Install modules:', options.modules || true);
        console.log('Node version:', process.version);
        console.log('Nipinit version:', pkg.version);
        console.log('Error: --------------');
        console.error(err);
      } else {
        logger.error(err.message);
        const stacks = err.stack.split('\n').slice(1, 3);
        for (const stack of stacks)
          logger.error(stack);
      }
      process.exit(1);
    }
  });

const presetsCmd = program
  .command('presets')
  .description('Manage presets');

presetsCmd
  .command('ls')
  .description('List all existing presets')
  .action(cli.presetCommand.showPresetList);
presetsCmd
  .command('info <preset>')
  .description('Get informations about a preset')
  .action(cli.presetCommand.showPresetInfo);
presetsCmd
  .command('remove <preset>')
  .alias('rem')
  .description('Remove a preset')
  .action(cli.presetCommand.removePreset);

program.parse(process.argv);
