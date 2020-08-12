import commontags from 'common-tags';

const { stripIndent } = commontags;

export default {
  gitignore: stripIndent`
    node_modules/
  `,
  babel: stripIndent`
    {
      "presets": ["@babel/preset-env"]
    }
  `,
  eslint: config => stripIndent`
    module.exports = {
      extends: '${config}',
      ignorePatterns: ['.eslintrc.js', 'node_modules/'],
      rules: {},
      env: {
        node: true,
      },
    };
  `,
  nodemon: stripIndent`
    {
      "verbose": false,
      "ignore": ["node_modules/*"],
      "ext": "js,json"
    }
  `,
  editorconfig: stripIndent`
    # http://editorconfig.org

    root = true

    [*]
    charset = utf-8
    end_of_line = lf
    indent_style = space
    indent_size = 2
    trim_trailing_whitespace = true
    insert_final_newline = true
  `,
  readme: (project, user) => stripIndent`
    # ${project}

    A NodeJS Program made by ${user}

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
    Copyright © ${new Date().getFullYear()} ${user}. Licensed under the MIT license, see [the license](./LICENSE)
  `,
};
