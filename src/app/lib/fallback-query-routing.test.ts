import { describe, expect, it } from 'vitest';
import { getWorkspaceScopeActions } from './workspace-experience';
import { buildFallbackClarificationMessage, matchPromptCandidate } from './fallback-query-routing';

describe('fallback query routing', () => {
  it('matches freeform operations questions to the closest fixed prompt', () => {
    const actions = getWorkspaceScopeActions('fleet', { level: 'all' });

    expect(
      matchPromptCandidate(
        'Which fleet cohort needs operator attention first?',
        actions,
      )?.id,
    ).toBe('all-priority-cohorts');
  });

  it('matches freeform growth questions to campaign ROI prompts', () => {
    const actions = getWorkspaceScopeActions('growth', {
      level: 'organization',
      region: 'bandwidth-constrained-households',
      organization: 'premium-upgrade-q2',
    });

    expect(
      matchPromptCandidate(
        'Where is conversion being won or lost in Premium Upgrade Q2?',
        actions,
      )?.id,
    ).toBe('org-campaign-roi');
  });

  it('matches support validation questions to the validation queue prompt', () => {
    const actions = getWorkspaceScopeActions('support', {
      level: 'region',
      region: 'SUB-1234',
    });

    expect(
      matchPromptCandidate(
        'Which AI fixes are still waiting on validation before closure?',
        actions,
      )?.id,
    ).toBe('all-pending-validations');
  });

  it('returns null for unrelated questions and builds a clarification message', () => {
    const actions = getWorkspaceScopeActions('growth', { level: 'all' });

    expect(matchPromptCandidate('hello there', actions)).toBeNull();
    expect(
      buildFallbackClarificationMessage('Growth', actions.slice(0, 2).map((action) => action.prompt)),
    ).toContain('Growth');
    expect(
      buildFallbackClarificationMessage('Growth', actions.slice(0, 2).map((action) => action.prompt)),
    ).toContain(actions[0]?.prompt);
  });
});
