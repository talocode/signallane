import { generateHooks } from '../lib/hooks-engine.js';

export function hooksCommand(topic: string) {
  return generateHooks(topic);
}
