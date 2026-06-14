import { getProfilePath, readJson, writeJson } from './storage.js';

export interface Profile {
  name: string;
  role: string;
  topics: string[];
  voice: string;
  audience: string[];
  avoid: string[];
}

export const emptyProfile = (): Profile => ({
  name: '',
  role: '',
  topics: [],
  voice: '',
  audience: [],
  avoid: [],
});

export function loadProfile(): Profile {
  return readJson<Profile>(getProfilePath(), emptyProfile());
}

export function saveProfile(profile: Profile) {
  writeJson(getProfilePath(), profile);
}
