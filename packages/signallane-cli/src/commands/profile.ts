import { loadProfile, saveProfile, emptyProfile, type Profile } from '../lib/profile.js';
import prompts from 'prompts';

export function profileShowCommand() {
  return loadProfile();
}

export function profileSetCommand(profile: Partial<Profile>) {
  const current = loadProfile();
  const next = { ...emptyProfile(), ...current, ...profile };
  saveProfile(next);
  return next;
}

export async function profileSetInteractive() {
  const current = loadProfile();
  const answers = await prompts<Record<string, string>>([
    { type: 'text', name: 'name', message: 'Name', initial: current.name },
    { type: 'text', name: 'role', message: 'Role', initial: current.role },
    { type: 'text', name: 'topics', message: 'Topics (comma-separated)', initial: current.topics.join(', ') },
    { type: 'text', name: 'voice', message: 'Voice', initial: current.voice },
    { type: 'text', name: 'audience', message: 'Audience (comma-separated)', initial: current.audience.join(', ') },
    { type: 'text', name: 'avoid', message: 'Avoid (comma-separated)', initial: current.avoid.join(', ') },
  ]);
  return profileSetCommand({
    name: answers.name,
    role: answers.role,
    topics: splitList(answers.topics ?? ''),
    voice: answers.voice,
    audience: splitList(answers.audience ?? ''),
    avoid: splitList(answers.avoid ?? ''),
  });
}

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
