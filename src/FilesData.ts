import { stripIndent } from 'common-tags';
import getEslintConfigInfo from './getEslintConfig';
import { EslintConfigAnswer } from './models/ChoiceAnswers';
import { EslintPluginEntry } from './models/EslintPluginEntry';


export default class FilesData {
  public eslintConfig: EslintPluginEntry;

  // eslint-disable-next-line max-params
  constructor(
    eslintConfigAnswer: EslintConfigAnswer,
    private useBabel: boolean,
    private useEsModules: boolean,
    private projectName: string,
    private userName: string,
    private license: string,
  ) {
    this.eslintConfig = getEslintConfigInfo(eslintConfigAnswer);
  }

  getGitIgnore(): string {
    return stripIndent`
      node_modules/
      ${this.useBabel && 'dist/'}
    `;
  }

  getBabelConfig(): string {
    return stripIndent`
      {
        "presets": ["@babel/preset-env"]
      }
    `;
  }

  getEslintConfig(): string {
    return stripIndent`
      module.exports = {
        extends: '${this.eslintConfig.extends}',
        ${this.useBabel ? "parser: '@babel/eslint-parser'," : ''}
        ignorePatterns: ['.eslintrc.${this.useEsModules ? 'c' : ''}js', 'node_modules/'],
        rules: {},
        env: {
          node: true,
        },
      };
    `;
  }

  getNodemon(): string {
    return stripIndent`
      {
        "verbose": false,
        "ignore": ["node_modules/*"],
        "ext": "js,json"
      }
    `;
  }

  getEditorConfig(): string {
    return stripIndent`
      # http://editorconfig.org

      root = true

      [*]
      charset = utf-8
      end_of_line = lf
      indent_style = space
      indent_size = 2
      trim_trailing_whitespace = true
      insert_final_newline = true
    `;
  }

  getReadme(): string {
    return stripIndent`
      # ${this.projectName}

      A NodeJS Program made by ${this.userName}

      ## Table of Contents
      - [Usage](#usage)
      - [Screenshots](#screenshots)
      - [TO-DO](#to-do)
      - [License](#license)

      ## Usage
      🚧 WIP

      ## Screenshots
      🚧 WIP

      ## TO-DO
      - [ ] Start writing code
      - [x] Initialise the needed file

      ## License
      Copyright © ${new Date().getFullYear()} ${this.userName}. Licensed under the ${this.license} license, see [the license](./LICENSE)
    `;
  }

  getMainjs(): string {
    return stripIndent`
      // main.js
    `;
  }
}
