import { promises as fs } from 'fs';
import path from 'path';
import type editJson from 'edit-json-file';
import type { Paths, GeneralAnswers } from '../types';
import getLicense from '../utils/getLicense';


export default async function createLicense(
  answers: GeneralAnswers,
  editablePackageJson: editJson.JsonEditor,
  paths: Paths,
): Promise<void> {
  const license = await getLicense(paths, answers.license, answers.userName, answers.projectName);
  editablePackageJson.set('license', answers.license);
  await fs.writeFile(path.join(paths.project, 'LICENSE'), license);
}
