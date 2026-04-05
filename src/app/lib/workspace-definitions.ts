/**
 * Workspace Definitions
 *
 * Defines the three primary work modes in the platform:
 * - Fleet Intelligence: Fleet-level operations, incidents, cohorts
 * - Support: Case-level work, tickets, subscribers, homes
 * - Growth: Opportunities, segments, upsell (reserved for future)
 */

export type WorkspaceId = 'fleet' | 'support' | 'growth';

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
  fleet: {
    id: 'fleet',
    name: 'Fleet Intelligence',
    description: 'AI-discovered fleet patterns, predictive risks, and rollout health across the network.',
    tagline: 'AI-discovered patterns across your network',
    icon: 'activity',
    primaryObjects: ['incident', 'cohort', 'region', 'organization'],
    exampleScenarios: [
      'FW 2.1.3 memory regression',
      'Region East channel congestion',
      'Service deployment anomaly',
      'Predictive fleet health scan',
    ],
    accentColor: 'var(--ambient-blue)',
    isImplemented: true,
    recentQuestions: [
      'Show the cohorts trending toward degradation this week',
      'Which deployments are most at risk over the next 48 hours?',
      'Compare fleet health vs last week across all regions',
    ],
    topQuestions: [
      'What anomaly patterns has AI detected this week that I have not seen yet?',
      'Correlate offline events with firmware 2.1 and show if this is fleet-wide',
      'Predict which cohorts will hit memory pressure in the next 7 days',
      'Show service deployment health for the last 48 hours',
    ],
  },

  support: {
    id: 'support',
    name: 'Support',
    description: 'AI-driven diagnosis, zero-touch resolution, and escalation control for active cases.',
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
      'Show the cases AI resolved today without human intervention',
      'Which open cases already have a high-confidence AI root cause?',
      'Show me the repeat offender homes from this week',
    ],
    topQuestions: [
      'Show cases AI resolved without human intervention this week',
      'This subscriber reports slow internet. What did AI find?',
      'Which open cases have AI-generated root cause with high confidence?',
      'Show pending validations for fixes AI already applied',
    ],
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Predictive insights for revenue expansion, churn prevention, and offer targeting.',
    tagline: 'Predictive insights for revenue and retention',
    icon: 'trending-up',
    primaryObjects: ['opportunity', 'segment', 'offer', 'campaign'],
    exampleScenarios: [
      'Pre-Churn Rescue',
      'Bandwidth Upsell Opportunities',
      'VAS Opportunity',
    ],
    accentColor: 'var(--ambient-warm)',
    isImplemented: true,
    recentQuestions: [
      'Show this week’s top 10 upsell candidates',
      'Which subscribers are at churn risk with no open tickets?',
      'Identify households with untapped VAS potential',
    ],
    topQuestions: [
      'Which subscribers will likely churn in the next 30 days?',
      'Predict upsell conversion rate if we target bandwidth-constrained households',
      'What is the projected revenue impact of VAS expansion?',
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
  fleet: [
    {
      id: 'ops-1',
      title: 'FW 2.1.3 Memory Regression',
      description: 'Investigate the emerging memory trend AI detected in the latest firmware cohort',
      prompt: 'Investigate the FW 2.1.3 memory regression across impacted cohorts and show projected critical risk over the next 5 days.',
    },
    {
      id: 'ops-2',
      title: 'Region East Channel Congestion',
      description: 'Explain the correlated congestion pattern AI found across impacted cohorts',
      prompt: 'Explain the Region East channel congestion pattern, highlight impacted cohorts, and compare it to the previous baseline.',
    },
    {
      id: 'ops-3',
      title: 'Service Deployment Anomaly',
      description: 'Review platform-specific install failures during the latest service rollout',
      prompt: 'Review parental controls deployment health, isolate platform-specific failures, and recommend the next remediation step.',
    },
    {
      id: 'ops-4',
      title: 'Predictive Fleet Health Scan',
      description: 'See which cohorts and rollouts are likely to degrade next',
      prompt: 'Find the cohorts trending toward degradation in the next 7 days and explain what AI is seeing.',
    },
  ],

  support: [
    {
      id: 'sup-1',
      title: 'Cases AI Resolved Today',
      description: 'Review the zero-touch cases AI closed without human intervention',
      prompt: 'Show the cases AI fully resolved today and summarize what was fixed.',
    },
    {
      id: 'sup-2',
      title: 'Cases Needing Review',
      description: 'Surface the cases AI escalated for a human decision',
      prompt: 'Show the open cases needing human attention and explain why AI escalated them.',
    },
    {
      id: 'sup-3',
      title: 'Repeat Offender Homes',
      description: 'Find the homes that keep reappearing in the support queue',
      prompt: 'Find the repeat offender homes this week and explain the recurring issue pattern.',
    },
    {
      id: 'sup-4',
      title: 'Pending Validations',
      description: 'Check the fixes AI applied that still need confirmation',
      prompt: 'Show AI fixes waiting for validation and explain what still needs to be confirmed.',
    },
  ],

  growth: [
    {
      id: 'grw-1',
      title: 'Top Upsell Candidates',
      description: 'Rank the strongest upsell opportunities AI found this week',
      prompt: 'Show this week’s top 10 upsell candidates and explain why AI ranked them highest.',
    },
    {
      id: 'grw-2',
      title: 'Churn Risk With No Tickets',
      description: 'Surface declining subscribers before they ask for help',
      prompt: 'Show subscribers at churn risk who have no open tickets and explain the early warning signals.',
    },
    {
      id: 'grw-3',
      title: 'VAS Opportunity',
      description: 'Find households with devices indicating untapped value-added service potential',
      prompt: 'Identify households with gaming consoles or children\'s devices but no parental control subscription, and estimate revenue impact.',
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
    case 'fleet':
      return {
        workspace: workspaceId,
        primaryScope: 'fleet, region, organization, cohort',
        capabilities: [
          'Fleet-wide incident detection',
          'Cohort analysis and correlation',
          'Regional outage management',
          'Firmware regression analysis',
          'Traffic anomaly detection',
          'Predictive rollout risk scoring',
        ],
      };

    case 'support':
      return {
        workspace: workspaceId,
        primaryScope: 'subscriber, home, gateway, device',
        capabilities: [
          'Ticket-based troubleshooting',
          'Subscriber health investigation',
          'Home and gateway diagnostics',
          'Device-level remediation',
          'Post-fix validation',
          'Escalation risk review',
        ],
      };

    case 'growth':
      return {
        workspace: workspaceId,
        primaryScope: 'segment, campaign, subscriber',
        capabilities: [
          'Churn risk scoring and identification',
          'Upsell opportunity detection',
          'Bandwidth saturation analysis',
          'Offer and campaign optimization',
          'Revenue impact forecasting',
          'Campaign targeting',
        ],
      };
  }
}
