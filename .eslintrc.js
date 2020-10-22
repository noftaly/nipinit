module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'noftalint',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  ignorePatterns: ['node_modules/', 'playground/', 'build/', './**/*.d.ts'],
  rules: {
    'node/file-extension-in-import': 'off',
    'import/extensions': 'off',

    // We have disable these rules because it is a CLT
    'node/no-sync': 'off',
    'node/no-process-exit': 'off',

    // We have to disable/change all these rules because we are using TypeScript
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      vars: 'all',
      args: 'after-used',
      argsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    }],

    'node/shebang': ['error', {
      convertPath: {
        'src/main.ts': ['^src/main.ts$', 'build/src/main.js'],
      },
    }],
  },
  env: {
    node: true,
  },
  overrides: [{
    files: ['.eslintrc.js'],
    rules: {
      'import/no-commonjs': 'off',
    },
  }],
  settings: {
    node: { tryExtensions: ['.ts', '.d.ts', '.js'] },
  },
};
