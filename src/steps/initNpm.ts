import path from 'path';
import editJson from 'edit-json-file';
import { GeneralAnswers } from '../models/answerChoice';
import { Paths } from '../models/paths';
import exec from '../utils/exec';


async function initNpm(paths: Paths, answers: GeneralAnswers): Promise<editJson.JsonEditor> {
  await exec('npm init -y', { cwd: paths.project });
  const editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });
  editablePackageJson.set('author', answers.userName);
  return editablePackageJson;
}

export default initNpm;
