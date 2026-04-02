# Heights — AI-Powered Network Operations Platform

An intelligent network management interface for ISPs and telecom operators, featuring generative UI, multi-workspace architecture, and AI-driven network operations assistance.

> Original Design: [Heights Web App Design (Figma)](https://www.figma.com/design/VSZqRthhwzW3bYOfis8ngg/Heights-Web-App-Design)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Workspaces](#workspaces)
- [Generative UI Scenarios](#generative-ui-scenarios)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [UI System](#ui-system)
- [Design Documentation](#design-documentation)
- [Planned Features](#planned-features)
- [License](#license)

---

## Overview

Heights is a next-generation network operations management web application designed for service providers. It replaces traditional static dashboards with an **AI-powered conversational interface** that dynamically generates visualizations, insights, and actionable recommendations based on natural-language queries.

### Key Differentiators

- **Workspace-oriented** — Three purpose-built work modes (Operations, Support, Growth) instead of one-size-fits-all dashboards
- **Generative UI** — The interface dynamically renders charts, tables, risk matrices, and action panels based on AI analysis context
- **Hierarchical scope navigation** — Drill down from fleet level to individual devices with breadcrumb navigation
- **Scenario-driven** — Pre-built high-value scenarios covering firmware regression, traffic anomalies, churn prevention, and more

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Workspace Welcome (/)                 │
│              ┌──────────┬──────────┬──────────┐         │
│              │Operations│ Support  │ Growth   │         │
│              └────┬─────┴────┬─────┴────┬─────┘         │
│                   │          │          │                │
│         ┌─────────▼──┐  ┌───▼──────┐  ┌▼─────────┐     │
│         │  AI Chat    │  │ AI Chat  │  │ AI Chat  │     │
│         │  + Scope    │  │ + Scope  │  │ + Scope  │     │
│         │  + Generative│ │ + Generative│ + Generative│   │
│         └─────────────┘  └──────────┘  └──────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Shared Layer: App Layout, Scope Selector,       │   │
│  │  Theme System, UI Components, Audit Timeline     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query (natural language)
  → Scenario Resolver (keyword matching + confidence scoring)
    → Scenario Definition (loading stages, blocks, evidence)
      → Generative Cards (dynamic rendering of blocks)
        → Follow-up Suggestions
```

---

## Workspaces

The platform organizes work into three distinct workspaces, each tailored to a specific operational context:

### Operations (`/operations`)

**Purpose:** Fleet-level operations, incidents, and network-wide issues.

| Attribute | Detail |
|-----------|--------|
| Primary Objects | incident, cohort, region, organization |
| Accent Color | Blue (`--ambient-blue`) |
| Status | Implemented |

**Example Scenarios:**
- Firmware regression analysis across fleet
- DPI & traffic anomaly detection
- Regional outage investigation
- Fleet health analysis

### Support (`/support`)

**Purpose:** Case-level work for tickets, subscribers, and individual gateway support.

| Attribute | Detail |
|-----------|--------|
| Primary Objects | ticket, subscriber, home, gateway |
| Accent Color | Cyan (`--ambient-cyan`) |
| Status | Implemented |

**Example Scenarios:**
- Ticket-based subscriber troubleshooting
- Home gateway diagnostics
- Subscriber health investigation
- Device-level remediation

### Growth (`/growth`)

**Purpose:** Growth opportunities, segments, upsell campaigns, and VAS promotion.

| Attribute | Detail |
|-----------|--------|
| Primary Objects | opportunity, segment, campaign |
| Accent Color | Warm (`--ambient-warm`) |
| Status | Coming Soon |

**Example Scenarios:**
- Bandwidth upsell opportunities
- Silent sufferer churn prevention
- VAS device fingerprint targeting
- Segment-based campaigns

---

## Generative UI Scenarios

The platform includes 6 pre-built AI analysis scenarios with dynamic UI rendering:

### Scenario Architecture

Each scenario consists of:
- **Loading stages** — Progressive disclosure messages during analysis
- **Confidence score** — Overall confidence percentage of the analysis
- **Evidence domains** — Data sources referenced by the analysis
- **Content blocks** — Dynamically rendered UI components
- **Follow-up prompts** — Suggested next queries

### Supported Block Types

| Block Type | Description |
|------------|-------------|
| `summary` | Root cause / key finding narrative |
| `stats` | Key metric cards with trends (up/down/neutral) |
| `bar-chart` | Categorical bar visualization |
| `time-series` | Temporal data with anomaly markers |
| `table` | Structured data table with columns and rows |
| `risk-matrix` | 4-quadrant risk assessment grid |
| `forecast` | Historical + predicted data with confidence intervals |
| `device-insight` | Device category breakdown with examples |
| `subscriber-list` | Prioritized subscriber list with risk levels |
| `actions` | Actionable recommendation buttons (primary/outline/destructive) |
| `bandwidth-timeline` | Hourly bandwidth usage vs threshold |

### Built-in Scenarios

| ID | Title | Family | Confidence |
|----|-------|--------|------------|
| `firmware-regression` | Firmware Regression Analysis (Needle in a Haystack) | Operations | 94% |
| `dpi-traffic-anomalies` | DPI & Traffic Anomaly Report | Operations | 91% |
| `resource-planning` | Proactive Cost Forecast | Planning | 87% |
| `churn-prevention` | Silent Sufferer Detection | Business | 89% |
| `bandwidth-upsell` | Bandwidth Saturation Analysis | Business | 86% |
| `vas-device-fingerprint` | Device Fingerprint Insights (VAS) | Business | 92% |

### Scenario Resolution

User queries are matched to scenarios via keyword matching in `scenario-resolver.ts`. Keywords support both English and Chinese terms for multilingual matching.

---

## Features

### Core Interface

- **Workspace Selection Page** — Animated entry point with workspace cards showing primary objects, example scenarios, and accent theming
- **AI Chat Interface** — Natural language conversation for querying and controlling network state
- **Contextual Message Cards** — Inline rendering of metric cards, alerts, subscriber info, device tables, and visualizations
- **Prompt Suggestions** — Quick-action buttons for common queries and starter tasks

### Scope Navigation

- **Hierarchical filtering** — All Tenants → Region → Organization → Subscriber → Device
- **Breadcrumb navigation** — Jump between scope levels instantly
- **Dynamic dropdowns** — Cascading selectors based on current scope
- **Command-line shortcuts** — `/region`, `/organization` style navigation

### Audit & History

- **Audit Timeline** (`/audit`) — Chronological log of all operations and AI-executed actions
- Filter by scope, severity, and time range

### Visual System

- **Dark / light theme toggle** — Persistent theme via CSS variables and `next-themes`
- **Animated transitions** — Page and component animations via `motion/react`
- **Ambient background effects** — Floating gradient blobs with subtle drift animations
- **Responsive layout** — Collapsible sidebar, mobile-friendly top bar
- **Reduced motion support** — Respects `prefers-reduced-motion` accessibility preference

### Developer Experience

- **50+ shadcn/ui components** — Radix UI primitives styled with Tailwind v4
- **Toast notifications** — Via `sonner`
- **Action confirmation modals** — Safe execution flow for destructive operations
- **Subscriber Quick Inspect Drawer** — Slide-in panel for rapid subscriber review
- **State Pack Demo** (`/demo`) — Component showcase page

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3 |
| Routing | React Router | 7.13 |
| Styling | Tailwind CSS | 4.1 |
| UI Primitives | Radix UI | 38+ components |
| Animation | Motion (Framer Motion) | 12.x |
| Charts | Recharts | 2.15 |
| Icons | Lucide React | 0.487 |
| Build Tool | Vite | 6.3 |
| Notifications | Sonner | 2.0 |
| Forms | React Hook Form | 7.55 |
| Date Utilities | date-fns | 3.6 |
| Command Menu | cmdk | 1.1 |
| Drawers | vaul | 1.1 |
| Carousels | Embla Carousel | 8.6 |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/SuHuiLong/Heightswebappdesign_cc.git
cd Heightswebappdesign_cc

# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server starts at `http://localhost:5173/Heightswebappdesign/`.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory with optimized code splitting:

| Chunk | Contents |
|-------|----------|
| `charts` | Recharts library |
| `motion` | Framer Motion animations |
| `ui-vendor` | Radix UI, cmdk, vaul, date picker, carousel |
| `router` | React Router |
| `app-vendor` | Lucide icons, Sonner, date-fns |

---

## Project Structure

```
src/
├── main.tsx                          # Application entry point
├── styles/                           # Global styles
│   ├── index.css                     # Style imports
│   ├── tailwind.css                  # Tailwind v4 configuration
│   ├── theme.css                     # CSS custom properties (design tokens)
│   └── fonts.css                     # Typography
│
└── app/
    ├── App.tsx                       # Root component with router provider
    ├── routes.ts                     # Route definitions (lazy loaded)
    │
    ├── components/
    │   ├── ui/                       # 50+ shadcn/ui base components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── input.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── tooltip.tsx
    │   │   └── ...                   # 40+ more components
    │   │
    │   ├── generative/               # Dynamic scenario rendering
    │   │   ├── generative-cards.tsx  # Block type renderers
    │   │   └── workspace-session.tsx # Session management
    │   │
    │   ├── app-layout.tsx            # Shell: top bar, sidebar, content area
    │   ├── scope-selector.tsx        # Hierarchical scope breadcrumb
    │   ├── chat-messages.tsx         # AI message card types
    │   ├── context-panel.tsx         # Right-side context panel
    │   ├── state-pack.tsx            # State pack component
    │   ├── theme-toggle.tsx          # Dark/light mode switch
    │   ├── subscriber-quick-inspect-drawer.tsx
    │   └── action-confirmation-modal.tsx
    │
    ├── lib/                          # Business logic & data
    │   ├── workspace-definitions.ts  # Workspace configs, starter tasks, context
    │   ├── scenario-definitions.ts   # 6 AI scenario definitions with blocks
    │   ├── scenario-resolver.ts      # Keyword-based scenario matching
    │   ├── scope-data.ts             # Hierarchical data (ISPs, regions, subscribers)
    │   └── state-pack.tsx
    │
    └── pages/
        ├── workspace-welcome.tsx     # Entry point — workspace selection (/)
        ├── workspace-operations.tsx  # Operations workspace (/operations)
        ├── workspace-support.tsx     # Support workspace (/support)
        ├── command-center.tsx        # Legacy AI chat (/command-center)
        ├── audit-timeline.tsx        # Operation audit log (/audit)
        ├── settings.tsx              # Application settings (/settings)
        ├── state-pack-demo.tsx       # Component demo (/demo)
        └── not-found.tsx             # 404 page
```

---

## Routing

All routes use lazy loading for optimal bundle size. Base path: `/Heightswebappdesign`.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `WorkspaceWelcome` | Workspace selection entry point |
| `/operations` | `OperationsWorkspace` | Operations workspace (AI chat + scope) |
| `/support` | `SupportWorkspace` | Support workspace (AI chat + scope) |
| `/growth` | `WorkspaceWelcome` | Growth workspace (placeholder, redirects to welcome) |
| `/command-center` | `CommandCenter` | Legacy command center (kept for reference) |
| `/audit` | `AuditTimeline` | Operation audit log |
| `/settings` | `Settings` | Application settings |
| `/demo` | `StatePackDemo` | Component showcase |
| `*` | `NotFound` | 404 fallback |

---

## UI System

### Theme System

The application uses CSS custom properties for theming, managed through `theme.css`. Two themes are available:

- **Dark theme** (default) — Dark backgrounds with vibrant accent colors
- **Light theme** — Light surfaces with adjusted contrast

Theme switching is handled by `next-themes` and toggled via the `ThemeToggle` component.

### Design Tokens

Key CSS variables include:

| Token | Purpose |
|-------|---------|
| `--background` | Page background |
| `--foreground` | Primary text color |
| `--card` | Card background |
| `--border` | Border color |
| `--primary` | Primary action color |
| `--ambient-blue` | Operations workspace accent |
| `--ambient-cyan` | Support workspace accent |
| `--ambient-warm` | Growth workspace accent |
| `--ambient-violet` | Decorative accent |
| `--critical` / `--warning` / `--success` | Status colors |

### Component Library

Built on **shadcn/ui** (Radix UI primitives + Tailwind v4), including:
- Accordion, AlertDialog, Avatar, Breadcrumb, Button, Card, Checkbox
- Command Menu (cmdk), ContextMenu, Dialog, Drawer (vaul), DropdownMenu
- Form (react-hook-form), Input, Label, Menubar, NavigationMenu
- Popover, Progress, RadioGroup, ScrollArea, Select, Separator
- Sheet, Slider, Switch, Table, Tabs, Toggle, Tooltip

---

## Design Documentation

The `uiux/` directory contains design references and feedback:

| File | Description |
|------|-------------|
| `Cloud AI Wi-Fi Management Dashboard for Service Providers.docx.md` | Original product specification |
| `Generative_UI_The_Future_of_Network_Management.pdf` | Generative UI design approach |
| `Workspace-UI-Feedback-2026-04-01.zh-CN.md` | UI feedback review (Chinese) |

---

## Planned Features

- **Real-time alerts panel** — WebSocket-driven live alert feed with severity badges
- **Network topology map** — Interactive graph view of region/org/subscriber relationships
- **Bulk action support** — Multi-select subscribers for batch operations
- **Role-based access control** — Permission-gated UI for read-only, operator, and admin roles
- **Export & reporting** — Download audit logs as CSV/PDF
- **Keyboard shortcuts** — Power-user shortcuts for scope switching and command focus
- **Saved queries** — Bookmark frequently used AI prompts
- **Custom dashboard widgets** — Drag-and-drop metric card arrangement per user
- **Growth workspace** — Full implementation of upsell, churn prevention, and campaign tools

---

## License

Private — see [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party licenses.
