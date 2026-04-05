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
    'Show me the detailed timeline of connection drops',
    'Which regions are most affected?',
    'Generate a bug report for the firmware team',
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
    'Apply QoS optimization to the top 5 highest-risk subscribers',
    'Show me the degradation trend for the past month',
    'Generate proactive notification campaign',
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
    'Show me the top 20 users by saturation duration',
    'What plans should we recommend?',
    'Generate the targeted offer email template',
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
    'Show me the device breakdown by household size',
    'Which VAS packages have the highest conversion rate?',
    'Trigger the free-trial campaign for the top 50 households',
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
    'Show me the recovery timeline in detail',
    'Has this subscriber had similar issues before?',
    'View the gateway diagnostic log',
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
    'Show the QoS policy applied',
    'View session quality metrics during protection',
    'How many sessions were protected this week?',
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
