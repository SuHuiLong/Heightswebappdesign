# Design Spec: 7 New Chat Card Types for Command Center

**Date:** 2026-03-28
**Status:** Approved
**Scope:** `src/app/components/chat-messages.tsx` + `src/app/pages/command-center.tsx`

---

## Overview

Add 7 new AI response card types to the Command Center home page, each triggered by natural language keywords in the chat input. All cards follow the existing `CardWrapper` pattern, use only mock data, and require no new dependencies.

---

## Architecture

- **No new files.** All card components added to `chat-messages.tsx`.
- **No new dependencies.** Recharts (already installed) used for BandwidthChartCard.
- Each card is a named export from `chat-messages.tsx`.
- Each card is triggered by a new `else if` branch in `handleSend()` in `command-center.tsx`, inserted **before** the existing `else` default branch.
- Each `SuggestionCard` chip uses the same **inline `setTimeout` pattern** as existing chips (not `handleSend()`) — duplicating the push-message + setIsTyping + setTimeout logic directly in `onClick`.

---

## Message Type Strings

Each new card maps to a message object `type` string. These must not collide with existing types (`user`, `ai-text`, `metric`, `alerts`, `subscriber`, `action`, `receipt`, `device-table`, `topology`).

| Component | `type` string |
|---|---|
| BandwidthChartCard | `bandwidth-chart` |
| SpeedTestCard | `speed-test` |
| OutageMapCard | `outage-map` |
| ServicePlanCard | `service-plan` |
| WorkOrderCard | `work-order` |
| SLAStatusCard | `sla-status` |
| ProvisioningCard | `provisioning` |

---

## CSS Variables

All color references must use the actual variables defined in `theme.css`:

- Accent/orange: `var(--accent-color)` (NOT `var(--accent)`)
- Primary/blue: `var(--primary)`
- Success/green: `var(--success)`
- Warning/yellow: `var(--warning)`
- Critical/red: `var(--critical)`
- Severity badges: `var(--severity-critical)`, `var(--severity-high)`, `var(--severity-medium)`, `var(--severity-low)`
- Neutral shades: `var(--neutral-400)`, `var(--neutral-500)`, `var(--neutral-600)`

---

## Keyword Branch Ordering in `handleSend()`

Insert all 7 new `else if` branches **before** the existing `else` default. Suggested order (most specific first, no collisions with existing branches):

```
if (device/gateway/list)          // existing
else if (topology/subscriber/john) // existing
else if (chart/history/bandwidth)  // NEW
else if (speed test/speed/测速)    // NEW — check 'speed test' before 'speed'
else if (outage/故障/停服/down)    // NEW
else if (plan/套餐)                // NEW — NOT 'billing' to avoid future conflicts
else if (work order/ticket/工单)   // NEW — check 'work order' before 'order'
else if (sla/uptime/可用性)        // NEW
else if (provision/开通/新用户)    // NEW
else                               // existing default
```

Note: `billing` keyword removed from ServicePlanCard trigger to avoid ambiguity. Use `plan` and `套餐` only.

---

## Card Specifications

### 1. BandwidthChartCard

**Trigger keywords:** `chart`, `history`, `历史`, `bandwidth`
**Type string:** `bandwidth-chart`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Title: "Bandwidth Usage — Last 7 Days"
- Recharts `LineChart` (width 100%, height 200) with two `Line` series:
  - Download: color `var(--primary)`
  - Upload: color `var(--accent-color)`
- X-axis: `['Mon','Tue','Wed','Thu','Fri','Sat','Sun']`
- Y-axis: Mbps, domain `[0, 600]`
- Mock data: 7 objects `{ day, download, upload }` with realistic values
- `<Legend />` and `<Tooltip />` included
- Wrapped in `CardWrapper`

**AI text message:** `"Here's your bandwidth usage for the last 7 days:"`

---

### 2. SpeedTestCard

**Trigger keywords:** `speed test`, `speed`, `测速`
**Type string:** `speed-test`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Three columns: Download, Upload, Latency
- Each column: circular SVG ring (r=40, strokeWidth=8) + value below
  - Download ring: `var(--primary)`, final value 487, unit Mbps
  - Upload ring: `var(--accent-color)`, final value 92, unit Mbps
  - Latency ring: `var(--success)`, final value 8, unit ms
- On mount (`useEffect`): animate ring `strokeDashoffset` from 0% fill to final % over 1800ms
- Status label: "Test Complete ✓" shown after animation (use local `useState` flag)
- Wrapped in `CardWrapper`

**AI text message:** `"Running speed test on your connection..."`

---

### 3. OutageMapCard

**Trigger keywords:** `outage`, `故障`, `停服`, `down`
**Type string:** `outage-map`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Header: "3 Active Outages" with red badge
- List of 3 zones, sorted critical → high → medium:
  1. Critical — Downtown Core — 847 affected — ETA 14:30
  2. High — East District — 312 affected — ETA 15:00
  3. Medium — West Suburb — 89 affected — ETA 16:45
- Each row: severity badge (`var(--severity-*)` bg), zone name, affected count, ETA
- Footer: "Last updated: " + timestamp
- Wrapped in `CardWrapper`

**AI text message:** `"Here are the currently active outages in your network:"`

---

### 4. ServicePlanCard

**Trigger keywords:** `plan`, `套餐`
**Type string:** `service-plan`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Plan name badge: "Business Pro 500" (primary color)
- Monthly cost: "$89.99/mo"
- Data usage: progress bar, 342 GB used of 500 GB cap (68.4%)
  - Bar color: `var(--primary)` normally, `var(--critical)` when >80%
- Billing cycle: "Mar 1 – Mar 31, 2026" — "3 days remaining"
- Feature tags: Static IP, Priority Support, 24/7 NOC
- Wrapped in `CardWrapper`

**AI text message:** `"Here's the current service plan for this subscriber:"`

---

### 5. WorkOrderCard

**Trigger keywords:** `work order`, `ticket`, `工单`
**Type string:** `work-order`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Header: "Work Order Created" with `CheckCircle2` icon in `var(--success)` color
- Fields: Ticket ID (WO-20480), Category (Network Issue), Priority (High — warning badge), Assigned (Tech: Marcus Webb), Created (just now)
- Status badge: "Open" in primary color
- Primary button: "View Full Ticket" → calls `toast.success('Opening work order WO-20480')`
- Wrapped in `CardWrapper`

**AI text message:** `"I've created a work order for this issue:"`

---

### 6. SLAStatusCard

**Trigger keywords:** `sla`, `uptime`, `可用性`
**Type string:** `sla-status`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Header: overall badge — "Compliant" (`var(--success)`) since 2 of 3 metrics pass
- Table, 3 rows:
  | Metric | Target | Actual | Status |
  |---|---|---|---|
  | Uptime | 99.9% | 99.97% | ✓ green |
  | Avg Response Time | 2.0h | 2.1h | ✗ red |
  | Avg Resolution Time | 4.0h | 3.8h | ✓ green |
- ✓ colored `var(--success)`, ✗ colored `var(--critical)`
- Wrapped in `CardWrapper`

**AI text message:** `"Here's the current SLA compliance status:"`

---

### 7. ProvisioningCard

**Trigger keywords:** `provision`, `开通`, `新用户`
**Type string:** `provisioning`
**Props:** `timestamp: string`, `source: string`

**Layout:**
- Header: "Provisioning: Alex Turner (ACC-20391)"
- Vertical stepper, 5 steps:
  1. Account Created — `CheckCircle2` green — "Mar 25, 10:00"
  2. Equipment Ordered — `CheckCircle2` green — "Mar 25, 10:02"
  3. Equipment Shipped — `Clock` warning — "In transit — ETA Mar 30" (in-progress)
  4. ONT Online — `Circle` neutral-400 — "Pending"
  5. Service Activated — `Circle` neutral-400 — "Pending"
- Step connector line: green for completed, neutral for pending
- Progress bar at bottom: 40% complete (`var(--primary)`)
- Wrapped in `CardWrapper`

**Icon imports needed:** Add `Circle` to lucide-react import in `chat-messages.tsx`
**AI text message:** `"Here's the provisioning status for the new subscriber:"`

---

## Prompt Suggestion Chips

Add 4 new `SuggestionCard` chips to the suggestions grid in `command-center.tsx`. Each uses the **inline setTimeout pattern** (same as existing chips, not `handleSend()`):

| Chip title | User message sent | AI response type |
|---|---|---|
| "Bandwidth History" | `"Show bandwidth history"` | `bandwidth-chart` |
| "Run Speed Test" | `"Run speed test"` | `speed-test` |
| "Active Outages" | `"Show active outages"` | `outage-map` |
| "Current Plan" | `"Show current plan"` | `service-plan` |

---

## Implementation Boundaries

- All data is mock/static — no API calls
- No new files created
- No new npm packages
- Animation only in SpeedTestCard (SVG ring mount effect)
- All cards use CSS variables from `theme.css` for theming
- Cards respect dark/light mode automatically via CSS variables
- `toast` already imported in `command-center.tsx` via `sonner`; WorkOrderCard receives `onViewTicket?: () => void` prop OR calls `toast` directly by importing from `sonner` in `chat-messages.tsx`
