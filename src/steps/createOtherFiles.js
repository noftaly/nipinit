import { promises as fs } from 'fs';
import path from 'path';

import filesContent from '../../data/files.js';


async function createOtherFiles(answers, paths, editablePackageJson) {
  await fs.writeFile(path.join(paths.project, '.editorconfig'), filesContent.editorconfig);
  await fs.writeFile(path.join(paths.project, 'README.md'), filesContent.readme(answers.projectName, answers.userName));
  await fs.mkdir(path.join(paths.project, 'src'));
  await fs.writeFile(path.join(paths.project, 'src', 'main.js'), filesContent.mainjs);
  editablePackageJson.set('main', './src/main.js');
  await fs.writeFile(path.join(paths.project, '.env'), '');
  await fs.writeFile(path.join(paths.project, '.env.example'), '');
}

export default createOtherFiles;
