import editJson from 'edit-json-file';
import { ExtraModulesAnswer } from '../models/ChoiceAnswers';
import { GeneralAnswers } from '../models/PromptAnswers';

export default function configureScripts(editablePackageJson: editJson.JsonEditor, answers: GeneralAnswers): void {
  const prod = answers.extras.includes(ExtraModulesAnswer.Crossenv) ? 'cross-env NODE_ENV=production' : '';
  const dev = answers.extras.includes(ExtraModulesAnswer.Crossenv) ? 'cross-env NODE_ENV=development' : '';

  editablePackageJson.unset('scripts.test');
  if (answers.babel) {
    editablePackageJson.set('scripts.build', 'babel src -d dist/');
    editablePackageJson.set('scripts.start', `npm run build && ${prod} node ./dist/main.js`.replace(/\s+/g, ' '));
  } else {
    editablePackageJson.set('scripts.start', `${prod} node ./src/main.js`.replace(/\s+/g, ' ').trim());
  }

  if (answers.extras.includes(ExtraModulesAnswer.Nodemon))
    editablePackageJson.set('scripts.dev:watch', `nodemon --exec ${dev} ${answers.babel ? 'babel-' : ''}node ./src/main.js`.replace(/\s+/g, ' '));
  editablePackageJson.set('scripts.dev', `${dev} ${answers.babel ? 'babel-' : ''}node ./src/main.js`.replace(/\s+/g, ' ').trim());
  editablePackageJson.set('scripts.lint', 'eslint .');
  editablePackageJson.set('scripts.lint:fix', 'eslint . --fix');
}
