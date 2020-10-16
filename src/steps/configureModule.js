function configureModule(editablePackageJson) {
  editablePackageJson.set('type', 'module');
  editablePackageJson.set('engines', { node: '>= 14.0.0' });
}

export default configureModule;
