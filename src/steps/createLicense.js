import { promises as fs } from 'fs';
import path from 'path';
import getLicense from '../getLicense.js';


async function createLicense(answers, editablePackageJson, paths) {
  const license = await getLicense(answers.license, answers.userName, answers.projectName);
  editablePackageJson.set('license', answers.license);
  await fs.writeFile(path.join(paths.project, 'LICENSE'), license);
}

export default createLicense;
