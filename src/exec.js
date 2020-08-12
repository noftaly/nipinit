import { exec as execWithoutPromises } from 'child_process';

export default function exec(cmd, options) {
  return new Promise((resolve, reject) => {
    execWithoutPromises(cmd, options, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout || stderr);
    });
  });
}
