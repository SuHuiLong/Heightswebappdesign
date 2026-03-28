# Heights Web App Design

An AI-powered network operations management interface for ISPs and telecom operators. Built with React, Tailwind CSS v4, and Radix UI primitives.

> Original Figma design: [Heights Web App Design](https://www.figma.com/design/VSZqRthhwzW3bYOfis8ngg/Heights-Web-App-Design)

---

## Features

### Command Center (`/`)
- **AI Operations Assistant** — natural language chat interface for querying and controlling network state
- **Contextual message cards** — metric cards, alert lists, subscriber info, action confirmations, device tables, and network topology views rendered inline in the conversation
- **Prompt suggestions** — quick-action buttons for common queries
- **Parallax background** — mouse-tracked motion effects for depth

### Scope Selector
- **Hierarchical tenant filtering** — drill down from All Tenants → Region → Organization → Subscriber
- **Breadcrumb navigation** — always-visible breadcrumb lets you jump between scope levels instantly
- **Dynamic dropdowns** — region/organization/subscriber selectors cascade based on selection

### Audit Timeline (`/audit`)
- Chronological log of all operations and AI-executed actions
- Filter by scope, severity, and time range

### Settings (`/settings`)
- Application and account configuration

### UI System
- **Dark / light theme toggle** — persistent theme switching via `next-themes`
- **Animated transitions** — page and component animations via `motion/react`
- **Responsive layout** — collapsible sidebar, mobile-friendly top bar with hamburger menu
- **shadcn/ui component library** — Radix UI primitives styled with Tailwind v4 CSS variables
- **Toast notifications** — via `sonner`
- **Action confirmation modals** — safe execution flow for destructive or impactful operations
- **Subscriber Quick Inspect Drawer** — slide-in panel for rapid subscriber details review

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI |
| Animation | Motion (Framer Motion v12) |
| Charts | Recharts |
| Icons | Lucide React |
| Build | Vite 6 |
| Notifications | Sonner |
| Forms | React Hook Form |
| Drag & Drop | React DnD |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── app-layout.tsx       # Shell: top bar, sidebar, scope selector
│   │   ├── scope-selector.tsx   # Hierarchical tenant scope breadcrumb
│   │   ├── chat-messages.tsx    # AI message card types
│   │   ├── context-panel.tsx    # Right-side context panel
│   │   ├── action-confirmation-modal.tsx
│   │   └── subscriber-quick-inspect-drawer.tsx
│   ├── pages/
│   │   ├── command-center.tsx   # Main AI chat interface (/)
│   │   ├── audit-timeline.tsx   # Operation audit log (/audit)
│   │   ├── settings.tsx         # Settings (/settings)
│   │   └── state-pack-demo.tsx  # Component demo (/demo)
│   ├── routes.ts
│   └── App.tsx
└── main.tsx
```

---

## Planned Features

- **Real-time alerts panel** — WebSocket-driven live alert feed with severity badges
- **Network topology map** — interactive graph view of region/org/subscriber relationships
- **Bulk action support** — multi-select subscribers for batch operations
- **Role-based access control** — permission-gated UI for read-only vs. operator vs. admin roles
- **Export & reporting** — download audit logs as CSV/PDF
- **Keyboard shortcuts** — power-user shortcuts for common operations (scope switching, command focus)
- **Saved queries** — bookmark frequently used AI prompts
- **Custom dashboard widgets** — drag-and-drop metric card arrangement per user

---

## License

Private — see [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party licenses.
