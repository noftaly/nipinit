import { promises as fs } from 'fs';
import path from 'path';
import type editJson from 'edit-json-file';
import type FilesData from '../structures/FilesData';
import type { GeneralAnswers, Paths } from '../types';
import { LanguageAnswer } from '../types';


export default async function createOtherFiles(
  answers: GeneralAnswers,
  filesData: FilesData,
  paths: Paths,
  editablePackageJson: editJson.JsonEditor,
): Promise<void> {
  const mainFile = `main.${answers.language === LanguageAnswer.Typecript ? 'ts' : 'js'}`;

  await fs.writeFile(path.join(paths.project, '.editorconfig'), filesData.getEditorConfig());
  await fs.writeFile(path.join(paths.project, 'README.md'), filesData.getReadme());
  await fs.mkdir(path.join(paths.project, 'src'));
  await fs.writeFile(path.join(paths.project, 'src', mainFile), filesData.getMain());
  editablePackageJson.set('main', `./src/${mainFile}`);
  await fs.writeFile(path.join(paths.project, '.env'), '');
  await fs.writeFile(path.join(paths.project, '.env.example'), '');
}
