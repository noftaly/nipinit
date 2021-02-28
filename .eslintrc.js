module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'noftalint',
    'noftalint/typescript',
  ],
  ignorePatterns: ['node_modules/', 'playground/', 'lib/', './**/*.d.ts'],
  rules: {
    'node/file-extension-in-import': 'off',
    'import/extensions': 'off',

    'class-methods-use-this': 'off',

    // We have disable these rules because it is a CLT
    'node/no-sync': 'off',
    'node/no-process-exit': 'off',

    // We have to change this rule because we are using TypeScript
    'node/shebang': ['error', {
      convertPath: {
        'src/main.ts': ['^src/main.ts$', 'lib/main.js'],
      },
    }],
  },
};
