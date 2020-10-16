import { exec as execSync } from 'child_process';


export default function exec(cmd, options) {
  return new Promise((resolve, reject) => {
    execSync(cmd, options, (error, stdout, stderr) => {
      if (error)
        reject(error);
      resolve(stdout || stderr);
    });
  });
}
