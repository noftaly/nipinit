import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function getLicense(license, userName, programName) {
  const licenses = {
    MIT: 'mit.txt',
    'GPL-v3.0-only': 'gpl.txt',
    ISC: 'isc.txt',
  };
  const licenseSlug = licenses[license];
  const licensePath = path.resolve(__dirname, '..', 'data', 'licenses', licenseSlug);
  const fullLicense = await fs.readFile(licensePath, { encoding: 'utf-8' });

  return fullLicense
    .replace(/\[year]/g, new Date().getFullYear())
    .replace(/\[fullname]/g, userName)
    .replace(/\[program]/g, programName);
}
