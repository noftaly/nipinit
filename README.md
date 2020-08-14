# Nipinit

> 💻 A command-line utility to easily create new NPM projects.


## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
  - [Fresh start](#fresh-start)
  - [Presets](#presets)
- [Screenshots](#screenshots)
- [TO-DO](#to-do)
- [License](#license)


## Installation

```shell
$ npm i -g nipinit
```


## Usage

### Fresh start

To start a new NPM project, go to the directory you want in your terminal, and type:
```shell
$ nipinit
```
You will be prompts some questions to generate the boilerplate that fits you the most, and
you will be good to go!

### Presets

You can create presets when creating a new project. (answer 'Yes' to the prompt
`Do you want to save this preset?`).
After that, you can generate a new project using this preset just by adding the `--preset preset_name` argument to nipinit. (it has an alias: `-p`)
```shell
$ nipinit -preset myCoolPreset
```

If you create a project without using a prest, but it happens that the exact same preset is already
saved, nipinit will tell you so you can use it next time!

You can also manage your presets with
```shell
$ nipinit preset
```
Add the `--help` option to see all available arguments.


## Screenshots

![Nipinit Screenshot where we can see all the prompts asked and the success messages](./assets/nipinit_screenshot.jpg)


## TO-DO

- [x] Save configurations and use them
- [x] Split code into multiple files
- [x] Add a "no-color" option which does not print color in the console.logs
- [x] Add a logger to manage the output logs
- [x] Add a "help" page (`nipinit help` or `nipinit --help`?)
- [x] If babel and ESLint are used, use the babel-eslint parser for ESLint
- [x] Show an Error message when the entered project is already a directory
- [ ] Install different ESLint/plugins version based on the config (use peerDeps?)
- [ ] Add a class to manage/query Database
- [ ] Add a "no-modules" option which does not install node modules
- [ ] Use `commander` (or `meow`) for the command-line argument parsing?
- [ ] Improve error handling
- [ ] Lower the required node version (currently >=14.8.0, if we can lower it down to 14.0.0 or even 12.x.x it would be nice)
- [ ] Add unit tests


## License

Copyright © 2020 Elliot 'noftaly' Maisl. Licensed under the MIT license, see [the license](./LICENSE).
