/**
 * Workspace Definitions
 *
 * Defines the three primary work modes in the platform:
 * - Operations: Fleet-level operations, incidents, cohorts
 * - Support: Case-level work, tickets, subscribers, homes
 * - Growth: Opportunities, segments, upsell (reserved for future)
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
}

export const WORKSPACES: Record<WorkspaceId, WorkspaceDefinition> = {
  operations: {
    id: 'operations',
    name: 'Operations',
    description: 'Fleet-level operations for incidents, cohorts, and network-wide issues.',
    tagline: 'Discover and explain fleet-wide risks',
    icon: 'activity',
    primaryObjects: ['incident', 'cohort', 'region', 'organization'],
    exampleScenarios: [
      'Firmware regression analysis',
      'DPI & traffic anomaly detection',
      'Regional outage investigation',
      'Fleet health analysis',
    ],
    accentColor: 'var(--ambient-blue)',
    isImplemented: true,
  },

  support: {
    id: 'support',
    name: 'Support',
    description: 'Case-level work for tickets, subscribers, homes, and individual gateway support.',
    tagline: 'Handle cases and location issues',
    icon: 'users',
    primaryObjects: ['case', 'location', 'home', 'gateway'],
    exampleScenarios: [
      'Autonomous Wi-Fi Recovery',
      'Critical Session Protection',
      'Subscriber Troubleshooting',
      'Gateway Diagnostics',
    ],
    accentColor: 'var(--ambient-cyan)',
    isImplemented: true,
  },

  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Growth opportunities, segments, upsell campaigns, and VAS promotion.',
    tagline: 'Identify upsell and churn prevention opportunities',
    icon: 'trending-up',
    primaryObjects: ['opportunity', 'segment', 'offer', 'campaign'],
    exampleScenarios: [
      'Pre-Churn Rescue / Plan Upgrade',
      'Bandwidth Upsell Opportunities',
      'VAS Device Fingerprint Targeting',
    ],
    accentColor: 'var(--ambient-warm)',
    isImplemented: true,
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
      title: 'Investigate Connection Drops',
      description: 'Find gateways with unusual connection drops and correlate with firmware versions',
      prompt: 'Show me all home gateways with unusual connection drops in the last 24 hours, group failing devices by MAC vendor, and correlate with recent firmware updates.',
    },
    {
      id: 'ops-2',
      title: 'Analyze Traffic Anomalies',
      description: 'Compare L7 streaming vs gaming traffic and highlight TLS classification gaps',
      prompt: 'Compare L7 streaming vs gaming traffic across Europe this week and highlight anomalies in TLS traffic classification.',
    },
    {
      id: 'ops-3',
      title: 'Fleet Health Overview',
      description: 'Get a summary of current fleet health, active alerts, and recommended actions',
      prompt: 'Run a fleet health analysis and show me the current status across all regions.',
    },
    {
      id: 'ops-4',
      title: 'Regional Outage Check',
      description: 'View active outages and incidents affecting any region',
      prompt: 'Show me active outages across all regions.',
    },
  ],

  support: [
    {
      id: 'sup-1',
      title: 'Troubleshoot Ticket',
      description: 'Start with a ticket number to investigate subscriber issues',
      prompt: 'I need to troubleshoot ticket TKT-4821 for subscriber John Smith.',
    },
    {
      id: 'sup-2',
      title: 'Subscriber Health Check',
      description: 'Review gateway health and service status for a subscriber',
      prompt: 'Show me the health summary for subscriber SUB-1234.',
    },
    {
      id: 'sup-3',
      title: 'Gateway Diagnostics',
      description: 'Run diagnostics on a specific home gateway',
      prompt: 'Run diagnostics on gateway GW-7834-HOME.',
    },
    {
      id: 'sup-4',
      title: 'View Home Overview',
      description: 'See the static dashboard for a subscriber home',
      prompt: 'Show me the home overview for SUB-1234.',
    },
  ],

  growth: [
    {
      id: 'grw-1',
      title: 'Pre-Churn Rescue',
      description: 'Identify subscribers at risk of churning with no support tickets',
      prompt: 'Identify households with high latency in streaming/gaming over the last 14 days with no support tickets. Rank by churn risk.',
    },
    {
      id: 'grw-2',
      title: 'Bandwidth Upsell',
      description: 'Find users saturating WAN bandwidth who need plan upgrades',
      prompt: 'Show users saturating WAN bandwidth >2 hours/day due to video calls and 4K streaming.',
    },
    {
      id: 'grw-3',
      title: 'VAS Opportunity',
      description: 'Find households eligible for value-added services',
      prompt: "Find households with gaming consoles or children's devices but no parental control subscription.",
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
        primaryScope: 'fleet, region, organization',
        capabilities: [
          'Fleet-wide incident detection',
          'Cohort analysis and correlation',
          'Regional outage management',
          'Firmware regression analysis',
          'Traffic anomaly detection',
          'Cross-tenant comparisons',
        ],
      };

    case 'support':
      return {
        workspace: workspaceId,
        primaryScope: 'ticket, subscriber, home, gateway',
        capabilities: [
          'Ticket-based troubleshooting',
          'Subscriber health investigation',
          'Home gateway diagnostics',
          'Device-level remediation',
          'Service plan verification',
          'Topology and device inventory',
        ],
      };

    case 'growth':
      return {
        workspace: workspaceId,
        primaryScope: 'segment, opportunity, campaign',
        capabilities: [
          'Churn risk scoring and identification',
          'Upsell opportunity detection',
          'Bandwidth saturation analysis',
          'VAS cross-sell recommendations',
          'Revenue impact forecasting',
          'Campaign targeting',
        ],
      };
  }
}
