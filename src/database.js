import fsSync, { promises as fs } from 'fs';

import low from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync.js';

import handleError from './handleError.js';


if (!fsSync.existsSync('../userGenerated')) await fs.mkdir('../userGenerated').catch(handleError);
const adapter = new FileAsync('../userGenerated/preferences.json');
const db = await low(adapter);
await db.defaults({ configurations: [] })
  .write();

db._.mixin({
  findSame: (config1, config2) => {
    const anonConfig1 = config1.map(({ name, projectName, ...keep }) => keep);
    const anonConfig2 = [config2].map(({ name, projectName, ...keep }) => keep);

    const stringifiedConfig1 = JSON.stringify(anonConfig1).replace(/\s/g, '');
    const stringifiedConfig2 = JSON.stringify(anonConfig2).replace(/\s/g, '');

    return stringifiedConfig1 === stringifiedConfig2 ? config1 : false;
  },
});

export default db;
