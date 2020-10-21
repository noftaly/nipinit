import { EslintConfigAnswer } from './models/ChoiceAnswers';
import { EslintPluginEntry } from './models/EslintPluginEntry';

const eslintConfigs: Record<EslintConfigAnswer, EslintPluginEntry> = {
  [EslintConfigAnswer.Noftalint]: {
    extends: 'noftalint',
    plugins: 'eslint-config-noftalint eslint-plugin-import eslint-plugin-node eslint-plugin-unicorn',
  },
  [EslintConfigAnswer.Airbnb]: {
    extends: 'airbnb-base',
    plugins: 'eslint-config-airbnb-base eslint-plugin-import',
  },
  [EslintConfigAnswer.Standard]: {
    extends: 'standard',
    plugins: 'eslint-config-standard eslint-plugin-import eslint-plugin-standard eslint-plugin-promise eslint-plugin-node',
  },
  [EslintConfigAnswer.Recommended]: {
    extends: 'eslint:recommended',
    plugins: '',
  },
  [EslintConfigAnswer.None]: {
    extends: '',
    plugins: '',
  },
};

export default function getEslintConfigInfo(name: EslintConfigAnswer): EslintPluginEntry {
  return eslintConfigs[name];
}
