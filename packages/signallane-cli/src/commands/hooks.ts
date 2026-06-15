import { generateHooks, HOOK_STYLES, type HookStyle } from '../lib/hooks-engine.js';

export function hooksCommand(topic: string, count = 10, style?: string) {
  const safeStyle = HOOK_STYLES.includes(style as HookStyle) ? (style as HookStyle) : 'default';
  return generateHooks(topic, count, safeStyle);
}
