const eslintConfigs = {
  noftalint: {
    extends: 'noftalint',
    plugins: 'eslint-config-noftalint eslint-plugin-import eslint-plugin-node eslint-plugin-unicorn',
  },
  airbnb: {
    extends: 'airbnb-base',
    plugins: 'eslint-config-airbnb-base eslint-plugin-import',
  },
  standard: {
    extends: 'standard',
    plugins: 'eslint-config-standard eslint-plugin-import eslint-plugin-standard eslint-plugin-promise eslint-plugin-node',
  },
  recommended: {
    extends: 'eslint:recommended',
    plugins: '',
  },
};

export default function getEslintConfig(name) {
  return eslintConfigs[name];
}
