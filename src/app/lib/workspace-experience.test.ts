import { describe, expect, it } from 'vitest';
import {
  WORKSPACE_EXPERIENCE,
  getScopeCommandOptionsForWorkspace,
  getWorkspaceDefaultScope,
  getSupportPresetQueryMatch,
  getWorkspaceScopeActions,
  getWorkspaceScopeConfig,
  getWorkspaceScopePaletteStateForTarget,
} from './workspace-experience';
import { resolveScenarioForWorkspace } from './scenario-resolver';

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

  it('maps representative scope actions in each workspace to concrete demo scenarios', () => {
    const fleetAction = getWorkspaceScopeActions('fleet', {
      level: 'organization',
      region: 'north',
      organization: 'acme-isp',
    })[0];
    expect(fleetAction.scenarioId).toBe('firmware-regression');
    expect(
      resolveScenarioForWorkspace(
        fleetAction.prompt,
        'fleet',
        fleetAction.scenarioId,
      )?.id,
    ).toBe('firmware-regression');

    const supportAction = getWorkspaceScopeActions('support', {
      level: 'device',
      region: 'SUB-1234',
      organization: 'home-sub-1234',
      subscriber: 'GW-7834-HOME',
      device: 'GW-7834-HOME-iphone',
    })[0];
    expect(supportAction.scenarioId).toBe('autonomous-wifi-recovery');
    expect(
      resolveScenarioForWorkspace(
        supportAction.prompt,
        'support',
        supportAction.scenarioId,
      )?.id,
    ).toBe('autonomous-wifi-recovery');

    const growthAction = getWorkspaceScopeActions('growth', {
      level: 'subscriber',
      region: 'bandwidth-constrained-households',
      organization: 'premium-upgrade-q2',
      subscriber: 'SUB-7834',
    })[0];
    expect(growthAction.scenarioId).toBe('bandwidth-upsell');
    expect(
      resolveScenarioForWorkspace(
        growthAction.prompt,
        'growth',
        growthAction.scenarioId,
      )?.id,
    ).toBe('bandwidth-upsell');
  });

  it('restores the slow-internet top question to the known support case', () => {
    expect(
      getSupportPresetQueryMatch(
        'This subscriber reports slow internet. What did AI find?',
      ),
    ).toEqual({
      kind: 'ticket',
      ticketId: 'TKT-4820',
      intro:
        'I found the related slow-speed case. Here is what AI diagnosed, how it fixed it, and what was verified afterward.',
    });
  });
});
