import path from 'path';
import editJson from 'edit-json-file';
import exec from '../utils/exec.js';


async function initNpm(paths, answers) {
  await exec('npm init -y', { cwd: paths.project });
  const editablePackageJson = editJson(path.join(paths.project, 'package.json'), { autosave: true });
  editablePackageJson.set('author', answers.userName);
  return editablePackageJson;
}

export default initNpm;
