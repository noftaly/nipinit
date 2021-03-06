import { promises as fs } from 'fs';
import path from 'path';
import type editJson from 'edit-json-file';
import ejs from 'ejs';
import type { GeneralAnswers, Paths } from '../types';
import { LanguageAnswer } from '../types';


export default async function createOtherFiles(
  answers: GeneralAnswers,
  paths: Paths,
  editablePackageJson: editJson.JsonEditor,
): Promise<void> {
  // Generate README.md
  const template = await fs.readFile(path.join(paths.dataDir, 'readme.ejs'), { encoding: 'utf-8' });
  const rendered = ejs.render(template, { ...answers });
  await fs.writeFile(path.join(paths.project, 'README.md'), rendered);

  // Generate .editorconfig
  await fs.copyFile(
    path.join(paths.dataDir, 'editorconfig'),
    path.join(paths.project, '.editorconfig'),
  );

  // Create src/ and generate main.js/main.ts
  const mainFile = `main.${answers.language === LanguageAnswer.Typecript ? 'ts' : 'js'}`;
  await fs.mkdir(path.join(paths.project, 'src'));
  await fs.copyFile(
    path.join(paths.dataDir, 'main.js'),
    path.join(paths.project, 'src', mainFile),
  );

  // Update main file in package.json
  editablePackageJson.set('main', `./src/${mainFile}`);

  // Generate .env and .env.example
  await fs.writeFile(path.join(paths.project, '.env'), '');
  await fs.writeFile(path.join(paths.project, '.env.example'), '');
}
