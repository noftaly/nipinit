import { promises as fs } from 'fs';
import path from 'path';
import { Paths } from '../models/Paths';


const licenses = {
  MIT: 'mit.txt',
  'GPL-v3.0-only': 'gpl.txt',
  ISC: 'isc.txt',
};

export default async function getLicense(
  paths: Paths,
  license: string,
  userName: string,
  programName: string,
): Promise<string> {
  const licenseSlug = licenses[license];
  const licensePath = path.resolve(paths.data.licenses, licenseSlug);
  const fullLicense = await fs.readFile(licensePath, { encoding: 'utf-8' });

  return fullLicense
    .replace(/\[year]/g, new Date().getFullYear().toString())
    .replace(/\[fullname]/g, userName)
    .replace(/\[program]/g, programName);
}
