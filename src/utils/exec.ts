import { exec as execSync, ExecException, ExecOptions } from 'child_process';


export default function exec(cmd: string, options?: ExecOptions): Promise<string | ExecException> {
  return new Promise((resolve, reject) => {
    execSync(cmd, options, (error, stdout, stderr) => {
      if (error)
        reject(error);
      resolve(stdout || stderr);
    });
  });
}
