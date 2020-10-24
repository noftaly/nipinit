import { promises as fs } from 'fs';
import path from 'path';
import editJson from 'edit-json-file';
import { Paths } from '../models/Paths';
import { GeneralAnswers } from '../models/PromptAnswers';
import getLicense from '../utils/getLicense';


async function createLicense(
  answers: GeneralAnswers,
  editablePackageJson: editJson.JsonEditor,
  paths: Paths,
): Promise<void> {
  const license = await getLicense(paths, answers.license, answers.userName, answers.projectName);
  editablePackageJson.set('license', answers.license);
  await fs.writeFile(path.join(paths.project, 'LICENSE'), license);
}

export default createLicense;
