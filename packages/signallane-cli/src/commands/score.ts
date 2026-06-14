import { scoreReply } from '../lib/scoring.js';

export function scoreCommand(text: string) {
  return scoreReply(text);
}
