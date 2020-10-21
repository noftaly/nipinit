#!/usr/bin/env node

import { program } from 'commander';
import updateNotifier from 'update-notifier';

import * as pkg from '../package.json';
import CLI from './CLI';
import { CLIOptions } from './models/CLIOptions';


updateNotifier({ pkg }).notify();
const cli = new CLI();

program
  .version(pkg.version, '-v, --version', 'Output the nipinit version')
  .option('-p, --preset <string>', 'Create a new project with a preset')
  .option('--no-modules', 'Create a new project without installing node modules')
  .option('--no-color', 'Create a new project without showing colors in the CLI')
  .action((options: CLIOptions, command?: string) => {
    // If it is a subcommand, then stop here and let the other actions take care of it
    if (command) return;
    cli.startPrompting(options.preset, options.modules);
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
