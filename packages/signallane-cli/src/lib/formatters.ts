export function formatSection(title: string, lines: string[]) {
  return [title, ...lines.map((line) => `- ${line}`)].join('\n');
}
