import { EslintConfigAnswer } from '../types';
import type { EslintPluginEntry } from '../types';

const eslintConfigs: Record<EslintConfigAnswer, EslintPluginEntry> = {
  [EslintConfigAnswer.Noftalint]: {
    extends: 'noftalint',
    plugins: ['eslint-config-noftalint', ...['import', 'node', 'unicorn'].map(pl => `eslint-plugin-${pl}`)],
  },
  [EslintConfigAnswer.NoftalintTypescript]: {
    extends: 'noftalint/typescript',
    plugins: ['eslint-config-noftalint', ...['import', 'node', 'unicorn'].map(pl => `eslint-plugin-${pl}`)],
  },
  [EslintConfigAnswer.Airbnb]: {
    extends: 'airbnb-base',
    plugins: ['eslint-config-airbnb-base', 'eslint-plugin-import'],
  },
  [EslintConfigAnswer.Standard]: {
    extends: 'standard',
    plugins: ['eslint-config-standard', ...['import', 'standard', 'promise', 'node'].map(pl => `eslint-plugin-${pl}`)],
  },
  [EslintConfigAnswer.Recommended]: {
    extends: 'eslint:recommended',
    plugins: [],
  },
  [EslintConfigAnswer.TypescriptRecommended]: {
    extends: 'plugin:@typescript-eslint/recommended',
    plugins: [],
  },
  [EslintConfigAnswer.None]: {
    extends: '',
    plugins: [],
  },
};

export default function getEslintConfigInfo(name: EslintConfigAnswer): EslintPluginEntry {
  return eslintConfigs[name];
}
