import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync.js';

import handleError from './utils/handleError.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const folder = path.join(__dirname, '..', 'userGenerated');

if (!fsSync.existsSync(folder))
  await fs.mkdir(folder).catch(handleError);
const adapter = new FileAsync(`${folder}/preferences.json`);
const db = await low(adapter);
await db.defaults({ presets: [] })
  .write();

db._.mixin({
  findSame: (preset1, preset2) => {
    const anonPreset1 = preset1.map(({ name, projectName, ...keep }) => keep);
    const anonPreset2 = [preset2].map(({ name, projectName, ...keep }) => keep);

    const stringifiedPreset1 = JSON.stringify(anonPreset1).replace(/\s/g, '');
    const stringifiedPreset2 = JSON.stringify(anonPreset2).replace(/\s/g, '');

    return stringifiedPreset1 === stringifiedPreset2 ? preset1 : false;
  },
});

export default db;
