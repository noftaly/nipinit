import os from 'os';
import path from 'path';

import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';

import { StoredPreset, AnonymousPreset } from './models/StoredPreset';
import { GeneralAnswers } from './models/answerChoice';


class PresetManager {
  db: Keyv<StoredPreset>;
  list: Keyv<string[]>;

  constructor() {
    const base = path.join(os.tmpdir(), 'nipinit');
    this.db = new Keyv<StoredPreset>({
      store: new KeyvFile({
        filename: path.join(base, 'preferences.json'),
      }),
    });

    // Keyv only expose get/set/delete of a specific value, so we need another
    // db to keep track of all the preset's name
    this.list = new Keyv<string[]>({
      store: new KeyvFile({
        filename: path.join(base, 'all.json'),
      }),
    });
    this.init();
  }

  async init(): Promise<void> {
    const list = await this.list.get('presetsList');
    if (!list)
      this.list.set('presetsList', []);
  }

  async addPreset(preset: StoredPreset): Promise<void> {
    await this.db.set(preset.name, preset);

    const allNames = await this.getAllNames();
    allNames.push(preset.name);
    await this.list.set('presetsList', allNames);
  }

  async findFromName(name: string): Promise<StoredPreset> {
    const preset = await this.db.get(name);
    return preset;
  }

  async findSame(answers: GeneralAnswers): Promise<StoredPreset | null> {
    const allPresets: StoredPreset[] = await this.getList();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async getAllNames(): Promise<string[]> {
    const allNames = await this.list.get('presetsList');
    return allNames;
  }

  async getList(): Promise<StoredPreset[]> {
    const allNames = await this.getAllNames();
    if (!allNames)
      return [];

    const allPresetsPromises: Promise<StoredPreset>[] = [];

    for (const name of allNames)
      allPresetsPromises.push(this.db.get(name));

    const allPresets: StoredPreset[] = (await Promise.all(allPresetsPromises));
    return allPresets;
  }

  async remove(name: string): Promise<boolean> {
    const existed = await this.db.delete(name);

    if (existed) {
      const allNames = await this.getAllNames();
      allNames.splice(allNames.indexOf(name), 1);
      await this.list.set('presetsList', allNames);
    }
    return existed;
  }

  async createName(userName: string): Promise<string> {
    const allNames = await this.getAllNames();

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

export default PresetManager;
