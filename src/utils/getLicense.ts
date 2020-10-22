import { promises as fs } from 'fs';
import path from 'path';


const licenses = {
  MIT: 'mit.txt',
  'GPL-v3.0-only': 'gpl.txt',
  ISC: 'isc.txt',
};

export default async function getLicense(license: string, userName: string, programName: string): Promise<string> {
  const licenseSlug = licenses[license];
  const licensePath = path.resolve(__dirname, '..', 'data', 'licenses', licenseSlug);
  const fullLicense = await fs.readFile(licensePath, { encoding: 'utf-8' });

  return fullLicense
    .replace(/\[year]/g, new Date().getFullYear().toString())
    .replace(/\[fullname]/g, userName)
    .replace(/\[program]/g, programName);
}
