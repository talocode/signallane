import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { emptyProfile, saveProfile, loadProfile } from '../dist/lib/profile.js';
import { generateReplies, improveDraft } from '../dist/lib/reply-engine.js';
import { scoreReply } from '../dist/lib/scoring.js';
import { generateAngles } from '../dist/lib/angle-engine.js';
import { generateHooks, HOOK_STYLES } from '../dist/lib/hooks-engine.js';
import { initCommand } from '../dist/commands/init.js';
import { hooksCommand } from '../dist/commands/hooks.js';
import { examplesCommand } from '../dist/commands/examples.js';
import { VERSION } from '../dist/lib/version.js';

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

test('hooks generation default count', () => {
  assert.equal(generateHooks('AI coding agents').length, 10);
});

test('hooks custom count', () => {
  assert.equal(generateHooks('AI coding agents', 20).length, 20);
});

test('hooks max count cap', () => {
  assert.equal(generateHooks('AI coding agents', 100).length, 50);
});

test('hooks min count cap', () => {
  assert.equal(generateHooks('AI coding agents', 0).length, 1);
});

test('hooks style variants', () => {
  for (const style of HOOK_STYLES) {
    assert.ok(generateHooks('open source AI tools', 1, style).length >= 1);
  }
});

test('examples command', () => {
  const lines = examplesCommand();
  assert.equal(lines[0], 'SignalLane Examples');
  assert.ok(lines.some((line) => line.includes('signallane hooks --topic "AI coding agents"')));
});

test('version constant', () => {
  assert.equal(VERSION, '0.1.1');
});

test('package metadata', async () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.name, '@talocode/signallane');
  assert.equal(pkg.version, '0.1.1');
  assert.equal(pkg.bin.signallane, 'dist/index.js');
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
