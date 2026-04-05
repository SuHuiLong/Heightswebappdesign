import { describe, expect, it } from 'vitest';
import {
  WORKSPACE_EXPERIENCE,
  getScopeCommandOptionsForWorkspace,
  getWorkspaceDefaultScope,
  getWorkspaceScopeConfig,
  getWorkspaceScopePaletteStateForTarget,
} from './workspace-experience';

describe('workspace experience', () => {
  it('defines an AI-first fleet workspace with cohort scope and predictive reasoning', () => {
    expect(WORKSPACE_EXPERIENCE.fleet.displayName).toBe('Fleet Intelligence');
    expect(WORKSPACE_EXPERIENCE.fleet.initialMessage).toContain('FW 2.1.3');
    expect(WORKSPACE_EXPERIENCE.fleet.scenarioHeading).toBe('AI DETECTED');
    expect(WORKSPACE_EXPERIENCE.fleet.reasoning.idleSteps.map((step) => step.label)).toEqual([
      'Fleet health baseline',
      'Anomaly detection',
      'Predictive risk',
    ]);

    const spec = getWorkspaceScopeConfig('fleet');
    expect(spec.levelOrder).toEqual(['all', 'region', 'organization', 'subscriber']);
    expect(spec.levelLabels).toMatchObject({
      all: 'All (Fleet)',
      region: 'Region',
      organization: 'Organization',
      subscriber: 'Cohort',
    });
  });

  it('gives support its own subscriber-home-gateway-device scope flow', () => {
    expect(WORKSPACE_EXPERIENCE.support.initialMessage).toContain('auto-resolved today');
    expect(WORKSPACE_EXPERIENCE.support.scenarioHeading).toBe('AI HANDLED');
    expect(WORKSPACE_EXPERIENCE.support.reasoning.idleSteps.map((step) => step.label)).toEqual([
      'Open case triage',
      'Resolution rate',
      'Escalation risk',
    ]);

    const spec = getWorkspaceScopeConfig('support');
    expect(spec.levelOrder).toEqual(['region', 'organization', 'subscriber', 'device']);
    expect(spec.levelLabels).toMatchObject({
      region: 'Subscriber',
      organization: 'Home',
      subscriber: 'Gateway',
      device: 'Device',
    });
    expect(getWorkspaceDefaultScope('support')).toEqual({ level: 'region' });

    const rootOptions = getScopeCommandOptionsForWorkspace(
      'support',
      getWorkspaceScopePaletteStateForTarget('support', null, { level: 'region' }),
      '',
      { level: 'region' },
    );

    expect(rootOptions.map((option) => option.label)).toEqual([
      'Subscriber',
      'Home',
      'Gateway',
      'Device',
    ]);
  });

  it('gives growth a segment-campaign-subscriber scope and predictive prompts', () => {
    expect(WORKSPACE_EXPERIENCE.growth.initialMessage).toContain('upsell candidates');
    expect(WORKSPACE_EXPERIENCE.growth.scenarioHeading).toBe('AI IDENTIFIED');
    expect(WORKSPACE_EXPERIENCE.growth.reasoning.idleSteps.map((step) => step.label)).toEqual([
      'Churn risk scan',
      'Upsell opportunity scoring',
      'Segment health',
    ]);

    const spec = getWorkspaceScopeConfig('growth');
    expect(spec.levelOrder).toEqual(['all', 'region', 'organization', 'subscriber']);
    expect(spec.levelLabels).toMatchObject({
      all: 'All Segments',
      region: 'Segment',
      organization: 'Campaign',
      subscriber: 'Subscriber',
    });

    const rootOptions = getScopeCommandOptionsForWorkspace(
      'growth',
      getWorkspaceScopePaletteStateForTarget('growth', null, { level: 'all' }),
      '',
      { level: 'all' },
    );

    expect(rootOptions.map((option) => option.label)).toEqual([
      'All Segments',
      'Segment',
      'Campaign',
      'Subscriber',
    ]);
  });
});
