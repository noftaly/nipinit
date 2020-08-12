module.exports = {
  extends: 'noftalint',
  rules: {
    'function-paren-newline': 'off',

    // We have to disable those rules because files are ES Modules...
    'node/file-extension-in-import': 'off',
    'import/extensions': 'off',
  },
  env: {
    node: true,
  },
};
