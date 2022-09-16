import path from 'node:path';
import editJson from 'edit-json-file';
import type { GeneralAnswers, Paths } from '../types';
import exec from '../utils/exec';

export default async function initNpm(paths: Paths, answers: GeneralAnswers): Promise<editJson.JsonEditor> {
  await exec('npm init -y', { cwd: paths.project });
  const editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });
  editablePackageJson.set('author', answers.userName);
  return editablePackageJson;
}
