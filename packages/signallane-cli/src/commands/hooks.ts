import { generateHooks, HOOK_STYLES, type HookStyle } from '../lib/hooks-engine.js';

export function hooksCommand(topic: string, count = 10, style?: string) {
  const safeStyle = HOOK_STYLES.includes(style as HookStyle) ? (style as HookStyle) : 'default';
  return generateHooks(topic, count, safeStyle);
}

export function formatHooksOutput(topic: string, style: HookStyle, hooks: string[]) {
  return [
    'SignalLane Hooks',
    '',
    `Topic: ${topic}`,
    `Style: ${style}`,
    `Count: ${hooks.length}`,
    '',
    ...hooks.map((hook, index) => `${index + 1}. ${hook}`),
  ].join('\n');
}
