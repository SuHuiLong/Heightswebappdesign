import type { WorkspaceId } from './workspace-definitions';
import {
  DEFAULT_SUBSCRIBER_ID,
  DEFAULT_SUBSCRIBER_NAME,
  DEVICE_ENTITIES,
  getDevicesForSubscriber,
  getGatewaySiteLabel,
  getOrganizationsForRegion,
  getSubscribersForOrganization,
  ORGANIZATION_ENTITIES,
  ORGANIZATION_LABELS,
  REGION_LABELS,
  REGIONS,
  type ScopeSelection,
  SUBSCRIBER_ENTITIES,
  SUBSCRIBER_LABELS,
} from './scope-data';

export type WorkspaceScopeLevel = 'all' | 'region' | 'organization' | 'subscriber' | 'device';
export type ScopeCommandName = WorkspaceScopeLevel;
export type ScopePaletteStep = 'root' | WorkspaceScopeLevel;

export interface WorkspaceScenarioCard {
  id: string;
  title: string;
  description: string;
  query: string;
  icon: string;
  scenarioId?: string;
}

export interface WorkspaceScopeActionCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
  action?: string;
  scenarioId?: string;
}

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

export interface WorkspaceReasoningRail {
  idleSteps: ReasoningStep[];
  activeSteps: ReasoningStep[];
  backendActions: BackendAction[];
  auditEntries: AuditEntry[];
}

export interface ScopeCommandOption {
  id: string;
  label: string;
  description: string;
  commandLabel?: string;
  nextState?: ScopePaletteState;
  scope?: ScopeSelection;
}

export interface ScopePaletteState {
  targetLevel: ScopeCommandName | null;
  step: ScopePaletteStep;
  region?: string;
  organization?: string;
  subscriber?: string;
  device?: string;
}

interface WorkspaceScopeSpec {
  levelOrder: WorkspaceScopeLevel[];
  levelLabels: Partial<Record<WorkspaceScopeLevel, string>>;
  uppercaseLabels: Partial<Record<WorkspaceScopeLevel, string>>;
}

interface WorkspaceExperienceConfig {
  displayName: string;
  initialMessage: string;
  scenarioHeading: string;
  scopeActionHeading: string;
  reasoning: WorkspaceReasoningRail;
}

export interface SupportPresetQueryMatch {
  kind: 'ticket';
  ticketId: string;
  intro: string;
}

interface SupportHome {
  id: string;
  subscriberId: string;
  name: string;
  address: string;
  detail: string;
}

interface SupportGateway {
  id: string;
  homeId: string;
  subscriberId: string;
  name: string;
  detail: string;
}

interface SupportClientDevice {
  id: string;
  gatewayId: string;
  homeId: string;
  subscriberId: string;
  name: string;
  detail: string;
}

interface FleetCohort {
  id: string;
  regionId: string;
  organizationId: string;
  name: string;
  detail: string;
}

interface GrowthSegment {
  id: string;
  name: string;
  detail: string;
}

interface GrowthCampaign {
  id: string;
  segmentId: string;
  name: string;
  detail: string;
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const key = getKey(item);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

const OPERATIONS_SCOPE_SPEC: WorkspaceScopeSpec = {
  levelOrder: ['all', 'region', 'organization', 'subscriber'],
  levelLabels: {
    all: 'All (Fleet)',
    region: 'Region',
    organization: 'Organization',
    subscriber: 'Cohort',
  },
  uppercaseLabels: {
    all: 'ALL TENANTS (FLEET)',
    region: 'REGION',
    organization: 'ORGANIZATION',
    subscriber: 'COHORT',
  },
};

const SUPPORT_SCOPE_SPEC: WorkspaceScopeSpec = {
  levelOrder: ['region', 'organization', 'subscriber', 'device'],
  levelLabels: {
    region: 'Subscriber',
    organization: 'Home',
    subscriber: 'Gateway',
    device: 'Device',
  },
  uppercaseLabels: {
    region: 'SUBSCRIBER',
    organization: 'HOME',
    subscriber: 'GATEWAY',
    device: 'DEVICE',
  },
};

const GROWTH_SCOPE_SPEC: WorkspaceScopeSpec = {
  levelOrder: ['all', 'region', 'organization', 'subscriber'],
  levelLabels: {
    all: 'All Segments',
    region: 'Segment',
    organization: 'Campaign',
    subscriber: 'Subscriber',
  },
  uppercaseLabels: {
    all: 'ALL SEGMENTS',
    region: 'SEGMENT',
    organization: 'CAMPAIGN',
    subscriber: 'SUBSCRIBER',
  },
};

const WORKSPACE_SCOPE_SPECS: Record<WorkspaceId, WorkspaceScopeSpec> = {
  fleet: OPERATIONS_SCOPE_SPEC,
  support: SUPPORT_SCOPE_SPEC,
  growth: GROWTH_SCOPE_SPEC,
};

const CLIENT_DEVICE_TEMPLATES = [
  { suffix: 'iphone', name: 'iPhone 15 Pro', detail: 'Video calls, premium Wi-Fi eligible' },
  { suffix: 'tv', name: '4K Smart TV', detail: 'Peak evening streaming, QoE protected' },
  { suffix: 'console', name: 'Xbox Series X', detail: 'Latency-sensitive gaming endpoint' },
];

const SUPPORT_HOMES: SupportHome[] = SUBSCRIBER_ENTITIES.map((subscriber) => ({
  id: `home-${subscriber.id.toLowerCase()}`,
  subscriberId: subscriber.id,
  name: subscriber.serviceAddress,
  address: subscriber.serviceAddress,
  detail: `${subscriber.city} • ${subscriber.plan}`,
}));

const SUPPORT_HOMES_BY_SUBSCRIBER = groupBy(SUPPORT_HOMES, (home) => home.subscriberId);

const SUPPORT_GATEWAYS: SupportGateway[] = DEVICE_ENTITIES.map((device) => ({
  id: device.id,
  homeId: `home-${device.subscriberId.toLowerCase()}`,
  subscriberId: device.subscriberId,
  name: `${device.name} Gateway`,
  detail: `${device.model} • FW ${device.firmware} • Health ${device.healthScore}`,
}));

const SUPPORT_GATEWAYS_BY_HOME = groupBy(SUPPORT_GATEWAYS, (gateway) => gateway.homeId);

const SUPPORT_CLIENT_DEVICES: SupportClientDevice[] = SUPPORT_GATEWAYS.flatMap((gateway) =>
  CLIENT_DEVICE_TEMPLATES.map((template) => ({
    id: `${gateway.id}-${template.suffix}`,
    gatewayId: gateway.id,
    homeId: gateway.homeId,
    subscriberId: gateway.subscriberId,
    name: template.name,
    detail: template.detail,
  })),
);

const SUPPORT_CLIENT_DEVICES_BY_GATEWAY = groupBy(
  SUPPORT_CLIENT_DEVICES,
  (device) => device.gatewayId,
);

const FLEET_COHORTS: FleetCohort[] = ORGANIZATION_ENTITIES.flatMap((organization) => [
  {
    id: `${organization.id}-fw213`,
    regionId: organization.regionId,
    organizationId: organization.id,
    name: 'FW 2.1.3 Broadcom Gateways',
    detail: '47 gateways showing rising memory trend since Tuesday',
  },
  {
    id: `${organization.id}-rf-congestion`,
    regionId: organization.regionId,
    organizationId: organization.id,
    name: '5GHz Congestion Watchlist',
    detail: '3 cohorts correlated with subscriber complaint spikes',
  },
  {
    id: `${organization.id}-parental-controls`,
    regionId: organization.regionId,
    organizationId: organization.id,
    name: 'Parental Controls Rollout',
    detail: 'Install failures elevated on MTK-based deployments',
  },
]);

const FLEET_COHORTS_BY_ORGANIZATION = groupBy(
  FLEET_COHORTS,
  (cohort) => cohort.organizationId,
);

const GROWTH_SEGMENTS: GrowthSegment[] = [
  {
    id: 'bandwidth-constrained-households',
    name: 'Bandwidth-Constrained Households',
    detail: 'High nightly saturation with no open support ticket',
  },
  {
    id: 'premium-wifi-retention',
    name: 'Premium Wi-Fi Retention',
    detail: 'Existing subscribers showing QoE decline and churn signals',
  },
  {
    id: 'family-safety-expansion',
    name: 'Family Safety Expansion',
    detail: 'Homes with children devices and no parental controls subscription',
  },
];

const GROWTH_CAMPAIGNS: GrowthCampaign[] = [
  {
    id: 'premium-upgrade-q2',
    segmentId: 'bandwidth-constrained-households',
    name: 'Premium Upgrade Q2',
    detail: 'Target homes hitting >85% WAN utilization for 30 days',
  },
  {
    id: 'video-call-protection',
    segmentId: 'bandwidth-constrained-households',
    name: 'Video Call Protection',
    detail: 'Bundle QoE protection with faster upload tiers',
  },
  {
    id: 'save-at-risk-tier',
    segmentId: 'premium-wifi-retention',
    name: 'Save At-Risk Tier',
    detail: 'Retention offer for subscribers with declining usage',
  },
  {
    id: 'premium-wifi-roi',
    segmentId: 'premium-wifi-retention',
    name: 'Premium Wi-Fi ROI',
    detail: 'Measure conversion and NPS lift after remediation',
  },
  {
    id: 'family-controls-launch',
    segmentId: 'family-safety-expansion',
    name: 'Family Controls Launch',
    detail: 'Cross-sell parental controls to family households',
  },
  {
    id: 'device-safety-bundle',
    segmentId: 'family-safety-expansion',
    name: 'Device Safety Bundle',
    detail: 'Bundle controls with device fingerprint targeting',
  },
];

const GROWTH_CAMPAIGNS_BY_SEGMENT = groupBy(
  GROWTH_CAMPAIGNS,
  (campaign) => campaign.segmentId,
);

const GROWTH_CAMPAIGN_SUBSCRIBERS: Record<string, string[]> = {
  'premium-upgrade-q2': ['SUB-7834', 'SUB-5568', 'SUB-7790'],
  'video-call-protection': ['SUB-4521', 'SUB-1013', 'SUB-8902'],
  'save-at-risk-tier': ['SUB-3344', 'SUB-6679', 'SUB-8891'],
  'premium-wifi-roi': ['SUB-1234', 'SUB-4522', 'SUB-1016'],
  'family-controls-launch': ['SUB-7835', 'SUB-6678', 'SUB-8894'],
  'device-safety-bundle': ['SUB-3351', 'SUB-6682', 'SUB-9902'],
};

function getSupportHomesForSubscriber(subscriberId?: string) {
  return subscriberId ? SUPPORT_HOMES_BY_SUBSCRIBER[subscriberId] ?? [] : SUPPORT_HOMES;
}

function getSupportGatewaysForHome(homeId?: string) {
  return homeId ? SUPPORT_GATEWAYS_BY_HOME[homeId] ?? [] : SUPPORT_GATEWAYS;
}

function getSupportDevicesForGateway(gatewayId?: string) {
  return gatewayId ? SUPPORT_CLIENT_DEVICES_BY_GATEWAY[gatewayId] ?? [] : SUPPORT_CLIENT_DEVICES;
}

function getFleetCohortsForOrganization(organizationId?: string) {
  return organizationId ? FLEET_COHORTS_BY_ORGANIZATION[organizationId] ?? [] : FLEET_COHORTS;
}

function getGrowthCampaignsForSegment(segmentId?: string) {
  return segmentId ? GROWTH_CAMPAIGNS_BY_SEGMENT[segmentId] ?? [] : GROWTH_CAMPAIGNS;
}

function getGrowthSubscribersForCampaign(campaignId?: string) {
  const subscriberIds = campaignId ? GROWTH_CAMPAIGN_SUBSCRIBERS[campaignId] ?? [] : [];
  return subscriberIds
    .map((subscriberId) =>
      SUBSCRIBER_ENTITIES.find((subscriber) => subscriber.id === subscriberId),
    )
    .filter((subscriber): subscriber is (typeof SUBSCRIBER_ENTITIES)[number] => Boolean(subscriber));
}

export const OPERATIONS_SCENARIOS: WorkspaceScenarioCard[] = [
  {
    id: 'ops-firmware',
    title: 'Post-Rollout Hidden Regression',
    description: 'Trace the FW 2.1 rollback candidate AI found across Broadcom-heavy cohorts.',
    query: 'Investigate the FW 2.1.3 memory regression across impacted cohorts and show projected critical risk over the next 5 days.',
    icon: 'activity',
    scenarioId: 'firmware-regression',
  },
  {
    id: 'ops-regional-incident',
    title: 'Regional Incident Interpretation',
    description: 'Explain the correlated outage AI stitched together across three South Region PoPs.',
    query: 'Explain the current South Region incident, show the affected footprint, and summarize what operators should do next.',
    icon: 'radio',
    scenarioId: 'regional-incident',
  },
  {
    id: 'ops-cost-forecast',
    title: 'Proactive Cost Forecast',
    description: 'Project next month’s ingestion cost before fleet growth pushes the plan out of bounds.',
    query: 'Forecast next month’s ingestion cost with 15% fleet growth and highlight the budget risk.',
    icon: 'layers',
    scenarioId: 'resource-planning',
  },
];

export const SUPPORT_SCENARIOS: WorkspaceScenarioCard[] = [
  {
    id: 'sup-auto-recovery',
    title: 'Autonomous Wi-Fi Recovery',
    description: 'Wi-Fi interference auto-resolved on 3 homes today.',
    query: 'Show the homes AI auto-recovered today, explain what interference was found, and verify the fix outcome.',
    icon: 'wifi',
    scenarioId: 'autonomous-wifi-recovery',
  },
  {
    id: 'sup-session-protection',
    title: 'Critical Session Protection',
    description: '2 video calls were protected during peak congestion.',
    query: 'Show the sessions AI protected during peak congestion and explain which QoS actions kept them stable.',
    icon: 'shield',
    scenarioId: 'critical-session-protection',
  },
  {
    id: 'sup-firmware-investigation',
    title: 'Firmware Regression Investigation',
    description: 'FW 2.1.3 causing IoT disconnects, traced by AI to an ACS config change.',
    query: 'Open the firmware regression case, summarize AI root-cause evidence, and list what still needs human review.',
    icon: 'cpu',
    scenarioId: 'firmware-regression',
  },
  {
    id: 'sup-slow-speed',
    title: 'User-Reported Slow Speed',
    description: 'Subscriber #4820 reported slow service and AI isolated the issue to local 5GHz congestion.',
    query: 'Open the slow-speed complaint for subscriber #4820 and show the AI diagnosis, verification, and next action.',
    icon: 'zap',
  },
];

const SUPPORT_PRESET_QUERY_MATCHERS: Array<{
  pattern: RegExp;
  match: SupportPresetQueryMatch;
}> = [
  {
    pattern: /this subscriber reports slow internet\. what did ai find\??/i,
    match: {
      kind: 'ticket',
      ticketId: 'TKT-4820',
      intro:
        'I found the related slow-speed case. Here is what AI diagnosed, how it fixed it, and what was verified afterward.',
    },
  },
  {
    pattern: /slow[-\s]speed complaint|slow internet|slow service/i,
    match: {
      kind: 'ticket',
      ticketId: 'TKT-4820',
      intro:
        'I found the related slow-speed case. Here is what AI diagnosed, how it fixed it, and what was verified afterward.',
    },
  },
];

export function getSupportPresetQueryMatch(
  query: string,
): SupportPresetQueryMatch | null {
  if (!query.trim()) {
    return null;
  }

  const matcher = SUPPORT_PRESET_QUERY_MATCHERS.find(({ pattern }) =>
    pattern.test(query),
  );

  return matcher?.match ?? null;
}

export const GROWTH_SCENARIOS: WorkspaceScenarioCard[] = [
  {
    id: 'grw-upsell-candidates',
    title: 'Bandwidth Upsell Candidates',
    description: '2,340 households are showing sustained saturation with high upgrade confidence.',
    query: 'Rank the highest-confidence bandwidth upsell candidates and explain which usage signals are driving the score.',
    icon: 'trending-up',
    scenarioId: 'bandwidth-upsell',
  },
  {
    id: 'grw-churn-risk',
    title: 'Pre-Churn Rescue',
    description: '47 subscribers were flagged this week despite having no active support tickets.',
    query: 'Show subscribers at highest churn risk this week, especially those with declining usage and no open tickets.',
    icon: 'alert-triangle',
    scenarioId: 'churn-prevention',
  },
  {
    id: 'grw-vas-opportunity',
    title: 'VAS Opportunity',
    description: '847 households have gaming consoles or children\'s devices but no parental control subscription.',
    query: 'Identify households with devices that indicate untapped VAS potential (gaming consoles, children\'s devices) but no corresponding subscription.',
    icon: 'sparkles',
    scenarioId: 'vas-device-fingerprint',
  },
];

function buildOperationsScopeActions(scope: ScopeSelection): WorkspaceScopeActionCard[] {
  const label = getWorkspaceScopeDisplayLabel('fleet', scope);

  switch (scope.level) {
    case 'region':
      return [
        {
          id: 'region-rollout-regression',
          title: 'Rollout regressions',
          description: `Check which firmware or service rollouts in ${label} are drifting away from baseline.`,
          prompt: `Show rollout regressions emerging in ${label} and explain which cohorts are moving first.`,
          scenarioId: 'firmware-regression',
        },
        {
          id: 'region-incident-interpretation',
          title: 'Regional incident',
          description: `Summarize the correlated incident signals operators need to understand in ${label}.`,
          prompt: `Interpret the active incident footprint in ${label} and summarize the likely root cause.`,
          scenarioId: 'regional-incident',
        },
        {
          id: 'region-cost-forecast',
          title: 'Growth cost forecast',
          description: `Project whether fleet growth in ${label} pushes ingest cost beyond plan.`,
          prompt: `Forecast ingest cost growth for ${label} next month and highlight any budget risk.`,
          scenarioId: 'resource-planning',
        },
        {
          id: 'region-cohorts-at-risk',
          title: 'Highest-risk cohorts',
          description: `Rank the cohorts in ${label} that are most likely to become operator work next.`,
          prompt: `Rank the highest-risk cohorts in ${label} and explain what would justify intervention now.`,
          scenarioId: 'firmware-regression',
        },
      ];
    case 'organization':
      return [
        {
          id: 'org-rollout-regression',
          title: 'Rollout regressions',
          description: `Review rollout health inside ${label} and isolate the cohort diverging from baseline.`,
          prompt: `Review rollout regressions inside ${label} and identify the cohort most likely to require rollback.`,
          scenarioId: 'firmware-regression',
        },
        {
          id: 'org-incident-summary',
          title: 'Service impact summary',
          description: `Explain how the current incident is affecting ${label} and where the pressure concentrates.`,
          prompt: `Summarize current incident impact for ${label} and show the operator-facing risk.`,
          scenarioId: 'regional-incident',
        },
        {
          id: 'org-cost-forecast',
          title: 'Next-month cost risk',
          description: `Project the next cost step-up for ${label} before the next expansion window.`,
          prompt: `Forecast next month’s ingestion cost for ${label} and explain the confidence range.`,
          scenarioId: 'resource-planning',
        },
        {
          id: 'org-compare-stable-baseline',
          title: 'Stable vs failing cohort',
          description: `Compare the leading at-risk cohort in ${label} against the last stable baseline.`,
          prompt: `Compare the failing cohort in ${label} with the last stable baseline and explain the delta.`,
          scenarioId: 'firmware-regression',
        },
      ];
    case 'subscriber':
      return [
        {
          id: 'sub-rollout-risk',
          title: 'Rollout risk',
          description: `Check whether ${label} is now the cohort most likely to trigger fleet intervention.`,
          prompt: `Explain the rollout risk for ${label} and why it is or is not the leading rollback candidate.`,
          scenarioId: 'firmware-regression',
        },
        {
          id: 'sub-incident-path',
          title: 'Incident path',
          description: `See how the incident would flow from backbone impact down to ${label}.`,
          prompt: `Show how the current incident path affects ${label} and what operators should watch next.`,
          scenarioId: 'regional-incident',
        },
        {
          id: 'sub-growth-forecast',
          title: 'Cost if growth continues',
          description: `Project the cost impact if ${label} keeps growing at the current rate.`,
          prompt: `Forecast the ingest cost if ${label} continues growing at the current pace.`,
          scenarioId: 'resource-planning',
        },
        {
          id: 'sub-rollback-plan',
          title: 'Draft rollback plan',
          description: `Prepare the staged rollback or mitigation plan for ${label}.`,
          prompt: `Draft a rollback plan for ${label} and summarize the operator risk if action is delayed.`,
          scenarioId: 'firmware-regression',
        },
      ];
    case 'all':
    default:
      return [
        {
          id: 'all-rollout-regressions',
          title: 'Rollout regressions',
          description: 'Find the rollouts that are quietly drifting toward rollback.',
          prompt: 'Show the post-rollout regressions emerging across the fleet and identify the most urgent cohort.',
          scenarioId: 'firmware-regression',
        },
        {
          id: 'all-regional-incidents',
          title: 'Regional incidents',
          description: 'Summarize the incident patterns operators should understand before paging more teams.',
          prompt: 'Interpret the active regional incidents across the fleet and summarize the biggest operator risk.',
          scenarioId: 'regional-incident',
        },
        {
          id: 'all-growth-cost',
          title: 'Growth cost forecast',
          description: 'Project the ingest-cost impact of near-term fleet growth before budget gets surprised.',
          prompt: 'Forecast next month’s fleet ingestion cost with current growth assumptions and highlight any budget risk.',
          scenarioId: 'resource-planning',
        },
        {
          id: 'all-priority-cohorts',
          title: 'Priority cohorts',
          description: 'Rank the cohorts most likely to become operator work in the next few days.',
          prompt: 'Rank the fleet cohorts that need operator attention first and explain why.',
          scenarioId: 'firmware-regression',
        },
      ];
  }
}

function buildSupportScopeActions(scope: ScopeSelection): WorkspaceScopeActionCard[] {
  const label = getWorkspaceScopeDisplayLabel('support', scope);

  switch (scope.level) {
    case 'organization':
      return [
        {
          id: 'org-home-recovery',
          title: 'Recovery timeline',
          description: `Review the autonomous Wi-Fi recovery AI already completed at ${label}.`,
          prompt: `Show the autonomous Wi-Fi recovery timeline for ${label} and explain how AI verified the fix.`,
          scenarioId: 'autonomous-wifi-recovery',
        },
        {
          id: 'org-home-protected-session',
          title: 'Protected sessions',
          description: `Review the high-value sessions AI protected at ${label}.`,
          prompt: `Show the protected sessions at ${label} and explain which QoS actions kept them stable.`,
          scenarioId: 'critical-session-protection',
        },
        {
          id: 'org-home-firmware-case',
          title: 'Rollback review',
          description: `Open the firmware case at ${label} that still needs human judgment.`,
          prompt: `Open the firmware rollback case for ${label} and summarize what still needs human review.`,
          scenarioId: 'firmware-regression',
        },
        {
          id: 'org-home-pending-validation',
          title: 'Pending validation',
          description: `Check which AI-applied fixes at ${label} are still waiting for sign-off.`,
          prompt: `Show pending validation work for ${label} and explain why the case is not fully closed yet.`,
          scenarioId: 'firmware-regression',
        },
      ];
    case 'subscriber':
      return [
        {
          id: 'sub-gateway-validation',
          title: 'Post-fix validation',
          description: `Verify that the latest AI recovery on ${label} is still holding.`,
          prompt: `Run a post-fix validation for ${label} and summarize the autonomous recovery result.`,
          scenarioId: 'autonomous-wifi-recovery',
        },
        {
          id: 'sub-gateway-protected-session',
          title: 'Protected session review',
          description: `Show how AI protected the last critical session on ${label}.`,
          prompt: `Review the protected session on ${label} and explain the QoS actions that kept it stable.`,
          scenarioId: 'critical-session-protection',
        },
        {
          id: 'sub-gateway-root-cause',
          title: 'Root-cause summary',
          description: `Open the firmware rollback evidence tied to ${label}.`,
          prompt: `Show the firmware rollback evidence for ${label} and explain why human review is still required.`,
          scenarioId: 'firmware-regression',
        },
        {
          id: 'sub-gateway-stability',
          title: 'Current stability',
          description: `Validate whether ${label} is stable enough to keep the case closed.`,
          prompt: `Validate current stability for ${label} and call out any remaining support risk.`,
          scenarioId: 'autonomous-wifi-recovery',
        },
      ];
    case 'device':
      return [
        {
          id: 'sub-device-interference',
          title: 'Device interference check',
          description: `Validate whether ${label} is still affected by interference.`,
          prompt: `Check whether ${label} is still seeing interference and explain the latest recovery evidence.`,
          scenarioId: 'autonomous-wifi-recovery',
        },
        {
          id: 'sub-device-session-protection',
          title: 'Session protection',
          description: `Review how AI protected active sessions for ${label}.`,
          prompt: `Show how AI protected active sessions for ${label} during the last incident window.`,
          scenarioId: 'critical-session-protection',
        },
        {
          id: 'sub-device-connectivity',
          title: 'Connectivity validation',
          description: `Verify current connectivity health for ${label}.`,
          prompt: `Validate current connectivity health for ${label} and summarize any remaining support risk.`,
          scenarioId: 'autonomous-wifi-recovery',
        },
        {
          id: 'sub-device-rollback-evidence',
          title: 'Rollback evidence',
          description: `Surface the firmware evidence tied to ${label} before you escalate the case.`,
          prompt: `Open the firmware rollback evidence for ${label} and summarize what still needs human review.`,
          scenarioId: 'firmware-regression',
        },
      ];
    case 'region':
    default:
      return [
        {
          id: 'all-cases-ai-resolved',
          title: 'Cases AI resolved today',
          description: 'Review zero-touch cases AI closed without human intervention.',
          prompt: 'Show the cases AI fully resolved today and summarize what was fixed.',
          scenarioId: 'autonomous-wifi-recovery',
        },
        {
          id: 'all-protected-sessions',
          title: 'Protected sessions',
          description: 'Review the high-value sessions AI kept stable during peak congestion.',
          prompt: 'Show the protected sessions AI handled today and explain which QoS actions kept them stable.',
          scenarioId: 'critical-session-protection',
        },
        {
          id: 'all-cases-needing-attention',
          title: 'Cases needing my attention',
          description: 'Surface the firmware or rollback cases AI could not safely finish on its own.',
          prompt: 'Show the support cases that still need human review and summarize the blocked rollback evidence.',
          scenarioId: 'firmware-regression',
        },
        {
          id: 'all-pending-validations',
          title: 'Pending validations',
          description: 'Check which AI fixes are waiting for verification.',
          prompt: 'Show AI fixes waiting for validation and explain what still needs to be confirmed before closure.',
          scenarioId: 'firmware-regression',
        },
      ];
  }
}

function buildGrowthScopeActions(scope: ScopeSelection): WorkspaceScopeActionCard[] {
  const label = getWorkspaceScopeDisplayLabel('growth', scope);

  switch (scope.level) {
    case 'region':
      return [
        {
          id: 'region-segment-opportunities',
          title: 'Best opportunities in segment',
          description: `Rank the most valuable opportunities inside ${label}.`,
          prompt: `Rank the most valuable opportunities inside ${label} and explain the scoring factors.`,
          scenarioId: 'bandwidth-upsell',
        },
        {
          id: 'region-segment-churn',
          title: 'Churn rescue priorities',
          description: `See which homes inside ${label} need intervention before they quietly churn.`,
          prompt: `Show the churn rescue priorities inside ${label} and explain the silent-sufferer signals.`,
          scenarioId: 'churn-prevention',
        },
        {
          id: 'region-segment-vas',
          title: 'VAS fit scan',
          description: `Find households inside ${label} that already look ready for a device-led add-on.`,
          prompt: `Identify the best VAS-fit households inside ${label} using device fingerprints and subscription gaps.`,
          scenarioId: 'vas-device-fingerprint',
        },
        {
          id: 'region-segment-revenue',
          title: 'Revenue impact',
          description: `Forecast the revenue upside if ${label} converts at the current propensity level.`,
          prompt: `Forecast the revenue impact for ${label} if the top upsell opportunities convert at current rates.`,
          scenarioId: 'bandwidth-upsell',
        },
      ];
    case 'organization':
      return [
        {
          id: 'org-campaign-roi',
          title: 'Campaign ROI tracker',
          description: `Review the ROI trend for ${label}.`,
          prompt: `Show the ROI tracker for ${label} and explain where conversion is being won or lost.`,
          scenarioId: 'bandwidth-upsell',
        },
        {
          id: 'org-campaign-churn',
          title: 'Save-at-risk subscribers',
          description: `Surface the subscribers inside ${label} most likely to churn without outreach.`,
          prompt: `Show the subscribers inside ${label} most at risk of churn and explain the rescue priority.`,
          scenarioId: 'churn-prevention',
        },
        {
          id: 'org-campaign-vas',
          title: 'Device-led offers',
          description: `Find the households inside ${label} where connected devices suggest a missing add-on.`,
          prompt: `Show the households inside ${label} where device fingerprints suggest an untapped VAS offer.`,
          scenarioId: 'vas-device-fingerprint',
        },
        {
          id: 'org-campaign-next-offer',
          title: 'Next-best offer',
          description: `Recommend the next offer adjustment for ${label}.`,
          prompt: `Recommend the next-best offer for ${label} based on current conversion and churn signals.`,
          scenarioId: 'bandwidth-upsell',
        },
      ];
    case 'subscriber':
      return [
        {
          id: 'sub-upsell-confidence',
          title: 'Upsell confidence',
          description: `Explain why ${label} is or is not likely to convert.`,
          prompt: `Explain the upsell confidence score for ${label} and the evidence behind it.`,
          scenarioId: 'bandwidth-upsell',
        },
        {
          id: 'sub-churn-save-offer',
          title: 'Save offer',
          description: `Recommend the best save offer for ${label}.`,
          prompt: `Recommend the best churn save offer for ${label} and explain the expected impact.`,
          scenarioId: 'churn-prevention',
        },
        {
          id: 'sub-vas-fit',
          title: 'VAS fit',
          description: `Check whether ${label} looks like a strong fit for a device-led add-on.`,
          prompt: `Explain whether ${label} is a strong VAS-fit household based on device fingerprints and subscription gaps.`,
          scenarioId: 'vas-device-fingerprint',
        },
        {
          id: 'sub-similar-households',
          title: 'Compare similar households',
          description: `Compare ${label} with similar subscribers in the same campaign.`,
          prompt: `Compare ${label} with similar subscribers in the same campaign and explain where it differs.`,
          scenarioId: 'bandwidth-upsell',
        },
      ];
    case 'all':
    default:
      return [
        {
          id: 'all-top-upsell-candidates',
          title: 'Top 10 upsell candidates',
          description: 'Show the strongest AI-ranked upsell opportunities this week.',
          prompt: 'Show this week’s top 10 upsell candidates and explain why AI ranked them highest.',
          scenarioId: 'bandwidth-upsell',
        },
        {
          id: 'all-churn-risk-no-tickets',
          title: 'Churn risk with no tickets',
          description: 'Find subscribers whose usage and sentiment are declining without support activity.',
          prompt: 'Show subscribers at churn risk who have no open tickets and explain the early warning signals.',
          scenarioId: 'churn-prevention',
        },
        {
          id: 'all-vas-opportunity',
          title: 'VAS opportunity scan',
          description: 'Find households with devices that indicate untapped VAS potential.',
          prompt: 'Identify households with gaming consoles or children\'s devices but no parental control subscription, and estimate the revenue opportunity.',
          scenarioId: 'vas-device-fingerprint',
        },
        {
          id: 'all-revenue-impact',
          title: 'Revenue impact',
          description: 'Forecast near-term revenue upside from the strongest current growth motions.',
          prompt: 'Forecast the near-term revenue impact of the strongest current growth opportunities and recommend where to focus next.',
          scenarioId: 'bandwidth-upsell',
        },
      ];
  }
}

const ALL_OPS_SCOPE_ACTIONS = [
  ...buildOperationsScopeActions({ level: 'all' }),
  ...buildOperationsScopeActions({ level: 'region', region: 'north' }),
  ...buildOperationsScopeActions({
    level: 'organization',
    region: 'north',
    organization: 'acme-isp',
  }),
  ...buildOperationsScopeActions({
    level: 'subscriber',
    region: 'north',
    organization: 'acme-isp',
    subscriber: 'acme-isp-fw213',
  }),
];

const ALL_SUPPORT_SCOPE_ACTIONS = [
  ...buildSupportScopeActions({ level: 'region', region: DEFAULT_SUBSCRIBER_ID }),
  ...buildSupportScopeActions({
    level: 'organization',
    region: DEFAULT_SUBSCRIBER_ID,
    organization: `home-${DEFAULT_SUBSCRIBER_ID.toLowerCase()}`,
  }),
  ...buildSupportScopeActions({
    level: 'subscriber',
    region: DEFAULT_SUBSCRIBER_ID,
    organization: `home-${DEFAULT_SUBSCRIBER_ID.toLowerCase()}`,
    subscriber: getDevicesForSubscriber(DEFAULT_SUBSCRIBER_ID)[0]?.id,
  }),
  ...buildSupportScopeActions({
    level: 'device',
    region: DEFAULT_SUBSCRIBER_ID,
    organization: `home-${DEFAULT_SUBSCRIBER_ID.toLowerCase()}`,
    subscriber: getDevicesForSubscriber(DEFAULT_SUBSCRIBER_ID)[0]?.id,
    device: `${getDevicesForSubscriber(DEFAULT_SUBSCRIBER_ID)[0]?.id ?? 'GW-7834-HOME'}-iphone`,
  }),
];

const ALL_GROWTH_SCOPE_ACTIONS = [
  ...buildGrowthScopeActions({ level: 'all' }),
  ...buildGrowthScopeActions({ level: 'region', region: 'bandwidth-constrained-households' }),
  ...buildGrowthScopeActions({
    level: 'organization',
    region: 'bandwidth-constrained-households',
    organization: 'premium-upgrade-q2',
  }),
  ...buildGrowthScopeActions({
    level: 'subscriber',
    region: 'bandwidth-constrained-households',
    organization: 'premium-upgrade-q2',
    subscriber: 'SUB-7834',
  }),
];

export { ALL_OPS_SCOPE_ACTIONS, ALL_SUPPORT_SCOPE_ACTIONS, ALL_GROWTH_SCOPE_ACTIONS };

export const WORKSPACE_EXPERIENCE: Record<WorkspaceId, WorkspaceExperienceConfig> = {
  fleet: {
    displayName: 'Fleet Intelligence',
    initialMessage:
      '12,458 online. 23 degraded. 1 emerging pattern: FW 2.1.3 memory trend across Region North projected critical in ~5 days.',
    scenarioHeading: 'AI DETECTED',
    scopeActionHeading: 'AI RECOMMENDED NEXT STEPS',
    reasoning: {
      idleSteps: [
        {
          id: 'ops-idle-baseline',
          label: 'Fleet health baseline',
          detail: '12,489 devices across 6 regions. 23 degraded, 8 offline, all within watch thresholds except one cohort.',
          confidence: 0.97,
          status: 'complete',
        },
        {
          id: 'ops-idle-anomaly',
          label: 'Anomaly detection',
          detail: 'Applied a 14-day rolling baseline and isolated one emerging memory trend in the FW 2.1.3 cohort.',
          confidence: 0.94,
          status: 'complete',
        },
        {
          id: 'ops-idle-risk',
          label: 'Predictive risk',
          detail: 'FW 2.1.3 is projected to cross the critical threshold in ~5 days if the current slope holds.',
          confidence: 0.91,
          status: 'complete',
        },
      ],
      activeSteps: [
        {
          id: 'ops-active-parse',
          label: 'Parsing fleet prompt',
          detail: 'Extracting scope, incident family, and timeframe from the fleet investigation request.',
          confidence: 1,
          status: 'complete',
        },
        {
          id: 'ops-active-telemetry',
          label: 'Resolving telemetry context',
          detail: 'Pulling cohort telemetry, deployment history, and subscriber complaint correlations.',
          status: 'in-progress',
        },
        {
          id: 'ops-active-correlation',
          label: 'Correlating anomalies',
          detail: 'Pending: cross-checking firmware, region, and service deployment signals.',
          status: 'pending',
        },
        {
          id: 'ops-active-remediation',
          label: 'Drafting remediation view',
          detail: 'Pending: assembling rollback, compare-version, and support drill-down actions.',
          status: 'pending',
        },
      ],
      backendActions: [
        {
          id: 'ops-action-telemetry',
          label: 'Queried telemetry and cohort store',
          status: 'success',
          timestamp: '2 min ago',
        },
        {
          id: 'ops-action-prediction',
          label: 'Computed predictive degradation score',
          status: 'success',
          timestamp: '1 min ago',
        },
        {
          id: 'ops-action-insights',
          label: 'Generated fleet insight cards',
          status: 'success',
          timestamp: 'just now',
        },
      ],
      auditEntries: [
        {
          id: 'ops-audit-1',
          action: 'Fleet baseline refreshed for 6 regions',
          actor: 'AI Assistant',
          timestamp: '10:42 AM',
          type: 'query',
        },
        {
          id: 'ops-audit-2',
          action: 'FW 2.1.3 cohort flagged for predictive memory pressure',
          actor: 'AI Engine',
          timestamp: '10:42 AM',
          type: 'alert',
        },
        {
          id: 'ops-audit-3',
          action: 'Rollback readiness draft generated for Region North',
          actor: 'System',
          timestamp: '10:41 AM',
          type: 'system',
        },
      ],
    },
  },
  support: {
    displayName: 'Support',
    initialMessage:
      '14 cases auto-resolved today. 3 need your review. 1 escalation pending.',
    scenarioHeading: 'AI HANDLED',
    scopeActionHeading: 'AI RECOMMENDED NEXT STEPS',
    reasoning: {
      idleSteps: [
        {
          id: 'sup-idle-triage',
          label: 'Open case triage',
          detail: 'Sorted active cases by severity, customer impact, and whether AI can safely finish the fix.',
          confidence: 0.96,
          status: 'complete',
        },
        {
          id: 'sup-idle-resolution',
          label: 'Resolution rate',
          detail: '14 cases auto-resolved today. 3 require review because verification or rollback risk is still open.',
          confidence: 0.92,
          status: 'complete',
        },
        {
          id: 'sup-idle-escalation',
          label: 'Escalation risk',
          detail: '1 case is trending toward escalation after AI exhausted safe remediation options.',
          confidence: 0.9,
          status: 'complete',
        },
      ],
      activeSteps: [
        {
          id: 'sup-active-parse',
          label: 'Parsing support request',
          detail: 'Extracting the case, subscriber, home, or gateway context from the incoming prompt.',
          confidence: 1,
          status: 'complete',
        },
        {
          id: 'sup-active-context',
          label: 'Pulling case and home context',
          detail: 'Loading ticket history, gateway telemetry, and the last AI interventions.',
          status: 'in-progress',
        },
        {
          id: 'sup-active-resolution',
          label: 'Evaluating fix vs escalate',
          detail: 'Pending: comparing current evidence against safe autonomous actions.',
          status: 'pending',
        },
        {
          id: 'sup-active-plan',
          label: 'Preparing resolution plan',
          detail: 'Pending: drafting the next AI or human follow-up action.',
          status: 'pending',
        },
      ],
      backendActions: [
        {
          id: 'sup-action-cases',
          label: 'Queried case, subscriber, and gateway timelines',
          status: 'success',
          timestamp: '2 min ago',
        },
        {
          id: 'sup-action-verification',
          label: 'Checked post-fix validation outcomes',
          status: 'success',
          timestamp: '1 min ago',
        },
        {
          id: 'sup-action-queue',
          label: 'Ranked cases needing human review',
          status: 'success',
          timestamp: 'just now',
        },
      ],
      auditEntries: [
        {
          id: 'sup-audit-1',
          action: 'Auto-resolved Wi-Fi interference on 3 homes',
          actor: 'AI Assistant',
          timestamp: '10:39 AM',
          type: 'action',
        },
        {
          id: 'sup-audit-2',
          action: 'Escalation risk raised on firmware rollback case',
          actor: 'AI Engine',
          timestamp: '10:38 AM',
          type: 'alert',
        },
        {
          id: 'sup-audit-3',
          action: 'Pending validations refreshed for the support queue',
          actor: 'System',
          timestamp: '10:37 AM',
          type: 'system',
        },
      ],
    },
  },
  growth: {
    displayName: 'Growth',
    initialMessage:
      '2,340 upsell candidates identified. 47 subscribers flagged high churn risk this week.',
    scenarioHeading: 'AI IDENTIFIED',
    scopeActionHeading: 'AI RECOMMENDED NEXT STEPS',
    reasoning: {
      idleSteps: [
        {
          id: 'grw-idle-churn',
          label: 'Churn risk scan',
          detail: 'Combined usage decline, case history, and QoE drop signals to isolate the highest-risk subscribers.',
          confidence: 0.95,
          status: 'complete',
        },
        {
          id: 'grw-idle-upsell',
          label: 'Upsell opportunity scoring',
          detail: 'Scored bandwidth saturation, product fit, and QoE improvement potential to rank expansion candidates.',
          confidence: 0.92,
          status: 'complete',
        },
        {
          id: 'grw-idle-health',
          label: 'Segment health',
          detail: 'Refreshed segment and campaign health to show where conversion and retention are trending.',
          confidence: 0.89,
          status: 'complete',
        },
      ],
      activeSteps: [
        {
          id: 'grw-active-parse',
          label: 'Parsing growth query',
          detail: 'Extracting segment, campaign, and offer intent from the prompt.',
          confidence: 1,
          status: 'complete',
        },
        {
          id: 'grw-active-signals',
          label: 'Loading segment and offer signals',
          detail: 'Pulling usage, churn, NPS, and conversion data for the selected audience.',
          status: 'in-progress',
        },
        {
          id: 'grw-active-scoring',
          label: 'Scoring churn and upsell propensity',
          detail: 'Pending: ranking subscribers and offers by expected impact.',
          status: 'pending',
        },
        {
          id: 'grw-active-recommendation',
          label: 'Drafting target recommendations',
          detail: 'Pending: assembling next-best actions and campaign guidance.',
          status: 'pending',
        },
      ],
      backendActions: [
        {
          id: 'grw-action-signals',
          label: 'Queried segment, campaign, and offer signals',
          status: 'success',
          timestamp: '2 min ago',
        },
        {
          id: 'grw-action-propensity',
          label: 'Computed churn and upsell propensity scores',
          status: 'success',
          timestamp: '1 min ago',
        },
        {
          id: 'grw-action-recommendations',
          label: 'Generated predictive opportunity cards',
          status: 'success',
          timestamp: 'just now',
        },
      ],
      auditEntries: [
        {
          id: 'grw-audit-1',
          action: 'Updated top upsell candidates for this week',
          actor: 'AI Assistant',
          timestamp: '10:40 AM',
          type: 'query',
        },
        {
          id: 'grw-audit-2',
          action: 'High churn risk cohort flagged with no ticket activity',
          actor: 'AI Engine',
          timestamp: '10:39 AM',
          type: 'alert',
        },
        {
          id: 'grw-audit-3',
          action: 'Premium Wi-Fi campaign ROI refreshed',
          actor: 'System',
          timestamp: '10:38 AM',
          type: 'system',
        },
      ],
    },
  },
};

function normalizeScopeSearchValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function matchesScopeQuery(query: string, ...values: Array<string | undefined>) {
  if (!query) return true;
  const normalizedQuery = normalizeScopeSearchValue(query);
  return values.some((value) =>
    normalizeScopeSearchValue(value ?? '').includes(normalizedQuery),
  );
}

function getWorkspaceSelectorLabel(
  workspaceId: WorkspaceId,
  level: WorkspaceScopeLevel,
) {
  return WORKSPACE_SCOPE_SPECS[workspaceId].levelLabels[level] ?? level;
}

function getScopeValue(scope: ScopeSelection, level: WorkspaceScopeLevel) {
  switch (level) {
    case 'all':
      return scope.level === 'all' ? 'all' : undefined;
    case 'region':
      return scope.region;
    case 'organization':
      return scope.organization;
    case 'subscriber':
      return scope.subscriber;
    case 'device':
      return scope.device;
  }
}

interface ScopeEntityOption {
  id: string;
  label: string;
  description: string;
  selection: ScopeSelection;
  commandLabel: string;
}

function getOperationsScopeOptions(
  level: WorkspaceScopeLevel,
  state: ScopePaletteState,
): ScopeEntityOption[] {
  switch (level) {
    case 'all':
      return [
        {
          id: 'all',
          label: 'All (Fleet)',
          description: 'Reset to the global fleet scope.',
          selection: { level: 'all' },
          commandLabel: '/all',
        },
      ];
    case 'region':
      return REGIONS.filter((region) => region.id !== 'all').map((region) => ({
        id: region.id,
        label: region.name,
        description: `${region.organizationCount} orgs • ${region.deviceCount} devices`,
        selection: { level: 'region', region: region.id },
        commandLabel: `/region ${region.id}`,
      }));
    case 'organization':
      return getOrganizationsForRegion(state.region).map((organization) => ({
        id: organization.id,
        label: organization.name,
        description: `${organization.serviceModel} • ${organization.deviceCount} devices`,
        selection: {
          level: 'organization',
          region: organization.regionId,
          organization: organization.id,
        },
        commandLabel: `/organization ${organization.id}`,
      }));
    case 'subscriber':
      return getFleetCohortsForOrganization(state.organization).map((cohort) => ({
        id: cohort.id,
        label: cohort.name,
        description: cohort.detail,
        selection: {
          level: 'subscriber',
          region: cohort.regionId,
          organization: cohort.organizationId,
          subscriber: cohort.id,
        },
        commandLabel: `/subscriber ${cohort.id}`,
      }));
    case 'device':
      return [];
  }
}

function getSupportScopeOptions(
  level: WorkspaceScopeLevel,
  state: ScopePaletteState,
): ScopeEntityOption[] {
  switch (level) {
    case 'region':
      return SUBSCRIBER_ENTITIES.map((subscriber) => ({
        id: subscriber.id,
        label: `${subscriber.name} (${subscriber.id})`,
        description: `${subscriber.city} • ${subscriber.plan}`,
        selection: {
          level: 'region',
          region: subscriber.id,
        },
        commandLabel: `/region ${subscriber.id}`,
      }));
    case 'organization':
      return getSupportHomesForSubscriber(state.region).map((home) => ({
        id: home.id,
        label: home.address,
        description: home.detail,
        selection: {
          level: 'organization',
          region: home.subscriberId,
          organization: home.id,
        },
        commandLabel: `/organization ${home.id}`,
      }));
    case 'subscriber':
      return getSupportGatewaysForHome(state.organization).map((gateway) => ({
        id: gateway.id,
        label: gateway.name,
        description: gateway.detail,
        selection: {
          level: 'subscriber',
          region: gateway.subscriberId,
          organization: gateway.homeId,
          subscriber: gateway.id,
        },
        commandLabel: `/subscriber ${gateway.id}`,
      }));
    case 'device':
      return getSupportDevicesForGateway(state.subscriber).map((device) => ({
        id: device.id,
        label: device.name,
        description: device.detail,
        selection: {
          level: 'device',
          region: device.subscriberId,
          organization: device.homeId,
          subscriber: device.gatewayId,
          device: device.id,
        },
        commandLabel: `/device ${device.id}`,
      }));
    case 'all':
      return [];
  }
}

function getGrowthScopeOptions(
  level: WorkspaceScopeLevel,
  state: ScopePaletteState,
): ScopeEntityOption[] {
  switch (level) {
    case 'all':
      return [
        {
          id: 'all',
          label: 'All Segments',
          description: 'Review portfolio-wide opportunity and churn signals.',
          selection: { level: 'all' },
          commandLabel: '/all',
        },
      ];
    case 'region':
      return GROWTH_SEGMENTS.map((segment) => ({
        id: segment.id,
        label: segment.name,
        description: segment.detail,
        selection: {
          level: 'region',
          region: segment.id,
        },
        commandLabel: `/region ${segment.id}`,
      }));
    case 'organization':
      return getGrowthCampaignsForSegment(state.region).map((campaign) => ({
        id: campaign.id,
        label: campaign.name,
        description: campaign.detail,
        selection: {
          level: 'organization',
          region: campaign.segmentId,
          organization: campaign.id,
        },
        commandLabel: `/organization ${campaign.id}`,
      }));
    case 'subscriber':
      return getGrowthSubscribersForCampaign(state.organization).map((subscriber) => ({
        id: subscriber.id,
        label: `${subscriber.name} (${subscriber.id})`,
        description: `${subscriber.city} • ${subscriber.plan}`,
        selection: {
          level: 'subscriber',
          region: state.region,
          organization: state.organization,
          subscriber: subscriber.id,
        },
        commandLabel: `/subscriber ${subscriber.id}`,
      }));
    case 'device':
      return [];
  }
}

function getScopeOptionsForLevel(
  workspaceId: WorkspaceId,
  level: WorkspaceScopeLevel,
  state: ScopePaletteState,
) {
  switch (workspaceId) {
    case 'fleet':
      return getOperationsScopeOptions(level, state);
    case 'support':
      return getSupportScopeOptions(level, state);
    case 'growth':
      return getGrowthScopeOptions(level, state);
  }
}

function getNextLevel(
  workspaceId: WorkspaceId,
  currentLevel: WorkspaceScopeLevel,
) {
  const levelOrder = WORKSPACE_SCOPE_SPECS[workspaceId].levelOrder;
  const currentIndex = levelOrder.indexOf(currentLevel);
  return currentIndex === -1 ? undefined : levelOrder[currentIndex + 1];
}

function buildStateFromSelection(
  targetLevel: ScopeCommandName | null,
  nextStep: ScopePaletteStep,
  selection: ScopeSelection,
): ScopePaletteState {
  return {
    targetLevel,
    step: nextStep,
    region: selection.region,
    organization: selection.organization,
    subscriber: selection.subscriber,
    device: selection.device,
  };
}

function getContextLevels(workspaceId: WorkspaceId) {
  return WORKSPACE_SCOPE_SPECS[workspaceId].levelOrder.filter((level) => level !== 'all');
}

export function getWorkspaceScopePaletteStateForTarget(
  workspaceId: WorkspaceId,
  targetLevel: ScopeCommandName | null,
  currentScope: ScopeSelection,
): ScopePaletteState {
  if (!targetLevel) {
    return buildStateFromSelection(null, 'root', currentScope);
  }

  if (targetLevel === 'all') {
    return buildStateFromSelection(targetLevel, 'root', currentScope);
  }

  const chain = getContextLevels(workspaceId);
  const targetIndex = chain.indexOf(targetLevel);
  if (targetIndex === -1) {
    return buildStateFromSelection(targetLevel, 'root', currentScope);
  }

  for (let index = 0; index < targetIndex; index += 1) {
    const level = chain[index];
    if (!getScopeValue(currentScope, level)) {
      return buildStateFromSelection(targetLevel, level, currentScope);
    }
  }

  return buildStateFromSelection(targetLevel, targetLevel, currentScope);
}

function getRootScopeCommandOptions(
  workspaceId: WorkspaceId,
  currentScope: ScopeSelection,
) {
  return WORKSPACE_SCOPE_SPECS[workspaceId].levelOrder.map((level) => {
    if (level === 'all') {
      return {
        id: 'scope-all',
        label: getWorkspaceSelectorLabel(workspaceId, 'all'),
        description:
          workspaceId === 'growth'
            ? 'Reset to the full segment portfolio.'
            : 'Reset to the broadest workspace scope.',
        commandLabel: '/all',
        scope: { level: 'all' } as ScopeSelection,
      };
    }

    return {
      id: `target-${level}`,
      label: getWorkspaceSelectorLabel(workspaceId, level),
      description: `Choose a ${getWorkspaceSelectorLabel(workspaceId, level).toLowerCase()} scope.`,
      nextState: getWorkspaceScopePaletteStateForTarget(workspaceId, level, currentScope),
    };
  });
}

export function getScopeCommandOptionsForWorkspace(
  workspaceId: WorkspaceId,
  state: ScopePaletteState,
  query: string,
  currentScope: ScopeSelection,
): ScopeCommandOption[] {
  if (state.step === 'root') {
    return getRootScopeCommandOptions(workspaceId, currentScope).filter((option) =>
      matchesScopeQuery(query, option.label, option.description, option.commandLabel),
    );
  }

  const options = getScopeOptionsForLevel(workspaceId, state.step, state).filter((option) =>
    matchesScopeQuery(query, option.id, option.label, option.description),
  );

  const nextLevel = getNextLevel(workspaceId, state.step);
  return options.map((option) => {
    if (state.targetLevel === state.step || !nextLevel) {
      return {
        id: option.id,
        label: option.label,
        description: option.description,
        commandLabel: option.commandLabel,
        scope: option.selection,
      };
    }

    return {
      id: option.id,
      label: option.label,
      description: option.description,
      commandLabel: option.commandLabel,
      nextState: buildStateFromSelection(state.targetLevel, nextLevel, option.selection),
    };
  });
}

export function parseScopeCommandInputForWorkspace(input: string): {
  command: ScopeCommandName | null;
  filter: string;
} | null {
  if (!input.startsWith('/')) {
    return null;
  }

  const raw = input.slice(1).trim();
  if (!raw) {
    return { command: null, filter: '' };
  }

  const [token, ...rest] = raw.split(/\s+/);
  const command = token?.toLowerCase();
  const knownCommands: ScopeCommandName[] = ['all', 'region', 'organization', 'subscriber', 'device'];

  if (command && knownCommands.includes(command as ScopeCommandName)) {
    return {
      command: command as ScopeCommandName,
      filter: rest.join(' ').trim(),
    };
  }

  return {
    command: null,
    filter: raw,
  };
}

export function getWorkspaceScopeConfig(workspaceId: WorkspaceId) {
  return WORKSPACE_SCOPE_SPECS[workspaceId];
}

export function getWorkspaceDefaultScope(workspaceId: WorkspaceId): ScopeSelection {
  switch (workspaceId) {
    case 'fleet':
      return { level: 'all' };
    case 'support':
      return { level: 'region' };
    case 'growth':
      return { level: 'all' };
  }
}

function getSubscriberDisplayName(subscriberId?: string) {
  if (!subscriberId) {
    return DEFAULT_SUBSCRIBER_NAME;
  }
  return SUBSCRIBER_LABELS[subscriberId] ?? DEFAULT_SUBSCRIBER_NAME;
}

function getSupportHomeLabel(homeId?: string) {
  return SUPPORT_HOMES.find((home) => home.id === homeId)?.address;
}

function getSupportGatewayLabel(gatewayId?: string, subscriberId?: string) {
  if (!gatewayId) {
    return undefined;
  }
  const subscriberName = getSubscriberDisplayName(subscriberId);
  const gateway = SUPPORT_GATEWAYS.find((item) => item.id === gatewayId);
  if (!gateway) {
    return undefined;
  }
  return `${subscriberName} • ${getGatewaySiteLabel(subscriberName, gateway.name.replace(/ Gateway$/, ''))} Gateway`;
}

function getSupportDeviceLabel(deviceId?: string, gatewayId?: string, subscriberId?: string) {
  const device = SUPPORT_CLIENT_DEVICES.find((item) => item.id === deviceId);
  if (!device) {
    return undefined;
  }
  const gatewayLabel = getSupportGatewayLabel(gatewayId, subscriberId);
  return gatewayLabel ? `${gatewayLabel} • ${device.name}` : device.name;
}

export function getWorkspaceScopeDisplayLabel(
  workspaceId: WorkspaceId,
  scope: ScopeSelection,
) {
  switch (workspaceId) {
    case 'fleet': {
      switch (scope.level) {
        case 'all':
          return 'all fleet regions';
        case 'region':
          return REGION_LABELS[scope.region ?? ''] ?? 'this region';
        case 'organization':
          return ORGANIZATION_LABELS[scope.organization ?? ''] ?? 'this organization';
        case 'subscriber':
          return (
            FLEET_COHORTS.find((cohort) => cohort.id === scope.subscriber)?.name ??
            'this cohort'
          );
        case 'device':
          return 'this device';
      }
    }
    case 'support': {
      switch (scope.level) {
        case 'region': {
          const subscriberName = SUBSCRIBER_LABELS[scope.region ?? ''];
          if (subscriberName && scope.region) {
            return `${subscriberName} (${scope.region})`;
          }
          return 'this subscriber';
        }
        case 'organization':
          return getSupportHomeLabel(scope.organization) ?? 'this home';
        case 'subscriber':
          return (
            getSupportGatewayLabel(scope.subscriber, scope.region) ?? 'this gateway'
          );
        case 'device':
          return (
            getSupportDeviceLabel(scope.device, scope.subscriber, scope.region) ??
            'this device'
          );
        case 'all':
          return 'the support queue';
      }
    }
    case 'growth': {
      switch (scope.level) {
        case 'all':
          return 'all segments';
        case 'region':
          return (
            GROWTH_SEGMENTS.find((segment) => segment.id === scope.region)?.name ??
            'this segment'
          );
        case 'organization':
          return (
            GROWTH_CAMPAIGNS.find((campaign) => campaign.id === scope.organization)?.name ??
            'this campaign'
          );
        case 'subscriber': {
          const subscriberName = SUBSCRIBER_LABELS[scope.subscriber ?? ''];
          if (subscriberName && scope.subscriber) {
            return `${subscriberName} (${scope.subscriber})`;
          }
          return 'this subscriber';
        }
        case 'device':
          return 'this device';
      }
    }
  }
}

export function getWorkspaceScopeTagLabel(
  workspaceId: WorkspaceId,
  scope: ScopeSelection,
) {
  const scopeSpec = WORKSPACE_SCOPE_SPECS[workspaceId];
  return scopeSpec.uppercaseLabels[scope.level] ?? 'UNKNOWN';
}

export function getWorkspaceScopeSelectorLabel(
  workspaceId: WorkspaceId,
  level: WorkspaceScopeLevel,
  scope: ScopeSelection,
) {
  switch (workspaceId) {
    case 'fleet':
      if (level === 'all') {
        return scope.level === 'all' ? 'All (Fleet)' : 'All (Fleet)';
      }
      if (level === 'region' && scope.region) {
        return REGION_LABELS[scope.region] ?? scope.region;
      }
      if (level === 'organization' && scope.organization) {
        return ORGANIZATION_LABELS[scope.organization] ?? scope.organization;
      }
      if (level === 'subscriber' && scope.subscriber) {
        return (
          FLEET_COHORTS.find((cohort) => cohort.id === scope.subscriber)?.name ??
          scope.subscriber
        );
      }
      return getWorkspaceSelectorLabel(workspaceId, level);
    case 'support':
      if (level === 'region' && scope.region) {
        const subscriberName = SUBSCRIBER_LABELS[scope.region];
        return subscriberName ? `${subscriberName} (${scope.region})` : scope.region;
      }
      if (level === 'organization' && scope.organization) {
        return getSupportHomeLabel(scope.organization) ?? getWorkspaceSelectorLabel(workspaceId, level);
      }
      if (level === 'subscriber' && scope.subscriber) {
        return (
          SUPPORT_GATEWAYS.find((gateway) => gateway.id === scope.subscriber)?.name ??
          getWorkspaceSelectorLabel(workspaceId, level)
        );
      }
      if (level === 'device' && scope.device) {
        return (
          SUPPORT_CLIENT_DEVICES.find((device) => device.id === scope.device)?.name ??
          getWorkspaceSelectorLabel(workspaceId, level)
        );
      }
      return getWorkspaceSelectorLabel(workspaceId, level);
    case 'growth':
      if (level === 'all') {
        return 'All Segments';
      }
      if (level === 'region' && scope.region) {
        return (
          GROWTH_SEGMENTS.find((segment) => segment.id === scope.region)?.name ??
          scope.region
        );
      }
      if (level === 'organization' && scope.organization) {
        return (
          GROWTH_CAMPAIGNS.find((campaign) => campaign.id === scope.organization)?.name ??
          scope.organization
        );
      }
      if (level === 'subscriber' && scope.subscriber) {
        const subscriberName = SUBSCRIBER_LABELS[scope.subscriber];
        return subscriberName ? `${subscriberName} (${scope.subscriber})` : scope.subscriber;
      }
      return getWorkspaceSelectorLabel(workspaceId, level);
  }
}

export function getWorkspaceScopePalettePlaceholder(
  workspaceId: WorkspaceId,
  state: ScopePaletteState,
) {
  const spec = WORKSPACE_SCOPE_SPECS[workspaceId];
  if (state.step === 'root') {
    return spec.levelOrder.map((level) => spec.levelLabels[level]).join(', ');
  }
  return `Filter ${getWorkspaceSelectorLabel(workspaceId, state.step).toLowerCase()}s`;
}

export function getWorkspaceScopePaletteContextLabel(
  workspaceId: WorkspaceId,
  state: ScopePaletteState,
) {
  const parts: string[] = [];

  switch (workspaceId) {
    case 'fleet':
      if (state.region) {
        parts.push(REGION_LABELS[state.region] ?? state.region);
      }
      if (state.organization) {
        parts.push(ORGANIZATION_LABELS[state.organization] ?? state.organization);
      }
      if (state.subscriber) {
        parts.push(
          FLEET_COHORTS.find((cohort) => cohort.id === state.subscriber)?.name ??
            state.subscriber,
        );
      }
      break;
    case 'support':
      if (state.region) {
        const subscriberName = SUBSCRIBER_LABELS[state.region];
        parts.push(subscriberName ? `${subscriberName} (${state.region})` : state.region);
      }
      if (state.organization) {
        parts.push(getSupportHomeLabel(state.organization) ?? state.organization);
      }
      if (state.subscriber) {
        parts.push(
          SUPPORT_GATEWAYS.find((gateway) => gateway.id === state.subscriber)?.name ??
            state.subscriber,
        );
      }
      break;
    case 'growth':
      if (state.region) {
        parts.push(
          GROWTH_SEGMENTS.find((segment) => segment.id === state.region)?.name ??
            state.region,
        );
      }
      if (state.organization) {
        parts.push(
          GROWTH_CAMPAIGNS.find((campaign) => campaign.id === state.organization)?.name ??
            state.organization,
        );
      }
      if (state.subscriber) {
        const subscriberName = SUBSCRIBER_LABELS[state.subscriber];
        parts.push(
          subscriberName ? `${subscriberName} (${state.subscriber})` : state.subscriber,
        );
      }
      break;
  }

  return parts.join(' > ');
}

export function getWorkspaceScopeActions(
  workspaceId: WorkspaceId,
  scope: ScopeSelection,
) {
  switch (workspaceId) {
    case 'fleet':
      return buildOperationsScopeActions(scope);
    case 'support':
      return buildSupportScopeActions(scope);
    case 'growth':
      return buildGrowthScopeActions(scope);
  }
}

export function getWorkspaceExperience(workspaceId: WorkspaceId) {
  return WORKSPACE_EXPERIENCE[workspaceId];
}
