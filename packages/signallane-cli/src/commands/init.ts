import fs from 'node:fs';
import { getDraftsDir, getHistoryPath, getProfilePath, getStorageDir, ensureStorage } from '../lib/storage.js';
import { emptyProfile, saveProfile } from '../lib/profile.js';

export function initCommand() {
  ensureStorage();
  fs.mkdirSync(getStorageDir(), { recursive: true });
  fs.mkdirSync(getDraftsDir(), { recursive: true });
  if (!fs.existsSync(getProfilePath())) saveProfile(emptyProfile());
  if (!fs.existsSync(getHistoryPath())) fs.writeFileSync(getHistoryPath(), '[]\n');
  return `Initialized local storage at ${getStorageDir()}`;
}
