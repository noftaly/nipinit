import { EslintConfigAnswer } from '../types';
import type { EslintPluginEntry } from '../types';

const plugins = (...eslintPlugins: string[]): string[] => eslintPlugins.map(pl => `eslint-plugin-${pl}`);

const eslintConfigs: Record<EslintConfigAnswer, EslintPluginEntry> = {
  [EslintConfigAnswer.Noftalint]: {
    extends: 'noftalint',
    plugins: ['eslint-config-noftalint', ...plugins('import', 'node', 'unicorn')],
  },
  [EslintConfigAnswer.NoftalintTypescript]: {
    extends: 'noftalint/typescript',
    plugins: ['eslint-config-noftalint', ...plugins('import', 'node', 'unicorn')],
  },
  [EslintConfigAnswer.Airbnb]: {
    extends: 'airbnb-base',
    plugins: ['eslint-config-airbnb-base', 'eslint-plugin-import'],
  },
  [EslintConfigAnswer.Standard]: {
    extends: 'standard',
    plugins: ['eslint-config-standard', ...plugins('import', 'standard', 'promise', 'node')],
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
