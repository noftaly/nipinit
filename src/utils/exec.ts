import type { ExecException, ExecOptions } from 'node:child_process';
import { exec as execSync } from 'node:child_process';

export default async function exec(cmd: string, options?: ExecOptions): Promise<ExecException | string> {
  return new Promise((resolve, reject) => {
    execSync(cmd, options, (error, stdout, stderr) => {
      if (error)
        reject(error);
      resolve(stdout || stderr);
    });
  });
}
