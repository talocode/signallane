import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { emptyProfile, saveProfile, loadProfile } from '../dist/lib/profile.js';
import { generateReplies, improveDraft } from '../dist/lib/reply-engine.js';
import { scoreReply } from '../dist/lib/scoring.js';
import { generateAngles } from '../dist/lib/angle-engine.js';
import { generateHooks } from '../dist/lib/hooks-engine.js';
import { initCommand } from '../dist/commands/init.js';

test('profile creation', () => {
  const profile = emptyProfile();
  assert.deepEqual(profile, { name: '', role: '', topics: [], voice: '', audience: [], avoid: [] });
});

test('reply generation', () => {
  const replies = generateReplies('AI coding agents are getting better but still unreliable.');
  assert.equal(replies.length, 3);
});

test('improve draft', () => {
  assert.match(improveDraft('this is very interesting and useful for builders'), /interesting and useful for builders/);
});

test('reply score', () => {
  const score = scoreReply('AI tools are useful when they understand context.');
  assert.ok(score.clarity >= 1);
});

test('angles generation', () => {
  assert.equal(generateAngles('open source AI tools').length, 5);
});

test('hooks generation', () => {
  assert.equal(generateHooks('AI coding agents').length, 10);
});

test('local storage creation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'signallane-'));
  process.env.SIGNALLANE_HOME = dir;
  initCommand();
  saveProfile(emptyProfile());
  assert.deepEqual(loadProfile(), emptyProfile());
  delete process.env.SIGNALLANE_HOME;
  fs.rmSync(dir, { recursive: true, force: true });
});

test('package metadata', async () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.name, '@talocode/signallane');
  assert.equal(pkg.bin.signallane, 'dist/index.js');
});
