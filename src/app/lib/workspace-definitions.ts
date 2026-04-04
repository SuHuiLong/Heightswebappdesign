/**
 * Workspace Definitions
 *
 * Defines the three primary work modes in the platform:
 * - Fleet Intelligence: AI-discovered patterns across the network (fleet-level)
 * - Support: AI-driven diagnosis and zero-touch resolution (single-home)
 * - Growth: Predictive insights for revenue and retention
 */

export type WorkspaceId = 'operations' | 'support' | 'growth';

export interface WorkspaceDefinition {
  id: WorkspaceId;
  name: string;
  description: string;
  tagline: string;
  icon: string;
  // Primary work objects for this workspace
  primaryObjects: string[];
  // Example scenarios for this workspace
  exampleScenarios: string[];
  // Color theme accent
  accentColor: string;
  // Is this workspace fully implemented?
  isImplemented: boolean;
  // Recent questions (simulated for demo)
  recentQuestions: string[];
  // Top/popular questions (simulated for demo)
  topQuestions: string[];
}

export const WORKSPACES: Record<WorkspaceId, WorkspaceDefinition> = {
  operations: {
    id: 'operations',
    name: 'Fleet Intelligence',
    description: 'AI-discovered patterns across your network — anomalies, correlations, and predictive risks at fleet scale.',
    tagline: 'AI-discovered patterns across your network',
    icon: 'activity',
    primaryObjects: ['incident', 'cohort', 'region', 'deployment'],
    exampleScenarios: [
      'Firmware regression analysis',
      'Regional RF interference detection',
      'Service deployment health',
      'Fleet-wide zero-touch resolution stats',
    ],
    accentColor: 'var(--ambient-blue)',
    isImplemented: true,
    recentQuestions: [
      'Correlate offline events with firmware 2.1 — is this a fleet-wide regression?',
      'Which regions had the most auto-resolved incidents this week?',
      'Service deployment health for parental controls rollout',
    ],
    topQuestions: [
      'What anomaly patterns has AI detected this week that I haven\'t seen?',
      'Predict which cohorts will hit memory pressure in the next 7 days',
      'Show firmware cohorts with rising memory trends',
      'Which regions have the highest zero-touch resolution rate?',
    ],
  },

  support: {
    id: 'support',
    name: 'Support',
    description: 'AI-driven diagnosis and zero-touch resolution for subscriber cases, homes, and gateways.',
    tagline: 'AI-driven diagnosis and zero-touch resolution',
    icon: 'users',
    primaryObjects: ['case', 'location', 'home', 'gateway'],
    exampleScenarios: [
      'Autonomous Wi-Fi Recovery',
      'Critical Session Protection',
      'Firmware Regression Investigation',
      'User-Reported Slow Speed',
    ],
    accentColor: 'var(--ambient-cyan)',
    isImplemented: true,
    recentQuestions: [
      'Show cases AI resolved without human intervention this week',
      'This subscriber reports slow internet — what did AI find?',
      'Which open cases have AI-generated root cause with high confidence?',
    ],
    topQuestions: [
      'Show cases AI resolved without human intervention today',
      'Why is this subscriber\'s IoT device disconnecting?',
      'Which open cases have AI-generated root cause with high confidence?',
      'Show case history for subscriber SUB-1234',
    ],
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Predictive insights for revenue expansion, churn prevention, and subscriber monetization.',
    tagline: 'Predictive insights for revenue and retention',
    icon: 'trending-up',
    primaryObjects: ['opportunity', 'segment', 'offer', 'campaign'],
    exampleScenarios: [
      'Pre-Churn Rescue / Plan Upgrade',
      'Bandwidth Upsell Opportunities',
      'VAS Device Fingerprint Targeting',
    ],
    accentColor: 'var(--ambient-warm)',
    isImplemented: true,
    recentQuestions: [
      'Which subscribers will likely churn in the next 30 days?',
      'Predict upsell conversion rate for bandwidth-constrained households',
      'Show Premium Wi-Fi subscription conversion funnel',
    ],
    topQuestions: [
      'Which subscribers will likely churn in the next 30 days?',
      'Predict upsell conversion rate if we target bandwidth-constrained households',
      'What\'s the projected revenue impact of Premium Wi-Fi expansion to Region South?',
      'Which segments have the highest upsell confidence this month?',
    ],
  },
};

// Workspace-specific starter tasks shown in empty state
export interface WorkspaceStarterTask {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export const WORKSPACE_STARTER_TASKS: Record<WorkspaceId, WorkspaceStarterTask[]> = {
  operations: [
    {
      id: 'ops-1',
      title: 'FW 2.1.3 Memory Regression',
      description: '47 gateways showing rising memory trend since Tuesday, correlated with last OTA',
      prompt: 'Correlate offline events with firmware 2.1 across Broadcom gateways. Is this a fleet-wide regression?',
    },
    {
      id: 'ops-2',
      title: 'Region East Channel Congestion',
      description: '5GHz utilization up 31% in 3 cohorts, 12 subscriber complaints correlated',
      prompt: 'Show regional channel utilization anomalies. Which regions have the highest zero-touch resolution rate this week?',
    },
    {
      id: 'ops-3',
      title: 'Service Deployment Anomaly',
      description: 'Parental Controls install failure rate 8.2% on MTK platform',
      prompt: 'Service deployment health for parental controls rollout in the last 48 hours.',
    },
    {
      id: 'ops-4',
      title: 'Predictive Cohort Risk',
      description: 'AI predicts FW 2.1.3 cohort will hit memory pressure in ~5 days',
      prompt: 'Predict which cohorts will hit memory pressure in the next 7 days.',
    },
  ],

  support: [
    {
      id: 'sup-1',
      title: 'Wi-Fi Auto-Resolved Today',
      description: 'Wi-Fi interference auto-resolved on 3 homes today',
      prompt: 'Show cases AI resolved without human intervention today.',
    },
    {
      id: 'sup-2',
      title: 'FW 2.1.3 IoT Disconnects',
      description: 'AI traced IoT disconnects to ACS config change',
      prompt: 'Why is this subscriber\'s IoT device disconnecting?',
    },
    {
      id: 'sup-3',
      title: 'Video Call Protected',
      description: '2 video calls protected during peak congestion',
      prompt: 'Protect active video call sessions during peak congestion. Monitor QoS metrics and ensure minimum MOS score.',
    },
    {
      id: 'sup-4',
      title: 'User-Reported Slow Speed',
      description: 'Subscriber reported slow — AI confirmed external CDN issue',
      prompt: 'Fix slow speeds for subscriber SUB-1234. Speed tests show 120 Mbps vs expected 500 Mbps.',
    },
  ],

  growth: [
    {
      id: 'grw-1',
      title: 'Pre-Churn Rescue',
      description: '47 subscribers flagged high churn risk — declining usage + rising tickets',
      prompt: 'Which subscribers will likely churn in the next 30 days? Rank by risk score.',
    },
    {
      id: 'grw-2',
      title: 'Bandwidth Upsell',
      description: '2,340 households at >85% utilization, upgrade conversion confidence 72%',
      prompt: 'Predict upsell conversion rate if we target bandwidth-constrained households.',
    },
    {
      id: 'grw-3',
      title: 'VAS Opportunity',
      description: '1,100 homes with 3+ children devices but no parental controls subscription',
      prompt: 'Which segments have the highest upsell confidence this month?',
    },
  ],
};

// Workspace context for AI assistant
export interface WorkspaceContext {
  workspace: WorkspaceId;
  primaryScope: string;
  capabilities: string[];
}

export function getWorkspaceContext(workspaceId: WorkspaceId): WorkspaceContext {
  const workspace = WORKSPACES[workspaceId];

  switch (workspaceId) {
    case 'operations':
      return {
        workspace: workspaceId,
        primaryScope: 'fleet, region, organization, cohort',
        capabilities: [
          'AI-discovered anomaly patterns',
          'Cohort analysis and correlation',
          'Predictive risk assessment',
          'Firmware regression detection',
          'Regional pattern correlation',
          'Zero-touch resolution tracking',
        ],
      };

    case 'support':
      return {
        workspace: workspaceId,
        primaryScope: 'case, subscriber, home, gateway',
        capabilities: [
          'AI autonomous case resolution',
          'Zero-touch Wi-Fi self-healing',
          'Session-aware QoS protection',
          'Subscriber health diagnostics',
          'Topology and device inventory',
          'External attribution analysis',
        ],
      };

    case 'growth':
      return {
        workspace: workspaceId,
        primaryScope: 'segment, opportunity, campaign, subscriber',
        capabilities: [
          'Predictive churn risk scoring',
          'Upsell conversion probability',
          'Revenue impact forecasting',
          'Subscription health monitoring',
          'Campaign ROI tracking',
          'Segment behavior prediction',
        ],
      };
  }
}
