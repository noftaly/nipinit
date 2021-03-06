import Conf from 'conf';

import type { GeneralAnswers, StoredPreset } from '../types';
import { LanguageAnswer } from '../types';


type AnonymousPreset = Omit<StoredPreset, 'name' | 'userName'>;

export default class PresetManager {
  public readonly conf: Conf<Record<string, StoredPreset>>;

  constructor() {
    this.conf = new Conf<Record<string, StoredPreset>>({
      migrations: {
        '>=2.2.0': (store): void => {
          for (const [name, config] of Object.entries(store.store)) {
            /* eslint-disable @typescript-eslint/dot-notation */
            if ('module' in config && config['module'] === true)
              store.set(`${name}.language`, LanguageAnswer.Modules);
            else if ('babel' in config && config['babel'] === true)
              store.set(`${name}.language`, LanguageAnswer.Babel);
            else
              store.set(`${name}.language`, LanguageAnswer.Vanilla);
            store.delete(`${name}.module`);
            store.delete(`${name}.babel`);
            /* eslint-enable @typescript-eslint/dot-notation */
          }
        },
      },
    });
  }

  public addPreset(preset: StoredPreset): void {
    this.conf.set(preset.name, preset);
  }

  public findByName(name: string): StoredPreset {
    if (name === '__internal__')
      return null;
    return this.conf.get(name);
  }

  public findSame(answers: GeneralAnswers): StoredPreset | null {
    const allPresets: StoredPreset[] = this.getList();
    const allAnonymousPreset: AnonymousPreset[] = allPresets.map(({ userName, name, ...keep }) => keep);

    const currentConfiguration: AnonymousPreset = {
      git: answers.git,
      license: answers.license,
      language: answers.language,
      eslint: answers.eslint,
      extras: answers.extras,
    };
    const stringifiedCurrent: string = JSON.stringify(currentConfiguration).replace(/\s/g, '');

    for (const [i, preset] of allAnonymousPreset.entries()) {
      const stringifiedPreset = JSON.stringify(preset).replace(/\s/g, '');
      if (stringifiedPreset === stringifiedCurrent)
        return allPresets[i];
    }

    return null;
  }

  public getList(): StoredPreset[] {
    return Object.values(this.conf.store).filter(preset => preset.name !== '__internal__');
  }

  public getNames(): string[] {
    return Object.keys(this.conf.store).filter(preset => preset !== '__internal__');
  }

  public remove(name: string): boolean {
    if (!this.conf.get(name))
      return false;

    this.conf.delete(name);
    return true;
  }

  public createName(userName: string): string {
    const allNames = this.getNames();

    let suffix = 1;
    let possibleName = userName;
    let found = allNames.includes(possibleName);
    while (found) {
      possibleName = `${userName}-${suffix++}`;
      found = allNames.includes(possibleName);
    }
    return possibleName;
  }
}
