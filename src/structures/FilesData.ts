import { stripIndent } from 'common-tags';
import type { EslintConfigAnswer, EslintPluginEntry } from '../types';
import getEslintConfigInfo from '../utils/getEslintConfig';


export default class FilesData {
  public eslintConfig: EslintPluginEntry;

  // eslint-disable-next-line max-params
  constructor(
    eslintConfigAnswer: EslintConfigAnswer,
    private readonly _useBabel: boolean,
    private readonly _useEsModules: boolean,
    private readonly _projectName: string,
    private readonly _userName: string,
    private readonly _license: string,
  ) {
    this.eslintConfig = getEslintConfigInfo(eslintConfigAnswer);
  }

  public getGitIgnore(): string {
    return stripIndent`
      node_modules/
      ${this._useBabel && 'dist/'}
    `;
  }

  public getBabelConfig(): string {
    return stripIndent`
      {
        "presets": ["@babel/preset-env"]
      }
    `;
  }

  public getEslintConfig(): string {
    return stripIndent`
      module.exports = {
        extends: '${this.eslintConfig.extends}',
        ${this._useBabel ? "parser: '@babel/eslint-parser'," : ''}
        ignorePatterns: ['.eslintrc.${this._useEsModules ? 'c' : ''}js', 'node_modules/'],
        rules: {},
        env: {
          node: true,
        },
      };
    `;
  }

  public getNodemon(): string {
    return stripIndent`
      {
        "verbose": false,
        "ignore": ["node_modules/*"],
        "ext": "js,json"
      }
    `;
  }

  public getEditorConfig(): string {
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

  public getReadme(): string {
    return stripIndent`
      # ${this._projectName}

      A NodeJS Program made by ${this._userName}

      ## Table of Contents
      - [Usage](#usage)
      - [Screenshots](#screenshots)
      - [TO-DO](#to-do)
      - [License](#_license)

      ## Usage
      🚧 WIP

      ## Screenshots
      🚧 WIP

      ## TO-DO
      - [ ] Start writing code
      - [x] Initialise the needed file

      ## License
      Copyright © ${new Date().getFullYear()} ${this._userName}. Licensed under the ${this._license} _license, see [the _license](./LICENSE)
    `;
  }

  public getMainjs(): string {
    return stripIndent`
      // main.js
    `;
  }
}
