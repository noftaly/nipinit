import type editJson from 'edit-json-file';
import type { GeneralAnswers } from '../types';
import { ExtraModulesAnswer, LanguageAnswer } from '../types';

export default function configureScripts(editablePackageJson: editJson.JsonEditor, answers: GeneralAnswers): void {
  const prod = answers.extras.includes(ExtraModulesAnswer.Crossenv) ? 'cross-env NODE_ENV=production ' : '';
  const dev = answers.extras.includes(ExtraModulesAnswer.Crossenv) ? 'cross-env NODE_ENV=development ' : '';

  editablePackageJson.unset('scripts.test');
  if (answers.language === LanguageAnswer.Babel) {
    editablePackageJson.set('scripts.build', 'babel src -d dist/');
    editablePackageJson.set('scripts.start', `npm run build && ${prod}node ./dist/main.js`.replace(/\s+/g, ' '));
  } else if (answers.language === LanguageAnswer.Typecript) {
    editablePackageJson.set('scripts.build', 'rm -rf ./dist && tsc');
    editablePackageJson.set('scripts.exec', 'node ./dist/src/main.js');
    editablePackageJson.set('scripts.start', `npm run build && ${prod}npm run exec`);
    editablePackageJson.set('scripts.dev', `npm run build && ${dev}npm run exec`);
  } else {
    editablePackageJson.set('scripts.start', `${prod} node ./src/main.js`.replace(/\s+/g, ' ').trim());
  }

  const useBabel = answers.language === LanguageAnswer.Babel;
  if (answers.extras.includes(ExtraModulesAnswer.Nodemon))
    editablePackageJson.set('scripts.dev:watch', `nodemon --exec ${dev}${useBabel ? 'babel-' : ''}node ./src/main.js`.replace(/\s+/g, ' '));
  editablePackageJson.set('scripts.dev', `${dev}${useBabel ? 'babel-' : ''}node ./src/main.js`.replace(/\s+/g, ' ').trim());
  editablePackageJson.set('scripts.lint', 'eslint .');
  editablePackageJson.set('scripts.lint:fix', 'eslint . --fix');
}
