module.exports = {
  parser: '@babel/eslint-parser',
  extends: 'noftalint',
  ignorePatterns: ['.eslintrc.js', 'node_modules/', 'playground/'],
  rules: {
    'function-paren-newline': 'off',

    // Rule we disable because it is a CLT
    'node/no-process-exit': 'off',
    'node/no-sync': 'off',

    // We have to disable those rules because files are ES Modules...
    'node/file-extension-in-import': 'off',
    'import/extensions': 'off',
  },
  env: {
    node: true,
  },
};
