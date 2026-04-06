import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { WorkspaceWelcome } from './workspace-welcome';

describe('WorkspaceWelcome', () => {
  it('keeps the refreshed card layout while restoring the full workspace tag list', () => {
    render(
      <MemoryRouter>
        <WorkspaceWelcome />
      </MemoryRouter>,
    );

    expect(screen.getByText('AI-Native Platform')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: /where do you want to start\?/i });
    expect(heading).toBeInTheDocument();

    const mainContent = heading.closest('main')?.firstElementChild as HTMLElement | null;
    expect(mainContent).not.toBeNull();
    expect(mainContent?.className).toContain('max-w-6xl');

    const fleetCard = screen.getByRole('link', { name: /start fleet intelligence/i }).closest('article');
    const supportCard = screen.getByRole('link', { name: /start support/i }).closest('article');
    const growthCard = screen.getByRole('link', { name: /start growth/i }).closest('article');

    expect(fleetCard).not.toBeNull();
    expect(supportCard).not.toBeNull();
    expect(growthCard).not.toBeNull();

    const fleetScope = fleetCard ? within(fleetCard) : null;
    const supportScope = supportCard ? within(supportCard) : null;
    const growthScope = growthCard ? within(growthCard) : null;
    const fleetIconShell = fleetCard?.firstElementChild?.firstElementChild as HTMLElement | null;
    const supportIconShell = supportCard?.firstElementChild?.firstElementChild as HTMLElement | null;
    const growthIconShell = growthCard?.firstElementChild?.firstElementChild as HTMLElement | null;

    expect(fleetScope?.getByText('incident')).toBeInTheDocument();
    expect(fleetScope?.getByText('cohort')).toBeInTheDocument();
    expect(fleetScope?.getByText('region')).toBeInTheDocument();
    expect(fleetScope?.getByText('organization')).toBeInTheDocument();
    expect(fleetScope?.queryByText('What you work with')).not.toBeInTheDocument();

    expect(supportScope?.getByText('case')).toBeInTheDocument();
    expect(supportScope?.getByText('location')).toBeInTheDocument();
    expect(supportScope?.getByText('home')).toBeInTheDocument();
    expect(supportScope?.getByText('gateway')).toBeInTheDocument();
    expect(supportScope?.queryByText('What you work with')).not.toBeInTheDocument();

    expect(growthScope?.getByText('opportunity')).toBeInTheDocument();
    expect(growthScope?.getByText('segment')).toBeInTheDocument();
    expect(growthScope?.getByText('offer')).toBeInTheDocument();
    expect(growthScope?.getByText('campaign')).toBeInTheDocument();
    expect(growthScope?.queryByText('What you work with')).not.toBeInTheDocument();

    expect(fleetIconShell?.className).toContain('shrink-0');
    expect(supportIconShell?.className).toContain('shrink-0');
    expect(growthIconShell?.className).toContain('shrink-0');
    expect(fleetIconShell?.className).toContain('rounded-2xl');
    expect(supportIconShell?.className).toContain('rounded-2xl');
    expect(growthIconShell?.className).toContain('rounded-2xl');
    expect(supportIconShell?.className).toContain('text-white');
    expect(supportIconShell?.getAttribute('style')).toContain('var(--ambient-cyan)');
    expect(supportCard?.querySelector('svg.lucide-users')).not.toBeNull();
  });
});
