export function normalizeText(input: string) {
  return input.replace(/\r\n/g, '\n').trim();
}

export function compressWhitespace(input: string) {
  return input.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
