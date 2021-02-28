import { stripIndent } from 'common-tags';
import type { EslintConfigAnswer, EslintPluginEntry } from '../types';
import { LanguageAnswer } from '../types';
import getEslintConfigInfo from '../utils/getEslintConfig';


export default class FilesData {
  public eslintConfig: EslintPluginEntry;

  constructor(
    eslintConfigAnswer: EslintConfigAnswer,
    private readonly _language: LanguageAnswer,
    private readonly _projectName: string,
    private readonly _userName: string,
    private readonly _license: string,
  ) {
    this.eslintConfig = getEslintConfigInfo(eslintConfigAnswer);
  }

  public getGitIgnore(): string {
    return stripIndent`
      node_modules/
      ${this._language === LanguageAnswer.Babel || this._language === LanguageAnswer.Typecript ? 'dist/' : ''}
      .idea/
      .vscode/
      .env
      .DS_Store
    `;
  }

  public getBabelConfig(): string {
    return stripIndent`
      {
        "presets": ["@babel/preset-env"]
      }
    `;
  }

  public getTsConfig(): string {
    return stripIndent`
      {
        "compilerOptions": {
          "allowSyntheticDefaultImports": true,
          "baseUrl": "./",
          "checkJs": true,
          "declaration": true,
          "emitDecoratorMetadata": true,
          "experimentalDecorators": true,
          "incremental": true,
          "module": "commonjs",
          "noImplicitAny": true,
          "outDir": "./dist",
          "pretty": false,
          "removeComments": true,
          "resolveJsonModule": true,
          "sourceMap": true,
          "target": "es2017"
        },
        "include": ["./src/**/*.ts", "./test/**/*.ts"],
        "exclude": ["node_modules/", "typings/"]
      }
    `;
  }

  public getTsEslintConfig(): string {
    return stripIndent`
      {
        "extends": "./tsconfig.json",
        "include": [
          "src/**/*.ts",
          "**/*.d.ts",
          ".eslintrc.js",
        ]
      }
    `;
  }

  public getEslintConfig(): string {
    return stripIndent`
      module.exports = {
        extends: '${this.eslintConfig.extends}',
        ${this._language ? "parser: '@babel/eslint-parser'," : ''}
        ignorePatterns: ['node_modules/'],
      };
    `;
  }

  public getEslintTypescriptConfig(): string {
    let baseConfig = stripIndent`
      module.exports = {
        root: true,
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        extends: ['${this.eslintConfig.extends}'],
        ignorePatterns: ['node_modules/', 'dist/'],
        reportUnusedDisableDirectives: true,
        parserOptions: {
          project: './tsconfig.eslint.json',
        },
    `;

    if (this.eslintConfig.plugins.includes('eslint-plugin-import')) {
      baseConfig += stripIndent`
        rules: {
          'import/extensions': ['error', 'never', { ts: 'never', json: 'always' }],
        },
        settings: {
          'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
          },
          'import/resolver': {
            typescript: {
              alwaysTryTypes: true,
            },
          },
        },
      `;
    }
    baseConfig += '\n};\n';
    return baseConfig;
  }

  public getNodemon(): string {
    return stripIndent`
      {
        "verbose": false,
        "ignore": ["node_modules/*"],
        "ext": "js,ts,json"
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

      > ⚡️ A Node.js program made by ${this._userName}.

      :warning: ${this._projectName} is still under early development! Use with caution.

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
      - [x] Initialise the needed files

      ## License

      Copyright © ${new Date().getFullYear()} ${this._userName}. Licensed under the ${this._license} license, see [the license](./LICENSE).
    `;
  }

  public getMain(): string {
    return stripIndent`
      // Main file
    `;
  }
}
