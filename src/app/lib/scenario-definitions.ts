/**
 * Scenario Definitions for Generative UI Workspaces
 *
 * Each scenario represents a high-value use case where the system
 * dynamically generates visualizations, insights, and actions
 * based on natural-language user intent.
 */

import type {
  AuditEntry,
  BackendAction,
  ReasoningStep,
  WorkbenchCapabilityStage,
  WorkbenchCurrentQuestion,
} from './workbench-model';

// ─── Block Types ──────────────────────────────────────────────────────────

export type BlockType =
  | 'summary'
  | 'stats'
  | 'bar-chart'
  | 'time-series'
  | 'table'
  | 'risk-matrix'
  | 'forecast'
  | 'device-insight'
  | 'subscriber-list'
  | 'actions'
  | 'bandwidth-timeline';

export interface SummaryBlock {
  type: 'summary';
  title: string;
  body: string;
}

export interface StatsBlock {
  type: 'stats';
  items: Array<{ label: string; value: string; change?: string; trend?: 'up' | 'down' | 'neutral' }>;
}

export interface BarChartBlock {
  type: 'bar-chart';
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
  xLabel?: string;
  yLabel?: string;
}

export interface TimeSeriesBlock {
  type: 'time-series';
  title: string;
  data: Array<{ time: string; a: number; b: number; anomaly?: number }>;
  legendA: string;
  legendB: string;
  showAnomalies?: boolean;
}

export interface TableBlock {
  type: 'table';
  title: string;
  columns: string[];
  rows: string[][];
}

export interface RiskMatrixBlock {
  type: 'risk-matrix';
  title: string;
  quadrants: {
    highDegradation: Array<{ id: string; name: string; risk: number }>;
    lowDegradation: Array<{ id: string; name: string; risk: number }>;
    highContract: Array<{ id: string; name: string; risk: number }>;
    lowContract: Array<{ id: string; name: string; risk: number }>;
  };
}

export interface ForecastBlock {
  type: 'forecast';
  title: string;
  historical: Array<{ month: string; value: number }>;
  predicted: Array<{ month: string; value: number; upper: number; lower: number }>;
  unit: string;
  growthAssumption: number;
}

export interface DeviceInsightBlock {
  type: 'device-insight';
  title: string;
  insights: Array<{
    category: string;
    count: number;
    examples: string[];
    color: string;
  }>;
}

export interface SubscriberListBlock {
  type: 'subscriber-list';
  title: string;
  subscribers: Array<{
    id: string;
    name: string;
    risk: 'critical' | 'high' | 'medium';
    reason: string;
  }>;
}

export interface ActionsBlock {
  type: 'actions';
  items: Array<{ label: string; description: string; variant: 'primary' | 'outline' | 'destructive' }>;
}

export interface BandwidthTimelineBlock {
  type: 'bandwidth-timeline';
  title: string;
  data: Array<{ hour: string; usage: number; threshold: number }>;
  saturationHours: number;
}

export type ScenarioBlock =
  | SummaryBlock
  | StatsBlock
  | BarChartBlock
  | TimeSeriesBlock
  | TableBlock
  | RiskMatrixBlock
  | ForecastBlock
  | DeviceInsightBlock
  | SubscriberListBlock
  | ActionsBlock
  | BandwidthTimelineBlock;

// ─── Scenario Definition ──────────────────────────────────────────────────

export interface ScenarioDefinition {
  id: string;
  title: string;
  subtitle: string;
  /** Natural-language description shown during staged loading */
  description: string;
  /** Loading stages shown progressively */
  loadingStages: string[];
  /** Overall confidence percentage */
  confidence: number;
  /** Evidence domains referenced by the analysis */
  evidenceDomains: string[];
  /** Follow-up prompt suggestions */
  followUps: string[];
  /** Scenario family for grouping */
  family: 'fleet' | 'business' | 'planning';
  /** Keyword triggers for matching user queries */
  keywords: string[];
  /** Rendered content blocks */
  blocks: ScenarioBlock[];
  /** Optional query-specific answer variants for fixed prompts and follow-ups */
  variants?: ScenarioVariant[];
  /** Optional metadata for the prompt-first workbench */
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

export interface ScenarioVariant {
  id: string;
  /** Query hints used to select this variant when a fixed prompt is submitted */
  keywords: string[];
  title?: string;
  subtitle?: string;
  description?: string;
  loadingStages?: string[];
  confidence?: number;
  evidenceDomains?: string[];
  followUps?: string[];
  blocks?: ScenarioBlock[];
  workbench?: ScenarioDefinition['workbench'];
}

function scoreKeywordMatch(normalizedQuery: string, keywords: string[]) {
  let score = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += normalizedKeyword.length;
      matchedKeywords.push(normalizedKeyword);
    }
  }

  if (matchedKeywords.length >= 2) {
    score += matchedKeywords.length * 4;
  }

  return score;
}

function selectScenarioVariant(
  scenario: ScenarioDefinition,
  query: string,
): ScenarioVariant | null {
  if (!scenario.variants?.length || !query.trim()) {
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();
  let bestVariant: ScenarioVariant | null = null;
  let bestScore = 0;

  for (const variant of scenario.variants) {
    const score = scoreKeywordMatch(normalizedQuery, variant.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestVariant = variant;
    }
  }

  return bestScore >= 6 ? bestVariant : null;
}

export function materializeScenarioForQuery(
  scenario: ScenarioDefinition,
  query: string,
): ScenarioDefinition {
  const variant = selectScenarioVariant(scenario, query);
  if (!variant) {
    return scenario;
  }

  return {
    ...scenario,
    title: variant.title ?? scenario.title,
    subtitle: variant.subtitle ?? scenario.subtitle,
    description: variant.description ?? scenario.description,
    loadingStages: variant.loadingStages ?? scenario.loadingStages,
    confidence: variant.confidence ?? scenario.confidence,
    evidenceDomains: variant.evidenceDomains ?? scenario.evidenceDomains,
    followUps: variant.followUps ?? scenario.followUps,
    blocks: variant.blocks ?? scenario.blocks,
    workbench: variant.workbench ?? scenario.workbench,
  };
}

// ─── Scenario 1: Needle in a Haystack (IOP Issue) ────────────────────────

const firmwareRegression: ScenarioDefinition = {
  id: 'firmware-regression',
  title: 'Post-Rollout Hidden Regression Detection',
  subtitle: 'Fleet-wide Risk Discovery',
  description:
    'Correlated connection drops with firmware versions and MAC vendors. Found 45% increase on Firmware v2.1 affecting Broadcom-based devices.',
  loadingStages: [
    'Scanning gateway connection logs across fleet...',
    'Correlating firmware versions with drop events...',
    'Grouping failing devices by MAC vendor...',
    'Assembling root-cause workspace...',
  ],
  confidence: 94,
  evidenceDomains: ['Connection Logs', 'Firmware Inventory', 'MAC Vendor Registry', 'Ticket History'],
  followUps: [
    'Rank the cohorts most likely to require rollback next.',
    'Compare the leading rollback cohort against the last stable baseline.',
    'Draft the staged rollback plan for the highest-risk cohort.',
  ],
  family: 'fleet',
  keywords: [
    'firmware', 'connection drop', 'iop', 'broadcom', 'gateway', 'unusual',
    'haystack', 'mac vendor', 'rollback', 'bug report', 'firmware update',
    'firmware cn', 'connection interrupt cn', 'dropout cn', 'vendor cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Root Cause Identified',
      body: '45% increase in connection drops traced to Firmware v2.1, primarily affecting Broadcom-based home gateways. The regression started after the v2.1 rollout on March 18. Affected devices show intermittent WAN disconnects every 4–8 hours.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Affected Gateways', value: '1,247', change: '+45%', trend: 'up' },
        { label: 'Avg Drops / Day', value: '8.3', change: '+3.1', trend: 'up' },
        { label: 'Failing Firmware', value: 'v2.1', change: 'Since Mar 18', trend: 'neutral' },
        { label: 'Primary Vendor', value: 'Broadcom', change: '89% of cases', trend: 'neutral' },
      ],
    },
    {
      type: 'bar-chart',
      title: 'Affected Devices by MAC Vendor',
      data: [
        { name: 'Broadcom', value: 891, color: 'var(--critical)' },
        { name: 'Qualcomm', value: 156, color: 'var(--warning)' },
        { name: 'MediaTek', value: 124, color: 'var(--primary)' },
        { name: 'Intel', value: 47, color: 'var(--neutral-500)' },
        { name: 'Realtek', value: 29, color: 'var(--neutral-400)' },
      ],
      xLabel: 'Vendor',
      yLabel: 'Devices',
    },
    {
      type: 'table',
      title: 'Firmware Version Impact',
      columns: ['Firmware', 'Devices', 'Drop Rate', 'Status'],
      rows: [
        ['v2.1', '4,218', '12.4%', 'Regression'],
        ['v2.0.3', '3,891', '4.1%', 'Stable'],
        ['v1.9.7', '2,104', '3.8%', 'Stable'],
        ['v1.8.2', '1,420', '5.2%', 'Deprecated'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'Rollback Firmware v2.1', description: 'Revert 4,218 gateways to v2.0.3 in a staged rollout.', variant: 'primary' },
        { label: 'Generate IOP Bug Report', description: 'Create a detailed bug report for the firmware engineering team.', variant: 'outline' },
        { label: 'Notify Affected Subscribers', description: 'Send a proactive maintenance notification to impacted users.', variant: 'outline' },
      ],
    },
  ],
  variants: [
    {
      id: 'rollback-candidate-ranking',
      keywords: [
        'highest-risk cohorts',
        'priority cohorts',
        'operator attention',
        'rollout risk',
        'rollback candidate',
        'most urgent cohort',
        'moving first',
        'require rollback next',
      ],
      title: 'Rollback Candidate Ranking',
      subtitle: 'Cohort Risk Prioritization',
      description:
        'Ranked the firmware v2.1 cohorts by rollback urgency using disconnect acceleration, ticket growth, and subscriber criticality.',
      loadingStages: [
        'Scoring firmware cohorts by disconnect acceleration...',
        'Comparing ticket growth against the last stable baseline...',
        'Ranking rollback urgency across impacted cohorts...',
        'Preparing operator intervention priorities...',
      ],
      confidence: 93,
      evidenceDomains: [
        'Connection Logs',
        'Ticket Growth',
        'Firmware Cohorts',
        'Subscriber Criticality',
      ],
      followUps: [
        'Compare the leading rollback cohort against the last stable baseline.',
        'Draft the staged rollback plan for the highest-risk cohort.',
        'Show the firmware rollback evidence that still needs human review.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Rollback Priorities Ranked',
          body: 'Three firmware v2.1 cohorts now account for 71% of the new disconnect volume. The Acme North suburban gateway cohort is the leading rollback candidate because its drop rate is accelerating fastest, tickets doubled in the last 12 hours, and the affected homes have the highest premium-plan concentration.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Top Rollback Candidate', value: 'Acme North Suburban', change: 'Risk score 94/100', trend: 'up' },
            { label: 'Cohorts Escalating', value: '3', change: 'Need action in 24h', trend: 'up' },
            { label: 'Ticket Growth', value: '+118%', change: 'Since yesterday', trend: 'up' },
            { label: 'Intervention Window', value: '<24 hrs', change: 'Before churn risk rises', trend: 'down' },
          ],
        },
        {
          type: 'table',
          title: 'Rollback Priority by Cohort',
          columns: ['Cohort', 'Gateways', 'Drop Acceleration', 'Ticket Growth', 'Recommendation'],
          rows: [
            ['Acme North Suburban', '612', '+58%', '+118%', 'Rollback first'],
            ['FastFiber South Metro', '428', '+37%', '+71%', 'Mitigate + monitor'],
            ['NetPro Mixed Hardware', '207', '+19%', '+24%', 'Watch closely'],
            ['Legacy Qualcomm Fleet', '156', '+9%', '+11%', 'No rollback yet'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Stage Rollback Wave 1', description: 'Start rollback on the top-ranked cohort before the evening peak.', variant: 'primary' },
            { label: 'Compare Stable Baseline', description: 'Open the delta view against the last healthy rollout cohort.', variant: 'outline' },
            { label: 'Notify Regional Operators', description: 'Share the ranked intervention list with affected operators.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'stable-baseline-comparison',
      keywords: [
        'stable baseline',
        'last stable baseline',
        'compare the failing cohort',
        'explain the delta',
        'compare the leading rollback cohort',
      ],
      title: 'Cohort Baseline Comparison',
      subtitle: 'Failing vs Stable Rollout Delta',
      description:
        'Compared the leading failing firmware cohort against the last stable rollout baseline to isolate what changed materially.',
      loadingStages: [
        'Loading the last stable firmware baseline...',
        'Comparing disconnect frequency and retry behavior...',
        'Measuring ticket and QoE deltas...',
        'Summarizing the rollback justification...',
      ],
      confidence: 95,
      evidenceDomains: [
        'Stable Baseline',
        'Disconnect Telemetry',
        'QoE Metrics',
        'Ticket History',
      ],
      followUps: [
        'Rank the cohorts most likely to require rollback next.',
        'Draft the staged rollback plan for the highest-risk cohort.',
        'Show the firmware rollback evidence that still needs human review.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Failing Cohort Diverges Materially',
          body: 'The leading v2.1 cohort is now 3.0x worse than the last stable v2.0.3 baseline on disconnect frequency and 2.2x worse on support contacts. The gap is largest during the evening peak, which strongly supports staged rollback instead of continued observation.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Drop Rate Delta', value: '+8.3 pts', change: '12.4% vs 4.1%', trend: 'up' },
            { label: 'Avg Retries / Day', value: '8.3', change: '3.1 above baseline', trend: 'up' },
            { label: 'Ticket Lift', value: '2.2x', change: 'Above stable cohort', trend: 'up' },
            { label: 'Peak-Hour Impact', value: '19:00-23:00', change: 'Worst divergence', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Failing Cohort vs Stable Baseline',
          columns: ['Signal', 'v2.1 Failing', 'v2.0.3 Stable', 'Delta'],
          rows: [
            ['Disconnect rate', '12.4%', '4.1%', '+8.3 pts'],
            ['Retries per gateway / day', '8.3', '5.2', '+3.1'],
            ['Support contacts / 100 homes', '14.8', '6.7', '+8.1'],
            ['Evening latency spike', '94 ms', '41 ms', '+53 ms'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Approve Rollback Justification', description: 'Use the baseline delta as the operator-facing rollback rationale.', variant: 'primary' },
            { label: 'Open Ranked Cohorts', description: 'Return to the cohort ranking view to decide who rolls back first.', variant: 'outline' },
            { label: 'Share Delta Snapshot', description: 'Send the stable-vs-failing comparison to firmware engineering.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'rollback-plan',
      keywords: [
        'draft a rollback plan',
        'staged rollback plan',
        'action is delayed',
        'operator risk if action is delayed',
      ],
      title: 'Staged Rollback Plan',
      subtitle: 'Operator Action Plan',
      description:
        'Prepared a staged firmware rollback plan that minimizes peak-hour exposure while preserving service continuity.',
      loadingStages: [
        'Sequencing the rollback waves by cohort risk...',
        'Checking maintenance windows and change capacity...',
        'Planning subscriber communication and monitoring...',
        'Packaging the rollback runbook for operators...',
      ],
      confidence: 91,
      evidenceDomains: [
        'Rollback Policy',
        'Maintenance Windows',
        'Firmware Inventory',
        'Subscriber Communications',
      ],
      followUps: [
        'Rank the cohorts most likely to require rollback next.',
        'Compare the leading rollback cohort against the last stable baseline.',
        'Show the firmware rollback evidence that still needs human review.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Rollback Plan Ready',
          body: 'The safest plan is a three-wave rollback starting with the Acme North suburban cohort before the evening peak. Delaying past the next 24 hours is likely to add roughly 190 more impacted homes and push the support backlog above the weekend threshold.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Wave 1 Scope', value: '612 gateways', change: 'Top-risk cohort', trend: 'neutral' },
            { label: 'Execution Window', value: '16:00-18:00', change: 'Before peak', trend: 'neutral' },
            { label: 'Delay Risk', value: '+190 homes', change: 'If postponed 24h', trend: 'up' },
            { label: 'Rollback Duration', value: '2.5 hrs', change: 'Across 3 waves', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Rollback Runbook',
          columns: ['Wave', 'Target', 'Window', 'Guardrail', 'Success Check'],
          rows: [
            ['Wave 1', 'Acme North Suburban', '16:00-16:45', 'Pause if drops stay >10%', 'Disconnect rate <6%'],
            ['Wave 2', 'FastFiber South Metro', '17:00-17:40', 'Hold if ACS retries spike', 'Ticket creation stabilizes'],
            ['Wave 3', 'NetPro Mixed Hardware', '18:15-18:45', 'Skip if latency normalizes', 'Evening peak passes cleanly'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Approve Wave 1 Rollback', description: 'Begin the first rollback wave for the top-risk cohort.', variant: 'primary' },
            { label: 'Send Subscriber Notice', description: 'Issue the maintenance notice for the impacted homes.', variant: 'outline' },
            { label: 'Open Human Review Evidence', description: 'Check the remaining evidence gates before execution.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'firmware-human-review',
      keywords: [
        'human review',
        'rollback evidence',
        'rollback case',
        'root-cause evidence',
        'what still needs human review',
      ],
      title: 'Firmware Rollback Evidence',
      subtitle: 'Support Case Review',
      description:
        'Collected the root-cause evidence and highlighted the specific rollback gates that still require human approval.',
      loadingStages: [
        'Loading gateway diagnostics and ACS change history...',
        'Reviewing rollback safety checks for the affected case...',
        'Flagging unresolved evidence that needs human judgment...',
        'Preparing the support review package...',
      ],
      confidence: 92,
      evidenceDomains: [
        'Gateway Diagnostics',
        'ACS Config History',
        'Rollback Safety Checks',
        'Subscriber Impact',
      ],
      followUps: [
        'Show pending validation work and explain why the case is not fully closed yet.',
        'Show AI fixes waiting for validation and what still needs to be confirmed.',
        'Draft the staged rollback plan for the highest-risk cohort.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Human Review Still Required',
          body: 'AI isolated the regression to the firmware v2.1 rollout plus an ACS retry policy change, but support still needs to verify rollback safety on the affected gateway cluster. The evidence is strong enough to justify action, yet two closure gates remain open: rollback blast radius and customer communication timing.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Root-Cause Confidence', value: '92%', change: 'AI correlation complete', trend: 'up' },
            { label: 'Open Review Gates', value: '2', change: 'Before closure', trend: 'neutral' },
            { label: 'Affected Cases', value: '14', change: 'Need reviewer sign-off', trend: 'up' },
            { label: 'Oldest Waiting Case', value: '47 min', change: 'Escalate soon', trend: 'up' },
          ],
        },
        {
          type: 'table',
          title: 'Human Review Checklist',
          columns: ['Evidence', 'AI Conclusion', 'Why Review Is Needed', 'Owner'],
          rows: [
            ['Gateway drop trace', 'Matches v2.1 defect signature', 'Confirm no local cabling issue', 'Support L2'],
            ['ACS retry policy change', 'Amplifies reconnect storm', 'Approve rollback sequence', 'Platform Ops'],
            ['Subscriber impact estimate', '14 homes currently critical', 'Validate notice timing', 'Care Team'],
            ['Rollback simulation', 'Safe for top cohort', 'Confirm maintenance window', 'Duty Manager'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Open Reviewer Packet', description: 'Send the rollback evidence bundle to Support L2 and Platform Ops.', variant: 'primary' },
            { label: 'Show Validation Queue', description: 'Open the cases that are still waiting for closure checks.', variant: 'outline' },
            { label: 'Approve Maintenance Notice', description: 'Review the subscriber notice before rollback begins.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'validation-queue',
      keywords: [
        'pending validation',
        'waiting for validation',
        'not fully closed yet',
        'needs to be confirmed',
        'cases needing my attention',
        'support cases',
      ],
      title: 'AI Fix Validation Queue',
      subtitle: 'Cases Awaiting Closure',
      description:
        'Summarized the AI-driven support cases that are still blocked on verification, rollback confirmation, or human sign-off.',
      loadingStages: [
        'Scanning AI-handled cases awaiting closure...',
        'Checking verification jobs and rollback confirmations...',
        'Ranking blocked cases by urgency...',
        'Preparing the validation queue summary...',
      ],
      confidence: 90,
      evidenceDomains: [
        'Case Queue',
        'Verification Jobs',
        'Rollback Tasks',
        'Support Workflow',
      ],
      followUps: [
        'Show the firmware rollback evidence that still needs human review.',
        'Show the cases AI fully resolved today and summarize what was fixed.',
        'Show the protected sessions AI handled today and explain the QoS actions.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Validation Work Still Open',
          body: 'Nine AI-handled support cases are waiting on final verification. Four need rollback confirmation, three need a post-fix stability window to complete, and two are blocked on human approval for customer communication before the case can be closed.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Cases Waiting', value: '9', change: 'Across 3 queues', trend: 'up' },
            { label: 'Rollback Confirmations', value: '4', change: 'Most urgent', trend: 'up' },
            { label: 'Stability Windows', value: '3', change: 'Auto-checks running', trend: 'neutral' },
            { label: 'Human Sign-Offs', value: '2', change: 'Care + Ops', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Pending Validation Queue',
          columns: ['Case', 'Blocker', 'ETA', 'Risk if Delayed', 'Next Step'],
          rows: [
            ['TKT-4821', 'Rollback confirmation', '18 min', 'Repeat disconnects', 'Verify v2.0.9 applied'],
            ['TKT-4819', 'Custom payload push', '26 min', 'New install delayed', 'Approve config retry'],
            ['TKT-4830', '24h stability window', '41 min', 'Premature closure', 'Wait for auto-check'],
            ['TKT-4833', 'Subscriber notice approval', '55 min', 'Escalation confusion', 'Approve outreach copy'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Review Highest-Risk Cases', description: 'Open the top blocked cases that need attention now.', variant: 'primary' },
            { label: 'Open Human Review Evidence', description: 'Inspect the rollback cases that still need reviewer approval.', variant: 'outline' },
            { label: 'Refresh Verification Jobs', description: 'Rerun the post-fix checks for cases waiting on stability windows.', variant: 'outline' },
          ],
        },
      ],
    },
  ],
  workbench: {
    capabilityChain: [
      {
        title: 'Device Signals',
        detail: 'Gateways on firmware v2.1 show repeated WAN disconnects and vendor clustering.',
      },
      {
        title: 'Cloud Checks',
        detail: 'Fleet analytics correlates the rollout date, firmware cohort, and ticket history.',
      },
      {
        title: 'Agent Reasoning / Actions',
        detail: 'The agent isolates the regression pattern and recommends rollback plus escalation.',
      },
    ],
    processRail: {
      reasoning: [
        {
          title: 'Rollout correlation found',
          detail: 'Disconnect frequency rises immediately after the v2.1 deployment window.',
        },
      ],
      backendActions: [
        {
          title: 'Firmware cohort comparison',
          system: 'Fleet Analytics',
          outcome: 'v2.1 devices show a materially higher drop rate than stable cohorts.',
        },
      ],
      auditEntries: [
        {
          title: 'Regression candidate recorded',
          detail: 'Broadcom-heavy firmware v2.1 cohort flagged for incident follow-up.',
        },
      ],
    },
  },
};

// ─── Scenario 2: DPI & Traffic Anomalies ──────────────────────────────────

const dpiTrafficAnomalies: ScenarioDefinition = {
  id: 'dpi-traffic-anomalies',
  title: 'DPI & Traffic Anomaly Report',
  subtitle: 'Traffic Classification Analysis',
  description:
    'Compared L7 streaming vs gaming traffic across Europe. Identified TLS classification gaps and auto-generated a comprehensive report.',
  loadingStages: [
    'Ingesting DPI telemetry from European nodes...',
    'Classifying L7 traffic categories...',
    'Detecting anomalies in TLS fingerprinting...',
    'Generating anomaly report...',
  ],
  confidence: 91,
  evidenceDomains: ['DPI Engine', 'Traffic Classifier', 'TLS Fingerprint DB', 'Regional Telemetry'],
  followUps: [
    'Show me the unclassified traffic breakdown by region',
    'What is the TLS classification accuracy trend?',
    'Export the full anomaly report as PDF',
  ],
  family: 'fleet',
  keywords: [
    'dpi', 'traffic', 'streaming', 'gaming', 'tls', 'anomaly', 'classification',
    'europe', 'l7', 'encrypted', 'unknown', 'report', 'pdf',
    'traffic cn', 'anomaly cn', 'classify cn', 'encrypt cn', 'report cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Traffic Classification Gaps Detected',
      body: 'Analyzed 12.4 TB of traffic across 6 European PoPs. Streaming traffic shows 98.2% classification accuracy, while gaming traffic drops to 84.7%. 3.1% of TLS traffic remains unclassified ("Unknown TLS"), concentrated in the Frankfurt and Amsterdam nodes.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Total Traffic', value: '12.4 TB', change: '+8% WoW', trend: 'up' },
        { label: 'Streaming Accuracy', value: '98.2%', change: '+0.3%', trend: 'up' },
        { label: 'Gaming Accuracy', value: '84.7%', change: '-2.1%', trend: 'down' },
        { label: 'Unknown TLS', value: '3.1%', change: '+0.8%', trend: 'up' },
      ],
    },
    {
      type: 'time-series',
      title: 'Streaming vs Gaming Traffic — Europe (This Week)',
      data: [
        { time: 'Mon', a: 3200, b: 890, anomaly: undefined },
        { time: 'Tue', a: 3410, b: 920, anomaly: undefined },
        { time: 'Wed', a: 3280, b: 1150, anomaly: 1150 },
        { time: 'Thu', a: 3560, b: 1080, anomaly: undefined },
        { time: 'Fri', a: 3890, b: 1340, anomaly: 1340 },
        { time: 'Sat', a: 4120, b: 1560, anomaly: 1560 },
        { time: 'Sun', a: 3950, b: 1410, anomaly: undefined },
      ],
      legendA: 'Streaming (GB)',
      legendB: 'Gaming (GB)',
      showAnomalies: true,
    },
    {
      type: 'table',
      title: 'Unclassified Encrypted Traffic',
      columns: ['Node', 'Unknown TLS', 'Total TLS', 'Gap %'],
      rows: [
        ['Frankfurt', '84.2 GB', '1,240 GB', '6.8%'],
        ['Amsterdam', '62.1 GB', '1,180 GB', '5.3%'],
        ['London', '28.4 GB', '1,890 GB', '1.5%'],
        ['Paris', '19.8 GB', '1,620 GB', '1.2%'],
        ['Stockholm', '8.2 GB', '980 GB', '0.8%'],
        ['Warsaw', '5.1 GB', '720 GB', '0.7%'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'Update TLS Signatures', description: 'Push updated TLS fingerprint database to Frankfurt and Amsterdam nodes.', variant: 'primary' },
        { label: 'Generate Full Report (PDF)', description: 'Export a comprehensive traffic analysis report with all charts and tables.', variant: 'outline' },
        { label: 'Generate Report (Slides)', description: 'Create a presentation-ready slide deck from this analysis.', variant: 'outline' },
      ],
    },
  ],
};

// ─── Scenario 3: Regional Incident Interpretation ──────────────────────────

const regionalIncident: ScenarioDefinition = {
  id: 'regional-incident',
  title: 'Regional Incident Interpretation',
  subtitle: 'Correlated Outage Analysis',
  description:
    'Detected correlated service degradation across 3 PoPs in the South Region. Root cause traced to BGP route flapping affecting 2,400 subscribers.',
  loadingStages: [
    'Ingesting incident signals from monitoring system...',
    'Correlating affected subscribers and devices...',
    'Analyzing BGP routing tables and PoP health...',
    'Building incident timeline and impact assessment...',
  ],
  confidence: 96,
  evidenceDomains: ['Incident Management', 'BGP Routing', 'PoP Health', 'Subscriber Impact'],
  followUps: [
    'Show me the affected subscriber list',
    'What is the estimated time to resolution?',
    'Generate incident report for the NOC team',
  ],
  family: 'fleet',
  keywords: [
    'outage', 'incident', 'region', 'bgp', 'route', 'flapping', 'degradation',
    'correlated', 'pop', 'impact', 'subscribers affected',
    'interrupt cn', 'incident cn', 'region cn', 'impact cn', 'route cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Incident Root Cause Identified',
      body: 'Correlated service degradation across Atlanta, Nashville, and Tampa PoPs traced to BGP route flapping on peer AS-65001. The incident started at 14:22 UTC and affects approximately 2,400 subscribers across 3 ISPs in the South Region. Impact manifests as intermittent packet loss (8-15%) and increased latency (45-120ms vs baseline 18ms).',
    },
    {
      type: 'stats',
      items: [
        { label: 'Affected Subscribers', value: '2,400', change: 'Across 3 ISPs', trend: 'neutral' },
        { label: 'Packet Loss', value: '8-15%', change: '+12% above baseline', trend: 'up' },
        { label: 'Latency Spike', value: '120ms', change: '+102ms vs normal', trend: 'up' },
        { label: 'PoPs Affected', value: '3 of 12', change: 'South Region only', trend: 'neutral' },
      ],
    },
    {
      type: 'time-series',
      title: 'Incident Timeline — Latency Across Affected PoPs',
      data: [
        { time: '14:00', a: 18, b: 20, anomaly: undefined },
        { time: '14:15', a: 22, b: 25, anomaly: undefined },
        { time: '14:22', a: 85, b: 95, anomaly: 95 },
        { time: '14:30', a: 110, b: 120, anomaly: 120 },
        { time: '14:45', a: 75, b: 88, anomaly: undefined },
        { time: '15:00', a: 55, b: 62, anomaly: undefined },
        { time: '15:15', a: 45, b: 50, anomaly: undefined },
      ],
      legendA: 'Atlanta (ms)',
      legendB: 'Tampa (ms)',
      showAnomalies: true,
    },
    {
      type: 'table',
      title: 'Impact by ISP',
      columns: ['ISP', 'Subscribers', 'Avg Latency', 'Packet Loss', 'Status'],
      rows: [
        ['FastFiber Inc.', '1,120', '125ms', '15%', 'Critical'],
        ['NetPro Services', '840', '88ms', '9%', 'Degraded'],
        ['GulfStream Connect', '440', '65ms', '8%', 'Degraded'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'Escalate to NOC', description: 'Route incident to the South Region NOC team for immediate action.', variant: 'primary' },
        { label: 'Notify Affected ISPs', description: 'Send incident notification to all 3 affected ISP operations teams.', variant: 'outline' },
        { label: 'Generate Incident Report', description: 'Create a full incident timeline and impact report for post-mortem.', variant: 'outline' },
      ],
    },
  ],
};

// ─── Scenario 4: Proactive Resource Planning ──────────────────────────────

const resourcePlanning: ScenarioDefinition = {
  id: 'resource-planning',
  title: 'Proactive Cost Forecast',
  subtitle: 'Resource Planning — Ingestion Cost',
  description:
    'Forecasted next month\'s ingestion cost with 15% device growth. Predictive model shows $47,200 ±$3,100 with interactive scenario adjustment.',
  loadingStages: [
    'Loading current ingestion cost model...',
    'Applying 15% growth assumption to device count...',
    'Running Monte Carlo simulation for confidence intervals...',
    'Building interactive forecast workspace...',
  ],
  confidence: 87,
  evidenceDomains: ['Billing System', 'Device Registry', 'Cost Model', 'Growth Analytics'],
  followUps: [
    'What if growth is 25% instead?',
    'Show me the cost breakdown by region',
    'When do we hit the budget ceiling?',
  ],
  family: 'planning',
  keywords: [
    'forecast', 'cost', 'ingestion', 'resource', 'planning', 'budget', 'growth',
    'device growth', 'predict', 'spend', 'capacity',
    'forecast cn', 'cost cn', 'budget cn', 'growth cn', 'planning cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Cost Forecast Generated',
      body: 'With 15% device growth (projected 14,326 → 16,475 devices), next month\'s ingestion cost is forecast at $47,200 with a 90% confidence interval of $44,100–$50,300. Current monthly spend is $41,000.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Current Monthly', value: '$41,000', change: 'Baseline', trend: 'neutral' },
        { label: 'Forecast (15% growth)', value: '$47,200', change: '+15.1%', trend: 'up' },
        { label: 'Confidence Range', value: '±$3,100', change: '90% CI', trend: 'neutral' },
        { label: 'Budget Headroom', value: '$7,800', change: '14% margin', trend: 'down' },
      ],
    },
    {
      type: 'forecast',
      title: 'Monthly Ingestion Cost Trend & Forecast',
      historical: [
        { month: 'Oct', value: 35200 },
        { month: 'Nov', value: 36800 },
        { month: 'Dec', value: 38100 },
        { month: 'Jan', value: 39400 },
        { month: 'Feb', value: 40200 },
        { month: 'Mar', value: 41000 },
      ],
      predicted: [
        { month: 'Apr', value: 43200, upper: 45100, lower: 41300 },
        { month: 'May', value: 45600, upper: 48200, lower: 43000 },
        { month: 'Jun', value: 47200, upper: 50300, lower: 44100 },
      ],
      unit: '$',
      growthAssumption: 15,
    },
    {
      type: 'actions',
      items: [
        { label: 'Adjust Growth to 25%', description: 'Rerun forecast with 25% device growth assumption.', variant: 'primary' },
        { label: 'Export Forecast Model', description: 'Download the full cost model with all assumptions.', variant: 'outline' },
        { label: 'Set Budget Alert', description: 'Create an alert when spend exceeds the forecast upper bound.', variant: 'outline' },
      ],
    },
  ],
  workbench: {
    capabilityChain: [
      {
        title: 'Device Signals',
        detail: 'Device registry growth and current ingestion volume establish the planning baseline.',
      },
      {
        title: 'Cloud Checks',
        detail: 'Cost services run forecast simulations with budget thresholds and confidence bounds.',
      },
      {
        title: 'Agent Reasoning / Actions',
        detail: 'The agent frames spend risk and proposes alerting or scenario changes.',
      },
    ],
    processRail: {
      reasoning: [
        {
          title: 'Growth assumption applied',
          detail: 'The model projects spend under a 15% increase in managed devices.',
        },
      ],
      backendActions: [
        {
          title: 'Forecast simulation',
          system: 'Cost Model',
          outcome: 'Monte Carlo forecasting produces projected spend and upper/lower bounds.',
        },
      ],
      auditEntries: [
        {
          title: 'Forecast snapshot saved',
          detail: 'Current planning recommendation stored with the 15% growth scenario.',
        },
      ],
    },
  },
};

// ─── Scenario 4: Proactive Churn Prevention ───────────────────────────────

const churnPrevention: ScenarioDefinition = {
  id: 'churn-prevention',
  title: 'Silent Sufferer Detection',
  subtitle: 'Proactive Churn Prevention',
  description:
    'Identified 23 households experiencing poor streaming/gaming quality for 14+ days with zero support tickets. Ranked by churn risk score.',
  loadingStages: [
    'Scanning subscriber quality metrics for degradation...',
    'Cross-referencing with support ticket history...',
    'Calculating churn risk scores...',
    'Building risk matrix and action workspace...',
  ],
  confidence: 89,
  evidenceDomains: ['QoE Metrics', 'Support Tickets', 'Contract DB', 'Usage Patterns'],
  followUps: [
    'Show the subscribers most at risk of churn and explain the rescue priority.',
    'Recommend the best churn save offer and explain the expected impact.',
    'Show churn risk with no tickets and explain the early warning signals.',
  ],
  family: 'business',
  keywords: [
    'churn', 'silent sufferer', 'retention', 'latency', 'streaming', 'gaming',
    'support ticket', 'risk', 'degradation', 'proactive', 'complaint',
    'churn cn', 'silent cn', 'latency cn', 'experience cn', 'risk cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Silent Sufferers Identified',
      body: 'Found 23 households with consistently poor streaming/gaming latency (>100ms) over the last 14 days, yet zero support tickets filed. These subscribers represent an estimated $18,400/month in at-risk MRR. Top 8 are in critical contract renewal windows.',
    },
    {
      type: 'stats',
      items: [
        { label: 'At-Risk Households', value: '23', change: '+5 vs last scan', trend: 'up' },
        { label: 'Avg Latency', value: '142 ms', change: '+38 ms', trend: 'up' },
        { label: 'At-Risk MRR', value: '$18,400', change: 'Potential loss', trend: 'down' },
        { label: 'Critical Renewals', value: '8', change: 'Within 30 days', trend: 'neutral' },
      ],
    },
    {
      type: 'risk-matrix',
      title: 'Churn Risk Matrix',
      quadrants: {
        highDegradation: [
          { id: 'SUB-4821', name: 'M. Thompson', risk: 92 },
          { id: 'SUB-1038', name: 'K. Yamamoto', risk: 88 },
          { id: 'SUB-7634', name: 'R. Patel', risk: 85 },
          { id: 'SUB-2190', name: 'A. Lindgren', risk: 82 },
          { id: 'SUB-5543', name: 'J. Santos', risk: 79 },
        ],
        lowDegradation: [
          { id: 'SUB-9921', name: 'P. Anderson', risk: 45 },
          { id: 'SUB-3342', name: 'L. Müller', risk: 41 },
          { id: 'SUB-6678', name: 'S. Kim', risk: 38 },
        ],
        highContract: [
          { id: 'SUB-4401', name: 'D. Chen', risk: 71 },
          { id: 'SUB-8723', name: 'N. Brooks', risk: 68 },
          { id: 'SUB-1190', name: 'F. Rossi', risk: 64 },
        ],
        lowContract: [
          { id: 'SUB-3356', name: 'H. Weber', risk: 28 },
          { id: 'SUB-7789', name: 'T. Nakamura', risk: 22 },
          { id: 'SUB-5512', name: 'C. Dubois', risk: 19 },
        ],
      },
    },
    {
      type: 'subscriber-list',
      title: 'High-Risk Subscriber List',
      subscribers: [
        { id: 'SUB-4821', name: 'M. Thompson', risk: 'critical', reason: '142ms avg latency, contract renewal in 12 days' },
        { id: 'SUB-1038', name: 'K. Yamamoto', risk: 'critical', reason: 'Gaming latency spikes to 280ms, high-value plan' },
        { id: 'SUB-7634', name: 'R. Patel', risk: 'high', reason: 'Streaming buffer ratio 8.2%, 4K plan subscriber' },
        { id: 'SUB-2190', name: 'A. Lindgren', risk: 'high', reason: 'Consistent 150ms+ latency, competitor offer detected' },
        { id: 'SUB-5543', name: 'J. Santos', risk: 'medium', reason: 'Degradation started 10 days ago, no tickets' },
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'Apply QoS Optimization', description: 'Automatically prioritize traffic for the top 5 at-risk subscribers.', variant: 'primary' },
        { label: 'Send Proactive Notification', description: 'Reach out to affected subscribers with a personalized service recovery message.', variant: 'outline' },
        { label: 'Create Retention Campaign', description: 'Generate a targeted retention offer for subscribers in critical renewal windows.', variant: 'outline' },
      ],
    },
  ],
  variants: [
    {
      id: 'save-offer',
      keywords: [
        'best churn save offer',
        'save offer',
        'expected impact',
        'retention offer',
      ],
      title: 'Churn Save Offer Recommendation',
      subtitle: 'Retention Action Plan',
      description:
        'Matched the highest-risk subscriber cohort with the save offers that are most likely to preserve revenue without over-discounting.',
      loadingStages: [
        'Reviewing churn drivers and contract timing...',
        'Comparing save-offer performance by cohort...',
        'Estimating retention lift and margin impact...',
        'Packaging the recommended retention action...',
      ],
      confidence: 88,
      evidenceDomains: [
        'QoE Metrics',
        'Offer Performance',
        'Contract DB',
        'Subscriber Value',
      ],
      followUps: [
        'Show the subscribers most at risk of churn and explain the rescue priority.',
        'Show churn risk with no tickets and explain the early warning signals.',
        'Identify the best VAS-fit households using device fingerprints and subscription gaps.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Best Save Offer Identified',
          body: 'The strongest save motion for the highest-risk households is a 90-day speed-tier upgrade plus white-glove outreach. It preserves roughly 74% of the at-risk MRR in the current cohort while keeping margin erosion materially lower than a blanket discount approach.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Recommended Offer', value: '90-day speed boost', change: 'Plus priority outreach', trend: 'neutral' },
            { label: 'Expected Retention Lift', value: '+22%', change: 'Vs no action', trend: 'up' },
            { label: 'Protected MRR', value: '$13,600', change: 'From current risk pool', trend: 'up' },
            { label: 'Margin Trade-Off', value: '-6%', change: 'Better than cash discount', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Save Offer Comparison',
          columns: ['Offer', 'Target Cohort', 'Retention Lift', 'Margin Impact', 'Recommendation'],
          rows: [
            ['90-day speed boost', 'Critical latency sufferers', '+22%', '-6%', 'Best overall'],
            ['1-month bill credit', 'Price-sensitive homes', '+14%', '-11%', 'Use selectively'],
            ['Device optimization visit', 'Gaming-heavy homes', '+17%', '-4%', 'Secondary option'],
            ['Bundle add-on discount', 'Family households', '+9%', '-8%', 'Low priority'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Launch Save Offer', description: 'Send the recommended retention offer to the highest-risk households.', variant: 'primary' },
            { label: 'Review High-Risk List', description: 'Open the current at-risk households and rescue priorities.', variant: 'outline' },
            { label: 'Draft Outreach Copy', description: 'Generate the subscriber-facing message for the save campaign.', variant: 'outline' },
          ],
        },
      ],
    },
  ],
};

// ─── Scenario 5: Hyper-Targeted Upsell ────────────────────────────────────

const bandwidthUpsell: ScenarioDefinition = {
  id: 'bandwidth-upsell',
  title: 'Bandwidth Saturation Analysis',
  subtitle: 'Hyper-Targeted Upsell Opportunity',
  description:
    'Found 312 users saturating WAN bandwidth >2 hours/day due to video calls and 4K streaming. Estimated $14,200/month MRR uplift from targeted "Bandwidth Boost" offers.',
  loadingStages: [
    'Analyzing WAN bandwidth utilization patterns...',
    'Identifying sustained saturation events...',
    'Correlating with application usage (video calls, 4K)...',
    'Calculating upsell revenue opportunity...',
  ],
  confidence: 86,
  evidenceDomains: ['Bandwidth Telemetry', 'Application Usage', 'Plan Database', 'Billing System'],
  followUps: [
    'Show this week’s top 10 upsell candidates and explain why AI ranked them highest.',
    'Forecast the near-term revenue impact of the strongest current growth opportunities.',
    'Recommend the next-best offer based on current conversion and churn signals.',
  ],
  family: 'business',
  keywords: [
    'bandwidth', 'upsell', 'saturation', 'video call', '4k', 'streaming',
    'mrr', 'revenue', 'upgrade', 'offer', 'targeted',
    'bandwidth cn', 'upgrade cn', 'saturation cn', 'revenue cn', 'recommendation cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Bandwidth Saturation Opportunity',
      body: '312 subscribers consistently saturate their WAN bandwidth for >2 hours daily, primarily driven by video conferencing and 4K streaming. These users are on plans that cannot support their usage patterns. A targeted "Bandwidth Boost" upsell campaign could generate an estimated $14,200/month in additional MRR.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Saturated Users', value: '312', change: '+18% MoM', trend: 'up' },
        { label: 'Avg Daily Saturation', value: '3.2 hrs', change: '+0.8 hrs', trend: 'up' },
        { label: 'Est. MRR Uplift', value: '$14,200', change: 'Per month', trend: 'up' },
        { label: 'Avg Plan Gap', value: '120 Mbps', change: 'Needed upgrade', trend: 'neutral' },
      ],
    },
    {
      type: 'bandwidth-timeline',
      title: 'Bandwidth Saturation Timeline (Typical User Day)',
      data: [
        { hour: '6am', usage: 42, threshold: 85 },
        { hour: '8am', usage: 68, threshold: 85 },
        { hour: '10am', usage: 89, threshold: 85 },
        { hour: '12pm', usage: 94, threshold: 85 },
        { hour: '2pm', usage: 91, threshold: 85 },
        { hour: '4pm', usage: 76, threshold: 85 },
        { hour: '6pm', usage: 88, threshold: 85 },
        { hour: '8pm', usage: 97, threshold: 85 },
        { hour: '10pm', usage: 72, threshold: 85 },
      ],
      saturationHours: 5,
    },
    {
      type: 'table',
      title: 'Usage Profile Breakdown',
      columns: ['Activity', 'Users', 'Avg Saturation', 'Recommended Plan'],
      rows: [
        ['Video Calls + 4K Streaming', '142', '4.1 hrs/day', 'Business Pro 1G'],
        ['4K Streaming Only', '98', '2.8 hrs/day', 'Entertainment 500'],
        ['Video Calls Only', '52', '2.3 hrs/day', 'Work-From-Home 500'],
        ['Gaming + Streaming', '20', '3.5 hrs/day', 'Power User 1G'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'Launch Bandwidth Boost Campaign', description: 'Send personalized upgrade offers to all 312 saturated users.', variant: 'primary' },
        { label: 'Preview Email Template', description: 'Review the targeted offer email before sending.', variant: 'outline' },
        { label: 'Export User List (CSV)', description: 'Download the full list of saturated subscribers for CRM import.', variant: 'outline' },
      ],
    },
  ],
  variants: [
    {
      id: 'opportunity-ranking',
      keywords: [
        'top 10 upsell candidates',
        'most valuable opportunities',
        'ranked them highest',
        'scoring factors',
      ],
      title: 'Top Upsell Candidate Ranking',
      subtitle: 'Opportunity Prioritization',
      description:
        'Ranked the highest-confidence upgrade opportunities using saturation duration, plan gap, and conversion propensity.',
      loadingStages: [
        'Ranking saturated subscribers by conversion propensity...',
        'Scoring plan gap and session criticality...',
        'Filtering the highest-value upgrade opportunities...',
        'Preparing the upsell priority list...',
      ],
      confidence: 88,
      evidenceDomains: [
        'Bandwidth Telemetry',
        'Propensity Model',
        'Plan Gap',
        'Revenue Scoring',
      ],
      followUps: [
        'Forecast the near-term revenue impact of the strongest current growth opportunities.',
        'Show the ROI tracker and explain where conversion is being won or lost.',
        'Explain the upsell confidence score and the evidence behind it.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Best Upsell Targets Ranked',
          body: 'The top 10 upgrade candidates combine sustained saturation, a large plan gap, and above-average conversion propensity. The highest-value cluster is work-from-home households that also stream 4K during the evening peak, making them both easy to justify and commercially attractive.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Top 10 Revenue Pool', value: '$4,320', change: 'Potential monthly uplift', trend: 'up' },
            { label: 'Avg Conversion Confidence', value: '81%', change: 'Across top 10', trend: 'up' },
            { label: 'Median Plan Gap', value: '150 Mbps', change: 'Current vs needed', trend: 'up' },
            { label: 'Fastest-Moving Segment', value: 'WFH + 4K homes', change: 'Highest score density', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Top 10 Upsell Candidates',
          columns: ['Subscriber', 'Current Plan', 'Plan Gap', 'Confidence', 'Recommended Offer'],
          rows: [
            ['SUB-7834', 'Entertainment 300', '200 Mbps', '89%', 'Entertainment 500'],
            ['SUB-6678', 'Work-From-Home 300', '150 Mbps', '86%', 'Work-From-Home 500'],
            ['SUB-9902', 'Business Core 500', '300 Mbps', '84%', 'Business Pro 1G'],
            ['SUB-3351', 'Entertainment 300', '120 Mbps', '82%', 'Entertainment 500'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Launch Top 10 Offers', description: 'Trigger the ranked offer set for the best current upsell candidates.', variant: 'primary' },
            { label: 'Open Revenue Forecast', description: 'Project the near-term revenue impact of the ranked opportunities.', variant: 'outline' },
            { label: 'Review Confidence Evidence', description: 'Inspect the score drivers behind the current ranking.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'revenue-impact',
      keywords: [
        'revenue impact',
        'near-term revenue',
        'convert at current rates',
        'where to focus next',
      ],
      title: 'Upsell Revenue Forecast',
      subtitle: 'Near-Term Revenue Impact',
      description:
        'Projected the revenue uplift from the strongest current upgrade opportunities under current conversion rates.',
      loadingStages: [
        'Loading current offer conversion assumptions...',
        'Forecasting revenue uplift by segment and campaign...',
        'Comparing upside against delivery capacity...',
        'Packaging the growth focus recommendation...',
      ],
      confidence: 85,
      evidenceDomains: [
        'Conversion Model',
        'Offer Mix',
        'Plan Gap',
        'Revenue Attribution',
      ],
      followUps: [
        'Show this week’s top 10 upsell candidates and explain why AI ranked them highest.',
        'Show the ROI tracker and explain where conversion is being won or lost.',
        'Recommend the next-best offer based on current conversion and churn signals.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Revenue Upside Concentrates in Two Motions',
          body: 'At current conversion rates, the strongest bandwidth upsell opportunities can add roughly $14.8k in near-term monthly revenue. More than 60% of that upside sits in two motions: premium WFH upgrades and family-streaming households that are already saturating their current tiers.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Near-Term Uplift', value: '$14,800', change: 'Current conversion assumptions', trend: 'up' },
            { label: 'Highest-Yield Motion', value: 'WFH upgrades', change: '$6,100 MRR', trend: 'up' },
            { label: 'Focus Segment', value: 'Family streaming', change: '$3,100 MRR', trend: 'up' },
            { label: 'Payback Window', value: '31 days', change: 'Campaign + incentive cost', trend: 'neutral' },
          ],
        },
        {
          type: 'forecast',
          title: 'Projected Upsell Revenue',
          historical: [
            { month: 'Jan', value: 7100 },
            { month: 'Feb', value: 8200 },
            { month: 'Mar', value: 9300 },
          ],
          predicted: [
            { month: 'Apr', value: 11800, upper: 12900, lower: 10700 },
            { month: 'May', value: 13600, upper: 14900, lower: 12300 },
            { month: 'Jun', value: 14800, upper: 16200, lower: 13400 },
          ],
          unit: '$',
          growthAssumption: 18,
        },
        {
          type: 'actions',
          items: [
            { label: 'Focus on Top Revenue Motions', description: 'Prioritize the highest-yield upgrade campaigns first.', variant: 'primary' },
            { label: 'Open ROI Tracker', description: 'Inspect where conversion is winning or stalling in active campaigns.', variant: 'outline' },
            { label: 'Recommend Next Offer', description: 'See the next-best offer for subscribers with mixed upsell/churn signals.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'campaign-roi',
      keywords: [
        'roi tracker',
        'campaign roi',
        'conversion is being won or lost',
      ],
      title: 'Campaign ROI Tracker',
      subtitle: 'Conversion Performance Review',
      description:
        'Measured how the active upsell campaigns are converting, where margin is leaking, and which offers are outperforming.',
      loadingStages: [
        'Loading offer funnel performance...',
        'Comparing segment conversion and CAC...',
        'Measuring incremental revenue by campaign...',
        'Building the ROI performance tracker...',
      ],
      confidence: 87,
      evidenceDomains: [
        'Campaign Metrics',
        'Conversion Events',
        'Revenue Attribution',
        'Offer Funnel',
      ],
      followUps: [
        'Forecast the near-term revenue impact of the strongest current growth opportunities.',
        'Recommend the next-best offer based on current conversion and churn signals.',
        'Explain the upsell confidence score and the evidence behind it.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'ROI Is Winning in Two Campaign Lanes',
          body: 'The best ROI is coming from premium WFH upgrades and gaming-heavy households, where conversion remains above plan and incentive costs stay low. Margin is leaking in broad family-streaming blasts because discounts are too generous relative to the observed plan gap.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Best ROI Campaign', value: 'Premium Upgrade Q2', change: '3.8x return', trend: 'up' },
            { label: 'Weakest ROI Campaign', value: 'Family Flex Save', change: '1.4x return', trend: 'down' },
            { label: 'Conversion Winner', value: 'Gaming homes', change: '18.6%', trend: 'up' },
            { label: 'Margin Leak', value: '$1,120', change: 'Discount-heavy lane', trend: 'down' },
          ],
        },
        {
          type: 'table',
          title: 'Campaign ROI Breakdown',
          columns: ['Campaign', 'Conversion', 'Incremental MRR', 'CAC', 'ROI'],
          rows: [
            ['Premium Upgrade Q2', '16.8%', '$5,440', '$1,420', '3.8x'],
            ['WFH Momentum', '14.2%', '$4,180', '$1,220', '3.4x'],
            ['Gaming Power Offer', '18.6%', '$2,910', '$980', '3.0x'],
            ['Family Flex Save', '9.4%', '$1,720', '$1,230', '1.4x'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Scale the Best ROI Campaigns', description: 'Shift more volume into the highest-return growth motions.', variant: 'primary' },
            { label: 'Tune Discount Levels', description: 'Reduce discount pressure in the weakest ROI lane.', variant: 'outline' },
            { label: 'Open Next-Best Offer', description: 'Inspect the offer recommendation for mixed-signal subscribers.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'next-best-offer',
      keywords: [
        'next-best offer',
        'recommend the next-best offer',
        'current conversion and churn signals',
      ],
      title: 'Next-Best Offer Recommendation',
      subtitle: 'Offer Strategy',
      description:
        'Recommended the offer that balances upsell potential against churn sensitivity for the current subscriber or campaign context.',
      loadingStages: [
        'Combining upsell propensity with churn sensitivity...',
        'Comparing eligible offers and expected lift...',
        'Estimating margin and save-risk trade-offs...',
        'Finalizing the next-best offer recommendation...',
      ],
      confidence: 84,
      evidenceDomains: [
        'Conversion Signals',
        'Churn Signals',
        'Offer Library',
        'Plan Eligibility',
      ],
      followUps: [
        'Show the ROI tracker and explain where conversion is being won or lost.',
        'Explain the upsell confidence score and the evidence behind it.',
        'Compare this subscriber with similar households and explain where it differs.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Best Offer Is a Guided Mid-Tier Upgrade',
          body: 'The next-best offer is a mid-tier upgrade with a short introductory discount rather than a straight jump to the highest plan. It captures most of the conversion upside while keeping churn exposure low for households that still show some price sensitivity.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Recommended Offer', value: 'Entertainment 500 + 60-day intro', change: 'Best fit', trend: 'neutral' },
            { label: 'Expected Conversion', value: '17%', change: 'Higher than 1G offer', trend: 'up' },
            { label: 'Churn Guardrail', value: 'Low', change: 'Price sensitivity respected', trend: 'neutral' },
            { label: 'Incremental MRR', value: '$46 / home', change: 'Post-intro period', trend: 'up' },
          ],
        },
        {
          type: 'table',
          title: 'Offer Comparison',
          columns: ['Offer', 'Conversion', 'Churn Risk', 'Incremental MRR', 'Decision'],
          rows: [
            ['Entertainment 500 + intro', '17%', 'Low', '$46', 'Recommended'],
            ['Entertainment 1G', '9%', 'Medium', '$71', 'Too aggressive'],
            ['Device add-on bundle', '12%', 'Low', '$18', 'Secondary option'],
            ['Cash discount only', '14%', 'Medium', '$7', 'Low value'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Use Recommended Offer', description: 'Launch the guided mid-tier offer for the current target context.', variant: 'primary' },
            { label: 'Inspect ROI Context', description: 'Review how this recommendation fits the active campaign ROI.', variant: 'outline' },
            { label: 'Open Peer Comparison', description: 'Compare the target household against similar subscribers.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'subscriber-confidence',
      keywords: [
        'upsell confidence score',
        'evidence behind it',
        'likely to convert',
      ],
      title: 'Upsell Confidence Evidence',
      subtitle: 'Subscriber Conversion Likelihood',
      description:
        'Explained the evidence behind the current upsell confidence score for the selected subscriber or household.',
      loadingStages: [
        'Reviewing usage intensity and plan gap...',
        'Checking peer conversion outcomes...',
        'Scoring offer fit and price sensitivity...',
        'Preparing the confidence evidence summary...',
      ],
      confidence: 83,
      evidenceDomains: [
        'Usage Pattern',
        'Plan Gap',
        'Peer Conversion',
        'Offer Response History',
      ],
      followUps: [
        'Compare this subscriber with similar households and explain where it differs.',
        'Recommend the next-best offer based on current conversion and churn signals.',
        'Forecast the near-term revenue impact of the strongest current growth opportunities.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Confidence Is Strong but Not Perfect',
          body: 'The current upsell confidence is high because the household shows repeated evening saturation, a measurable plan gap, and peer groups that convert well when offered the next tier. The main drag is moderate price sensitivity after the last promotional period ended.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Upsell Confidence', value: '78%', change: 'High confidence', trend: 'up' },
            { label: 'Plan Gap', value: '140 Mbps', change: 'Needed at peak', trend: 'up' },
            { label: 'Peer Conversion', value: '16.4%', change: 'Similar homes', trend: 'up' },
            { label: 'Price Sensitivity', value: 'Moderate', change: 'Watch discount depth', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Confidence Score Drivers',
          columns: ['Signal', 'Observation', 'Impact on Score', 'Notes'],
          rows: [
            ['Evening saturation', '>2.8 hrs/day', '+24', 'Consistent pain point'],
            ['Video-call activity', '4 weekdays/week', '+18', 'Work-from-home fit'],
            ['Peer conversions', '16.4%', '+21', 'Strong comparable cohort'],
            ['Promo fatigue', 'Last discount ended 45d ago', '-9', 'Keep offer measured'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Open Peer Comparison', description: 'See how the household differs from similar subscribers.', variant: 'primary' },
            { label: 'Recommend Next Offer', description: 'Choose the next-best offer based on the current evidence.', variant: 'outline' },
            { label: 'Review Revenue Forecast', description: 'Connect the subscriber signal to broader revenue planning.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'peer-comparison',
      keywords: [
        'compare',
        'similar subscribers',
        'where it differs',
      ],
      title: 'Peer Comparison for Upsell Fit',
      subtitle: 'Similar Subscriber Benchmark',
      description:
        'Compared the selected subscriber against similar households to show why the current upsell recommendation differs.',
      loadingStages: [
        'Finding similar households in the active campaign...',
        'Comparing usage patterns and conversion history...',
        'Measuring plan gap and sensitivity differences...',
        'Packaging the peer benchmark summary...',
      ],
      confidence: 82,
      evidenceDomains: [
        'Peer Cohort',
        'Usage Distribution',
        'Plan Mix',
        'Conversion Outcomes',
      ],
      followUps: [
        'Explain the upsell confidence score and the evidence behind it.',
        'Recommend the next-best offer based on current conversion and churn signals.',
        'Show the ROI tracker and explain where conversion is being won or lost.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'This Household Is Slightly More Ready Than Its Peers',
          body: 'Compared with similar households in the same campaign, the selected subscriber has a larger evening plan gap and heavier video-call load, which makes the upgrade case stronger. The main difference is that price sensitivity is only moderate here, while several peers needed a larger introductory discount to convert.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Plan Gap vs Peers', value: '+28 Mbps', change: 'Above median', trend: 'up' },
            { label: 'Video Sessions / Week', value: '19', change: '+4 vs peers', trend: 'up' },
            { label: 'Price Sensitivity', value: 'Lower', change: 'Than peer median', trend: 'up' },
            { label: 'Expected Lift', value: '+3.2 pts', change: 'Vs campaign average', trend: 'up' },
          ],
        },
        {
          type: 'table',
          title: 'Subscriber vs Similar Households',
          columns: ['Signal', 'Selected Subscriber', 'Peer Median', 'Difference'],
          rows: [
            ['Plan gap', '140 Mbps', '112 Mbps', '+28 Mbps'],
            ['Evening saturation', '2.8 hrs/day', '2.3 hrs/day', '+0.5 hrs'],
            ['Video sessions / week', '19', '15', '+4'],
            ['Intro discount needed', 'Moderate', 'High', 'More favorable'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Use Peer-Tuned Offer', description: 'Apply the offer recommended for this subscriber’s peer profile.', variant: 'primary' },
            { label: 'Review Confidence Drivers', description: 'Open the score explanation behind the current recommendation.', variant: 'outline' },
            { label: 'Open Campaign ROI', description: 'See how peer performance rolls up into campaign ROI.', variant: 'outline' },
          ],
        },
      ],
    },
  ],
};

// ─── Scenario 6: Promoting VAS via Device Fingerprinting ──────────────────

const vasDeviceFingerprint: ScenarioDefinition = {
  id: 'vas-device-fingerprint',
  title: 'Device Fingerprint Insights',
  subtitle: 'VAS Promotion — Parental Control',
  description:
    'Identified 847 households with gaming consoles or children\'s devices but no parental control subscription. Estimated $5,900/month MRR uplift from contextual free-trial campaigns.',
  loadingStages: [
    'Scanning connected device inventory across fleet...',
    'Fingerprinting device types by MAC OUI and behavior...',
    'Cross-referencing with VAS subscription status...',
    'Building device insight and targeting workspace...',
  ],
  confidence: 92,
  evidenceDomains: ['Device Inventory', 'MAC OUI Database', 'VAS Subscriptions', 'Household Profiles'],
  followUps: [
    'Identify the best VAS-fit households using device fingerprints and subscription gaps.',
    'Show the households where device fingerprints suggest an untapped VAS offer.',
    'Explain whether this is a strong VAS-fit household based on device fingerprints and subscription gaps.',
  ],
  family: 'business',
  keywords: [
    'device', 'fingerprint', 'parental control', 'vas', 'gaming console', 'children',
    'upsell', 'subscription', 'household', 'targeting', 'free trial',
    'device cn', 'fingerprint cn', 'parental control cn', 'value-added cn', 'gaming cn', 'children cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Untapped VAS Opportunity Found',
      body: 'Device fingerprinting identified 847 households with gaming consoles (PlayStation, Xbox, Nintendo Switch) or children\'s devices (kids\' tablets, smart speakers) but no active parental control subscription. These households represent a prime audience for a contextual free-trial campaign with an estimated $5,900/month MRR uplift.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Target Households', value: '847', change: 'New segment', trend: 'neutral' },
        { label: 'Gaming Consoles', value: '523', change: 'Detected', trend: 'up' },
        { label: "Children's Devices", value: '412', change: 'Detected', trend: 'up' },
        { label: 'Est. MRR Uplift', value: '$5,900', change: '$6.97 avg/sub', trend: 'up' },
      ],
    },
    {
      type: 'device-insight',
      title: 'Device Category Breakdown',
      insights: [
        { category: 'Gaming Consoles', count: 523, examples: ['PlayStation 5', 'Xbox Series X', 'Nintendo Switch'], color: 'var(--primary)' },
        { category: "Kids' Tablets", count: 218, examples: ['Amazon Fire Kids', 'iPad (Child Profile)', 'Samsung Kids'], color: 'var(--warning)' },
        { category: 'Smart Speakers', count: 124, examples: ['Echo Dot Kids', 'Google Nest Mini'], color: 'var(--success)' },
        { category: 'Wearable (Child)', count: 70, examples: ['Gabb Watch', 'TickTalk 4'], color: 'var(--accent-color)' },
      ],
    },
    {
      type: 'table',
      title: 'Target Audience Summary',
      columns: ['Segment', 'Households', 'Conversion Est.', 'MRR Impact'],
      rows: [
        ['Gaming Console Only', '312', '12.4%', '$2,340'],
        ['Children\'s Devices Only', '207', '18.2%', '$2,266'],
        ['Both (Gaming + Kids)', '186', '22.1%', '$1,238'],
        ['Smart Speaker Households', '142', '8.6%', '$734'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'Launch Free-Trial Campaign', description: 'Trigger a 30-day parental control free trial for the top 100 households.', variant: 'primary' },
        { label: 'Preview Campaign Creative', description: 'Review the contextual offer messaging and landing page.', variant: 'outline' },
        { label: 'Export Audience Segment', description: 'Download the household list for CRM or email marketing import.', variant: 'outline' },
      ],
    },
  ],
  variants: [
    {
      id: 'household-fit',
      keywords: [
        'strong vas-fit household',
        'subscription gaps',
        'is a strong vas-fit household',
      ],
      title: 'Household VAS Fit Assessment',
      subtitle: 'Subscriber-Level Add-On Readiness',
      description:
        'Explained whether the selected household is a strong fit for a device-led VAS offer and why.',
      loadingStages: [
        'Inspecting household device fingerprints...',
        'Checking current subscription gaps...',
        'Comparing with converting lookalike households...',
        'Preparing the VAS fit assessment...',
      ],
      confidence: 90,
      evidenceDomains: [
        'Device Inventory',
        'Subscription Gaps',
        'Household Profile',
        'Peer Conversion',
      ],
      followUps: [
        'Show the households where device fingerprints suggest an untapped VAS offer.',
        'Identify the best VAS-fit households using device fingerprints and subscription gaps.',
        'Recommend the best churn save offer and explain the expected impact.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Household Looks Like a Strong VAS Fit',
          body: 'The household is a strong candidate for a parental-control or device-safety add-on because device fingerprints show both child-oriented endpoints and unmanaged gaming usage, while the current subscription bundle has no safety or parental-control coverage. Similar households convert well when the offer is framed around visibility and time controls instead of pure security language.',
        },
        {
          type: 'stats',
          items: [
            { label: 'VAS Fit Score', value: '84%', change: 'Strong fit', trend: 'up' },
            { label: 'Detected Child Devices', value: '3', change: 'Kids tablet + wearable', trend: 'up' },
            { label: 'Gaming Endpoints', value: '2', change: 'Console heavy usage', trend: 'up' },
            { label: 'Subscription Gap', value: 'No safety add-on', change: 'Clear whitespace', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'VAS Fit Evidence',
          columns: ['Signal', 'Observation', 'Impact', 'Interpretation'],
          rows: [
            ['Child devices', 'Kids tablet + smartwatch', 'High', 'Safety messaging resonates'],
            ['Gaming activity', 'Console active 5 nights/week', 'Medium', 'Screen-time controls relevant'],
            ['Current subscriptions', 'No parental controls', 'High', 'Clear upsell whitespace'],
            ['Peer conversions', '19% on lookalikes', 'Medium', 'Offer likely to land'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Launch Household Offer', description: 'Trigger the safety-focused VAS offer for this household.', variant: 'primary' },
            { label: 'Open Segment View', description: 'Return to the broader audience of VAS-fit households.', variant: 'outline' },
            { label: 'Compare Offer Messaging', description: 'Review which creative converts best for similar homes.', variant: 'outline' },
          ],
        },
      ],
    },
  ],
};

// ─── Scenario 7: Autonomous Wi-Fi Recovery ─────────────────────────────────

const autonomousWifiRecovery: ScenarioDefinition = {
  id: 'autonomous-wifi-recovery',
  title: 'Autonomous Wi-Fi Recovery',
  subtitle: 'Self-Healing Network — Case View',
  description:
    'System autonomously detected local Wi-Fi degradation at subscriber location, executed channel optimization, verified recovery, and closed the case — all without human intervention.',
  loadingStages: [
    'Detecting Wi-Fi quality degradation at location...',
    'Running local diagnostic checks...',
    'Executing autonomous channel optimization...',
    'Verifying service recovery...',
    'Closing case with outcome verification...',
  ],
  confidence: 98,
  evidenceDomains: ['Wi-Fi Telemetry', 'Channel Analysis', 'Gateway Diagnostics', 'QoE Metrics'],
  followUps: [
    'Show the autonomous Wi-Fi recovery timeline and explain how AI verified the fix.',
    'Run a post-fix validation and summarize the autonomous recovery result.',
    'Show the cases AI fully resolved today and summarize what was fixed.',
  ],
  family: 'fleet',
  keywords: [
    'wifi', 'recovery', 'self-healing', 'autonomous', 'channel', 'optimization',
    'local', 'degradation', 'case', 'closed', 'recovery',
    'recovery cn', 'auto cn', 'optimize cn', 'channel cn', 'self-heal cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Autonomous Recovery Complete',
      body: 'Local Wi-Fi degradation detected at subscriber SUB-7834 (John Smith). System identified channel congestion on Channel 6 (4 neighboring APs detected). Autonomously executed channel migration to Channel 11, verified signal improvement from -72dBm to -48dBm, and confirmed QoE metrics restored to normal. Case auto-closed after 4-minute verification window.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Location', value: "John Smith's Home", change: '1428 Beacon Ridge Dr', trend: 'neutral' },
        { label: 'Issue', value: 'Channel Congestion', change: 'Ch 6 → Ch 11', trend: 'neutral' },
        { label: 'Signal Improvement', value: '-48 dBm', change: 'From -72 dBm', trend: 'up' },
        { label: 'Recovery Time', value: '4 min', change: 'Fully automated', trend: 'neutral' },
      ],
    },
    {
      type: 'table',
      title: 'Recovery Case Summary',
      columns: ['Step', 'Action', 'Duration', 'Result'],
      rows: [
        ['1. Detection', 'QoE degradation alert', 'Instant', 'RSSI dropped to -72dBm'],
        ['2. Diagnosis', 'Channel scan + neighbor analysis', '12s', '4 APs on Ch 6 detected'],
        ['3. Action', 'Channel migration Ch 6 → Ch 11', '8s', 'Signal improved to -48dBm'],
        ['4. Verification', 'QoE metric confirmation', '3 min', 'All metrics normal'],
        ['5. Close', 'Auto-close case', 'Instant', 'Case resolved'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'View Full Diagnostic Log', description: 'Open the complete diagnostic timeline for this case.', variant: 'outline' },
        { label: 'Review Similar Cases', description: 'Check if nearby subscribers are experiencing the same issue.', variant: 'outline' },
      ],
    },
  ],
  variants: [
    {
      id: 'post-fix-validation',
      keywords: [
        'post-fix validation',
        'current stability',
        'still seeing interference',
        'connectivity health',
        'remaining support risk',
        'latest recovery evidence',
      ],
      title: 'Post-Fix Validation Status',
      subtitle: 'Stability Verification',
      description:
        'Re-checked the latest autonomous Wi-Fi recovery and summarized whether the case is still stable enough to stay closed.',
      loadingStages: [
        'Replaying post-fix gateway telemetry...',
        'Checking interference and retry counters...',
        'Verifying QoE stability after the fix...',
        'Preparing the support-risk summary...',
      ],
      confidence: 96,
      evidenceDomains: [
        'Post-Fix Telemetry',
        'Gateway Diagnostics',
        'QoE Metrics',
        'Interference History',
      ],
      followUps: [
        'Show the autonomous Wi-Fi recovery timeline and explain how AI verified the fix.',
        'Show the cases AI fully resolved today and summarize what was fixed.',
        'Show the protected sessions AI handled today and explain the QoS actions.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'Recovery Still Holding',
          body: 'The autonomous fix remains stable. Post-fix telemetry shows no new channel congestion events, retry counts stayed near baseline for the last verification window, and QoE metrics remain in the healthy range. The case can stay closed, with only low residual risk if a neighboring AP returns to the same channel later tonight.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Current Stability', value: 'Healthy', change: 'No reopen needed', trend: 'up' },
            { label: 'Retry Rate', value: 'Baseline', change: 'Within normal band', trend: 'neutral' },
            { label: 'Interference Risk', value: 'Low', change: 'Neighbor AP quiet', trend: 'down' },
            { label: 'Residual Risk', value: 'Monitor overnight', change: 'Low priority', trend: 'neutral' },
          ],
        },
        {
          type: 'table',
          title: 'Post-Fix Validation Checks',
          columns: ['Check', 'Latest Result', 'Baseline', 'Status'],
          rows: [
            ['Channel utilization', '34%', '32%', 'Healthy'],
            ['Gateway retries / hour', '2', '2-3', 'Healthy'],
            ['5GHz throughput', '482 Mbps', '470 Mbps', 'Healthy'],
            ['Interference events', '0 in 6h', '0-1 expected', 'Healthy'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Keep Case Closed', description: 'Leave the autonomous recovery case closed with overnight monitoring.', variant: 'primary' },
            { label: 'Open Recovery Timeline', description: 'Review the detailed autonomous fix timeline again.', variant: 'outline' },
            { label: 'Watch Similar Cases', description: 'Check whether nearby homes show the same interference pattern.', variant: 'outline' },
          ],
        },
      ],
    },
    {
      id: 'resolved-today',
      keywords: [
        'cases ai fully resolved today',
        'fully resolved today',
        'what was fixed',
      ],
      title: 'AI-Resolved Cases Today',
      subtitle: 'Zero-Touch Support Summary',
      description:
        'Summarized the zero-touch support cases AI fully resolved today and what actions closed each one.',
      loadingStages: [
        'Scanning today’s autonomous closure queue...',
        'Collecting the fix actions and verification outcomes...',
        'Ranking the highest-value zero-touch saves...',
        'Preparing the daily resolution summary...',
      ],
      confidence: 97,
      evidenceDomains: [
        'Case Queue',
        'Autonomous Actions',
        'QoE Recovery',
        'Closure Audit',
      ],
      followUps: [
        'Run a post-fix validation and summarize the autonomous recovery result.',
        'Show the protected sessions AI handled today and explain the QoS actions.',
        'Show the firmware rollback evidence that still needs human review.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'AI Closed Four Cases Without Human Help',
          body: 'AI fully resolved four support issues today, most of them driven by local Wi-Fi interference or transient topology drift. Each case was automatically diagnosed, remediated, and held through a verification window before closure, saving the team roughly 7.5 human support hours.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Cases Closed Today', value: '4', change: 'Zero-touch', trend: 'up' },
            { label: 'Time Saved', value: '7.5 hrs', change: 'Human effort avoided', trend: 'up' },
            { label: 'Most Common Fix', value: 'Channel migration', change: '2 of 4 cases', trend: 'neutral' },
            { label: 'Reopen Rate', value: '0%', change: 'So far today', trend: 'up' },
          ],
        },
        {
          type: 'table',
          title: 'Resolved Cases Today',
          columns: ['Case', 'Issue', 'AI Action', 'Verification', 'Outcome'],
          rows: [
            ['TKT-4818', 'Wi-Fi interference', 'Auto channel migration', '4 min stable', 'Closed'],
            ['TKT-4826', 'Roaming dead zone', 'Band steering update', 'QoE normal', 'Closed'],
            ['TKT-4828', 'Guest SSID drift', 'Config correction', 'Clients rejoined', 'Closed'],
            ['TKT-4831', 'High retry bursts', 'Radio power adjustment', 'Retries normalized', 'Closed'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Review Today’s Closures', description: 'Open the zero-touch cases AI fully resolved today.', variant: 'primary' },
            { label: 'Run Spot Validation', description: 'Re-check the healthiest closure for safety.', variant: 'outline' },
            { label: 'Compare Protected Sessions', description: 'Contrast zero-touch closures with cases that needed QoS protection.', variant: 'outline' },
          ],
        },
      ],
    },
  ],
};

// ─── Scenario 8: Critical Session Protection ──────────────────────────────

const criticalSessionProtection: ScenarioDefinition = {
  id: 'critical-session-protection',
  title: 'Critical Session Protection',
  subtitle: 'High-Value Moment Safeguard',
  description:
    'System detected a high-value video conference session in progress and proactively applied QoS protection when neighboring interference threatened session quality. Session completed without disruption.',
  loadingStages: [
    'Monitoring active high-value sessions...',
    'Detecting interference threat to active session...',
    'Applying QoS protection policy...',
    'Verifying session quality maintained...',
  ],
  confidence: 97,
  evidenceDomains: ['Session Monitor', 'QoS Engine', 'Interference Detection', 'Traffic Classifier'],
  followUps: [
    'Show the protected session and explain which QoS actions kept it stable.',
    'Show how AI protected active sessions during the last incident window.',
    'Show the protected sessions AI handled today and explain the QoS actions.',
  ],
  family: 'fleet',
  keywords: [
    'session', 'protection', 'critical', 'qos', 'video', 'conference', 'high-value',
    'interference', 'safeguard', 'priority', 'real-time',
    'session cn', 'protection cn', 'critical moment cn', 'priority cn', 'video cn',
  ],
  blocks: [
    {
      type: 'summary',
      title: 'Session Protected Successfully',
      body: 'High-value video conference session detected for subscriber SUB-7834 (John Smith) connected to "Home" gateway. System identified rising interference from a newly activated neighboring AP on Channel 11. Proactively applied QoS traffic prioritization and bandwidth reservation. Session completed 47 minutes with zero quality degradation — mean opinion score maintained at 4.2/5.0 throughout.',
    },
    {
      type: 'stats',
      items: [
        { label: 'Protected Session', value: 'Video Conference', change: '47 min duration', trend: 'neutral' },
        { label: 'Threat Detected', value: 'Interference', change: 'New AP on Ch 11', trend: 'neutral' },
        { label: 'Protection Status', value: 'Active', change: 'QoS priority applied', trend: 'neutral' },
        { label: 'Session Quality', value: '4.2/5.0 MOS', change: 'No degradation', trend: 'neutral' },
      ],
    },
    {
      type: 'table',
      title: 'Protection Timeline',
      columns: ['Time', 'Event', 'Action', 'Impact'],
      rows: [
        ['14:02', 'Session started', 'Monitoring initiated', 'Normal quality'],
        ['14:18', 'Interference spike', 'QoS protection activated', 'No user impact'],
        ['14:35', 'Neighbor AP power increase', 'Bandwidth reserved', 'No user impact'],
        ['14:49', 'Session completed', 'Protection released', 'MOS 4.2/5.0'],
      ],
    },
    {
      type: 'actions',
      items: [
        { label: 'View QoS Policy Details', description: 'See the exact traffic prioritization rules applied during protection.', variant: 'outline' },
        { label: 'Protection History', description: 'View all session protection events for this subscriber.', variant: 'outline' },
      ],
    },
  ],
  variants: [
    {
      id: 'sessions-today',
      keywords: [
        'protected sessions ai handled today',
        'sessions were protected this week',
        'protected sessions today',
      ],
      title: 'Protected Sessions Today',
      subtitle: 'Daily QoS Safeguard Summary',
      description:
        'Summarized the sessions AI protected today and the QoS actions that kept them stable.',
      loadingStages: [
        'Scanning protected sessions from today’s congestion windows...',
        'Collecting the QoS actions applied to each session...',
        'Verifying user impact stayed below threshold...',
        'Preparing the daily protection summary...',
      ],
      confidence: 95,
      evidenceDomains: [
        'Session Monitor',
        'QoS Engine',
        'Congestion Signals',
        'Outcome Verification',
      ],
      followUps: [
        'Show how AI protected active sessions during the last incident window.',
        'Run a post-fix validation and summarize the autonomous recovery result.',
        'Show the cases AI fully resolved today and summarize what was fixed.',
      ],
      blocks: [
        {
          type: 'summary',
          title: 'AI Protected Nine High-Value Sessions Today',
          body: 'AI actively protected nine sessions during today’s congestion windows, mostly executive video calls and remote support sessions. QoS reservations and traffic prioritization kept mean session quality above the service threshold in every case, with no user-visible disconnects.',
        },
        {
          type: 'stats',
          items: [
            { label: 'Protected Sessions', value: '9', change: 'Today', trend: 'up' },
            { label: 'Most Used Action', value: 'QoS prioritization', change: '7 sessions', trend: 'neutral' },
            { label: 'Reserved Bandwidth', value: '1.8 Gbps', change: 'Across all cases', trend: 'up' },
            { label: 'Session Failures', value: '0', change: 'No visible drops', trend: 'up' },
          ],
        },
        {
          type: 'table',
          title: 'Protected Sessions Summary',
          columns: ['Session', 'Risk', 'QoS Action', 'Duration', 'Outcome'],
          rows: [
            ['Video call: John Smith', 'Neighbor interference', 'Priority queue + reservation', '47 min', 'Protected'],
            ['Remote support: Acme Ops', 'Peak congestion', 'Traffic shaping', '39 min', 'Protected'],
            ['Executive conference', 'Packet loss spike', 'Bandwidth reservation', '52 min', 'Protected'],
            ['Sales demo', 'RF interference', 'Priority queue', '28 min', 'Protected'],
          ],
        },
        {
          type: 'actions',
          items: [
            { label: 'Review Protected Sessions', description: 'Open the sessions AI handled today and the QoS actions used.', variant: 'primary' },
            { label: 'Inspect Last Incident Window', description: 'Look at the most recent congestion window in detail.', variant: 'outline' },
            { label: 'Compare Zero-Touch Closures', description: 'Contrast session protection with fully autonomous case closures.', variant: 'outline' },
          ],
        },
      ],
    },
  ],
  workbench: {
    capabilityChain: [
      {
        title: 'Device Signals',
        detail: 'Session telemetry and local Wi-Fi interference indicate a live video conference at risk.',
      },
      {
        title: 'Cloud Checks',
        detail: 'Policy services validate subscriber priority, classifier confidence, and QoS eligibility.',
      },
      {
        title: 'Agent Reasoning / Actions',
        detail: 'The agent decides to protect the session, reserves bandwidth, and verifies quality hold.',
      },
    ],
    processRail: {
      reasoning: [
        {
          title: 'High-value session detected',
          detail: 'The active query maps to a protected video conference already in progress.',
        },
        {
          title: 'Interference risk confirmed',
          detail: 'A neighboring AP activation threatens quality during peak congestion.',
        },
      ],
      backendActions: [
        {
          title: 'QoS protection applied',
          system: 'QoS Engine',
          outcome: 'Priority traffic handling and bandwidth reservation are activated for the session.',
        },
      ],
      auditEntries: [
        {
          title: 'Protection event logged',
          detail: 'Session safeguard activation and verification outcome recorded for subscriber review.',
        },
      ],
    },
  },
};

// ─── Export All Scenarios ──────────────────────────────────────────────────

export const ALL_SCENARIOS: ScenarioDefinition[] = [
  firmwareRegression,
  dpiTrafficAnomalies,
  regionalIncident,
  resourcePlanning,
  churnPrevention,
  bandwidthUpsell,
  vasDeviceFingerprint,
  autonomousWifiRecovery,
  criticalSessionProtection,
];

export const SCENARIO_MAP = Object.fromEntries(
  ALL_SCENARIOS.map((s) => [s.id, s]),
) as Record<string, ScenarioDefinition>;

export const SCENARIO_REGISTRY = SCENARIO_MAP;
