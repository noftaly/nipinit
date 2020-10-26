import Conf from 'conf';

import type { StoredPreset, GeneralAnswers } from '../types';


type AnonymousPreset = Omit<StoredPreset, 'userName' | 'name'>;

export default class PresetManager {
  public readonly conf: Conf<Record<string, StoredPreset>>;

  constructor() {
    this.conf = new Conf<Record<string, StoredPreset>>();
  }

  public addPreset(preset: StoredPreset): void {
    this.conf.set(preset.name, preset);
  }

  public findByName(name: string): StoredPreset {
    return this.conf.get(name);
  }

  public findSame(answers: GeneralAnswers): StoredPreset | null {
    const allPresets: StoredPreset[] = this.getList();
    const allAnonymousPreset: AnonymousPreset[] = allPresets.map(({ userName, name, ...keep }) => keep);

    const currentConfiguration: AnonymousPreset = {
      git: answers.git,
      github: answers.github,
      license: answers.license,
      module: answers.module,
      babel: answers.babel,
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
    return Object.values(this.conf.store);
  }

  public getNames(): string[] {
    return Object.keys(this.conf.store);
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
