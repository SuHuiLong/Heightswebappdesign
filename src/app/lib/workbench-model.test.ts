import { describe, expect, it } from 'vitest';
import { SCENARIO_REGISTRY } from './scenario-definitions';
import { buildProcessRailSnapshot, buildWorkbenchModel } from './workbench-model';

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

  it('builds staged process snapshots that track the active question and scope', () => {
    const scenario = SCENARIO_REGISTRY['bandwidth-upsell'];

    const intake = buildProcessRailSnapshot({
      scenario,
      activeQuery: 'Show this week’s top 10 upsell candidates.',
      scopeLabel: 'All Segments',
      phase: 'intake',
    });

    expect(intake.reasoning).toHaveLength(1);
    expect(intake.reasoning[0].detail).toContain('top 10 upsell candidates');
    expect(intake.reasoning[0].detail).toContain('All Segments');
    expect(intake.reasoning[0].status).toBe('in-progress');
    expect(intake.backendActions).toHaveLength(1);
    expect(intake.backendActions[0]?.status).toBe('running');
    expect(intake.auditEntries).toHaveLength(1);

    const evidence = buildProcessRailSnapshot({
      scenario,
      activeQuery: 'Show this week’s top 10 upsell candidates.',
      scopeLabel: 'All Segments',
      phase: 'evidence',
    });

    expect(evidence.reasoning).toHaveLength(2);
    expect(evidence.reasoning.map((step) => step.status)).toEqual([
      'complete',
      'in-progress',
    ]);
    expect(evidence.backendActions).toHaveLength(2);
    expect(evidence.backendActions.map((action) => action.status)).toEqual([
      'success',
      'running',
    ]);
    expect(evidence.auditEntries).toHaveLength(2);

    const synthesis = buildProcessRailSnapshot({
      scenario,
      activeQuery: 'Show this week’s top 10 upsell candidates.',
      scopeLabel: 'All Segments',
      phase: 'synthesis',
    });

    expect(synthesis.reasoning).toHaveLength(3);
    expect(synthesis.reasoning.map((step) => step.status)).toEqual([
      'complete',
      'complete',
      'in-progress',
    ]);
    expect(synthesis.backendActions).toHaveLength(3);
    expect(synthesis.backendActions.map((action) => action.status)).toEqual([
      'success',
      'success',
      'running',
    ]);
    expect(synthesis.backendActions[2]?.label).toContain('Synthesizing');
    expect(synthesis.auditEntries).toHaveLength(3);
    expect(
      synthesis.auditEntries.some((entry) => entry.action.includes('ready')),
    ).toBe(false);

    const ready = buildProcessRailSnapshot({
      scenario,
      activeQuery: 'Show this week’s top 10 upsell candidates.',
      scopeLabel: 'All Segments',
      phase: 'ready',
    });

    expect(ready.reasoning.every((step) => step.status === 'complete')).toBe(
      true,
    );
    expect(ready.backendActions.every((action) => action.status === 'success')).toBe(
      true,
    );
    expect(ready.auditEntries[0]?.action).toContain('top 10 upsell candidates');
  });
});
