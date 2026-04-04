import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Zap,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { WorkspaceId } from '../lib/workspace-definitions';

// ─── Types ─────────────────────────────────────────────────────────────────

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

export interface WorkspaceRightPanelProps {
  workspaceId: WorkspaceId;
  /** True when a query is being processed */
  isActive?: boolean;
  /** Reasoning steps for the current or last query */
  reasoningSteps?: ReasoningStep[];
  /** Backend actions for the current or last query */
  backendActions?: BackendAction[];
  /** Audit log entries */
  auditEntries?: AuditEntry[];
}

// ─── Default Mock Data ─────────────────────────────────────────────────────

const DEFAULT_REASONING: Record<WorkspaceId, ReasoningStep[]> = {
  operations: [
    { id: 'r1', label: 'Fleet health baseline', detail: '12,489 devices across 6 regions — 23 degraded, 8 offline.', confidence: 0.97, status: 'complete' },
    { id: 'r2', label: 'Anomaly detection', detail: '1 emerging: memory trend in FW 2.1.3 cohort (47 devices).', confidence: 0.94, status: 'complete' },
    { id: 'r3', label: 'Predictive risk', detail: 'FW 2.1.3 projected critical in ~5 days at current rate. Recommendation: stage rollback for Region North.', confidence: 0.91, status: 'complete' },
  ],
  support: [
    { id: 'r1', label: 'Open case triage', detail: '18 open cases — 14 auto-resolved today, 3 need human review, 1 escalation pending.', confidence: 0.96, status: 'complete' },
    { id: 'r2', label: 'Resolution rate', detail: 'Zero-touch rate: 78% this week. Top unresolved: firmware rollback (TKT-4821).', confidence: 0.92, status: 'complete' },
    { id: 'r3', label: 'Escalation risk', detail: '1 case at risk of SLA breach: TKT-4819 (gateway provisioning, critical priority).', confidence: 0.89, status: 'complete' },
  ],
  growth: [
    { id: 'r1', label: 'Churn risk scan', detail: '47 subscribers flagged high churn risk — declining usage + rising tickets. 23 no-ticket silent churn.', confidence: 0.91, status: 'complete' },
    { id: 'r2', label: 'Upsell opportunity scoring', detail: '2,340 bandwidth-constrained households. Conversion confidence: 72%. Top segment: Gigabit 500 → 1000.', confidence: 0.88, status: 'complete' },
    { id: 'r3', label: 'Segment health', detail: 'Premium Wi-Fi active: 8,200 subs. NPS +7 this month. 1,100 VAS-eligible homes untargeted.', confidence: 0.93, status: 'complete' },
  ],
};

const DEFAULT_ACTIONS: Record<WorkspaceId, BackendAction[]> = {
  operations: [
    { id: 'a1', label: 'Aggregated fleet telemetry (12,489 devices)', status: 'success', timestamp: '2 min ago' },
    { id: 'a2', label: 'Ran anomaly detection model', status: 'success', timestamp: '1 min ago' },
    { id: 'a3', label: 'Generated predictive risk report', status: 'success', timestamp: 'just now' },
  ],
  support: [
    { id: 'a1', label: 'Triage scan: 18 open cases analyzed', status: 'success', timestamp: '2 min ago' },
    { id: 'a2', label: 'Auto-resolved 14 cases (zero-touch)', status: 'success', timestamp: '1 min ago' },
    { id: 'a3', label: 'Escalated 1 case to human review', status: 'success', timestamp: 'just now' },
  ],
  growth: [
    { id: 'a1', label: 'Scanned 12,489 subscribers for churn risk', status: 'success', timestamp: '2 min ago' },
    { id: 'a2', label: 'Scored upsell opportunities (2,340 candidates)', status: 'success', timestamp: '1 min ago' },
    { id: 'a3', label: 'Updated segment health dashboard', status: 'success', timestamp: 'just now' },
  ],
};

const DEFAULT_AUDIT: Record<WorkspaceId, AuditEntry[]> = {
  operations: [
    { id: 'au1', action: 'Fleet baseline computed (6 regions)', actor: 'AI Engine', timestamp: '10:42 AM', type: 'query' },
    { id: 'au2', action: 'Anomaly detection: FW 2.1.3 memory trend flagged', actor: 'AI Engine', timestamp: '10:42 AM', type: 'system' },
    { id: 'au3', action: 'Predictive risk: cohort degradation in ~5 days', actor: 'AI Engine', timestamp: '10:41 AM', type: 'system' },
    { id: 'au4', action: 'Rollback recommendation staged for Region North', actor: 'AI Engine', timestamp: '10:41 AM', type: 'query' },
    { id: 'au5', action: 'Channel utilization scan completed', actor: 'System', timestamp: '10:40 AM', type: 'system' },
    { id: 'au6', action: 'Alert: East region congestion spike', actor: 'Monitor', timestamp: '10:38 AM', type: 'alert' },
  ],
  support: [
    { id: 'au1', action: 'Case triage scan: 18 cases processed', actor: 'AI Agent', timestamp: '10:42 AM', type: 'query' },
    { id: 'au2', action: 'Auto-resolved: Wi-Fi channel migration (TKT-4820)', actor: 'AI Agent', timestamp: '10:41 AM', type: 'action' },
    { id: 'au3', action: 'Auto-resolved: QoS protection applied (TKT-4817)', actor: 'AI Agent', timestamp: '10:40 AM', type: 'action' },
    { id: 'au4', action: 'Escalation: Gateway provisioning (TKT-4819)', actor: 'AI Agent', timestamp: '10:39 AM', type: 'system' },
    { id: 'au5', action: 'Human review needed: Firmware rollback (TKT-4821)', actor: 'AI Agent', timestamp: '10:38 AM', type: 'alert' },
    { id: 'au6', action: 'SLA breach risk: TKT-4819 approaching deadline', actor: 'Monitor', timestamp: '10:37 AM', type: 'alert' },
  ],
  growth: [
    { id: 'au1', action: 'Churn risk scan completed (47 flagged)', actor: 'AI Engine', timestamp: '10:42 AM', type: 'query' },
    { id: 'au2', action: 'Upsell scoring: 2,340 candidates ranked', actor: 'AI Engine', timestamp: '10:41 AM', type: 'system' },
    { id: 'au3', action: 'Segment health: Premium Wi-Fi NPS +7', actor: 'AI Engine', timestamp: '10:40 AM', type: 'system' },
    { id: 'au4', action: 'Campaign targeting updated (1,100 VAS eligible)', actor: 'AI Engine', timestamp: '10:39 AM', type: 'query' },
    { id: 'au5', action: 'Conversion funnel recalculated', actor: 'System', timestamp: '10:38 AM', type: 'system' },
    { id: 'au6', action: 'Revenue forecast: Region South expansion modeled', actor: 'AI Engine', timestamp: '10:37 AM', type: 'query' },
  ],
};

const ACTIVE_REASONING: ReasoningStep[] = [
  { id: 'ar1', label: 'Parsing natural language query', detail: 'Extracting entities, intent, and scope constraints.', confidence: 1.0, status: 'complete' },
  { id: 'ar2', label: 'Resolving data sources', detail: 'Mapping query to telemetry, topology, and event data.', status: 'in-progress' },
  { id: 'ar3', label: 'Correlation analysis', detail: 'Pending: Multi-dimensional correlation.', status: 'pending' },
  { id: 'ar4', label: 'Generating insights', detail: 'Pending: Synthesizing findings and recommendations.', status: 'pending' },
];

// ─── Sub-Components ────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  icon: Icon,
  count,
  defaultOpen = true,
  children,
  accentColor,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accentColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 py-2 text-left"
      >
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accentColor ?? 'var(--neutral-500)' }} />
        <span className="text-xs font-semibold tracking-[0.04em] uppercase flex-1" style={{ color: 'var(--neutral-500)' }}>
          {title}
        </span>
        {count != null && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-raised)', color: 'var(--neutral-400)' }}>
            {count}
          </span>
        )}
        {isOpen ? (
          <ChevronDown className="h-3 w-3" style={{ color: 'var(--neutral-400)' }} />
        ) : (
          <ChevronRight className="h-3 w-3" style={{ color: 'var(--neutral-400)' }} />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--critical)';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-raised)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-medium tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'complete':
    case 'success':
      return <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: 'var(--success)' }} />;
    case 'in-progress':
    case 'running':
      return <Loader2 className="h-3 w-3 shrink-0 animate-spin" style={{ color: 'var(--primary)' }} />;
    case 'failed':
      return <AlertTriangle className="h-3 w-3 shrink-0" style={{ color: 'var(--critical)' }} />;
    default:
      return <div className="h-3 w-3 shrink-0 rounded-full" style={{ background: 'var(--neutral-600)' }} />;
  }
}

function ActionTypeIcon({ type }: { type: AuditEntry['type'] }) {
  switch (type) {
    case 'query':
      return <ArrowUpRight className="h-3 w-3" style={{ color: 'var(--primary)' }} />;
    case 'action':
      return <Zap className="h-3 w-3" style={{ color: 'var(--warning)' }} />;
    case 'system':
      return <Shield className="h-3 w-3" style={{ color: 'var(--success)' }} />;
    case 'alert':
      return <AlertTriangle className="h-3 w-3" style={{ color: 'var(--critical)' }} />;
  }
}

// ─── Main Component ────────────────────────────────────────────────────────

export function WorkspaceRightPanel({
  workspaceId,
  isActive = false,
  reasoningSteps,
  backendActions,
  auditEntries,
}: WorkspaceRightPanelProps) {
  const steps = reasoningSteps ?? (isActive ? ACTIVE_REASONING : DEFAULT_REASONING[workspaceId] ?? DEFAULT_REASONING.operations);
  const actions = backendActions ?? DEFAULT_ACTIONS[workspaceId] ?? DEFAULT_ACTIONS.operations;
  const audit = auditEntries ?? DEFAULT_AUDIT[workspaceId] ?? DEFAULT_AUDIT.operations;

  const accentColor =
    workspaceId === 'operations' ? 'var(--primary)' :
    workspaceId === 'support' ? 'var(--ambient-cyan)' :
    'var(--ambient-warm)';

  return (
    <aside
      className="hidden xl:flex w-80 flex-col border-l overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}
    >
      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Section 1: Reasoning */}
        <CollapsibleSection title="Reasoning" icon={Brain} count={steps.length} accentColor={accentColor}>
          <div className="space-y-2.5 pb-1">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <StatusIcon status={step.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {step.label}
                  </div>
                  <div className="text-[10px] leading-relaxed mt-0.5" style={{ color: 'var(--neutral-400)' }}>
                    {step.detail}
                  </div>
                  {step.confidence != null && (
                    <div className="mt-1.5">
                      <ConfidenceBar value={step.confidence} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <div style={{ height: 1, background: 'var(--border-subtle)' }} />

        {/* Section 2: Backend Actions */}
        <CollapsibleSection title="Backend Actions" icon={Zap} count={actions.length} defaultOpen={true} accentColor={accentColor}>
          <div className="space-y-2 pb-1">
            {actions.map((action) => (
              <div key={action.id} className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <StatusIcon status={action.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: 'var(--foreground)' }}>
                    {action.label}
                  </div>
                  {action.detail && (
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--neutral-400)' }}>
                      {action.detail}
                    </div>
                  )}
                </div>
                <span className="text-[10px] shrink-0" style={{ color: 'var(--neutral-500)' }}>
                  {action.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <div style={{ height: 1, background: 'var(--border-subtle)' }} />

        {/* Section 3: Audit Log */}
        <CollapsibleSection title="Audit Log" icon={Clock} count={audit.length} defaultOpen={false} accentColor={accentColor}>
          <div className="space-y-2 pb-1">
            {audit.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <ActionTypeIcon type={entry.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: 'var(--foreground)' }}>
                    {entry.action}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>
                      {entry.actor}
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>
                      {entry.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2.5 flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <Info className="h-3 w-3" style={{ color: 'var(--neutral-500)' }} />
        <span className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>
          All actions are logged and auditable
        </span>
      </div>
    </aside>
  );
}
