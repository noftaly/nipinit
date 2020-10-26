import { promises as fs } from 'fs';
import path from 'path';
import type editJson from 'edit-json-file';
import type FilesData from '../structures/FilesData';
import type { Paths } from '../types';


export default async function createOtherFiles(
  filesData: FilesData,
  paths: Paths,
  editablePackageJson: editJson.JsonEditor,
): Promise<void> {
  await fs.writeFile(path.join(paths.project, '.editorconfig'), filesData.getEditorConfig());
  await fs.writeFile(path.join(paths.project, 'README.md'), filesData.getReadme());
  await fs.mkdir(path.join(paths.project, 'src'));
  await fs.writeFile(path.join(paths.project, 'src', 'main.js'), filesData.getMainjs());
  editablePackageJson.set('main', './src/main.js');
  await fs.writeFile(path.join(paths.project, '.env'), '');
  await fs.writeFile(path.join(paths.project, '.env.example'), '');
}
