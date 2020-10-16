import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getPaths(projectName) {
  const paths = {};
  paths.project = path.join(process.cwd(), projectName);
  paths.dataDir = path.join(__dirname, '..', '..', 'data');
  paths.dest = {};
  paths.data = {};
  paths.dest.gitignore = path.join(paths.project, '.gitignore');
  paths.dest.ghFolder = path.join(paths.project, '.github');
  paths.dest.issueTemplateFolder = path.join(paths.dest.ghFolder, 'ISSUE_TEMPLATE');
  paths.data.issueTemplateFolder = path.join(paths.dataDir, '.github', 'ISSUE_TEMPLATE');
  paths.data.lintAction = path.join(paths.dataDir, '.github', 'workflows', 'lint.yml');
  paths.dest.lintAction = path.join(paths.dest.ghFolder, 'workflows', 'lint.yml');
  return paths;
}

export default getPaths;
