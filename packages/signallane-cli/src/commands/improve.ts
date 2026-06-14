import { improveDraft } from '../lib/reply-engine.js';

export function improveCommand(text: string) {
  return improveDraft(text);
}
