import type editJson from 'edit-json-file';

export default function configureModule(editablePackageJson: editJson.JsonEditor): void {
  editablePackageJson.set('type', 'module');
  editablePackageJson.set('engines', { node: '>= 14.0.0' });
}
