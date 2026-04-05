import { ALL_SCENARIOS, SCENARIO_REGISTRY, ScenarioDefinition } from './scenario-definitions';
import type { WorkspaceId } from './workspace-definitions';

const DISABLED_SCENARIO_IDS = new Set(['dpi-traffic-anomalies']);

const WORKSPACE_SCENARIO_IDS: Record<WorkspaceId, string[]> = {
  fleet: ['firmware-regression', 'regional-incident', 'resource-planning'],
  support: [
    'autonomous-wifi-recovery',
    'critical-session-protection',
    'firmware-regression',
  ],
  growth: ['bandwidth-upsell', 'churn-prevention', 'vas-device-fingerprint'],
};

function getActiveScenarios(candidates: ScenarioDefinition[] = ALL_SCENARIOS) {
  return candidates.filter((scenario) => !DISABLED_SCENARIO_IDS.has(scenario.id));
}

function scoreScenarioMatch(query: string, scenario: ScenarioDefinition) {
  const normalized = query.toLowerCase().trim();
  let score = 0;

  for (const keyword of scenario.keywords) {
    const kw = keyword.toLowerCase();
    if (normalized.includes(kw)) {
      score += kw.length;
    }
  }

  const matchedKeywords = scenario.keywords.filter((kw) =>
    normalized.includes(kw.toLowerCase()),
  );
  if (matchedKeywords.length >= 2) {
    score += matchedKeywords.length * 4;
  }

  if (normalized.includes(scenario.title.toLowerCase())) {
    score += 20;
  }
  if (normalized.includes(scenario.subtitle.toLowerCase())) {
    score += 15;
  }

  return score;
}

function resolveScenarioFromCandidates(
  query: string,
  candidates: ScenarioDefinition[],
): ScenarioDefinition | null {
  if (!query || query.trim().length < 5) return null;

  let bestMatch: ScenarioDefinition | null = null;
  let bestScore = 0;

  for (const scenario of getActiveScenarios(candidates)) {
    const score = scoreScenarioMatch(query, scenario);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = scenario;
    }
  }

  if (bestScore < 6) return null;
  return bestMatch;
}

/**
 * Resolve a user query to the best matching scenario.
 *
 * Strategy:
 * 1. Direct keyword match (weighted by frequency and specificity)
 * 2. Fuzzy semantic match on scenario titles and descriptions
 * 3. Fall back to null (no scenario matched — use legacy chat flow)
 */
export function resolveScenario(query: string): ScenarioDefinition | null {
  return resolveScenarioFromCandidates(query, ALL_SCENARIOS);
}

export function resolveScenarioForWorkspace(
  query: string,
  workspaceId: WorkspaceId,
  preferredScenarioId?: string,
): ScenarioDefinition | null {
  if (preferredScenarioId) {
    const preferred = SCENARIO_REGISTRY[preferredScenarioId];
    if (preferred && !DISABLED_SCENARIO_IDS.has(preferred.id)) {
      return preferred;
    }
  }

  const candidates = WORKSPACE_SCENARIO_IDS[workspaceId]
    .map((scenarioId) => SCENARIO_REGISTRY[scenarioId])
    .filter((scenario): scenario is ScenarioDefinition => Boolean(scenario));

  return resolveScenarioFromCandidates(query, candidates);
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
