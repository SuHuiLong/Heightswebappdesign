# Prompt-First Workspace Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-led workspace UI with a prompt-first workbench that keeps the active query visible, elevates the device/cloud/agent system chain into the main canvas, and refocuses `Operations`, `Support`, and `Growth` around the approved representative scenarios.

**Architecture:** Add a shared prompt-first workbench shell that is driven by scenario metadata instead of per-page hardcoded layout. The scenario layer becomes the single source of truth for the current question framing, capability chain, and right-rail process data, while the workspace pages reuse `useWorkspaceChat()` for scope and interaction state and only provide workspace-specific starters and fallback content.

**Tech Stack:** React 18, React Router 7, Motion, Tailwind CSS 4, Lucide React, Recharts, Vite 6, Vitest, React Testing Library, jsdom

---

## File Structure

### Shared data and test infrastructure

- Modify: `package.json`
  Responsibility: add a repeatable `test` script and declare the UI test dependencies needed for TDD.
- Modify: `vite.config.ts`
  Responsibility: configure Vitest with `jsdom`, globals, and a shared setup file.
- Create: `src/test/setup.ts`
  Responsibility: register `@testing-library/jest-dom/vitest`.
- Create: `src/app/lib/workbench-model.ts`
  Responsibility: define the normalized prompt-first workbench contract and build a model from `ScenarioDefinition` + active query + scope label.
- Create: `src/app/lib/workbench-model.test.ts`
  Responsibility: prove that representative scenarios generate `current question`, `capability chain`, and `right rail` data from scenario definitions.
- Modify: `src/app/lib/scenario-definitions.ts:128-148,152-850`
  Responsibility: add optional `workbench` metadata to scenarios and populate the representative scenarios for this round.

### Shared UI shell

- Create: `src/app/components/workbench/prompt-workbench-shell.tsx`
  Responsibility: render the pinned query bar, current question framing, capability chain, starter investigations, and generated-result area.
- Create: `src/app/components/workbench/prompt-workbench-shell.test.tsx`
  Responsibility: verify the shared shell shows the query, chain stages, and starter investigations without collapsing back into a card grid.
- Modify: `src/app/components/generative/workspace-session.tsx:104-334`
  Responsibility: make the generated session embeddable inside the new shell without duplicating the current-question header.
- Modify: `src/app/components/workspace-right-panel.tsx:20-260`
  Responsibility: consume scenario-driven process data instead of static default-only mock content.
- Modify: `src/app/hooks/use-workspace-chat.ts:260-520`
  Responsibility: keep shared workspace interaction state centralized and expose any additional active-query state helpers required by the shell.

### Welcome page and shared header

- Modify: `src/app/lib/workspace-definitions.ts:8-157`
  Responsibility: add welcome-page content fields that describe work intent and representative investigations instead of generic module-card copy.
- Modify: `src/app/components/app-layout.tsx:15-167`
  Responsibility: render the approved two-row hierarchy: brand, user, customer breadcrumb, and workspace.
- Modify: `src/app/pages/workspace-welcome.tsx:7-240`
  Responsibility: redesign the entry screen as three work modes leading into workbenches, not three product cards.
- Create: `src/app/pages/workspace-welcome.test.tsx`
  Responsibility: verify the welcome page uses workbench language and still routes into all three workspaces.

### Workspace migrations

- Modify: `src/app/pages/workspace-operations.tsx:944-1415`
  Responsibility: replace the scenario-card/chat layout with the shared prompt-first shell and wire `Operations` scenario metadata.
- Modify: `src/app/pages/workspace-growth.tsx:838-1309`
  Responsibility: do the same for `Growth`, removing any “coming soon” posture from the main surface.
- Modify: `src/app/pages/workspace-support.tsx:1646-2015`
  Responsibility: make `Critical Session Protection` the primary scenario, embed the shared shell, and demote `Home Dashboard` to a secondary drill-in.
- Create: `src/app/pages/workspace-support.test.tsx`
  Responsibility: verify `Critical Session Protection` is primary and that `Home Dashboard` is no longer a first-class starter.

## Task 1: Establish the Scenario-Driven Workbench Contract

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/app/lib/workbench-model.ts`
- Create: `src/app/lib/workbench-model.test.ts`
- Modify: `src/app/lib/scenario-definitions.ts:128-148,152-850`

- [ ] **Step 1: Write the failing unit test for scenario-driven workbench metadata**

```ts
// src/app/lib/workbench-model.test.ts
import { describe, expect, it } from 'vitest';
import { SCENARIO_REGISTRY } from './scenario-definitions';
import { buildWorkbenchModel } from './workbench-model';

describe('buildWorkbenchModel', () => {
  it('derives current-question framing, capability chain, and process rail from the scenario definition', () => {
    const scenario = SCENARIO_REGISTRY['critical-session-protection'];

    const model = buildWorkbenchModel({
      scenario,
      activeQuery: 'Protect active video conference sessions for subscriber SUB-1234 during peak congestion.',
      scopeLabel: 'John Smith (SUB-1234) • Home Gateway',
    });

    expect(model.currentQuestion.title).toContain('Protect active video conference sessions');
    expect(model.currentQuestion.scopeLabel).toBe('John Smith (SUB-1234) • Home Gateway');
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/app/lib/workbench-model.test.ts`

Expected: FAIL with `Missing script: "test"` or `Cannot find module './workbench-model'`.

- [ ] **Step 3: Add the test runner wiring**

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "test": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.4"
  }
}
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // existing config...
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Implement the normalized workbench model and wire representative scenarios to it**

```ts
// src/app/lib/workbench-model.ts
import { ScenarioDefinition } from './scenario-definitions';

export interface ReasoningStep {
  id: string;
  label: string;
  detail: string;
  confidence?: number;
  status: 'complete' | 'in-progress' | 'pending';
}

export interface BackendAction {
  id: string;
  label: string;
  status: 'success' | 'running' | 'pending' | 'failed';
  timestamp: string;
  detail?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  type: 'query' | 'action' | 'system' | 'alert';
  detail?: string;
}

export interface WorkbenchCurrentQuestion {
  title: string;
  summary: string;
  scopeLabel: string;
  recognizedObjects: string[];
  suggestedRefinements: string[];
}

export interface WorkbenchCapabilityStage {
  id: 'device' | 'cloud' | 'agent';
  title: 'Device Signals' | 'Cloud Checks' | 'Agent Reasoning / Actions';
  summary: string;
  bullets: string[];
  status: 'complete' | 'active' | 'queued';
}

export interface WorkbenchModel {
  currentQuestion: WorkbenchCurrentQuestion;
  capabilityChain: WorkbenchCapabilityStage[];
  processRail: {
    reasoning: ReasoningStep[];
    backendActions: BackendAction[];
    auditEntries: AuditEntry[];
  };
}

export function buildWorkbenchModel({
  scenario,
  activeQuery,
  scopeLabel,
}: {
  scenario: ScenarioDefinition;
  activeQuery: string;
  scopeLabel: string;
}): WorkbenchModel {
  const fallback = {
    currentQuestion: {
      title: activeQuery,
      summary: scenario.description,
      scopeLabel,
      recognizedObjects: scenario.evidenceDomains.slice(0, 3),
      suggestedRefinements: scenario.followUps.slice(0, 2),
    },
    capabilityChain: [
      { id: 'device', title: 'Device Signals', summary: 'Collecting edge and telemetry evidence.', bullets: scenario.evidenceDomains.slice(0, 2), status: 'complete' as const },
      { id: 'cloud', title: 'Cloud Checks', summary: 'Resolving platform-wide context.', bullets: scenario.evidenceDomains.slice(1, 3), status: 'active' as const },
      { id: 'agent', title: 'Agent Reasoning / Actions', summary: 'Synthesizing findings and actions.', bullets: scenario.followUps.slice(0, 2), status: 'queued' as const },
    ],
    processRail: {
      reasoning: [],
      backendActions: [],
      auditEntries: [],
    },
  };

  return scenario.workbench
    ? {
        currentQuestion: { ...scenario.workbench.currentQuestion, title: activeQuery, scopeLabel },
        capabilityChain: scenario.workbench.capabilityChain,
        processRail: scenario.workbench.processRail,
      }
    : fallback;
}
```

```ts
// src/app/lib/scenario-definitions.ts
export interface ScenarioDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  loadingStages: string[];
  confidence: number;
  evidenceDomains: string[];
  followUps: string[];
  family: 'operations' | 'business' | 'planning';
  keywords: string[];
  blocks: ScenarioBlock[];
  workbench?: {
    currentQuestion: Omit<WorkbenchCurrentQuestion, 'title' | 'scopeLabel'>;
    capabilityChain: WorkbenchCapabilityStage[];
    processRail: {
      reasoning: ReasoningStep[];
      backendActions: BackendAction[];
      auditEntries: AuditEntry[];
    };
  };
}
```

```ts
// representative scenario additions in src/app/lib/scenario-definitions.ts
workbench: {
  currentQuestion: {
    summary: 'Protect a high-value real-time session before customer-visible degradation becomes irreversible.',
    recognizedObjects: ['subscriber', 'location', 'gateway', 'active session'],
    suggestedRefinements: ['Narrow to one gateway', 'Compare pre- and post-protection MOS'],
  },
  capabilityChain: [
    {
      id: 'device',
      title: 'Device Signals',
      summary: 'Gateway and session QoS signals indicate rising contention.',
      bullets: ['MOS drift on active call', 'Uplink queue depth rising', 'Wi-Fi retry spikes on Home gateway'],
      status: 'complete',
    },
    {
      id: 'cloud',
      title: 'Cloud Checks',
      summary: 'Subscriber, policy, and congestion context are validated in the platform.',
      bullets: ['Traffic policy entitlement', 'Regional congestion state', 'Historical session degradation comparison'],
      status: 'active',
    },
    {
      id: 'agent',
      title: 'Agent Reasoning / Actions',
      summary: 'The agent chooses a protection path, executes it, and verifies the outcome.',
      bullets: ['Classify session risk', 'Apply protection profile', 'Verify post-action MOS and packet loss'],
      status: 'queued',
    },
  ],
  processRail: {
    reasoning: [
      { id: 'rsp-1', label: 'Critical session recognized', detail: 'The active Zoom session is tagged as business-critical based on QoS fingerprint and subscriber tier.', confidence: 0.96, status: 'complete' },
    ],
    backendActions: [
      { id: 'bsp-1', label: 'Fetched active session QoS metrics', status: 'success', timestamp: 'just now', detail: 'Pulled MOS, jitter, and packet-loss telemetry for the current call.' },
    ],
    auditEntries: [
      { id: 'asp-1', action: 'Protection investigation started', actor: 'AI Assistant', timestamp: '10:42 AM', type: 'query' },
    ],
  },
},
```

- [ ] **Step 5: Run the targeted unit test to verify the contract passes**

Run: `npm run test -- --run src/app/lib/workbench-model.test.ts`

Expected: PASS with one passing suite for `buildWorkbenchModel`.

- [ ] **Step 6: Commit the contract and test harness**

```bash
git add package.json package-lock.json vite.config.ts src/test/setup.ts src/app/lib/workbench-model.ts src/app/lib/workbench-model.test.ts src/app/lib/scenario-definitions.ts
git commit -m "test: add scenario-driven workbench contract"
```

## Task 2: Build the Shared Prompt-First Workbench Shell

**Files:**
- Create: `src/app/components/workbench/prompt-workbench-shell.tsx`
- Create: `src/app/components/workbench/prompt-workbench-shell.test.tsx`
- Modify: `src/app/components/generative/workspace-session.tsx:104-334`
- Modify: `src/app/components/workspace-right-panel.tsx:20-260`
- Modify: `src/app/hooks/use-workspace-chat.ts:260-520`

- [ ] **Step 1: Write the failing component test for the new shell**

```tsx
// src/app/components/workbench/prompt-workbench-shell.test.tsx
import { render, screen } from '@testing-library/react';
import { PromptWorkbenchShell } from './prompt-workbench-shell';

it('renders the active question, capability chain, and starter investigations', () => {
  render(
    <PromptWorkbenchShell
      workspaceLabel="Support"
      scopeLabel="John Smith (SUB-1234)"
      input="Protect active video conference sessions"
      isFocused={false}
      isTyping={false}
      starterLabel="Suggested Investigations"
      starterPrompts={['Critical Session Protection']}
      currentQuestion={{
        title: 'Protect active video conference sessions',
        summary: 'Prevent visible impact for a critical session.',
        scopeLabel: 'John Smith (SUB-1234)',
        recognizedObjects: ['subscriber', 'gateway'],
        suggestedRefinements: ['Compare pre/post MOS'],
      }}
      capabilityChain={[
        { id: 'device', title: 'Device Signals', summary: 'Collecting edge evidence.', bullets: ['MOS drift'], status: 'complete' },
        { id: 'cloud', title: 'Cloud Checks', summary: 'Resolving policies.', bullets: ['Policy lookup'], status: 'active' },
        { id: 'agent', title: 'Agent Reasoning / Actions', summary: 'Selecting protection path.', bullets: ['Apply QoS profile'], status: 'queued' },
      ]}
      onInputChange={() => {}}
      onSend={() => {}}
      onFocusChange={() => {}}
      onStarterPrompt={() => {}}
    >
      <div>generated results</div>
    </PromptWorkbenchShell>,
  );

  expect(screen.getByText('Current Question')).toBeInTheDocument();
  expect(screen.getByText('Device Signals')).toBeInTheDocument();
  expect(screen.getByText('Agent Reasoning / Actions')).toBeInTheDocument();
  expect(screen.getByText('generated results')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/app/components/workbench/prompt-workbench-shell.test.tsx`

Expected: FAIL with `Cannot find module './prompt-workbench-shell'`.

- [ ] **Step 3: Implement the shared shell**

```tsx
// src/app/components/workbench/prompt-workbench-shell.tsx
import { Search, Sparkles, ArrowRight, Cpu, Cloud, Router } from 'lucide-react';

export function PromptWorkbenchShell({
  workspaceLabel,
  scopeLabel,
  input,
  isFocused,
  isTyping,
  starterLabel,
  starterPrompts,
  currentQuestion,
  capabilityChain,
  onInputChange,
  onSend,
  onFocusChange,
  onStarterPrompt,
  children,
}: PromptWorkbenchShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}>
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
            <span>{workspaceLabel} Workbench</span>
            <span>{scopeLabel}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--neutral-400)' }} />
            <input
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              onFocus={() => onFocusChange(true)}
              onBlur={() => onFocusChange(false)}
              className="w-full rounded-xl border pl-10 pr-24 py-3 text-sm"
              style={{
                background: 'var(--surface-raised)',
                borderColor: isFocused ? 'var(--primary)' : 'var(--border)',
                boxShadow: isFocused ? '0 0 0 3px var(--focus-ring)' : 'var(--shadow-xs)',
              }}
            />
            <button onClick={onSend} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-sm font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Update
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 overflow-auto px-4 py-5">
        <section className="rounded-2xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <h2 className="text-sm font-semibold">Current Question</h2>
          </div>
          <h3 className="text-xl font-semibold">{currentQuestion.title}</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--neutral-400)' }}>{currentQuestion.summary}</p>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {capabilityChain.map((stage) => (
            <article key={stage.id} className="rounded-2xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
                {stage.title}
              </div>
              <p className="text-sm">{stage.summary}</p>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{starterLabel}</h2>
            {isTyping && <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>Generating...</span>}
          </div>
          {!children && (
            <div className="grid gap-3 md:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <button key={prompt} onClick={() => onStarterPrompt(prompt)} className="rounded-xl border p-4 text-left" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <span className="text-sm font-medium">{prompt}</span>
                </button>
              ))}
            </div>
          )}
          {children}
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Make the generated session and right rail work inside the new shell**

```tsx
// src/app/components/generative/workspace-session.tsx
interface WorkspaceSessionProps {
  scenario: ScenarioDefinition;
  onFollowUp: (prompt: string) => void;
  showSessionHeader?: boolean;
}

export function WorkspaceSession({
  scenario,
  onFollowUp,
  showSessionHeader = true,
}: WorkspaceSessionProps) {
  // existing loading + reveal logic...
  return (
    <>
      {!isLoaded && <LoadingStageIndicator stages={scenario.loadingStages} currentStage={loadingStage} />}
      {isLoaded && (
        <>
          {showSessionHeader && <WorkspaceSessionHeader scenario={scenario} />}
          {scenario.blocks.slice(0, visibleBlocks).map((block, idx) => (
            <GenerativeBlockRenderer key={idx} block={block} timestamp={timestamp} source="AI Analysis Engine" />
          ))}
        </>
      )}
    </>
  );
}
```

```tsx
// src/app/components/workspace-right-panel.tsx
import { AuditEntry, BackendAction, ReasoningStep } from '../lib/workbench-model';

export interface WorkspaceRightPanelProps {
  workspaceId: WorkspaceId;
  isActive?: boolean;
  processRail?: {
    reasoning: ReasoningStep[];
    backendActions: BackendAction[];
    auditEntries: AuditEntry[];
  };
}

export function WorkspaceRightPanel({ workspaceId, isActive = false, processRail }: WorkspaceRightPanelProps) {
  const steps = processRail?.reasoning ?? (isActive ? ACTIVE_REASONING : DEFAULT_REASONING);
  const actions = processRail?.backendActions ?? DEFAULT_ACTIONS;
  const audit = processRail?.auditEntries ?? DEFAULT_AUDIT;
  // existing rendering...
}
```

```ts
// src/app/hooks/use-workspace-chat.ts
export function useWorkspaceChat() {
  const [activeQuery, setActiveQuery] = useState('');
  // existing state...
  return {
    activeQuery,
    setActiveQuery,
    // existing return values...
  };
}
```

- [ ] **Step 5: Run the component tests to verify the shared shell passes**

Run: `npm run test -- --run src/app/components/workbench/prompt-workbench-shell.test.tsx`

Expected: PASS with one passing shell-render test.

- [ ] **Step 6: Commit the shared shell**

```bash
git add src/app/components/workbench/prompt-workbench-shell.tsx src/app/components/workbench/prompt-workbench-shell.test.tsx src/app/components/generative/workspace-session.tsx src/app/components/workspace-right-panel.tsx src/app/hooks/use-workspace-chat.ts
git commit -m "feat: add shared prompt-first workbench shell"
```

## Task 3: Redesign the Welcome Page and Shared Header Hierarchy

**Files:**
- Modify: `src/app/lib/workspace-definitions.ts:8-157`
- Modify: `src/app/components/app-layout.tsx:15-167`
- Modify: `src/app/pages/workspace-welcome.tsx:7-240`
- Create: `src/app/pages/workspace-welcome.test.tsx`

- [ ] **Step 1: Write the failing welcome-page test**

```tsx
// src/app/pages/workspace-welcome.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { WorkspaceWelcome } from './workspace-welcome';

it('frames workspaces as work modes with suggested investigations', () => {
  render(
    <MemoryRouter>
      <WorkspaceWelcome />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Suggested Investigations/i)).toBeInTheDocument();
  expect(screen.getByText(/Enter Operations Workbench/i)).toBeInTheDocument();
  expect(screen.queryByText(/Choose your workspace/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/app/pages/workspace-welcome.test.tsx`

Expected: FAIL because the current page still renders the old title and old CTA labels.

- [ ] **Step 3: Expand workspace definitions with workbench-entry content**

```ts
// src/app/lib/workspace-definitions.ts
export interface WorkspaceDefinition {
  id: WorkspaceId;
  name: string;
  description: string;
  tagline: string;
  icon: string;
  primaryObjects: string[];
  exampleScenarios: string[];
  accentColor: string;
  isImplemented: boolean;
  positioning: string;
  entrySummary: string;
  featuredInvestigations: string[];
}

export const WORKSPACES: Record<WorkspaceId, WorkspaceDefinition> = {
  operations: {
    // existing fields...
    positioning: 'Discover and explain fleet-wide risks',
    entrySummary: 'Enter when you need to interpret network risk, correlate cohorts, and decide what to do next.',
    featuredInvestigations: [
      'Post-Rollout Hidden Regression Detection',
      'Regional Incident Interpretation',
    ],
  },
  support: {
    // existing fields...
    positioning: 'Handle cases and protect critical moments',
    entrySummary: 'Enter when one location, gateway, or subscriber needs diagnosis, remediation, or active protection.',
    featuredInvestigations: [
      'Critical Session Protection',
      'Autonomous Wi-Fi Recovery',
    ],
  },
  growth: {
    // existing fields...
    positioning: 'Identify upsell and churn-prevention opportunities',
    entrySummary: 'Enter when you need to find candidate households, explain why they qualify, and recommend the next action.',
    featuredInvestigations: [
      'Pre-Churn Rescue / Plan Upgrade Opportunity',
      'Bandwidth Upsell Opportunity',
    ],
  },
};
```

- [ ] **Step 4: Implement the two-row workspace header and redesign the entry page**

```tsx
// src/app/components/app-layout.tsx
interface LayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  showTopBar?: boolean;
  onScopeChange?: (scope: ScopeSelection) => void;
  scopeValue?: ScopeSelection;
  customerHierarchy?: string;
  currentWorkspaceLabel?: string;
  currentUserLabel?: string;
}

// inside the workspace-page header branch
<div className="flex flex-1 flex-col gap-1">
  <div className="flex items-center justify-between text-sm">
    <span style={{ color: 'var(--foreground)' }}>Heights Telecom</span>
    <span style={{ color: 'var(--neutral-400)' }}>Logged in as {currentUserLabel ?? 'ops-admin@acme.com'}</span>
  </div>
  <div className="flex items-center justify-between text-xs">
    <span style={{ color: 'var(--neutral-500)' }}>{customerHierarchy ?? 'APAC / ISP / Sub Group / Subscriber / Location / Home'}</span>
    <span style={{ color: 'var(--neutral-400)' }}>Workspace: {currentWorkspaceLabel}</span>
  </div>
</div>
```

```tsx
// src/app/pages/workspace-welcome.tsx
<section className="grid gap-5">
  {(Object.values(WORKSPACES) as const).map((workspace) => (
    <article key={workspace.id} className="grid gap-4 rounded-[28px] border p-6 lg:grid-cols-[1.2fr_1fr_auto]" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: workspace.accentColor }}>
          {workspace.positioning}
        </div>
        <h3 className="mt-2 text-2xl font-semibold">{workspace.name}</h3>
        <p className="mt-3 text-sm" style={{ color: 'var(--neutral-400)' }}>{workspace.entrySummary}</p>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
          Suggested Investigations
        </div>
        <ul className="mt-3 space-y-2">
          {workspace.featuredInvestigations.map((item) => (
            <li key={item} className="rounded-xl px-3 py-2" style={{ background: 'var(--surface-base)' }}>{item}</li>
          ))}
        </ul>
      </div>
      <Link to={WORKSPACE_CONFIG[workspace.id].route} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
        Enter {workspace.name} Workbench
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  ))}
</section>
```

- [ ] **Step 5: Run the welcome-page test and a build smoke check**

Run: `npm run test -- --run src/app/pages/workspace-welcome.test.tsx`

Expected: PASS with one passing welcome-page suite.

Run: `npm run build`

Expected: PASS with Vite build output and no type/import errors.

- [ ] **Step 6: Commit the welcome-page and header changes**

```bash
git add src/app/lib/workspace-definitions.ts src/app/components/app-layout.tsx src/app/pages/workspace-welcome.tsx src/app/pages/workspace-welcome.test.tsx
git commit -m "feat: redesign workspace entry and header hierarchy"
```

## Task 4: Migrate Operations and Growth onto the Shared Workbench

**Files:**
- Modify: `src/app/pages/workspace-operations.tsx:944-1415`
- Modify: `src/app/pages/workspace-growth.tsx:838-1309`
- Modify: `src/app/hooks/use-workspace-chat.ts:260-520`
- Modify: `src/app/components/workbench/prompt-workbench-shell.tsx`

- [ ] **Step 1: Write a failing route-level test for the shared workbench behavior**

```tsx
// src/app/components/workbench/prompt-workbench-shell.test.tsx
it('shows the generated result underneath a pinned current-question frame', () => {
  render(
    <PromptWorkbenchShell
      workspaceLabel="Operations"
      scopeLabel="All Tenants (Fleet)"
      input="Show me active outages"
      isFocused={false}
      isTyping={true}
      starterLabel="Suggested Investigations"
      starterPrompts={['Post-Rollout Hidden Regression Detection']}
      currentQuestion={{
        title: 'Show me active outages',
        summary: 'Interpret current incident signals across the fleet.',
        scopeLabel: 'All Tenants (Fleet)',
        recognizedObjects: ['incident', 'region'],
        suggestedRefinements: ['Filter by rollout', 'Narrow to APAC'],
      }}
      capabilityChain={[
        { id: 'device', title: 'Device Signals', summary: 'Collecting outage telemetry.', bullets: ['Edge alerts'], status: 'complete' },
        { id: 'cloud', title: 'Cloud Checks', summary: 'Correlating regions.', bullets: ['Regional aggregation'], status: 'active' },
        { id: 'agent', title: 'Agent Reasoning / Actions', summary: 'Synthesizing likely cause.', bullets: ['Explain outage'], status: 'queued' },
      ]}
      onInputChange={() => {}}
      onSend={() => {}}
      onFocusChange={() => {}}
      onStarterPrompt={() => {}}
    >
      <div>Root Cause Identified</div>
    </PromptWorkbenchShell>,
  );

  expect(screen.getByText('Show me active outages')).toBeInTheDocument();
  expect(screen.getByText('Root Cause Identified')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it captures the new composition**

Run: `npm run test -- --run src/app/components/workbench/prompt-workbench-shell.test.tsx`

Expected: FAIL if the shell still assumes starter cards are always the primary content.

- [ ] **Step 3: Track the active query in the page state and build the workbench model from the matched scenario**

```tsx
// shared pattern in src/app/pages/workspace-operations.tsx and src/app/pages/workspace-growth.tsx
const {
  input,
  setInput,
  isTyping,
  setIsTyping,
  isFocused,
  setIsFocused,
  currentScope,
  setHasInteracted,
  activeQuery,
  setActiveQuery,
  // existing hook returns...
} = useWorkspaceChat();

const submitQuery = (queryOverride?: string) => {
  const nextQuery = queryOverride ?? input.trim();
  if (!nextQuery) return;
  setInput('');
  setActiveQuery(nextQuery);
  handleGenerativePrompt(nextQuery);
};

const activeScenario = useMemo(
  () =>
    [...messages]
      .reverse()
      .find((message) => message.type === 'generative-workspace')?.scenario ?? null,
  [messages],
);

const workbenchModel = useMemo(
  () =>
    activeScenario
      ? buildWorkbenchModel({
          scenario: activeScenario,
          activeQuery,
          scopeLabel: getScopeDisplayLabel(currentScope),
        })
      : null,
  [activeQuery, activeScenario, currentScope],
);

const handleGenerativePrompt = (query: string) => {
  setHasInteracted(true);
  // existing query resolution and message push logic...
};
```

- [ ] **Step 4: Replace the old top scenario cards and bottom input area with the shared prompt-first shell**

```tsx
// shared structure in src/app/pages/workspace-operations.tsx and src/app/pages/workspace-growth.tsx
<AppLayout
  scopeValue={currentScope}
  onScopeChange={handleScopeChange}
  currentWorkspaceLabel="Operations"
  customerHierarchy="APAC / ISP / Sub Group / Subscriber / Location / Home"
>
  <div className="flex h-full overflow-hidden">
    <main className="flex-1 overflow-hidden">
      <PromptWorkbenchShell
        workspaceLabel="Operations"
        scopeLabel={getScopeLabel(currentScope)}
        input={input}
        isFocused={isFocused}
        isTyping={isTyping}
        starterLabel="Suggested Investigations"
        starterPrompts={OPERATIONS_SCENARIOS.map((scenario) => scenario.title)}
        currentQuestion={workbenchModel?.currentQuestion ?? DEFAULT_OPERATIONS_QUESTION}
        capabilityChain={workbenchModel?.capabilityChain ?? DEFAULT_OPERATIONS_CHAIN}
        onInputChange={setInput}
        onSend={() => submitQuery()}
        onFocusChange={setIsFocused}
        onStarterPrompt={(promptTitle) => {
          const prompt = OPERATIONS_SCENARIOS.find((scenario) => scenario.title === promptTitle)?.query ?? promptTitle;
          submitQuery(prompt);
        }}
      >
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.type === 'generative-workspace' ? (
                <WorkspaceSession scenario={msg.scenario} onFollowUp={submitQuery} showSessionHeader={false} />
              ) : (
                renderMessage(msg, idx)
              )}
            </div>
          ))}
        </div>
      </PromptWorkbenchShell>
    </main>
    <WorkspaceRightPanel workspaceId="operations" isActive={isTyping} processRail={workbenchModel?.processRail} />
  </div>
</AppLayout>
```

- [ ] **Step 5: Run targeted tests and a build smoke check**

Run: `npm run test -- --run src/app/components/workbench/prompt-workbench-shell.test.tsx`

Expected: PASS with the shared-shell tests green.

Run: `npm run build`

Expected: PASS with both workspace pages compiling against the shared shell.

- [ ] **Step 6: Commit the Operations and Growth migration**

```bash
git add src/app/pages/workspace-operations.tsx src/app/pages/workspace-growth.tsx src/app/hooks/use-workspace-chat.ts src/app/components/workbench/prompt-workbench-shell.tsx
git commit -m "feat: migrate operations and growth to prompt-first workbench"
```

## Task 5: Migrate Support and Demote Home Dashboard

**Files:**
- Modify: `src/app/pages/workspace-support.tsx:1646-2015`
- Create: `src/app/pages/workspace-support.test.tsx`
- Modify: `src/app/lib/scenario-definitions.ts`
- Modify: `src/app/lib/workspace-definitions.ts`

- [ ] **Step 1: Write the failing support-page test**

```tsx
// src/app/pages/workspace-support.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SupportWorkspace } from './workspace-support';

it('prioritizes Critical Session Protection and removes Home Dashboard from starter actions', () => {
  render(
    <MemoryRouter>
      <SupportWorkspace />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Critical Session Protection/i)).toBeInTheDocument();
  expect(screen.queryByText(/View Home Dashboard/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the support test to verify it fails**

Run: `npm run test -- --run src/app/pages/workspace-support.test.tsx`

Expected: FAIL because the current page still shows `View Home Dashboard` in the primary starter actions.

- [ ] **Step 3: Update Support starters so the main workbench starts from protection and remediation cases**

```ts
// src/app/lib/workspace-definitions.ts
support: {
  // existing fields...
  exampleScenarios: [
    'Critical Session Protection',
    'Autonomous Wi-Fi Recovery',
    'Subscriber Troubleshooting',
  ],
}
```

```tsx
// src/app/pages/workspace-support.tsx
const SUPPORT_SCENARIOS = [
  {
    id: 'sup-session-protection',
    title: 'Critical Session Protection',
    description: 'Protect video call QoS during peak congestion periods',
    query: 'Protect active video conference sessions for subscriber SUB-1234 during peak congestion...',
  },
  {
    id: 'sup-wifi-recovery',
    title: 'Autonomous Wi-Fi Recovery',
    description: 'Self-heal Wi-Fi interference by migrating gateway channels automatically',
    query: 'Detect and resolve Wi-Fi interference on home gateway GW-7834-HOME...',
  },
];

const SUPPORT_ACTIONS = [
  {
    id: 'sup-session-protection',
    title: 'Protect a critical session',
    prompt: 'Protect active video conference sessions for subscriber SUB-1234 during peak congestion.',
    description: 'Start with a proactive protection case',
  },
  {
    id: 'sup-wifi-recovery',
    title: 'Recover Wi-Fi autonomously',
    prompt: 'Detect and resolve Wi-Fi interference on home gateway GW-7834-HOME.',
    description: 'Start with a closed-loop recovery case',
  },
];
```

- [ ] **Step 4: Embed the support page in the shared shell and keep Home Dashboard as a drill-in only**

```tsx
// src/app/pages/workspace-support.tsx
{viewMode === 'home-dashboard' && selectedSubscriber ? (
  <HomeDashboard subscriber={selectedSubscriber} onBack={() => setViewMode('chat')} />
) : (
  <AppLayout
    scopeValue={currentScope}
    onScopeChange={handleScopeChange}
    currentWorkspaceLabel="Support"
    customerHierarchy="APAC / ISP / Sub Group / Subscriber / Location / Home"
  >
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-hidden">
        <PromptWorkbenchShell
          workspaceLabel="Support"
          scopeLabel={getScopeLabel(currentScope)}
          input={input}
          isFocused={isFocused}
          isTyping={isTyping}
        starterLabel="Suggested Investigations"
        starterPrompts={SUPPORT_SCENARIOS.map((scenario) => scenario.title)}
        currentQuestion={workbenchModel?.currentQuestion ?? DEFAULT_SUPPORT_QUESTION}
          capabilityChain={workbenchModel?.capabilityChain ?? DEFAULT_SUPPORT_CHAIN}
          onInputChange={setInput}
          onSend={() => submitQuery()}
          onFocusChange={setIsFocused}
          onStarterPrompt={(promptTitle) => {
            const prompt = SUPPORT_SCENARIOS.find((scenario) => scenario.title === promptTitle)?.query ?? promptTitle;
            submitQuery(prompt);
          }}
        >
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.type === 'generative-workspace' ? (
                  <WorkspaceSession scenario={msg.scenario} onFollowUp={submitQuery} showSessionHeader={false} />
                ) : (
                  renderMessage(msg, idx)
                )}
              </div>
            ))}
          </div>
        </PromptWorkbenchShell>
      </main>
      <WorkspaceRightPanel workspaceId="support" isActive={isTyping} processRail={workbenchModel?.processRail} />
    </div>
  </AppLayout>
)}
```

```tsx
// example drill-in entry point inside case detail rendering
<button
  onClick={() => handleOpenHomeDashboard(selectedSubscriber)}
  className="rounded-lg border px-3 py-2 text-sm"
  style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}
>
  Open Home Details
</button>
```

- [ ] **Step 5: Run the support test and a build smoke check**

Run: `npm run test -- --run src/app/pages/workspace-support.test.tsx`

Expected: PASS with the support-workspace assertions green.

Run: `npm run build`

Expected: PASS with the Support workspace and the retained `HomeDashboard` drill-in compiling cleanly.

- [ ] **Step 6: Commit the Support migration**

```bash
git add src/app/pages/workspace-support.tsx src/app/pages/workspace-support.test.tsx src/app/lib/workspace-definitions.ts src/app/lib/scenario-definitions.ts
git commit -m "feat: refocus support on prompt-first protection cases"
```

## Task 6: Verify Cross-Workspace Integration and Finish

**Files:**
- Modify: `src/app/pages/workspace-operations.tsx`
- Modify: `src/app/pages/workspace-support.tsx`
- Modify: `src/app/pages/workspace-growth.tsx`
- Modify: `src/app/components/app-layout.tsx`
- Modify: `src/app/components/workspace-right-panel.tsx`

- [ ] **Step 1: Add one integration-focused smoke test for the scenario-driven shell**

```tsx
// append to src/app/components/workbench/prompt-workbench-shell.test.tsx
it('renders the right-rail data that comes from the active scenario definition', () => {
  const model = buildWorkbenchModel({
    scenario: SCENARIO_REGISTRY['firmware-regression'],
    activeQuery: 'Show me firmware regressions',
    scopeLabel: 'All Tenants (Fleet)',
  });

  expect(model.processRail.reasoning.length).toBeGreaterThan(0);
  expect(model.processRail.backendActions.length).toBeGreaterThan(0);
  expect(model.processRail.auditEntries.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the full test suite**

Run: `npm run test -- --run`

Expected: PASS with all workbench, welcome, and support tests green.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: PASS with the Vite production bundle emitted successfully.

- [ ] **Step 4: Manually verify the approved experience**

Run: `npm run dev`

Expected manual checks:

- `/` shows three work modes and `Suggested Investigations`, not three generic feature cards
- `/operations` keeps the current query visible and shows a device/cloud/agent chain above generated results
- `/support` leads with `Critical Session Protection` and only opens `Home Dashboard` from drill-in actions
- `/growth` has no `Coming Soon` cues and frames `Pre-Churn Rescue / Plan Upgrade Opportunity` as a live work mode
- all three workspaces show scenario-driven `Reasoning / Backend Actions / Audit Log` in the right rail

- [ ] **Step 5: Commit the final integration pass**

```bash
git add src/app/components/workbench/prompt-workbench-shell.test.tsx src/app/components/app-layout.tsx src/app/components/workspace-right-panel.tsx src/app/pages/workspace-operations.tsx src/app/pages/workspace-support.tsx src/app/pages/workspace-growth.tsx
git commit -m "test: verify prompt-first workspace integration"
```
