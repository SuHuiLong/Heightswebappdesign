export interface PromptCandidate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  scenarioId?: string;
}

const STOP_WORDS = new Set([
  'a',
  'about',
  'an',
  'and',
  'are',
  'at',
  'can',
  'do',
  'for',
  'from',
  'get',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'show',
  'tell',
  'the',
  'these',
  'this',
  'to',
  'what',
  'which',
  'with',
]);

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreField(queryTokens: string[], value: string, weight: number) {
  const normalizedValue = value.toLowerCase();
  let score = 0;
  let matchCount = 0;

  for (const token of queryTokens) {
    if (normalizedValue.includes(token)) {
      score += token.length * weight;
      matchCount += 1;
    }
  }

  if (matchCount >= 2) {
    score += matchCount * weight * 2;
  }

  return { score, matchCount };
}

function scorePromptCandidate(query: string, candidate: PromptCandidate) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) {
    return 0;
  }

  const titleScore = scoreField(queryTokens, candidate.title, 4);
  const descriptionScore = scoreField(queryTokens, candidate.description, 2);
  const promptScore = scoreField(queryTokens, candidate.prompt, 5);

  const totalMatchCount =
    titleScore.matchCount + descriptionScore.matchCount + promptScore.matchCount;
  const exactPromptBoost = candidate.prompt.toLowerCase().includes(query.toLowerCase().trim())
    ? 18
    : 0;

  const totalScore =
    titleScore.score + descriptionScore.score + promptScore.score + exactPromptBoost;

  if (totalMatchCount < 2) {
    return 0;
  }

  return totalScore;
}

export function matchPromptCandidate<T extends PromptCandidate>(
  query: string,
  candidates: T[],
): T | null {
  if (query.trim().length < 4) {
    return null;
  }

  let bestCandidate: T | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = scorePromptCandidate(query, candidate);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestScore >= 12 ? bestCandidate : null;
}

export function buildFallbackClarificationMessage(
  workspaceLabel: string,
  suggestions: string[],
) {
  const trimmedSuggestions = suggestions
    .map((suggestion) => suggestion.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!trimmedSuggestions.length) {
    return `I do not have a fixed demo answer for that exact ${workspaceLabel} question yet. Try one of the suggested prompts instead.`;
  }

  return [
    `I do not have a fixed demo answer for that exact ${workspaceLabel} question yet.`,
    'Try one of these instead:',
    ...trimmedSuggestions.map((suggestion) => `- ${suggestion}`),
  ].join('\n');
}
