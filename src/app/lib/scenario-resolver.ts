import { ALL_SCENARIOS, ScenarioDefinition } from './scenario-definitions';

/**
 * Resolve a user query to the best matching scenario.
 *
 * Strategy:
 * 1. Direct keyword match (weighted by frequency and specificity)
 * 2. Fuzzy semantic match on scenario titles and descriptions
 * 3. Fall back to null (no scenario matched — use legacy chat flow)
 */
export function resolveScenario(query: string): ScenarioDefinition | null {
  if (!query || query.trim().length < 5) return null;

  const normalized = query.toLowerCase().trim();

  // Score each scenario by keyword overlap
  let bestMatch: ScenarioDefinition | null = null;
  let bestScore = 0;

  for (const scenario of ALL_SCENARIOS) {
    let score = 0;

    for (const keyword of scenario.keywords) {
      const kw = keyword.toLowerCase();
      if (normalized.includes(kw)) {
        // Longer keywords get higher weight (more specific)
        score += kw.length;
      }
    }

    // Bonus for matching multiple distinct keywords (not just one repeated)
    const matchedKeywords = scenario.keywords.filter((kw) =>
      normalized.includes(kw.toLowerCase()),
    );
    if (matchedKeywords.length >= 2) {
      score += matchedKeywords.length * 4;
    }

    // Title / subtitle match bonus
    if (normalized.includes(scenario.title.toLowerCase())) {
      score += 20;
    }
    if (normalized.includes(scenario.subtitle.toLowerCase())) {
      score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = scenario;
    }
  }

  // Require a minimum score to avoid false positives
  if (bestScore < 6) return null;

  return bestMatch;
}

/**
 * Check if a query should trigger the generative workspace flow
 * instead of the legacy card-by-card chat flow.
 */
export function isGenerativeQuery(query: string): boolean {
  return resolveScenario(query) !== null;
}

/**
 * Get the staged loading messages for a matched scenario.
 */
export function getLoadingStages(query: string): string[] | null {
  const scenario = resolveScenario(query);
  return scenario?.loadingStages ?? null;
}
