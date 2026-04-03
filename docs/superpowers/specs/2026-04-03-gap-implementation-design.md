# Gap Implementation Design

## Overview

Implement the missing features identified in the UI/UX document gap analysis, using the Extract Shared + Build approach. All data uses mock/static data consistent with the current codebase.

## Phase 1 (P0): Core Interaction & Dashboard

### 1.1 Extract Shared Workspace Hook

**Problem**: `workspace-operations.tsx` (1514 lines), `workspace-support.tsx` (2518 lines), and `workspace-growth.tsx` (1408 lines) share ~600 lines of identical scope palette logic.

**Solution**: Create `useWorkspaceChat` hook that encapsulates:

- Scope palette state machine (ScopePaletteState, parseScopeCommandInput, getScopeCommandOptions)
- Message state management (messages, isTyping, input)
- Cursor glow / ambient background
- Auto-scroll behavior
- Scope change handling

**File**: `src/app/hooks/use-workspace-chat.ts`

**Interface**:
```ts
interface UseWorkspaceChatOptions {
  workspaceId: WorkspaceId;
  welcomeMessage: string;
  scenarios: ScenarioPrompt[];
  getScopeActions: (scope: ScopeSelection) => ScopeQuickAction[];
}

interface UseWorkspaceChatReturn {
  // State
  input, setInput, messages, isTyping, currentScope,
  isFocused, setIsFocused, cursorGlow, hasInteracted,
  isScopeCommandMode, scopePaletteState, scopeCommandOptions, activeCommandIndex,

  // Actions
  handleSend, handleGenerativePrompt, handleScopeChange,
  handleScopeOptionClick, handleInputKeyDown,

  // Refs
  scrollContainerRef, inputRef, lastMessageRef,
}
```

### 1.2 Right Sidebar: Reasoning / Actions / Audit

**Requirement**: Every workspace page shows a fixed right panel with 3 collapsible sections:

1. **Reasoning** - Shows AI reasoning steps for the current query
2. **Backend Actions** - Auto-executed system actions
3. **Audit Log** - Chronological event timeline

**Current state**: Each workspace has a basic right panel with workspace info + scope actions. No Reasoning/Actions/Audit sections.

**Solution**: Create `WorkspaceRightPanel` component.

**File**: `src/app/components/workspace-right-panel.tsx`

**Structure**:
```
WorkspaceRightPanel
├── ReasoningSection (collapsible)
│   └── List of reasoning steps with confidence scores
├── BackendActionsSection (collapsible)
│   └── List of auto-executed actions with status
└── AuditLogSection (collapsible)
    └── Chronological event entries with timestamps
```

**Mock data**: Each workspace generates contextual mock entries when a query is processed.

### 1.3 Fleet Overview Dashboard

**Requirement**: A top-level dashboard showing fleet health at a glance.

**Solution**: New page at `/fleet` route.

**File**: `src/app/pages/fleet-overview.tsx`

**Layout**:
```
┌────────────────────────────────────────────────────┐
│ Fleet Overview                           Region ▼  │
├──────────┬──────────┬──────────┬──────────────────┤
│ Total GW │  Online  │ Degraded │    Offline       │
│  12,489  │  12,458  │    23    │      8           │
├──────────┴──────────┴──────────┴──────────────────┤
│ Health Score: 94.2% ████████████████░░ +2.3%      │
├───────────────────────┬──────────────────────────┤
│ Performance Trends    │  Active Alerts            │
│ [Line Chart]          │  🔴 1 Critical            │
│                       │  🟡 3 Medium              │
│                       │  ⚪ 12 Low                 │
├───────────────────────┴──────────────────────────┤
│ Regional Breakdown                                │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│ │North│ │South│ │East │ │West │ │Cent │ │All  ││
│ │98.1%│ │95.3%│ │91.7%│ │96.8%│ │93.2%│ │94.2%││
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘│
├──────────────────────────────────────────────────┤
│ Firmware Distribution                             │
│ v2.4.1 ████████░░ 78%   v2.4.0 ███░░ 18%         │
│ v2.3.x █░ 4%                                        │
└──────────────────────────────────────────────────┘
```

**Components**: Uses existing Card, Badge, Recharts. Mock data from `scope-data.ts`.

## Phase 2 (P1): Workspace Completion

### 2.1 Growth Workspace Enhancement

**Current state**: Growth workspace has basic chat but lacks Growth-specific data visualization and mock data.

**Solution**: Add Growth-specific message renderers:
- Churn risk matrix (heatmap-style card)
- Revenue pipeline chart
- Segment breakdown table
- Campaign performance metrics

### 2.2 Subscriber Detail Page

**Current state**: Support workspace has a `HomeDashboard` component (lines 2139-2517) embedded in workspace-support.tsx.

**Solution**: Extract and enhance as standalone page at `/subscriber/:id`.

**File**: `src/app/pages/subscriber-detail.tsx`

**Sub-tabs**: Overview, Gateways, Devices, Events, QoE, Security, Remote Actions

## Phase 3 (P2): Advanced Features

### 3.1 WiFi Topology Visualization

**Solution**: Add topology tab to subscriber detail using D3.js tree layout.

### 3.2 Real-time Alert Panel

**Solution**: Alert center component with auto-updating mock data (simulated with setInterval).

## Phase 4 (P3): Enterprise Features

### 4.1 RBAC

**Solution**: Mock role system with UI-level permission gates.

### 4.2 White-label

**Solution**: Theme provider that reads tenant configuration.

---

## File Structure (New Files)

```
src/app/
├── hooks/
│   └── use-workspace-chat.ts          # Shared workspace chat logic
├── components/
│   ├── workspace-right-panel.tsx       # Reasoning/Actions/Audit sidebar
│   ├── fleet-health-card.tsx           # Fleet KPI card
│   ├── fleet-region-grid.tsx           # Regional breakdown
│   └── fleet-alert-center.tsx          # Alert list component
├── pages/
│   ├── fleet-overview.tsx              # Fleet dashboard page
│   └── subscriber-detail.tsx           # Subscriber detail page
├── lib/
│   └── mock-fleet-data.ts             # Fleet mock data
```

## Implementation Order

1. Extract `useWorkspaceChat` hook
2. Refactor 3 workspace pages to use the hook
3. Build `WorkspaceRightPanel` with Reasoning/Actions/Audit
4. Integrate right panel into all 3 workspaces
5. Build Fleet Overview page + route
6. Enhance Growth workspace data visualization
7. Extract and enhance Subscriber Detail page

## Constraints

- All mock data, no API integration
- Tailwind v4 + CSS variables (existing theme system)
- Motion (Framer Motion) for animations
- Recharts for charts
- Must maintain dark/light theme support
- Responsive design (mobile-friendly)
