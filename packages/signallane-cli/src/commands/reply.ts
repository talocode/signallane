import fs from 'node:fs';
import { generateReplies } from '../lib/reply-engine.js';

export function replyCommand(input: { text?: string; from?: string }) {
  const source = input.text ?? (input.from ? fs.readFileSync(input.from, 'utf8') : '');
  return generateReplies(source);
}
