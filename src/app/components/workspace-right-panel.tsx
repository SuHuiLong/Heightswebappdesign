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
import {
  getWorkspaceExperience,
  type AuditEntry,
  type BackendAction,
  type ReasoningStep,
} from '../lib/workspace-experience';

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
  const experience = getWorkspaceExperience(workspaceId);
  const steps =
    reasoningSteps ?? (isActive ? experience.reasoning.activeSteps : experience.reasoning.idleSteps);
  const actions = backendActions ?? experience.reasoning.backendActions;
  const audit = auditEntries ?? experience.reasoning.auditEntries;

  const accentColor =
    workspaceId === 'fleet' ? 'var(--primary)' :
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
