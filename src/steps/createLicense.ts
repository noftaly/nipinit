import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { JsonEditor } from 'edit-json-file';
import ejs from 'ejs';
import type { GeneralAnswers, Paths } from '../types';

const licenses = {
  /* eslint-disable @typescript-eslint/naming-convention */
  MIT: 'mit.ejs',
  'GPL-v3.0-only': 'gpl.ejs',
  ISC: 'isc.ejs',
};

export default async function createLicense(
  answers: GeneralAnswers,
  editablePackageJson: JsonEditor,
  paths: Paths,
): Promise<void> {
  const licensePath = path.resolve(paths.data.licenses, licenses[answers.license]);
  const template = await fs.readFile(licensePath, { encoding: 'utf8' });
  const rendered = ejs.render(template, { fullname: answers.userName, program: answers.projectName });
  await fs.writeFile(path.join(paths.project, 'LICENSE'), rendered);

  editablePackageJson.set('license', answers.license);
}
