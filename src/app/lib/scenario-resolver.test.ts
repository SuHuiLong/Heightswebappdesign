import { describe, expect, it } from 'vitest';
import { resolveScenario, resolveScenarioForWorkspace } from './scenario-resolver';

describe('scenario resolver', () => {
  it('does not resolve the removed DPI anomaly demo prompt', () => {
    expect(
      resolveScenario('Show me the DPI and traffic anomaly report for Europe.'),
    ).toBeNull();
  });

  it('prefers an explicit workspace scenario id when one is provided', () => {
    expect(
      resolveScenarioForWorkspace(
        'Show protected sessions from the latest congestion window.',
        'support',
        'critical-session-protection',
      )?.id,
    ).toBe('critical-session-protection');
  });
});
