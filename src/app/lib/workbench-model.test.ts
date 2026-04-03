import { describe, expect, it } from 'vitest';
import { SCENARIO_REGISTRY } from './scenario-definitions';
import { buildWorkbenchModel } from './workbench-model';

describe('buildWorkbenchModel', () => {
  it('derives current-question framing, capability chain, and process rail from the scenario definition', () => {
    const scenario = SCENARIO_REGISTRY['critical-session-protection'];

    const model = buildWorkbenchModel({
      scenario,
      activeQuery:
        'Protect active video conference sessions for subscriber SUB-1234 during peak congestion.',
      scopeLabel: 'John Smith (SUB-1234) • Home Gateway',
    });

    expect(model.currentQuestion.title).toContain(
      'Protect active video conference sessions',
    );
    expect(model.currentQuestion.scopeLabel).toBe(
      'John Smith (SUB-1234) • Home Gateway',
    );
    expect(model.currentQuestion.summary).toContain('Protect');
    expect(model.currentQuestion.recognizedObjects).toContain('subscriber');
    expect(model.currentQuestion.suggestedRefinements.length).toBeGreaterThan(0);
    expect(model.capabilityChain.map((item) => item.title)).toEqual([
      'Device Signals',
      'Cloud Checks',
      'Agent Reasoning / Actions',
    ]);
    expect(model.processRail.reasoning.length).toBeGreaterThan(0);
    expect(model.processRail.backendActions.length).toBeGreaterThan(0);
    expect(model.processRail.auditEntries.length).toBeGreaterThan(0);
  });
});
