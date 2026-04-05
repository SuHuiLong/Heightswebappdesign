import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkspaceSession } from './workspace-session';
import { SCENARIO_REGISTRY } from '../../lib/scenario-definitions';

describe('WorkspaceSession', () => {
  it('does not render the workspace header card before the answer cards', () => {
    const scenario = SCENARIO_REGISTRY['critical-session-protection'];

    render(
      <WorkspaceSession
        scenario={scenario}
        onFollowUp={() => {}}
        stageDurationMs={0}
        finalPauseMs={0}
        blockRevealMs={0}
      />,
    );

    return waitFor(() => {
      expect(screen.getByText('Session Protected Successfully')).toBeInTheDocument();
      expect(
        screen.queryByText('Critical Session Protection'),
      ).not.toBeInTheDocument();
    });
  });
});
