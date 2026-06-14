import { generateAngles } from '../lib/angle-engine.js';

export function anglesCommand(topic: string) {
  return generateAngles(topic);
}
