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

  it('materializes firmware regression variants for fixed support prompts', () => {
    expect(
      resolveScenarioForWorkspace(
        'Show pending validation work for John Smith Home and explain why the case is not fully closed yet.',
        'support',
        'firmware-regression',
      )?.title,
    ).toBe('AI Fix Validation Queue');

    expect(
      resolveScenarioForWorkspace(
        'Open the firmware rollback case for John Smith Home and summarize what still needs human review.',
        'support',
        'firmware-regression',
      )?.title,
    ).toBe('Firmware Rollback Evidence');
  });

  it('materializes rollout and growth variants for fixed workspace prompts', () => {
    expect(
      resolveScenarioForWorkspace(
        'Rank the fleet cohorts that need operator attention first and explain why.',
        'fleet',
        'firmware-regression',
      )?.title,
    ).toBe('Rollback Candidate Ranking');

    expect(
      resolveScenarioForWorkspace(
        'Show the ROI tracker for Premium Upgrade Q2 and explain where conversion is being won or lost.',
        'growth',
        'bandwidth-upsell',
      )?.title,
    ).toBe('Campaign ROI Tracker');

    expect(
      resolveScenarioForWorkspace(
        'Recommend the best churn save offer for SUB-7834 and explain the expected impact.',
        'growth',
        'churn-prevention',
      )?.title,
    ).toBe('Churn Save Offer Recommendation');
  });

  it('materializes support summary and household-fit variants for fixed prompts', () => {
    expect(
      resolveScenarioForWorkspace(
        'Show the cases AI fully resolved today and summarize what was fixed.',
        'support',
        'autonomous-wifi-recovery',
      )?.title,
    ).toBe('AI-Resolved Cases Today');

    expect(
      resolveScenarioForWorkspace(
        'Show the protected sessions AI handled today and explain which QoS actions kept them stable.',
        'support',
        'critical-session-protection',
      )?.title,
    ).toBe('Protected Sessions Today');

    expect(
      resolveScenarioForWorkspace(
        'Explain whether SUB-7834 is a strong VAS-fit household based on device fingerprints and subscription gaps.',
        'growth',
        'vas-device-fingerprint',
      )?.title,
    ).toBe('Household VAS Fit Assessment');
  });
});
