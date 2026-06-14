import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const SIGNALLANE_DIR = path.join(os.homedir(), '.signallane');
export const PROFILE_PATH = path.join(SIGNALLANE_DIR, 'profile.json');
export const DRAFTS_DIR = path.join(SIGNALLANE_DIR, 'drafts');
export const HISTORY_PATH = path.join(SIGNALLANE_DIR, 'history.json');

export function getStorageDir() {
  return process.env.SIGNALLANE_HOME || SIGNALLANE_DIR;
}

export function getProfilePath() {
  return path.join(getStorageDir(), 'profile.json');
}

export function getDraftsDir() {
  return path.join(getStorageDir(), 'drafts');
}

export function getHistoryPath() {
  return path.join(getStorageDir(), 'history.json');
}

export function ensureStorage() {
  fs.mkdirSync(getStorageDir(), { recursive: true });
  fs.mkdirSync(getDraftsDir(), { recursive: true });
}

export function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(filePath: string, value: unknown) {
  ensureStorage();
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}
