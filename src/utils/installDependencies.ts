import path from 'node:path';
import SoftAddDependencies, { SaveMode } from 'soft-add-dependencies';
import exec from './exec';

export default async function installDependencies(
  install: boolean,
  project: string,
  dependencies: Set<string>,
): Promise<void> {
  await (install
    ? exec(`npm i -D ${[...dependencies].join(' ')}`, { cwd: project })
    : new SoftAddDependencies(path.join(project, 'package.json'))
      .add(...dependencies)
      .as(SaveMode.Dev)
      .run());
}
