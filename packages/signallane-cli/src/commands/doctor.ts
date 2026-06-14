import fs from 'node:fs';
import { getDraftsDir, getHistoryPath, getProfilePath, getStorageDir } from '../lib/storage.js';

export function doctorCommand() {
  const checks = [
    ['storage dir', fs.existsSync(getStorageDir())],
    ['profile.json', fs.existsSync(getProfilePath())],
    ['drafts/', fs.existsSync(getDraftsDir())],
    ['history.json', fs.existsSync(getHistoryPath())],
  ];
  return checks.map(([name, ok]) => `${ok ? 'OK' : 'MISSING'} ${name}`).join('\n');
}
