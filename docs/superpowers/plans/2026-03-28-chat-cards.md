# Chat Card Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 new AI response card types (BandwidthChartCard, SpeedTestCard, OutageMapCard, ServicePlanCard, WorkOrderCard, SLAStatusCard, ProvisioningCard) to the Command Center home page, each triggered by natural language keywords.

**Architecture:** All card components are added as named exports to the existing `chat-messages.tsx` file. Each card is rendered by the existing `renderMessage()` switch in `command-center.tsx`, triggered by new `else if` keyword branches in `handleSend()`. 4 new SuggestionCard chips are added to the home screen quick-action grid.

**Tech Stack:** React 18, TypeScript, Recharts (already installed), motion/react, lucide-react, sonner (toast), Tailwind CSS v4 with CSS variables.

**Spec:** `docs/superpowers/specs/2026-03-28-chat-cards-design.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/app/components/chat-messages.tsx` | Modify | Add 7 new card components + `Circle` to lucide import + `toast` from sonner |
| `src/app/pages/command-center.tsx` | Modify | Add 7 type imports, 7 keyword branches in `handleSend()`, 7 cases in `renderMessage()`, 4 new SuggestionCard chips |

No new files. No new packages.

---

## Task 1: Add BandwidthChartCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx` (add component at bottom)
- Modify: `src/app/pages/command-center.tsx` (add import, keyword branch, render case, suggestion chip)

- [ ] **Step 1: Add `BandwidthChartCard` to `chat-messages.tsx`**

Add these imports at the top of `chat-messages.tsx` (after existing imports):
```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

Add the component at the bottom of `chat-messages.tsx`:
```tsx
const BANDWIDTH_DATA = [
  { day: 'Mon', download: 423, upload: 78 },
  { day: 'Tue', download: 387, upload: 82 },
  { day: 'Wed', download: 512, upload: 95 },
  { day: 'Thu', download: 467, upload: 88 },
  { day: 'Fri', download: 498, upload: 91 },
  { day: 'Sat', download: 341, upload: 63 },
  { day: 'Sun', download: 298, upload: 54 },
];

interface BandwidthChartCardProps {
  timestamp: string;
  source: string;
}

export function BandwidthChartCard({ timestamp, source }: BandwidthChartCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
          Bandwidth Usage — Last 7 Days
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={BANDWIDTH_DATA}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} unit=" Mbps" domain={[0, 600]} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--foreground)',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="download" stroke="var(--primary)" strokeWidth={2} dot={false} name="Download" />
            <Line type="monotone" dataKey="upload" stroke="var(--accent-color)" strokeWidth={2} dot={false} name="Upload" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
}
```

- [ ] **Step 2: Wire into `command-center.tsx`**

Add import:
```tsx
import {
  // ...existing imports...
  BandwidthChartCard,
} from '../components/chat-messages';
```

Add keyword branch in `handleSend()` **before** the existing `else` block:
```tsx
} else if (userInput.includes('chart') || userInput.includes('history') || userInput.includes('历史') || userInput.includes('bandwidth')) {
  setMessages((prev) => [
    ...prev,
    {
      type: 'ai-text',
      message: "Here's your bandwidth usage for the last 7 days:",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    },
    { type: 'bandwidth-chart' },
  ]);
```

Add render case in `renderMessage()` switch:
```tsx
case 'bandwidth-chart':
  return (
    <BandwidthChartCard
      key={idx}
      timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      source="Network Analytics Engine"
    />
  );
```

Add SuggestionCard chip (in the suggestions grid, after existing chips):
```tsx
<SuggestionCard
  title="Bandwidth History"
  onClick={() => {
    const message = 'Show bandwidth history';
    setMessages((prev) => [
      ...prev,
      { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    ]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { type: 'ai-text', message: "Here's your bandwidth usage for the last 7 days:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
        { type: 'bandwidth-chart' },
      ]);
    }, 1500);
  }}
  delay={0.5}
/>
```

- [ ] **Step 3: Verify in browser** — type "show bandwidth" → should render chart card

- [ ] **Step 4: Commit**
```bash
git add src/app/components/chat-messages.tsx src/app/pages/command-center.tsx
git commit -m "feat: add BandwidthChartCard chat card"
```

---

## Task 2: Add SpeedTestCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx`
- Modify: `src/app/pages/command-center.tsx`

- [ ] **Step 1: Add `SpeedTestCard` to `chat-messages.tsx`**

```tsx
interface SpeedTestCardProps {
  timestamp: string;
  source: string;
}

export function SpeedTestCard({ timestamp, source }: SpeedTestCardProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const targets = { download: 487, upload: 92, latency: 8 };
  const maxValues = { download: 600, upload: 150, latency: 100 };

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;
    const frame = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(frame);
      else setDone(true);
    };
    requestAnimationFrame(frame);
  }, []);

  const ring = (value: number, max: number, color: string, label: string, unit: string) => {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const fill = (value / max) * progress;
    const offset = circ * (1 - fill);
    const displayed = Math.round(value * progress);
    return (
      <div className="flex flex-col items-center gap-2">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={r} fill="none" stroke="var(--neutral-200)" strokeWidth={8} />
          <circle
            cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
          <text x={50} y={54} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--foreground)">
            {displayed}
          </text>
        </svg>
        <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>{unit}</div>
      </div>
    );
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--foreground)' }}>Speed Test</div>
        <div className="flex justify-around mb-4">
          {ring(targets.download, maxValues.download, 'var(--primary)', 'Download', 'Mbps')}
          {ring(targets.upload, maxValues.upload, 'var(--accent-color)', 'Upload', 'Mbps')}
          {ring(targets.latency, maxValues.latency, 'var(--success)', 'Latency', 'ms')}
        </div>
        {done && (
          <div className="text-center text-sm font-medium" style={{ color: 'var(--success)' }}>
            Test Complete ✓
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
```

Note: `useState` and `useEffect` are already imported in `chat-messages.tsx`? Check — if not, add them to the React import line at the top.

- [ ] **Step 2: Wire into `command-center.tsx`**

Keyword branch (insert after bandwidth-chart branch):
```tsx
} else if (userInput.includes('speed test') || userInput.includes('speed') || userInput.includes('测速')) {
  setMessages((prev) => [
    ...prev,
    { type: 'ai-text', message: 'Running speed test on your connection...', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { type: 'speed-test' },
  ]);
```

Render case:
```tsx
case 'speed-test':
  return (
    <SpeedTestCard
      key={idx}
      timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      source="Speed Test Service"
    />
  );
```

SuggestionCard chip:
```tsx
<SuggestionCard
  title="Run Speed Test"
  onClick={() => {
    const message = 'Run speed test';
    setMessages((prev) => [
      ...prev,
      { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    ]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { type: 'ai-text', message: 'Running speed test on your connection...', timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
        { type: 'speed-test' },
      ]);
    }, 1500);
  }}
  delay={0.6}
/>
```

- [ ] **Step 3: Verify in browser** — type "speed test" → rings animate over 1.8s, then show "Test Complete ✓"

- [ ] **Step 4: Commit**
```bash
git add src/app/components/chat-messages.tsx src/app/pages/command-center.tsx
git commit -m "feat: add SpeedTestCard with animated rings"
```

---

## Task 3: Add OutageMapCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx`
- Modify: `src/app/pages/command-center.tsx`

- [ ] **Step 1: Add `OutageMapCard` to `chat-messages.tsx`**

```tsx
const OUTAGES = [
  { severity: 'critical' as const, zone: 'Downtown Core', affected: 847, eta: '14:30' },
  { severity: 'high' as const, zone: 'East District', affected: 312, eta: '15:00' },
  { severity: 'medium' as const, zone: 'West Suburb', affected: 89, eta: '16:45' },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'var(--severity-critical-bg)', text: 'var(--severity-critical)', label: 'Critical' },
  high: { bg: 'var(--severity-high-bg)', text: 'var(--severity-high)', label: 'High' },
  medium: { bg: 'var(--severity-medium-bg)', text: 'var(--severity-medium)', label: 'Medium' },
};

interface OutageMapCardProps {
  timestamp: string;
  source: string;
}

export function OutageMapCard({ timestamp, source }: OutageMapCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Active Outages</div>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: 'var(--severity-critical-bg)', color: 'var(--severity-critical)' }}
          >
            {OUTAGES.length} Active
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {OUTAGES.map((o) => {
            const col = SEVERITY_COLORS[o.severity];
            return (
              <div
                key={o.zone}
                className="flex items-center justify-between px-3 py-2 rounded"
                style={{ background: 'var(--neutral-50)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{ background: col.bg, color: col.text }}
                  >
                    {col.label}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{o.zone}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>{o.affected} affected</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>ETA {o.eta}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs mt-3" style={{ color: 'var(--neutral-400)' }}>Last updated: {timestamp}</div>
      </div>
    </CardWrapper>
  );
}
```

- [ ] **Step 2: Wire into `command-center.tsx`**

Keyword branch:
```tsx
} else if (userInput.includes('outage') || userInput.includes('故障') ||  userInput.includes('停服') || userInput.includes('down')) {
  setMessages((prev) => [
    ...prev,
    { type: 'ai-text', message: "Here are the currently active outages in your network:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { type: 'outage-map' },
  ]);
```

Render case:
```tsx
case 'outage-map':
  return <OutageMapCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="NOC Monitoring System" />;
```

SuggestionCard chip:
```tsx
<SuggestionCard
  title="Active Outages"
  onClick={() => {
    const message = 'Show active outages';
    setMessages((prev) => [...prev, { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev,
        { type: 'ai-text', message: "Here are the currently active outages in your network:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
        { type: 'outage-map' },
      ]);
    }, 1500);
  }}
  delay={0.7}
/>
```

- [ ] **Step 3: Verify** — type "outage" → outage list card renders

- [ ] **Step 4: Commit**
```bash
git add src/app/components/chat-messages.tsx src/app/pages/command-center.tsx
git commit -m "feat: add OutageMapCard chat card"
```

---

## Task 4: Add ServicePlanCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx`
- Modify: `src/app/pages/command-center.tsx`

- [ ] **Step 1: Add `ServicePlanCard` to `chat-messages.tsx`**

```tsx
interface ServicePlanCardProps {
  timestamp: string;
  source: string;
}

export function ServicePlanCard({ timestamp, source }: ServicePlanCardProps) {
  const used = 342;
  const cap = 500;
  const pct = Math.round((used / cap) * 100);
  const barColor = pct > 80 ? 'var(--critical)' : 'var(--primary)';
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Business Pro 500</span>
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>$89.99/mo</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
            <span>Data Usage</span>
            <span>{used} GB / {cap} GB ({pct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--neutral-200)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
          </div>
        </div>
        <div className="text-xs mb-3" style={{ color: 'var(--neutral-500)' }}>
          Billing cycle: Mar 1 – Mar 31, 2026 &nbsp;·&nbsp; <span style={{ color: 'var(--warning)' }}>3 days remaining</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Static IP', 'Priority Support', '24/7 NOC'].map((f) => (
            <span key={f} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-600)' }}>{f}</span>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}
```

- [ ] **Step 2: Wire into `command-center.tsx`**

Keyword branch:
```tsx
} else if (userInput.includes('plan') || userInput.includes('套餐')) {
  setMessages((prev) => [...prev,
    { type: 'ai-text', message: "Here's the current service plan for this subscriber:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { type: 'service-plan' },
  ]);
```

Render case:
```tsx
case 'service-plan':
  return <ServicePlanCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Billing System" />;
```

SuggestionCard chip:
```tsx
<SuggestionCard
  title="Current Plan"
  onClick={() => {
    const message = 'Show current plan';
    setMessages((prev) => [...prev, { type: 'user', message, timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev,
        { type: 'ai-text', message: "Here's the current service plan for this subscriber:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
        { type: 'service-plan' },
      ]);
    }, 1500);
  }}
  delay={0.8}
/>
```

- [ ] **Step 3: Verify** — type "plan" → service plan card renders

- [ ] **Step 4: Commit**
```bash
git add src/app/components/chat-messages.tsx src/app/pages/command-center.tsx
git commit -m "feat: add ServicePlanCard chat card"
```

---

## Task 5: Add WorkOrderCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx` (add `toast` import from sonner)
- Modify: `src/app/pages/command-center.tsx`

- [ ] **Step 1: Add `toast` import and `WorkOrderCard` to `chat-messages.tsx`**

Add at top of `chat-messages.tsx`:
```tsx
import { toast } from 'sonner';
```

Add component:
```tsx
interface WorkOrderCardProps {
  timestamp: string;
  source: string;
}

export function WorkOrderCard({ timestamp, source }: WorkOrderCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Work Order Created</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div><span style={{ color: 'var(--neutral-500)' }}>Ticket ID</span><div className="font-medium" style={{ color: 'var(--foreground)' }}>WO-20480</div></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Category</span><div className="font-medium" style={{ color: 'var(--foreground)' }}>Network Issue</div></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Priority</span><div><span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>High</span></div></div>
          <div><span style={{ color: 'var(--neutral-500)' }}>Assigned</span><div className="font-medium" style={{ color: 'var(--foreground)' }}>Marcus Webb</div></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Open</span>
          <Button
            size="sm"
            onClick={() => toast.success('Opening work order WO-20480')}
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-control)' }}
          >
            View Full Ticket
          </Button>
        </div>
      </div>
    </CardWrapper>
  );
}
```

Note: `CheckCircle2` and `Button` are already imported in `chat-messages.tsx`.

- [ ] **Step 2: Wire into `command-center.tsx`**

Keyword branch:
```tsx
} else if (userInput.includes('work order') || userInput.includes('ticket') || userInput.includes('工单')) {
  setMessages((prev) => [...prev,
    { type: 'ai-text', message: "I've created a work order for this issue:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { type: 'work-order' },
  ]);
```

Render case:
```tsx
case 'work-order':
  return <WorkOrderCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="Ticketing System" />;
```

- [ ] **Step 3: Verify** — type "create ticket" → work order card with button that fires toast

- [ ] **Step 4: Commit**
```bash
git add src/app/components/chat-messages.tsx src/app/pages/command-center.tsx
git commit -m "feat: add WorkOrderCard chat card"
```

---

## Task 6: Add SLAStatusCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx`
- Modify: `src/app/pages/command-center.tsx`

- [ ] **Step 1: Add `SLAStatusCard` to `chat-messages.tsx`**

```tsx
const SLA_METRICS = [
  { name: 'Uptime', target: '99.9%', actual: '99.97%', pass: true },
  { name: 'Avg Response Time', target: '2.0h', actual: '2.1h', pass: false },
  { name: 'Avg Resolution Time', target: '4.0h', actual: '3.8h', pass: true },
];

interface SLAStatusCardProps {
  timestamp: string;
  source: string;
}

export function SLAStatusCard({ timestamp, source }: SLAStatusCardProps) {
  const passing = SLA_METRICS.filter((m) => m.pass).length;
  const compliant = passing === SLA_METRICS.length;
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>SLA Compliance</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
            background: compliant ? 'var(--success-bg)' : 'var(--critical-bg)',
            color: compliant ? 'var(--success)' : 'var(--critical)',
          }}>
            {compliant ? 'Compliant' : 'At Risk'}
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: 'var(--neutral-500)' }}>
              <th className="text-left pb-2">Metric</th>
              <th className="text-right pb-2">Target</th>
              <th className="text-right pb-2">Actual</th>
              <th className="text-right pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {SLA_METRICS.map((m) => (
              <tr key={m.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="py-2" style={{ color: 'var(--foreground)' }}>{m.name}</td>
                <td className="py-2 text-right" style={{ color: 'var(--neutral-500)' }}>{m.target}</td>
                <td className="py-2 text-right font-medium" style={{ color: m.pass ? 'var(--success)' : 'var(--critical)' }}>{m.actual}</td>
                <td className="py-2 text-right" style={{ color: m.pass ? 'var(--success)' : 'var(--critical)' }}>{m.pass ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  );
}
```

- [ ] **Step 2: Wire into `command-center.tsx`**

Keyword branch:
```tsx
} else if (userInput.includes('sla') || userInput.includes('uptime') || userInput.includes('可用性')) {
  setMessages((prev) => [...prev,
    { type: 'ai-text', message: "Here's the current SLA compliance status:", timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    { type: 'sla-status' },
  ]);
```

Render case:
```tsx
case 'sla-status':
  return <SLAStatusCard key={idx} timestamp={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} source="SLA Management System" />;
```

- [ ] **Step 3: Verify** — type "sla" → table with pass/fail rows

- [ ] **Step 4: Commit**
```bash
git add src/app/components/chat-messages.tsx src/app/pages/command-center.tsx
git commit -m "feat: add SLAStatusCard chat card"
```

---

## Task 7: Add ProvisioningCard

**Files:**
- Modify: `src/app/components/chat-messages.tsx` (add `Circle` to lucide import)
- Modify: `src/app/pages/command-center.tsx`

- [ ] **Step 1: Add `Circle` to lucide import in `chat-messages.tsx`**

Find the lucide-react import line and add `Circle`:
```tsx
import { User, Bot, TrendingUp, AlertTriangle, Users, Play, CheckCircle2, Clock, Network, Wifi, Monitor, Smartphone, Laptop, Tablet, Circle } from 'lucide-react';
```

- [ ] **Step 2: Add `ProvisioningCard` to `chat-messages.tsx`**

```tsx
const PROVISIONING_STEPS = [
  { label: 'Account Created', status: 'done' as const, time: 'Mar 25, 10:00' },
  { label: 'Equipment Ordered', status: 'done' as const, time: 'Mar 25, 10:02' },
  { label: 'Equipment Shipped', status: 'active' as const, time: 'In transit — ETA Mar 30' },
  { label: 'ONT Online', status: 'pending' as const, time: 'Pending' },
  { label: 'Service Activated', status: 'pending' as const, time: 'Pending' },
];

interface ProvisioningCardProps {
  timestamp: string;
  source: string;
}

export function ProvisioningCard({ timestamp, source }: ProvisioningCardProps) {
  const done = PROVISIONING_STEPS.filter((s) => s.status === 'done').length;
  const pct = Math.round((done / PROVISIONING_STEPS.length) * 100);
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>Provisioning: Alex Turner <span style={{ color: 'var(--neutral-400)' }}>(ACC-20391)</span></div>
        <div className="flex flex-col gap-0">
          {PROVISIONING_STEPS.map((step, i) => {
            const isLast = i === PROVISIONING_STEPS.length - 1;
            const Icon = step.status === 'done' ? CheckCircle2 : step.status === 'active' ? Clock : Circle;
            const iconColor = step.status === 'done' ? 'var(--success)' : step.status === 'active' ? 'var(--warning)' : 'var(--neutral-400)';
            const lineColor = step.status === 'done' ? 'var(--success)' : 'var(--neutral-200)';
            return (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: iconColor }} />
                  {!isLast && <div className="w-px flex-1 my-1" style={{ background: lineColor, minHeight: '16px' }} />}
                </div>
                <div className="pb-3">
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{step.label}</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>{step.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full\" style={{ background: 'var(--neutral-200)' }}>
            <div className=\"h-2 rounded-full\" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
```

- [ ] **Step 3: Wire into `command-center.tsx`**

Keyword branch:
```tsx
} else if (userInput.includes('provision') || userInput.includes('开通') || userInput.includes('新用户')) {
  setMessages((prev) => [...prev,
    { type: 'ai-text', message: 