function configureScripts(editablePackageJson, answers) {
  const prod = answers.extras.includes('cross-env') ? 'cross-env NODE_ENV=production' : '';
  const dev = answers.extras.includes('cross-env') ? 'cross-env NODE_ENV=development' : '';

  editablePackageJson.unset('scripts.test');
  if (answers.babel) {
    editablePackageJson.set('scripts.build', 'babel src -d dist/');
    editablePackageJson.set('scripts.start', `npm run build && ${prod} node ./dist/main.js`);
  } else {
    editablePackageJson.set('scripts.start', `${prod} node ./src/main.js`.trim());
  }

  if (answers.extras.includes('nodemon'))
    editablePackageJson.set('scripts.dev:watch', `nodemon --exec ${dev} ${answers.babel ? 'babel-' : ''}node ./src/main.js`);
  editablePackageJson.set('scripts.dev', `${dev} ${answers.babel ? 'babel-' : ''}node ./src/main.js`.trim());
  editablePackageJson.set('scripts.lint', 'eslint .');
  editablePackageJson.set('scripts.lint:fix', 'eslint . --fix');
}

export default configureScripts;
