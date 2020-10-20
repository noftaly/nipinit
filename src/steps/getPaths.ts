import path from 'path';
import { Paths } from '../models/paths';


function getPaths(projectName: string): Paths {
  const project = path.join(process.cwd(), projectName);
  const dataDir = path.join(__dirname, '..', '..', 'data');
  const githubFolder = path.join(project, '.github');

  const paths: Paths = {
    project,
    dataDir,
    dest: {
      gitignore: path.join(project, '.gitignore'),
      githubFolder,
      issueTemplateFolder: path.join(githubFolder, 'ISSUE_TEMPLATE'),
      lintAction: path.join(githubFolder, 'workflows', 'lint.yml'),
    },
    data: {
      issueTemplateFolder: path.join(dataDir, 'github', 'ISSUE_TEMPLATE'),
      lintAction: path.join(dataDir, 'github', 'workflows', 'lint.yml'),
    },
  };
  return paths;
}

export default getPaths;
