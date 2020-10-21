module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'noftalint',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['node_modules/', 'playground/', 'build/', '**/*.d.ts', 'gulpfile.babel.js'],
  rules: {
    // We have disable these rules because it is a CLT
    'node/no-sync': 'off',

    // We have to disable/change all these rules because we are using TypeScript
    'node/file-extension-in-import': 'off',
    'node/no-missing-import': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['.eslintrc.js'],
      rules: {
        'import/no-commonjs': 'off',
      },
    },
  ],
};
