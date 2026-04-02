import { useMemo } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Shield,
  Cpu,
  Database,
  Zap,
  Globe,
  HardDrive,
  RefreshCw,
  Link2,
  ExternalLink,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Server,
  Timer,
  GitBranch,
  Wifi,
  Building2,
  Users,
  DollarSign,
  Layers,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ScopeSelection } from './scope-selector';
import { ScenarioDefinition } from '../lib/scenario-definitions';

// ─── Props ─────────────────────────────────────────────────────────────────

interface ContextPanelProps {
  scope: ScopeSelection;
  activeScenario?: ScenarioDefinition | null;
}

export function ContextPanel({ scope, activeScenario }: ContextPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const sections = useMemo(() => buildContextSections(scope, activeScenario), [scope, activeScenario]);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-[color:var(--border)] bg-[var(--surface-base)] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
            Context & Metrics
          </h3>
          {activeScenario && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Activity className="h-2.5 w-2.5" />
              Live
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-2.5">
        <motion.div
          key={activeScenario?.id ?? scope.level}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex h-full flex-col gap-2"
        >
          {/* REASONING */}
          <section className="flex min-h-0 flex-shrink-0 flex-col" style={{ flexBasis: '30%' }}>
            <SectionHeader icon={<Activity className="h-3 w-3" />} title="REASONING" color="var(--primary)" />
            <div className="flex-1 space-y-1.5 overflow-auto pr-1">
              {sections[0].items.map((item, iIdx) => (
                <ContextCard key={iIdx} item={item} delay={iIdx * 0.03} />
              ))}
            </div>
          </section>

          {/* BACKEND ACTIONS */}
          <section className="flex min-h-0 flex-shrink-0 flex-col" style={{ flexBasis: '35%' }}>
            <SectionHeader icon={<Cpu className="h-3 w-3" />} title="BACKEND ACTIONS" color="var(--warning)" />
            <div className="flex-1 space-y-1.5 overflow-auto pr-1">
              {sections[1].items.map((item, iIdx) => (
                <ContextCard key={iIdx} item={item} delay={iIdx * 0.03} />
              ))}
            </div>
          </section>

          {/* AUDIT LOG */}
          <section className="flex min-h-0 flex-1 flex-col" style={{ flexBasis: '35%' }}>
            <SectionHeader icon={<FileText className="h-3 w-3" />} title="AUDIT LOG" color="var(--success)" />
            <div className="flex-1 space-y-1.5 overflow-auto pr-1">
              {sections[2].items.map((item, iIdx) => (
                <ContextCard key={iIdx} item={item} delay={iIdx * 0.03} />
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

type CardType = 'metric' | 'progress' | 'status-row' | 'link' | 'tag-list' | 'bar-compact';

interface ContextItem {
  type: CardType;
  icon?: React.ReactNode;
  label: string;
  value?: string;
  sub?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  status?: 'completed' | 'in-progress' | 'queued';
  href?: string;
  tags?: Array<{ label: string; color: string }>;
  bars?: Array<{ label: string; value: number; max: number; color: string }>;
}

interface ContextSection {
  title: string;
  items: ContextItem[];
}

// ─── Card Renderer ──────────────────────────────────────────────────────────

function ContextCard({ item, delay = 0 }: { item: ContextItem; delay?: number }) {
  const shouldReduceMotion = useReducedMotion();

  const trendColor =
    item.trendType === 'positive' ? 'var(--success)' : item.trendType === 'negative' ? 'var(--critical)' : 'var(--neutral-500)';

  const TrendIcon = item.trendType === 'positive' ? ArrowUpRight : item.trendType === 'negative' ? ArrowDownRight : Minus;

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.12 }}
      className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-2 shadow-[var(--shadow-xs)]"
    >
      {item.type === 'metric' && (
        <>
          <div className="mb-0.5 flex items-center gap-1.5 text-[color:var(--neutral-600)]">
            {item.icon}
            <span className="text-[11px]">{item.label}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-[color:var(--foreground)]">{item.value}</span>
            {item.trend && (
              <span className="flex items-center gap-0.5 text-[11px]" style={{ color: trendColor }}>
                <TrendIcon className="h-2.5 w-2.5" />
                {item.trend}
              </span>
            )}
          </div>
          {item.sub && <div className="mt-0.5 text-[10px] text-[color:var(--neutral-400)]">{item.sub}</div>}
        </>
      )}

      {item.type === 'progress' && <ProgressRow item={item} />}

      {item.type === 'status-row' && (
        <div className="flex items-center gap-2">
          <StatusDot status={item.status} />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-[color:var(--foreground)]">{item.label}</div>
            {item.sub && <div className="text-[10px] text-[color:var(--neutral-400)]">{item.sub}</div>}
          </div>
          <span className="text-[10px] text-[color:var(--neutral-400)]">{item.value}</span>
        </div>
      )}

      {item.type === 'link' && (
        <button className="flex w-full items-center gap-1.5 text-left transition-colors hover:opacity-80">
          <ExternalLink className="h-3 w-3 flex-shrink-0 text-[color:var(--primary)]" />
          <span className="text-[11px] font-medium text-[color:var(--primary)]">{item.label}</span>
          {item.sub && <span className="ml-auto text-[10px] text-[color:var(--neutral-400)]">{item.sub}</span>}
        </button>
      )}

      {item.type === 'tag-list' && (
        <>
          <div className="mb-1 flex items-center gap-1.5">
            {item.icon}
            <span className="text-[11px] font-medium text-[color:var(--foreground)]">{item.label}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tags?.map((tag) => (
              <span
                key={tag.label}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: `${tag.color}14`, color: tag.color }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </>
      )}

      {item.type === 'bar-compact' && (
        <>
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {item.icon}
              <span className="text-[11px] font-medium text-[color:var(--foreground)]">{item.label}</span>
            </div>
          </div>
          {item.bars?.map((bar) => (
            <div key={bar.label} className="mb-0.5">
              <div className="mb-px flex justify-between text-[10px]">
                <span style={{ color: 'var(--neutral-500)' }}>{bar.label}</span>
                <span style={{ color: bar.color }}>{Math.round((bar.value / bar.max) * 100)}%</span>
              </div>
              <div className="h-1 w-full rounded-full" style={{ background: 'var(--neutral-200)' }}>
                <motion.div
                  className="h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                  transition={{ duration: 0.5, delay: delay + 0.1 }}
                  style={{ background: bar.color }}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </motion.div>
  );
}

function ProgressRow({ item }: { item: ContextItem }) {
  const cfg = {
    completed: { color: 'var(--success)', Icon: CheckCircle2 },
    'in-progress': { color: 'var(--warning)', Icon: Timer },
    queued: { color: 'var(--neutral-400)', Icon: Clock },
  }[item.status ?? 'queued'];
  const { Icon } = cfg;

  return (
    <div className="flex items-start gap-1.5">
      <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-[color:var(--foreground)]">{item.label}</div>
        {item.sub && <div className="text-[10px] text-[color:var(--neutral-400)]">{item.sub}</div>}
      </div>
      {item.value && <span className="text-[10px] whitespace-nowrap" style={{ color: cfg.color }}>{item.value}</span>}
    </div>
  );
}

function StatusDot({ status }: { status?: string }) {
  const color =
    status === 'completed' ? 'var(--success)' : status === 'in-progress' ? 'var(--warning)' : 'var(--neutral-300)';
  return <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />;
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <span style={{ color }}>{icon}</span>
      <h4 className="text-[11px] font-semibold tracking-[0.08em]" style={{ color }}>{title}</h4>
      <div className="ml-1 h-px flex-1" style={{ background: color, opacity: 0.25 }} />
    </div>
  );
}

// ─── Section Builder ────────────────────────────────────────────────────────

function buildContextSections(scope: ScopeSelection, scenario: ScenarioDefinition | null | undefined): ContextSection[] {
  if (scenario) return buildScenarioContext(scenario);
  return buildScopeContext(scope);
}

// ─── Scenario Context: supplementary only ──────────────────────────────────

function buildScenarioContext(scenario: ScenarioDefinition): ContextSection[] {
  switch (scenario.id) {
    case 'firmware-regression':
      return [
        {
          title: 'BACKEND PIPELINE',
          items: [
            { type: 'status-row', label: 'Connection log scan', status: 'completed', value: '3.2s' },
            { type: 'status-row', label: 'Firmware correlation', status: 'completed', value: '1.8s' },
            { type: 'status-row', label: 'MAC vendor grouping', status: 'completed', value: '0.9s' },
            { type: 'status-row', label: 'Root cause confidence scoring', status: 'in-progress', value: 'Running' },
          ],
        },
        {
          title: 'DATA SOURCES QUERIED',
          items: [
            {
              type: 'tag-list',
              icon: <Database className="h-3 w-3" />,
              label: '4 endpoints',
              tags: [
                { label: 'Connection Logs (24h)', color: 'var(--success)' },
                { label: 'Firmware Registry', color: 'var(--primary)' },
                { label: 'MAC OUI DB', color: 'var(--primary)' },
                { label: 'Ticket History', color: 'var(--warning)' },
              ],
            },
          ],
        },
        {
          title: 'SIMILAR INCIDENTS',
          items: [
            { type: 'link', label: 'INC-2025-1214 — v1.9.2 regression', sub: 'Broadcom + Qualcomm' },
            { type: 'link', label: 'INC-2025-0817 — WiFi driver crash', sub: 'MT7621 chipset' },
            { type: 'link', label: 'INC-2024-1103 — DHCP renewal loop', sub: 'All vendors' },
          ],
        },
        {
          title: 'SCHEDULED TASKS',
          items: [
            { type: 'progress', label: 'Staged rollback v2.1 → v2.0.3', status: 'queued', sub: 'Phase 1: 500 gateways', value: 'Queued' },
            { type: 'progress', label: 'Bug report BR-2026-0330', status: 'completed', sub: 'Auto-generated', value: 'Done' },
          ],
        },
        {
          title: 'WATCH LIST',
          items: [
            { type: 'metric', icon: <Eye className="h-3.5 w-3.5" />, label: 'WAN disconnect rate', value: '3x baseline', trend: 'Monitoring', trendType: 'negative' },
            { type: 'metric', icon: <Timer className="h-3.5 w-3.5" />, label: 'Next firmware release', value: 'v2.2 beta', sub: 'Expected Apr 12' },
          ],
        },
      ];

    case 'dpi-traffic-anomalies':
      return [
        {
          title: 'BACKEND PIPELINE',
          items: [
            { type: 'status-row', label: 'DPI telemetry ingest (6 PoPs)', status: 'completed', value: '8.4s' },
            { type: 'status-row', label: 'L7 classification pass', status: 'completed', value: '2.1s' },
            { type: 'status-row', label: 'Anomaly detection (Z-score)', status: 'completed', value: '1.6s' },
            { type: 'status-row', label: 'Report assembly', status: 'in-progress', value: 'Running' },
          ],
        },
        {
          title: 'DATA RECENCY',
          items: [
            { type: 'metric', icon: <Clock className="h-3.5 w-3.5" />, label: 'Last telemetry sync', value: '4 min ago', sub: 'Auto-refresh every 5 min' },
            { type: 'metric', icon: <Database className="h-3.5 w-3.5" />, label: 'Data volume processed', value: '12.4 TB', sub: '7-day rolling window' },
          ],
        },
        {
          title: 'TLS SIGNATURE VERSION',
          items: [
            { type: 'metric', icon: <GitBranch className="h-3.5 w-3.5" />, label: 'Current signature DB', value: 'v3.1.4', trend: 'v3.2 available', trendType: 'negative' },
            { type: 'link', label: 'View TLS signature changelog', sub: 'v3.2' },
          ],
        },
        {
          title: 'RELATED ANALYSES',
          items: [
            { type: 'link', label: 'IoT traffic classification audit', sub: '72.3% accuracy' },
            { type: 'link', label: 'Encrypted traffic trend (30d)', sub: 'Dashboard' },
            { type: 'link', label: 'PoP latency heatmap', sub: 'Real-time' },
          ],
        },
      ];

    case 'resource-planning':
      return [
        {
          title: 'MODEL PARAMETERS',
          items: [
            { type: 'metric', icon: <Cpu className="h-3.5 w-3.5" />, label: 'Model type', value: 'ARIMA + Monte Carlo', sub: '1,000 simulation runs' },
            { type: 'metric', icon: <Timer className="h-3.5 w-3.5" />, label: 'Training window', value: '6 months', sub: 'Oct 2025 — Mar 2026' },
            { type: 'metric', icon: <Activity className="h-3.5 w-3.5" />, label: 'Residual error', value: '±6.2%', sub: 'Within acceptable range' },
          ],
        },
        {
          title: 'VENDOR CONTRACTS',
          items: [
            { type: 'progress', label: 'Cloud ingestion contract', status: 'in-progress', sub: 'Renewal due May 15', value: '45 days' },
            { type: 'progress', label: 'Volume discount eligibility', status: 'queued', sub: 'At 16K devices — 12% off', value: '1,674 to go' },
          ],
        },
        {
          title: 'EXTERNAL FACTORS',
          items: [
            {
              type: 'tag-list',
              icon: <Globe className="h-3 w-3" />,
              label: 'Assumptions',
              tags: [
                { label: 'Seasonal: stable', color: 'var(--success)' },
                { label: 'Churn: 2.1%/mo', color: 'var(--warning)' },
                { label: 'New installs: +120/wk', color: 'var(--primary)' },
              ],
            },
          ],
        },
        {
          title: 'QUICK ACTIONS',
          items: [
            { type: 'link', label: 'Adjust growth to 25%', sub: 'Re-run' },
            { type: 'link', label: 'Export model to CSV', sub: 'All assumptions' },
            { type: 'link', label: 'Schedule budget review', sub: 'Calendar' },
          ],
        },
      ];

    case 'churn-prevention':
      return [
        {
          title: 'DETECTION PIPELINE',
          items: [
            { type: 'status-row', label: 'QoE metric scan', status: 'completed', value: '4.1s' },
            { type: 'status-row', label: 'Support ticket cross-ref', status: 'completed', value: '1.2s' },
            { type: 'status-row', label: 'Contract renewal overlay', status: 'completed', value: '0.8s' },
            { type: 'status-row', label: 'Risk scoring model', status: 'completed', value: '2.3s' },
          ],
        },
        {
          title: 'COMPETITOR SIGNALS',
          items: [
            { type: 'metric', icon: <Eye className="h-3.5 w-3.5" />, label: 'Price drop detected', value: '2 ISPs', sub: 'In affected regions' },
            { type: 'metric', icon: <Activity className="h-3.5 w-3.5" />, label: 'Plan comparison searches', value: '+18%', trend: 'Last 14 days', trendType: 'negative' },
          ],
        },
        {
          title: 'REMEDIATION COST',
          items: [
            { type: 'metric', icon: <DollarSign className="h-3.5 w-3.5" />, label: 'QoS fix cost/sub', value: '$2.40/mo', sub: 'Bandwidth priority allocation' },
            { type: 'metric', icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Save vs lose', value: '7.7x ROI', trend: 'Retention > acquisition', trendType: 'positive' },
          ],
        },
        {
          title: 'PREVIOUS CAMPAIGNS',
          items: [
            { type: 'link', label: 'Feb 2026 retention wave', sub: '62% success rate' },
            { type: 'link', label: 'QoS auto-fix results', sub: 'Last 30 days' },
          ],
        },
      ];

    case 'bandwidth-upsell':
      return [
        {
          title: 'ANALYSIS PIPELINE',
          items: [
            { type: 'status-row', label: 'WAN utilization scan', status: 'completed', value: '6.8s' },
            { type: 'status-row', label: 'App-level classification', status: 'completed', value: '3.2s' },
            { type: 'status-row', label: 'Usage profile clustering', status: 'completed', value: '2.1s' },
            { type: 'status-row', label: 'Revenue model calculation', status: 'completed', value: '0.4s' },
          ],
        },
        {
          title: 'HISTORICAL CONVERSION',
          items: [
            {
              type: 'bar-compact',
              icon: <Activity className="h-3 w-3" />,
              label: 'Past campaign success',
              bars: [
                { label: 'Black Friday 2025', value: 28, max: 100, color: 'var(--success)' },
                { label: 'Summer 2025 upgrade', value: 18, max: 100, color: 'var(--primary)' },
                { label: 'Spring 2025 promo', value: 14, max: 100, color: 'var(--warning)' },
              ],
            },
          ],
        },
        {
          title: 'CHURN RISK OF TARGET',
          items: [
            { type: 'metric', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Upsell-sensitive users', value: '23', sub: 'May churn if over-sold' },
            { type: 'metric', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Happy power users', value: '186', sub: 'Likely to convert & stay' },
          ],
        },
        {
          title: 'QUICK ACTIONS',
          items: [
            { type: 'link', label: 'Preview email template', sub: 'Draft' },
            { type: 'link', label: 'Export segment to CRM', sub: '312 users' },
            { type: 'link', label: 'Create A/B test plan', sub: '2 variants' },
          ],
        },
      ];

    case 'vas-device-fingerprint':
      return [
        {
          title: 'FINGERPRINT ENGINE',
          items: [
            { type: 'status-row', label: 'MAC OUI database lookup', status: 'completed', value: '2.4s' },
            { type: 'status-row', label: 'Behavioral analysis', status: 'completed', value: '4.1s' },
            { type: 'status-row', label: 'Household device mapping', status: 'completed', value: '1.8s' },
            { type: 'status-row', label: 'VAS cross-reference', status: 'completed', value: '0.6s' },
          ],
        },
        {
          title: 'FINGERPRINT CONFIDENCE',
          items: [
            {
              type: 'bar-compact',
              icon: <Shield className="h-3 w-3" />,
              label: 'Detection accuracy',
              bars: [
                { label: 'Gaming console', value: 96, max: 100, color: 'var(--success)' },
                { label: "Kids' tablet", value: 88, max: 100, color: 'var(--primary)' },
                { label: 'Smart speaker', value: 82, max: 100, color: 'var(--warning)' },
                { label: 'Child wearable', value: 71, max: 100, color: 'var(--warning)' },
              ],
            },
          ],
        },
        {
          title: 'PAST CAMPAIGN BENCHMARK',
          items: [
            { type: 'metric', icon: <Activity className="h-3.5 w-3.5" />, label: 'Best free-trial conv.', value: '22.1%', sub: 'Gaming + Kids segment, Nov 2025' },
            { type: 'metric', icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Avg trial-to-paid', value: '41%', sub: '30-day trial period' },
          ],
        },
        {
          title: 'QUICK ACTIONS',
          items: [
            { type: 'link', label: 'Review campaign creative', sub: 'Pending' },
            { type: 'link', label: 'Export audience to ESP', sub: '847 households' },
            { type: 'link', label: 'Set up conversion tracking', sub: 'Analytics' },
          ],
        },
      ];

    default:
      return buildScopeContext(scope);
  }
}

// ─── Scope Context: supplementary only ──────────────────────────────────────

function buildScopeContext(scope: ScopeSelection): ContextSection[] {
  switch (scope.level) {
    case 'all':
      return [
        {
          title: 'SYSTEM HEALTH',
          items: [
            { type: 'metric', icon: <Server className="h-3.5 w-3.5" />, label: 'API Response Time', value: '42ms', trend: '-8ms', trendType: 'positive' },
            { type: 'metric', icon: <Cpu className="h-3.5 w-3.5" />, label: 'Pipeline Throughput', value: '1.2K req/s', trend: 'Normal', trendType: 'neutral' },
            { type: 'metric', icon: <Database className="h-3.5 w-3.5" />, label: 'Data Lag', value: '<2 min', trend: 'Healthy', trendType: 'positive' },
          ],
        },
        {
          title: 'BACKGROUND JOBS',
          items: [
            { type: 'progress', label: 'Firmware audit sweep', status: 'in-progress', sub: '12,489 gateways', value: '67%' },
            { type: 'progress', label: 'DPI signature update', status: 'queued', sub: 'Scheduled 02:00 UTC', value: 'Queued' },
            { type: 'progress', label: 'Cost report generation', status: 'completed', sub: 'March 2026', value: 'Done' },
          ],
        },
        {
          title: 'RECENT CHANGES',
          items: [
            { type: 'status-row', label: 'Channel plan rebalanced — NA East', status: 'completed', value: '18m ago' },
            { type: 'status-row', label: 'New PoP activated — Warsaw', status: 'completed', value: '2h ago' },
            { type: 'status-row', label: 'Billing sync completed', status: 'completed', value: '4h ago' },
          ],
        },
        {
          title: 'QUICK LINKS',
          items: [
            { type: 'link', label: 'Capacity planning dashboard', sub: 'External' },
            { type: 'link', label: 'Fleet inventory export', sub: 'CSV' },
            { type: 'link', label: 'Network topology map', sub: 'Full view' },
          ],
        },
      ];

    case 'region':
      return [
        {
          title: 'INFRASTRUCTURE',
          items: [
            { type: 'metric', icon: <Server className="h-3.5 w-3.5" />, label: 'Regional PoPs', value: '3', sub: 'All healthy' },
            { type: 'metric', icon: <Zap className="h-3.5 w-3.5" />, label: 'Backhaul Util', value: '62%', trend: '-4% vs peak', trendType: 'positive' },
            { type: 'metric', icon: <Timer className="h-3.5 w-3.5" />, label: 'MTTR (last 30d)', value: '2.4 hrs', sub: 'SLA target: 4h' },
          ],
        },
        {
          title: 'PENDING CHANGES',
          items: [
            { type: 'progress', label: 'Firmware rollout Phase 2', status: 'queued', sub: '89 devices', value: 'Queued' },
            { type: 'progress', label: 'Channel rebalance — Sector 7', status: 'in-progress', sub: 'Gateway cluster', value: 'Running' },
          ],
        },
        {
          title: 'CROSS-REGION COMPARISON',
          items: [
            {
              type: 'bar-compact',
              icon: <Globe className="h-3 w-3" />,
              label: 'Health vs other regions',
              bars: [
                { label: 'This region', value: 89, max: 100, color: 'var(--primary)' },
                { label: 'Best region', value: 94, max: 100, color: 'var(--success)' },
                { label: 'Fleet avg', value: 87, max: 100, color: 'var(--neutral-400)' },
              ],
            },
          ],
        },
        {
          title: 'QUICK LINKS',
          items: [
            { type: 'link', label: 'Regional NOC dashboard', sub: 'External' },
            { type: 'link', label: 'Capacity utilization report', sub: 'PDF' },
          ],
        },
      ];

    case 'organization':
      return [
        {
          title: 'TENANT STATUS',
          items: [
            { type: 'metric', icon: <Layers className="h-3.5 w-3.5" />, label: 'Contract tier', value: 'Enterprise', sub: 'Priority support active' },
            { type: 'metric', icon: <Clock className="h-3.5 w-3.5" />, label: 'Last SLA review', value: '12 days ago', sub: 'Next review: Apr 15' },
            { type: 'metric', icon: <HardDrive className="h-3.5 w-3.5" />, label: 'Configuration changes', value: '3 pending', sub: 'Awaiting approval' },
          ],
        },
        {
          title: 'BILLING SNAPSHOT',
          items: [
            { type: 'metric', icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Monthly spend', value: '$4,218', trend: '+$312 MoM', trendType: 'negative' },
            { type: 'metric', icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Cost per subscriber', value: '$8.67', trend: '-$0.14', trendType: 'positive' },
          ],
        },
        {
          title: 'OPEN TICKETS',
          items: [
            { type: 'status-row', label: 'WO-31420 — Optimization', status: 'in-progress', value: '65%' },
            { type: 'status-row', label: 'WO-40812 — Tenant ops', status: 'completed', value: 'Resolved' },
            { type: 'status-row', label: 'WO-51203 — Escalation', status: 'queued', value: 'Pending' },
          ],
        },
      ];

    case 'subscriber':
      return [
        {
          title: 'ACCOUNT CONTEXT',
          items: [
            { type: 'metric', icon: <Clock className="h-3.5 w-3.5" />, label: 'Tenure', value: '2.4 years', sub: 'Customer since Nov 2023' },
            { type: 'metric', icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Lifetime value', value: '$2,587', sub: 'Business Pro 500 tier' },
            { type: 'metric', icon: <Activity className="h-3.5 w-3.5" />, label: 'Support interactions', value: '4 in 90d', sub: '2 auto-resolved' },
          ],
        },
        {
          title: 'CHANGE LOG',
          items: [
            { type: 'status-row', label: 'Gateway firmware updated', status: 'completed', value: 'Yesterday' },
            { type: 'status-row', label: 'Plan change (500 → Pro)', status: 'completed', value: '2 weeks ago' },
            { type: 'status-row', label: 'New gateway provisioned', status: 'completed', value: '1 month ago' },
          ],
        },
        {
          title: 'QUICK ACTIONS',
          items: [
            { type: 'link', label: 'View full billing history', sub: '12 months' },
            { type: 'link', label: 'Run connectivity diagnostics', sub: 'All gateways' },
            { type: 'link', label: 'Open support ticket', sub: 'Pre-filled' },
          ],
        },
      ];

    case 'device':
      return [
        {
          title: 'DEVICE CONTEXT',
          items: [
            { type: 'metric', icon: <HardDrive className="h-3.5 w-3.5" />, label: 'Hardware model', value: 'HG-8245H', sub: 'Huawei ONT' },
            { type: 'metric', icon: <GitBranch className="h-3.5 w-3.5" />, label: 'Firmware branch', value: 'stable-v2.4.x', sub: 'Auto-update enabled' },
            { type: 'metric', icon: <Timer className="h-3.5 w-3.5" />, label: 'Last reboot', value: '45d 12h ago', sub: 'Scheduled reboot available' },
          ],
        },
        {
          title: 'ENVIRONMENT',
          items: [
            { type: 'metric', icon: <Wifi className="h-3.5 w-3.5" />, label: 'Channel utilization', value: 'Ch 6: 72%', sub: '3 neighboring APs detected' },
            { type: 'metric', icon: <Activity className="h-3.5 w-3.5" />, label: 'Interference level', value: 'Moderate', trend: '+12% this week', trendType: 'negative' },
          ],
        },
        {
          title: 'DIAGNOSTIC HISTORY',
          items: [
            { type: 'status-row', label: 'Speed test', status: 'completed', value: '2h ago' },
            { type: 'status-row', label: 'Ping sweep (local)', status: 'completed', value: '6h ago' },
            { type: 'status-row', label: 'Firmware integrity check', status: 'completed', value: '1d ago' },
          ],
        },
        {
          title: 'QUICK ACTIONS',
          items: [
            { type: 'link', label: 'Schedule gateway reboot', sub: 'Off-peak' },
            { type: 'link', label: 'Change WiFi channel', sub: 'Auto-optimize' },
            { type: 'link', label: 'View raw device logs', sub: 'Syslog' },
          ],
        },
      ];

    default:
      return [];
  }
}
