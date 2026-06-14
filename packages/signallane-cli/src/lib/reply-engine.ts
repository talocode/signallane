import { compressWhitespace, normalizeText } from './text-cleaner.js';

export function generateReplies(source: string, context = '') {
  const topic = extractTopic(source || context);
  const subject = topic || 'this';
  return [
    `Useful, but only if the workflow has memory, verification, and clear boundaries.`,
    `The real issue is execution design. Good agents need context, tools, approval gates, and feedback loops.`,
    `That is why builders keep pushing for local-first tools that stay close to the workflow instead of adding more noise.`,
  ].map((text, index) => ({
    label: `Option ${index + 1}`,
    text: tweakForSource(text, subject),
  }));
}

export function improveDraft(text: string) {
  const clean = compressWhitespace(normalizeText(text));
  if (!clean) return '';
  const short = clean.replace(/\b(very|really|extremely|basically|actually)\b/gi, '').replace(/\s+/g, ' ').trim();
  const concise = short.length > 160 ? short.slice(0, 157).trimEnd() + '...' : short;
  return concise.replace(/AI-powered/gi, 'local-first').replace(/\butilize\b/gi, 'use');
}

function extractTopic(input: string) {
  const words = normalizeText(input).split(/\s+/).filter(Boolean).slice(0, 8);
  return words.join(' ').replace(/[^\w\s-]/g, '').trim();
}

function tweakForSource(text: string, subject: string) {
  if (subject && subject !== 'this') return text.replace('this', subject);
  return text;
}
