import { Configuration } from './Configuration';

export interface StoredPreset extends Configuration {
  name: string,
}

export type AnonymousPreset = Omit<StoredPreset, 'userName' | 'name'>;
