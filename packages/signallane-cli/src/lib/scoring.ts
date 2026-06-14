export interface ReplyScore {
  clarity: number;
  humanTone: number;
  specificity: number;
  aiRisk: 'Low' | 'Medium' | 'High';
  relevance: number;
  conversationFit: number;
  originality: number;
  suggestion: string;
}

export function scoreReply(text: string): ReplyScore {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const length = words.length;
  const hasSpecificNouns = /\b(builders?|founders?|engineers?|workflow|context|verification|reply|draft)\b/i.test(text);
  const aiPhrases = /\b(in summary|delve|unlock|supercharge|leverage|game-changer|cutting-edge)\b/i.test(text);
  return {
    clarity: clampScore(length < 18 ? 9 : length < 35 ? 8 : 6),
    humanTone: clampScore(aiPhrases ? 4 : 7),
    specificity: clampScore(hasSpecificNouns ? 8 : 5),
    aiRisk: aiPhrases || length > 50 ? 'Medium' : 'Low',
    relevance: clampScore(hasSpecificNouns ? 8 : 6),
    conversationFit: clampScore(length < 40 ? 8 : 6),
    originality: clampScore(hasSpecificNouns ? 7 : 5),
    suggestion: hasSpecificNouns ? 'Keep the specificity, but trim any extra filler.' : 'Make it more specific and less generic.',
  };
}

function clampScore(value: number) {
  return Math.max(1, Math.min(10, value));
}
