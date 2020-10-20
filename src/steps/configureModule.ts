import editJson from 'edit-json-file';

function configureModule(editablePackageJson: editJson.JsonEditor): void {
  editablePackageJson.set('type', 'module');
  editablePackageJson.set('engines', { node: '>= 14.0.0' });
}

export default configureModule;
