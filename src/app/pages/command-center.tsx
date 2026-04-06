import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AppLayout } from '../components/app-layout';
import { ContextPanel } from '../components/context-panel';
import { ScopeSelection } from '../components/scope-selector';
import {
  REGIONS,
  REGION_LABELS,
  ORGANIZATION_LABELS,
  SUBSCRIBER_LABELS,
  DEFAULT_SUBSCRIBER_ID,
  DEFAULT_SUBSCRIBER_NAME,
  buildScopeSelection,
  getDevicesForSubscriber,
  getGatewaySiteLabel,
  getOrganizationsForRegion,
  getSubscribersForOrganization,
  getParentScopeForDevice,
  normalizeScopeSearchValue,
} from '../lib/scope-data';
import {
  UserMessage,
  AITextMessage,
  ScopeActionsCard,
  ScopeActionOption,
  SearchResultsCard,
  MetricCard,
  AlertListCard,
  SubscriberCard,
  ActionCard,
  ReceiptCard,
  DeviceTableCard,
  TopologyCard,
  BandwidthChartCard,
  SpeedTestCard,
  OutageMapCard,
  ServicePlanCard,
  WorkOrderCard,
  SLAStatusCard,
  ProvisioningCard,
} from '../components/chat-messages';
import { ActionConfirmationModal } from '../components/action-confirmation-modal';
import { SubscriberQuickInspectDrawer } from '../components/subscriber-quick-inspect-drawer';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { resolveScenario } from '../lib/scenario-resolver';
import { ScenarioDefinition } from '../lib/scenario-definitions';
import { WorkspaceSession } from '../components/generative/workspace-session';

type ResultMessageType =
  | 'metric'
  | 'alerts'
  | 'subscriber'
  | 'action'
  | 'search-results'
  | 'device-table'
  | 'topology'
  | 'bandwidth-chart'
  | 'speed-test'
  | 'outage-map'
  | 'service-plan'
  | 'work-order'
  | 'sla-status'
  | 'provisioning';

type SearchResultStatus = 'healthy' | 'watch' | 'critical' | 'online' | 'degraded' | 'offline' | 'active';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  status?: SearchResultStatus;
}

interface ScopeQuickAction extends ScopeActionOption {
  prompt: string;
  response: string;
  resultTypes?: ResultMessageType[];
  openInspectDrawer?: boolean;
  resultMode?: 'search-results' | 'activate-search';
}

type ScopeCommandName = 'all' | 'region' | 'organization' | 'subscriber' | 'device';
type ScopePaletteStep = 'root' | 'region' | 'organization' | 'subscriber' | 'device';

interface ScopeCommandOption {
  id: string;
  label: string;
  description: string;
  commandLabel?: string;
  nextState?: ScopePaletteState;
  scope?: ScopeSelection;
}

interface ScopePaletteState {
  targetLevel: ScopeCommandName | null;
  step: ScopePaletteStep;
  region?: string;
  organization?: string;
  subscriber?: string;
}

interface ScopeCommandInput {
  command: ScopeCommandName | null;
  filter: string;
}

function matchesScopeQuery(query: string, ...values: Array<string | undefined>) {
  if (!query) return true;

  const normalizedQuery = normalizeScopeSearchValue(query);
  return values.some((value) => normalizeScopeSearchValue(value ?? '').includes(normalizedQuery));
}

function getScopePaletteContext(scope: ScopeSelection) {
  return {
    region: scope.region,
    organization: scope.organization,
    subscriber: scope.subscriber,
  };
}

function getScopePaletteStateForTarget(
  targetLevel: ScopeCommandName | null,
  currentScope: ScopeSelection,
): ScopePaletteState {
  const context = getScopePaletteContext(currentScope);

  if (!targetLevel) {
    return {
      targetLevel: null,
      step: 'root',
      ...context,
    };
  }

  if (targetLevel === 'all') {
    return {
      targetLevel,
      step: 'root',
      ...context,
    };
  }

  if (targetLevel === 'region') {
    return {
      targetLevel,
      step: 'region',
    };
  }

  if (targetLevel === 'organization') {
    return context.region
      ? {
          targetLevel,
          step: 'organization',
          region: context.region,
        }
      : {
          targetLevel,
          step: 'region',
        };
  }

  if (targetLevel === 'subscriber') {
    if (context.organization) {
      return {
        targetLevel,
        step: 'subscriber',
        region: context.region,
        organization: context.organization,
      };
    }

    if (context.region) {
      return {
        targetLevel,
        step: 'organization',
        region: context.region,
      };
    }

    return {
      targetLevel,
      step: 'region',
    };
  }

  if (context.subscriber) {
    return {
      targetLevel,
      step: 'device',
      region: context.region,
      organization: context.organization,
      subscriber: context.subscriber,
    };
  }

  if (context.organization) {
    return {
      targetLevel,
      step: 'subscriber',
      region: context.region,
      organization: context.organization,
    };
  }

  if (context.region) {
    return {
      targetLevel,
      step: 'organization',
      region: context.region,
    };
  }

  return {
    targetLevel,
    step: 'region',
  };
}

function parseScopeCommandInput(input: string): ScopeCommandInput | null {
  if (!input.startsWith('/')) return null;

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

function getRootScopeCommandOptions(currentScope: ScopeSelection): ScopeCommandOption[] {
  return [
    {
      id: 'scope-all',
      label: 'All (Fleet)',
      description: 'Reset to the global fleet scope.',
      commandLabel: '/all',
      scope: { level: 'all' },
    },
    {
      id: 'target-region',
      label: 'Region',
      description: 'Choose a region scope.',
      nextState: getScopePaletteStateForTarget('region', currentScope),
    },
    {
      id: 'target-organization',
      label: 'Organization',
      description: 'Choose region, then organization.',
      nextState: getScopePaletteStateForTarget('organization', currentScope),
    },
    {
      id: 'target-subscriber',
      label: 'Subscriber',
      description: 'Choose region, organization, then subscriber.',
      nextState: getScopePaletteStateForTarget('subscriber', currentScope),
    },
    {
      id: 'target-device',
      label: 'Device',
      description: 'Choose region, organization, subscriber, then gateway device.',
      nextState: getScopePaletteStateForTarget('device', currentScope),
    },
  ];
}

function getScopePalettePlaceholder(state: ScopePaletteState) {
  switch (state.step) {
    case 'root':
      return 'Choose All, Region, Organization, Subscriber, or Device';
    case 'region':
      return 'Filter regions';
    case 'organization':
      return 'Filter organizations in the selected region';
    case 'subscriber':
      return 'Filter subscribers in the selected organization';
    case 'device':
      return 'Filter gateway devices for the selected subscriber';
  }
}

function getScopePaletteContextLabel(state: ScopePaletteState) {
  const parts: string[] = [];

  if (state.region) {
    parts.push(REGION_LABELS[state.region] ?? state.region);
  }
  if (state.organization) {
    parts.push(ORGANIZATION_LABELS[state.organization] ?? state.organization);
  }
  if (state.subscriber) {
    const subscriberName = SUBSCRIBER_LABELS[state.subscriber];
    parts.push(subscriberName ? `${subscriberName} (${state.subscriber})` : state.subscriber);
  }

  return parts.join(' > ');
}

function getScopeCommandOptions(
  state: ScopePaletteState,
  query: string,
  currentScope: ScopeSelection,
): ScopeCommandOption[] {
  switch (state.step) {
    case 'root':
      return getRootScopeCommandOptions(currentScope).filter((option) =>
        matchesScopeQuery(query, option.label, option.description, option.commandLabel),
      );
    case 'region':
      return REGIONS.filter((region) => matchesScopeQuery(query, region.id, region.name)).map((region) => ({
        id: `region-${region.id}`,
        label: region.name,
        description:
          state.targetLevel === 'region'
            ? `Switch scope to ${region.name}.`
            : `Choose ${region.name} and continue.`,
        commandLabel: `/region ${region.id}`,
        scope: state.targetLevel === 'region' ? buildScopeSelection('region', region.id) : undefined,
        nextState:
          state.targetLevel === 'region'
            ? undefined
            : {
                ...state,
                step: 'organization',
                region: region.id,
                organization: undefined,
                subscriber: undefined,
              },
      }));
    case 'organization':
      return getOrganizationsForRegion(state.region)
        .filter((organization) => matchesScopeQuery(query, organization.id, organization.name))
        .map((organization) => ({
          id: `organization-${organization.id}`,
          label: organization.name,
          description:
            state.targetLevel === 'organization'
              ? `Switch to organization ${organization.name}.`
              : `Choose ${organization.name} and continue.`,
          commandLabel: `/organization ${organization.id}`,
          scope:
            state.targetLevel === 'organization'
              ? buildScopeSelection('organization', organization.id)
              : undefined,
          nextState:
            state.targetLevel === 'organization'
              ? undefined
              : {
                  ...state,
                  step: 'subscriber',
                  organization: organization.id,
                  subscriber: undefined,
                },
        }));
    case 'subscriber':
      return getSubscribersForOrganization(state.organization)
        .filter((subscriber) => matchesScopeQuery(query, subscriber.id, subscriber.name))
        .map((subscriber) => ({
          id: `subscriber-${subscriber.id}`,
          label: `${subscriber.name} (${subscriber.id})`,
          description:
            state.targetLevel === 'subscriber'
              ? `Switch to subscriber ${subscriber.name}.`
              : `Choose ${subscriber.name} and continue.`,
          commandLabel: `/subscriber ${subscriber.id}`,
          scope:
            state.targetLevel === 'subscriber'
              ? buildScopeSelection('subscriber', subscriber.id)
              : undefined,
          nextState:
            state.targetLevel === 'subscriber'
              ? undefined
              : {
                  ...state,
                  step: 'device',
                  subscriber: subscriber.id,
                },
        }));
    case 'device':
      return getDevicesForSubscriber(state.subscriber)
        .filter((device) => matchesScopeQuery(query, device.id, device.name))
        .map((device) => {
          const parentScope = getParentScopeForDevice(device.id);
          const subscriberName = SUBSCRIBER_LABELS[parentScope.subscriber ?? ''] ?? DEFAULT_SUBSCRIBER_NAME;
          return {
            id: `device-${device.id}`,
            label: `${device.name} Gateway`,
            description: `${subscriberName} (${parentScope.subscriber})`,
            commandLabel: `/device ${device.id}`,
            scope: buildScopeSelection('device', device.id),
          };
        });
  }
}

function getScopedGatewayContext(scope: ScopeSelection) {
  const subscriberId = scope.subscriber ?? DEFAULT_SUBSCRIBER_ID;
  const subscriberName = SUBSCRIBER_LABELS[subscriberId] ?? DEFAULT_SUBSCRIBER_NAME;
  const scopedDevices = getDevicesForSubscriber(subscriberId);
  const fallbackDevice = scopedDevices[0] ?? { id: 'GW-7834-HOME', name: 'Home' };
  const selectedDevice =
    scopedDevices.find((device) => device.id === scope.device) ?? fallbackDevice;

  return {
    subscriberId,
    subscriberName,
    deviceId: selectedDevice.id,
    deviceName: selectedDevice.name,
    gatewayName: `${getGatewaySiteLabel(subscriberName, selectedDevice.name)} Gateway`,
    siteName: getGatewaySiteLabel(subscriberName, selectedDevice.name),
  };
}

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

function getScopeDisplayLabel(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'all tenants';
    case 'region':
      return REGION_LABELS[scope.region ?? ''] ?? 'this region';
    case 'organization':
      return ORGANIZATION_LABELS[scope.organization ?? ''] ?? 'this organization';
    case 'subscriber': {
      const subscriberName = SUBSCRIBER_LABELS[scope.subscriber ?? ''];
      if (subscriberName && scope.subscriber) {
        return `${subscriberName} (${scope.subscriber})`;
      }
      return 'this subscriber';
    }
    case 'device': {
      const { subscriberId, subscriberName, gatewayName } = getScopedGatewayContext(scope);
      return `${subscriberName} (${subscriberId}) • ${gatewayName}`;
    }
    default:
      return 'the current scope';
  }
}

function getScopeAssistantCopy(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return {
        title: 'Fleet Assistant',
        description: 'Global operations actions for tenants, regions, outages, and fleet health.',
      };
    case 'region':
      return {
        title: 'Region Assistant',
        description: `Operational shortcuts for ${getScopeDisplayLabel(scope)} and its active devices, traffic, and incidents.`,
      };
    case 'organization':
      return {
        title: 'Organization Assistant',
        description: `Operator shortcuts for ${getScopeDisplayLabel(scope)} covering health, SLA, work orders, and plans.`,
      };
    case 'subscriber':
      return {
        title: 'Subscriber Assistant',
        description: `Gateway inventory shortcuts for ${getScopeDisplayLabel(scope)}. Select a gateway device to run diagnostics and actions.`,
      };
    case 'device':
      return {
        title: 'Gateway Assistant',
        description: `Device-level diagnostics and remediation shortcuts for ${getScopeDisplayLabel(scope)}.`,
      };
    default:
      return {
        title: 'Scope Assistant',
        description: 'Shortcuts for the current scope.',
      };
  }
}

function getScopedDeviceTableTitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Fleet Devices';
    case 'region':
      return `${getScopeDisplayLabel(scope)} Devices`;
    case 'organization':
      return `${getScopeDisplayLabel(scope)} Device Inventory`;
    case 'subscriber':
      return `${getScopeDisplayLabel(scope)} Gateway Devices`;
    case 'device':
      return `${getScopeDisplayLabel(scope)} Connected Clients`;
    default:
      return 'Device Inventory';
  }
}

function getScopedBandwidthTitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Bandwidth Usage - Fleet Overview';
    case 'region':
      return `Bandwidth Usage - ${getScopeDisplayLabel(scope)}`;
    case 'organization':
      return `Bandwidth Usage - ${getScopeDisplayLabel(scope)}`;
    case 'subscriber':
      return `Bandwidth Usage - ${getScopeDisplayLabel(scope)}`;
    case 'device':
      return `Gateway Bandwidth - ${getScopeDisplayLabel(scope)}`;
    default:
      return 'Bandwidth Usage';
  }
}

function getScopedServicePlanTitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Fleet Service Plan Overview';
    case 'region':
      return `Regional Service Plans - ${getScopeDisplayLabel(scope)}`;
    case 'organization':
      return `Service Plans - ${getScopeDisplayLabel(scope)}`;
    case 'subscriber':
      return `Service Plan - ${getScopeDisplayLabel(scope)}`;
    case 'device':
      return `Gateway Service Plan - ${getScopeDisplayLabel(scope)}`;
    default:
      return 'Service Plan';
  }
}

function getScopedTopologyName(scope: ScopeSelection) {
  if (scope.level === 'device') {
    return getScopeDisplayLabel(scope);
  }

  return scope.level === 'subscriber' ? getScopeDisplayLabel(scope) : DEFAULT_SUBSCRIBER_NAME;
}

function getScopedSpeedTestTitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Fleet Speed Test Summary';
    case 'region':
      return `Speed Test - ${getScopeDisplayLabel(scope)}`;
    case 'organization':
      return `Speed Test - ${getScopeDisplayLabel(scope)}`;
    case 'subscriber':
      return `Subscriber Speed Test - ${getScopeDisplayLabel(scope)}`;
    case 'device':
      return `Gateway Speed Test - ${getScopeDisplayLabel(scope)}`;
    default:
      return 'Speed Test';
  }
}

function getScopedOutageTitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Fleet Active Outages';
    case 'region':
      return `Active Outages - ${getScopeDisplayLabel(scope)}`;
    case 'organization':
      return `Incidents - ${getScopeDisplayLabel(scope)}`;
    case 'subscriber':
      return `Subscriber Incidents - ${getScopeDisplayLabel(scope)}`;
    case 'device':
      return `Gateway Incidents - ${getScopeDisplayLabel(scope)}`;
    default:
      return 'Active Outages';
  }
}

function getScopedMetricTitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Fleet Network Quality';
    case 'region':
      return `${getScopeDisplayLabel(scope)} Network Quality`;
    case 'organization':
      return `${getScopeDisplayLabel(scope)} Health Score`;
    case 'subscriber':
      return `${getScopeDisplayLabel(scope)} Subscriber Health`;
    case 'device':
      return `${getScopeDisplayLabel(scope)} Gateway Health`;
    default:
      return 'Average Network Quality';
  }
}

function getScopedMetricChange(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return '+2.3% vs yesterday';
    case 'region':
      return '+1.8% vs previous interval';
    case 'organization':
      return '+1.1% vs last report';
    case 'subscriber':
      return '+2.1% after gateway rebalance';
    case 'device':
      return '+4.2% after remediation';
    default:
      return '+2.3% vs yesterday';
  }
}

function getScopedAlerts(scope: ScopeSelection) {
  const label = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return [
        { id: '1', severity: 'critical' as const, message: 'Gateway GW-4521 offline', count: 1 },
        { id: '2', severity: 'medium' as const, message: 'High interference on channel 6', count: 3 },
        { id: '3', severity: 'low' as const, message: 'Firmware updates available', count: 12 },
      ];
    case 'region':
      return [
        { id: '1', severity: 'critical' as const, message: `Backhaul degradation detected in ${label}`, count: 2 },
        { id: '2', severity: 'medium' as const, message: `Channel congestion rising across ${label}`, count: 4 },
        { id: '3', severity: 'low' as const, message: `Pending firmware rollouts in ${label}`, count: 7 },
      ];
    case 'organization':
      return [
        { id: '1', severity: 'critical' as const, message: `${label} has one offline gateway cluster`, count: 1 },
        { id: '2', severity: 'medium' as const, message: `Authentication retries elevated for ${label}`, count: 5 },
        { id: '3', severity: 'low' as const, message: `Plan optimization opportunities identified for ${label}`, count: 9 },
      ];
    case 'subscriber':
      return [
        { id: '1', severity: 'critical' as const, message: `${label} has 1 degraded gateway device`, count: 1 },
        { id: '2', severity: 'medium' as const, message: `Gateway latency is elevated across 2 subscriber devices`, count: 2 },
        { id: '3', severity: 'low' as const, message: `Gateway optimization recommendations available`, count: 2 },
      ];
    case 'device':
      return [
        { id: '1', severity: 'critical' as const, message: `${label} experienced a gateway disconnect`, count: 1 },
        { id: '2', severity: 'medium' as const, message: `Packet loss is elevated for ${label}`, count: 3 },
        { id: '3', severity: 'low' as const, message: `Wi-Fi optimization recommendations available`, count: 2 },
      ];
    default:
      return [];
  }
}

function getScopedSubscriberCard(scope: ScopeSelection) {
  if (scope.level === 'device') {
    const gatewayContext = getScopedGatewayContext(scope);
    return {
      subscriberId: gatewayContext.deviceId,
      name: gatewayContext.gatewayName,
      source: 'Gateway Diagnostics',
      devices: 18,
    };
  }

  if (scope.level === 'subscriber') {
    return {
      subscriberId: scope.subscriber ?? DEFAULT_SUBSCRIBER_ID,
      name: SUBSCRIBER_LABELS[scope.subscriber ?? DEFAULT_SUBSCRIBER_ID] ?? DEFAULT_SUBSCRIBER_NAME,
      source: 'Subscriber Diagnostics',
      devices: getDevicesForSubscriber(scope.subscriber).length || 1,
    };
  }

  if (scope.level === 'organization') {
    return {
      subscriberId: 'ORG-PRIMARY',
      name: `${getScopeDisplayLabel(scope)} Priority Subscriber`,
      source: 'Organization Health Monitor',
      devices: 8,
    };
  }

  if (scope.level === 'region') {
    return {
      subscriberId: 'REG-IMPACT-1',
      name: `${getScopeDisplayLabel(scope)} Impacted Subscriber`,
      source: 'Regional Subscriber Monitor',
      devices: 6,
    };
  }

  return {
    subscriberId: DEFAULT_SUBSCRIBER_ID,
    name: DEFAULT_SUBSCRIBER_NAME,
    source: 'Subscriber Database',
    devices: getDevicesForSubscriber(DEFAULT_SUBSCRIBER_ID).length || 1,
  };
}

function getScopedActionCard(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return {
        title: 'Restart Gateway GW-4521',
        description: 'This will temporarily disconnect the subscriber for 30-60 seconds during restart.',
        source: 'Action Recommendation Engine',
      };
    case 'region':
      return {
        title: `Optimize channels in ${getScopeDisplayLabel(scope)}`,
        description: 'This action will rebalance congested channels across the selected region.',
        source: 'Regional Optimization Engine',
      };
    case 'organization':
      return {
        title: `Open remediation workflow for ${getScopeDisplayLabel(scope)}`,
        description: 'This will create a guided remediation workflow for the organization support team.',
        source: 'Organization Operations Engine',
      };
    case 'subscriber':
      return {
        title: `Review gateway inventory for ${getScopeDisplayLabel(scope)}`,
        description: 'Inspect gateway devices under this subscriber and choose one for remediation.',
        source: 'Subscriber Gateway Inventory',
      };
    case 'device':
      return {
        title: `Restart gateway for ${getScopeDisplayLabel(scope)}`,
        description: 'This will briefly interrupt service while the selected gateway restarts.',
        source: 'Gateway Remediation Engine',
      };
    default:
      return {
        title: 'Recommended Action',
        description: 'Suggested next step for the current scope.',
        source: 'Action Engine',
      };
  }
}

function getScopedReceipt(scope: ScopeSelection) {
  const label = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return {
        action: 'Fleet Remediation Completed',
        details: [
          { label: 'Target', value: 'GW-4521-A' },
          { label: 'Duration', value: '45 seconds' },
          { label: 'Scope', value: 'All (Fleet)' },
        ],
        source: 'Fleet Automation Engine',
      };
    case 'region':
      return {
        action: `Regional Optimization Completed`,
        details: [
          { label: 'Region', value: label },
          { label: 'Duration', value: '3 minutes' },
          { label: 'Affected Gateways', value: '12' },
        ],
        source: 'Regional Optimization Engine',
      };
    case 'organization':
      return {
        action: `Organization Workflow Created`,
        details: [
          { label: 'Organization', value: label },
          { label: 'Workflow', value: 'Remediation Playbook' },
          { label: 'Owner', value: 'Ops Team' },
        ],
        source: 'Organization Operations Engine',
      };
    case 'subscriber':
      return {
        action: `Subscriber Gateway Review Completed`,
        details: [
          { label: 'Subscriber', value: label },
          { label: 'Gateways Reviewed', value: `${getDevicesForSubscriber(scope.subscriber).length || 1}` },
          { label: 'Next Step', value: 'Select gateway device' },
        ],
        source: 'Subscriber Gateway Inventory',
      };
    case 'device': {
      const gatewayContext = getScopedGatewayContext(scope);
      return {
        action: `Gateway Remediation Completed`,
        details: [
          { label: 'Gateway', value: gatewayContext.gatewayName },
          { label: 'Duration', value: '45 seconds' },
          { label: 'Device ID', value: gatewayContext.deviceId },
        ],
        source: 'Gateway Remediation Engine',
      };
    }
    default:
      return {
        action: 'Action Completed',
        details: [],
        source: 'Automation Engine',
      };
  }
}

function getScopedWorkOrder(scope: ScopeSelection) {
  const label = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return {
        title: 'Fleet Work Order Created',
        ticketId: 'WO-20480',
        category: 'Fleet Incident',
        assignedTo: 'Marcus Webb',
      };
    case 'region':
      return {
        title: `Regional Work Order - ${label}`,
        ticketId: 'WO-31420',
        category: 'Regional Optimization',
        assignedTo: 'Elena Brooks',
      };
    case 'organization':
      return {
        title: `Organization Work Order - ${label}`,
        ticketId: 'WO-40812',
        category: 'Tenant Operations',
        assignedTo: 'Sarah Johnson',
      };
    case 'subscriber':
      return {
        title: `Subscriber Work Order - ${label}`,
        ticketId: 'WO-51773',
        category: 'Subscriber Gateway Review',
        assignedTo: 'Mike Chen',
      };
    case 'device':
      return {
        title: `Gateway Work Order - ${label}`,
        ticketId: 'WO-62451',
        category: 'Gateway Remediation',
        assignedTo: 'Nina Patel',
      };
    default:
      return {
        title: 'Work Order Created',
        ticketId: 'WO-20480',
        category: 'Network Issue',
        assignedTo: 'Marcus Webb',
      };
  }
}

function getScopedSLATitle(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return 'Fleet SLA Compliance';
    case 'region':
      return `${getScopeDisplayLabel(scope)} SLA Compliance`;
    case 'organization':
      return `${getScopeDisplayLabel(scope)} SLA Compliance`;
    case 'subscriber':
      return `${getScopeDisplayLabel(scope)} Service Compliance`;
    case 'device':
      return `${getScopeDisplayLabel(scope)} Gateway Compliance`;
    default:
      return 'SLA Compliance';
  }
}

function getScopedProvisioning(scope: ScopeSelection) {
  const label = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return {
        title: 'Provisioning - Fleet New Activations',
        accountId: 'FLEET-2026',
      };
    case 'region':
      return {
        title: `Provisioning - ${label}`,
        accountId: 'REG-20391',
      };
    case 'organization':
      return {
        title: `Provisioning - ${label}`,
        accountId: 'ORG-20391',
      };
    case 'subscriber':
      return {
        title: `Provisioning - ${label}`,
        accountId: scope.subscriber ?? DEFAULT_SUBSCRIBER_ID,
      };
    case 'device': {
      const gatewayContext = getScopedGatewayContext(scope);
      return {
        title: `Provisioning - ${label}`,
        accountId: gatewayContext.deviceId,
      };
    }
    default:
      return {
        title: 'Provisioning',
        accountId: 'ACC-20391',
      };
  }
}

function getScopedActionModal(scope: ScopeSelection) {
  switch (scope.level) {
    case 'all':
      return {
        title: 'Restart Fleet Gateway',
        description: 'This action will restart gateway GW-4521-A to restore fleet connectivity health.',
        scope: '1 Gateway • Fleet Operations',
        expectedImpact: 'Brief subscriber interruption for 30-60 seconds while the gateway restarts.',
        rollbackHint: 'If remediation fails, escalate to fleet operations for hardware diagnostics.',
      };
    case 'region':
      return {
        title: `Optimize Channels - ${getScopeDisplayLabel(scope)}`,
        description: `This action will rebalance channel allocation across ${getScopeDisplayLabel(scope)}.`,
        scope: `Regional Optimization • ${getScopeDisplayLabel(scope)}`,
        expectedImpact: 'Minor client reassociation may occur while channels are reassigned.',
        rollbackHint: 'If client stability degrades, revert to the previous regional channel plan.',
      };
    case 'organization':
      return {
        title: `Start Remediation Workflow - ${getScopeDisplayLabel(scope)}`,
        description: `This action will create and assign a remediation workflow for ${getScopeDisplayLabel(scope)}.`,
        scope: `Organization Workflow • ${getScopeDisplayLabel(scope)}`,
        expectedImpact: 'No direct subscriber interruption. Support workflow and notifications will be triggered.',
        rollbackHint: 'Cancel the workflow before execution if additional approvals are required.',
      };
    case 'subscriber':
      return {
        title: `Review Gateway Devices - ${getScopeDisplayLabel(scope)}`,
        description: 'This action opens a guided gateway review workflow for the selected subscriber.',
        scope: `Subscriber Gateway Inventory • ${getScopeDisplayLabel(scope)}`,
        expectedImpact: 'No immediate service interruption. Use this to choose the exact gateway device to operate on.',
        rollbackHint: 'Exit the workflow if you need to switch to a different gateway device.',
      };
    case 'device':
      return {
        title: `Restart Gateway - ${getScopeDisplayLabel(scope)}`,
        description: 'This action will restart the selected gateway device to resolve connectivity issues.',
        scope: `1 Gateway Device • ${getScopeDisplayLabel(scope)}`,
        expectedImpact: 'Service interruption of 30-60 seconds. Subscriber will experience a brief disconnect.',
        rollbackHint: 'If issues persist after restart, escalate to Tier-2 support for hardware diagnostics.',
      };
    default:
      return {
        title: 'Confirm Action',
        description: 'Review the impact of this action before continuing.',
        scope: 'Current Scope',
        expectedImpact: 'Action impact unavailable.',
        rollbackHint: 'Rollback guidance unavailable.',
      };
  }
}

function getScopedInspectSubscriber(scope: ScopeSelection) {
  if (scope.level === 'device') {
    const gatewayContext = getScopedGatewayContext(scope);
    return {
      id: gatewayContext.subscriberId,
      name: `${gatewayContext.subscriberName} • ${gatewayContext.gatewayName}`,
    };
  }

  if (scope.level === 'subscriber') {
    return {
      id: scope.subscriber ?? DEFAULT_SUBSCRIBER_ID,
      name: SUBSCRIBER_LABELS[scope.subscriber ?? DEFAULT_SUBSCRIBER_ID] ?? DEFAULT_SUBSCRIBER_NAME,
    };
  }

  if (scope.level === 'organization') {
    return {
      id: 'ORG-PRIMARY',
      name: `${getScopeDisplayLabel(scope)} Priority Subscriber`,
    };
  }

  if (scope.level === 'region') {
    return {
      id: 'REG-IMPACT-1',
      name: `${getScopeDisplayLabel(scope)} Impacted Subscriber`,
    };
  }

  return {
    id: DEFAULT_SUBSCRIBER_ID,
    name: DEFAULT_SUBSCRIBER_NAME,
  };
}

function getQuickActionSearchResults(
  action: ScopeQuickAction,
  scope: ScopeSelection,
): {
  title: string;
  source: string;
  emptyMessage: string;
  items: SearchResultItem[];
} | null {
  switch (action.id) {
    case 'all-regions':
      return {
        title: 'Regional Overview',
        source: 'Fleet Scope Index',
        emptyMessage: 'No regions available.',
        items: REGIONS.map((region) => ({
          id: region.id,
          title: region.name,
          subtitle: `${region.organizationCount} organizations • ${region.subscriberCount} subscribers • ${region.deviceCount} devices`,
          meta: `${region.market} • ${region.timezone}`,
          status: region.status,
        })),
      };
    case 'all-providers':
      return {
        title: 'ISP Search Results',
        source: 'Fleet Provider Directory',
        emptyMessage: 'No providers found across the fleet.',
        items: getOrganizationsForRegion().map((organization) => ({
          id: organization.id,
          title: organization.name,
          subtitle: `${organization.subscriberCount} subscribers • ${organization.deviceCount} devices`,
          meta: `${REGION_LABELS[organization.regionId] ?? organization.regionId} • ${organization.serviceModel}`,
          status: organization.status === 'incident' ? 'critical' : organization.status === 'watch' ? 'watch' : 'online',
        })),
      };
    case 'region-organizations':
    case 'region-search-organization':
      return {
        title: `${getScopeDisplayLabel(scope)} ISPs`,
        source: 'Regional Provider Directory',
        emptyMessage: 'No providers found in this region.',
        items: getOrganizationsForRegion(scope.region).map((organization) => ({
          id: organization.id,
          title: organization.name,
          subtitle: `${organization.subscriberCount} subscribers • ${organization.deviceCount} devices`,
          meta: `${organization.tier} tier • ${organization.serviceModel} • ${organization.nocRegion}`,
          status: organization.status === 'incident' ? 'critical' : organization.status === 'watch' ? 'watch' : 'online',
        })),
      };
    case 'org-subscribers':
    case 'org-search-subscriber':
      return {
        title: `${getScopeDisplayLabel(scope)} Subscribers`,
        source: 'Organization Subscriber Directory',
        emptyMessage: 'No subscribers found in this organization.',
        items: getSubscribersForOrganization(scope.organization).map((subscriber) => ({
          id: subscriber.id,
          title: `${subscriber.name} (${subscriber.id})`,
          subtitle: `${subscriber.plan} • ${subscriber.city}`,
          meta: `${subscriber.deviceCount} gateways • ${subscriber.serviceAddress}`,
          status: subscriber.status === 'delinquent' ? 'critical' : subscriber.status === 'watch' ? 'watch' : 'active',
        })),
      };
    case 'sub-gateways':
      return {
        title: `${getScopeDisplayLabel(scope)} Gateway Overview`,
        source: 'Subscriber Gateway Inventory',
        emptyMessage: 'No gateway devices found for this subscriber.',
        items: getDevicesForSubscriber(scope.subscriber).map((device) => ({
          id: device.id,
          title: `${device.name} Gateway`,
          subtitle: `${device.model} • Firmware ${device.firmware}`,
          meta: `${device.connectionType} • Health ${device.healthScore} • Last seen ${new Date(device.lastSeen).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}`,
          status: device.status,
        })),
      };
    case 'device-topology':
      return {
        title: 'Peer Gateways in Current Subscriber',
        source: 'Gateway Scope Directory',
        emptyMessage: 'No peer gateways found for this subscriber.',
        items: getDevicesForSubscriber(scope.subscriber).map((device) => ({
          id: device.id,
          title: `${device.name} Gateway`,
          subtitle: `${device.model} • ${device.connectionType}`,
          meta: `${device.serial} • Health ${device.healthScore}`,
          status: device.status,
        })),
      };
    default:
      return null;
  }
}

function getQuickActionSearchActivation(
  action: ScopeQuickAction,
  scope: ScopeSelection,
): { inputValue: string; nextState: ScopePaletteState } | null {
  switch (action.id) {
    case 'all-providers':
      return {
        inputValue: '/organization ',
        nextState: {
          targetLevel: 'organization',
          step: 'organization',
        },
      };
    case 'region-search-organization':
      return {
        inputValue: '/organization ',
        nextState: {
          targetLevel: 'organization',
          step: 'organization',
          region: scope.region,
        },
      };
    case 'org-search-subscriber':
      return {
        inputValue: '/subscriber ',
        nextState: {
          targetLevel: 'subscriber',
          step: 'subscriber',
          region: scope.region,
          organization: scope.organization,
        },
      };
    default:
      return null;
  }
}

function getScopeActions(scope: ScopeSelection): ScopeQuickAction[] {
  const scopeLabel = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return [
        {
          id: 'all-regions',
          title: 'Show regions',
          description: 'Start from the regional breakdown before drilling into providers.',
          prompt: 'Show me the regional breakdown across all tenants',
          response: `I can break ${scopeLabel} down by region first, then drill into providers within each region.`,
          resultMode: 'search-results',
        },
        {
          id: 'all-providers',
          title: 'Search ISP',
          description: 'Find a specific provider before jumping to subscribers or devices.',
          prompt: 'Search for a specific ISP across all tenants',
          response: `Tell me which ISP you want, and I will narrow ${scopeLabel} down to the matching provider.`,
          resultMode: 'activate-search',
        },
        {
          id: 'all-bandwidth',
          title: 'Review bandwidth overview',
          description: 'Look at aggregate traffic history and usage.',
          prompt: 'Show the fleet bandwidth overview',
          response: `I pulled the aggregate bandwidth view for ${scopeLabel}, including recent peaks, saturation windows, and the heaviest traffic segments.`,
          resultTypes: ['bandwidth-chart'],
        },
        {
          id: 'all-health',
          title: 'Run fleet health analysis',
          description: 'Summarize current health, alerts, and recommended actions.',
          prompt: 'Run a fleet health analysis',
          response: `I summarized the current health signals for ${scopeLabel}, including active risks, notable alerts, and the next actions worth taking.`,
          resultTypes: ['metric', 'alerts', 'subscriber', 'action'],
        },
      ];
    case 'region':
      return [
        {
          id: 'region-organizations',
          title: 'Show ISPs in region',
          description: 'Review providers in this region before drilling into subscribers.',
          prompt: `Show organizations in ${scopeLabel}`,
          response: `I can list the ISPs operating in ${scopeLabel} so you can pick the right provider first.`,
          resultMode: 'search-results',
        },
        {
          id: 'region-search-organization',
          title: 'Search ISP',
          description: 'Find a provider by name inside this region.',
          prompt: `Search for an ISP in ${scopeLabel}`,
          response: `Tell me the ISP name you want inside ${scopeLabel}, and I will narrow it down.`,
          resultMode: 'activate-search',
        },
        {
          id: 'region-outages',
          title: 'View regional outages',
          description: 'Inspect incidents affecting this region.',
          prompt: `Show active outages in ${scopeLabel}`,
          response: `I mapped the active outages affecting ${scopeLabel}, with the current impact footprint and the providers involved.`,
          resultTypes: ['outage-map'],
        },
        {
          id: 'region-bandwidth',
          title: 'Analyze regional bandwidth',
          description: 'Review usage trends for the selected region.',
          prompt: `Analyze bandwidth usage in ${scopeLabel}`,
          response: `I charted the recent bandwidth trend for ${scopeLabel}, highlighting peak demand periods and where usage is rising fastest.`,
          resultTypes: ['bandwidth-chart'],
        },
        {
          id: 'region-optimize',
          title: 'Recommend channel optimization',
          description: 'Generate optimization actions for this region.',
          prompt: `Recommend channel optimization for ${scopeLabel}`,
          response: `I generated channel optimization guidance for ${scopeLabel}, including the highest-priority fixes and where they should be applied first.`,
          resultTypes: ['metric', 'alerts', 'action'],
        },
      ];
    case 'organization':
      return [
        {
          id: 'org-subscribers',
          title: 'Show subscribers',
          description: 'Review subscribers in this provider before drilling into gateways.',
          prompt: `Show subscribers in ${scopeLabel}`,
          response: `I can list subscribers inside ${scopeLabel} so you can choose the right account first.`,
          resultMode: 'search-results',
        },
        {
          id: 'org-search-subscriber',
          title: 'Search subscriber',
          description: 'Find a subscriber by name or ID inside this provider.',
          prompt: `Search for a subscriber in ${scopeLabel}`,
          response: `Tell me the subscriber name or ID you want inside ${scopeLabel}, and I will narrow it down.`,
          resultMode: 'activate-search',
        },
        {
          id: 'org-sla',
          title: 'Check SLA compliance',
          description: 'Inspect current SLA performance for this organization.',
          prompt: `Check SLA compliance for ${scopeLabel}`,
          response: `I checked the current SLA posture for ${scopeLabel}, including compliance status, breach pressure, and where performance is slipping.`,
          resultTypes: ['sla-status'],
        },
        {
          id: 'org-work-orders',
          title: 'Open work orders',
          description: 'Review recent work orders and escalations.',
          prompt: `Show open work orders for ${scopeLabel}`,
          response: `I pulled the open work orders for ${scopeLabel}, including the latest escalations and what is still waiting on action.`,
          resultTypes: ['work-order'],
        },
        {
          id: 'org-plans',
          title: 'Review service plans',
          description: 'Check current plan mix and subscriber plan details.',
          prompt: `Review service plans for ${scopeLabel}`,
          response: `I summarized the current service plans for ${scopeLabel}, including the active plan mix and the subscribers attached to each tier.`,
          resultTypes: ['service-plan'],
        },
      ];
    case 'subscriber':
      return [
        {
          id: 'sub-gateways',
          title: 'List gateway devices',
          description: 'Review all gateway devices under this subscriber.',
          prompt: `Show gateway devices for ${scopeLabel}`,
          response: `I listed the gateway devices currently assigned to ${scopeLabel}, so you can inspect the relevant sites before drilling deeper.`,
          resultTypes: ['device-table', 'subscriber'],
          resultMode: 'search-results',
        },
        {
          id: 'sub-health',
          title: 'Review subscriber health',
          description: 'Summarize gateway health and subscriber-level alerts.',
          prompt: `Review gateway health for ${scopeLabel}`,
          response: `I summarized the current gateway health for ${scopeLabel}, including alert pressure, stability signals, and the main issues to watch.`,
          resultTypes: ['metric', 'alerts', 'subscriber'],
        },
        {
          id: 'sub-topology',
          title: 'View subscriber topology',
          description: 'Inspect all gateway locations and connected client segments.',
          prompt: `Show topology for ${scopeLabel}`,
          response: `I mapped the current network topology for ${scopeLabel}, including the gateway layout and the connected client segments.`,
          resultTypes: ['topology'],
        },
        {
          id: 'sub-plan',
          title: 'Review service plan',
          description: 'Check plan context before drilling into a gateway device.',
          prompt: `Show the current service plan for ${scopeLabel}`,
          response: `I pulled the current service plan for ${scopeLabel}, including tier, usage context, and the most relevant billing details.`,
          resultTypes: ['service-plan'],
        },
      ];
    case 'device':
      return [
        {
          id: 'device-topology',
          title: 'View gateway topology',
          description: 'Inspect this gateway and its connected client devices.',
          prompt: `Show topology for ${scopeLabel}`,
          response: `I mapped the topology for ${scopeLabel}, so you can see this gateway, its attached clients, and the path through the local network.`,
          resultTypes: ['topology'],
          resultMode: 'search-results',
        },
        {
          id: 'device-speed-test',
          title: 'Run speed test',
          description: 'Measure current download, upload, and latency for this gateway.',
          prompt: `Run a speed test for ${scopeLabel}`,
          response: `I started a speed test for ${scopeLabel} and I’m returning the current download, upload, and latency measurements.`,
          resultTypes: ['speed-test'],
        },
        {
          id: 'device-plan',
          title: 'Review current plan',
          description: 'Check service tier, usage, and billing context for this gateway.',
          prompt: `Show the current service plan for ${scopeLabel}`,
          response: `I pulled the current plan attached to ${scopeLabel}, including the service tier, usage profile, and billing context for this gateway.`,
          resultTypes: ['service-plan'],
        },
        {
          id: 'device-inspect',
          title: 'Quick inspect gateway',
          description: 'Open the detailed diagnostic drawer for this gateway context.',
          prompt: `Open a quick inspection for ${scopeLabel}`,
          response: `I opened the quick inspection view for ${scopeLabel}, so you can review the latest diagnostics, alerts, and device state in one place.`,
          openInspectDrawer: true,
        },
      ];
    default:
      return [];
  }
}

const GENERATIVE_PROMPTS = [
  {
    id: 'gen-firmware',
    title: 'Find firmware regression',
    query: 'Show me all home gateways with unusual connection drops in the last 24 hours, group failing devices by MAC vendor, and correlate with recent firmware updates.',
  },
  {
    id: 'gen-dpi',
    title: 'Analyze DPI traffic anomalies',
    query: 'Compare L7 streaming vs gaming traffic across Europe this week and highlight anomalies in TLS traffic classification.',
  },
  {
    id: 'gen-forecast',
    title: 'Forecast ingestion cost',
    query: 'Forecast next month\'s ingestion cost with 15% device growth.',
  },
  {
    id: 'gen-churn',
    title: 'Find silent sufferers',
    query: 'Identify households with high latency in streaming/gaming over the last 14 days with no support tickets. Rank by churn risk.',
  },
  {
    id: 'gen-upsell',
    title: 'Find bandwidth saturation',
    query: 'Show users saturating WAN bandwidth >2 hours/day due to video calls and 4K streaming.',
  },
  {
    id: 'gen-vas',
    title: 'VAS via device fingerprint',
    query: 'Find households with new gaming consoles or children\'s devices but no parental control subscription.',
  },
];

export function CommandCenter() {
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInspectDrawer, setShowInspectDrawer] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });
  const [currentScope, setCurrentScope] = useState<ScopeSelection>({ level: 'all' });
  const [activeScenario, setActiveScenario] = useState<ScenarioDefinition | null>(null);
  const [scopeScrollKey, setScopeScrollKey] = useState(0);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const [scopePaletteState, setScopePaletteState] = useState<ScopePaletteState>(
    getScopePaletteStateForTarget(null, { level: 'all' }),
  );
  const [messages, setMessages] = useState<any[]>([
    {
      type: 'ai-text',
      message:
        'Hello! I\'m your AI operations assistant. How can I help you manage your network today?',
      timestamp: '10:23 AM',
    },
  ]);

  const navigate = useNavigate();

  const ambientPointerStyle = useMemo(
    () => ({
      background: `radial-gradient(420px circle at ${cursorGlow.x}px ${cursorGlow.y}px, var(--cursor-glow), transparent 60%)`,
      opacity: !shouldReduceMotion && cursorGlow.active ? 1 : 0,
    }),
    [cursorGlow, shouldReduceMotion],
  );

  const lastUserMessageIndex = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.type === 'user') {
        return index;
      }
    }

    return -1;
  }, [messages]);

  const lastUserMessageKey =
    lastUserMessageIndex >= 0
      ? `${lastUserMessageIndex}-${messages[lastUserMessageIndex]?.message ?? ''}-${messages[lastUserMessageIndex]?.timestamp ?? ''}`
      : '';

  useEffect(() => {
    const container = scrollContainerRef.current;
    const target = lastMessageRef.current;

    if (!container || !target) return;

    const frame = requestAnimationFrame(() => {
      const maxScrollTop = Math.max(container.scrollHeight - container.clientHeight, 0);

      if (maxScrollTop <= 0) {
        return;
      }

      const targetTop = Math.max(target.offsetTop - 12, 0);
      const nextScrollTop = Math.min(targetTop, maxScrollTop);

      container.scrollTo({
        top: nextScrollTop,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [lastUserMessageKey, shouldReduceMotion]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || scopeScrollKey === 0) return;

    const frame = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [scopeScrollKey, shouldReduceMotion]);

  const currentScopeActions = useMemo(() => getScopeActions(currentScope), [currentScope]);
  const parsedScopeCommand = useMemo(() => parseScopeCommandInput(input), [input]);
  const scopePaletteQuery = useMemo(() => parsedScopeCommand?.filter ?? '', [parsedScopeCommand]);
  const scopeCommandOptions = useMemo(
    () => getScopeCommandOptions(scopePaletteState, scopePaletteQuery, currentScope),
    [currentScope, scopePaletteQuery, scopePaletteState],
  );
  const isScopeCommandMode = input.startsWith('/');

  useEffect(() => {
    setActiveCommandIndex(0);
  }, [input, scopePaletteState]);

  useEffect(() => {
    if (!isScopeCommandMode) {
      setScopePaletteState(getScopePaletteStateForTarget(null, currentScope));
      return;
    }

    setScopePaletteState(getScopePaletteStateForTarget(parsedScopeCommand?.command ?? null, currentScope));
  }, [currentScope, isScopeCommandMode, parsedScopeCommand]);

  const handleGenerativePrompt = (query: string) => {
    const matchedScenario = resolveScenario(query);

    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        message: query,
        timestamp: getTimestamp(),
      },
    ]);

    if (matchedScenario) {
      setIsTyping(true);
      setActiveScenario(matchedScenario);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: 'generative-workspace',
            scenario: matchedScenario,
          },
        ]);
      }, 300);
    } else {
      // Fallback to normal send flow
      setInput(query);
      setTimeout(() => handleSend(), 100);
    }
  };

  const applyScopeChange = (scope: ScopeSelection) => {
    setInput('');
    setActiveCommandIndex(0);
    setScopePaletteState(getScopePaletteStateForTarget(null, scope));
    handleScopeChange(scope);
  };

  const handleScopeCommandSubmit = () => {
    if (!scopeCommandOptions.length) {
      toast.error('No matching scope found for this command.');
      return;
    }

    const activeOption =
      scopeCommandOptions[Math.min(activeCommandIndex, scopeCommandOptions.length - 1)];
    if (activeOption.scope) {
      applyScopeChange(activeOption.scope);
      return;
    }

    if (activeOption.nextState) {
      setScopePaletteState(activeOption.nextState);
    }
  };

  const executeQuickAction = (action: ScopeQuickAction) => {
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        message: action.prompt,
        timestamp: getTimestamp(),
      },
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const nextMessages: any[] = [
        {
          type: 'ai-text',
          message: action.response,
          timestamp: getTimestamp(),
        },
      ];

      if (action.resultTypes?.length) {
        action.resultTypes.forEach((type) => {
          nextMessages.push({ type });
        });
      }

      if (action.resultMode === 'search-results') {
        const searchResults = getQuickActionSearchResults(action, currentScope);
        if (searchResults) {
          nextMessages.push({
            type: 'search-results',
            ...searchResults,
          });
        }
      }

      if (action.resultMode === 'activate-search') {
        const searchActivation = getQuickActionSearchActivation(action, currentScope);
        if (searchActivation) {
          setInput(searchActivation.inputValue);
          setScopePaletteState(searchActivation.nextState);
          setActiveCommandIndex(0);
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }
      }

      if (action.openInspectDrawer) {
        setShowInspectDrawer(true);
      }

      setMessages((prev) => [...prev, ...nextMessages]);
    }, 700);
  };

  const handleScopeChange = (scope: ScopeSelection) => {
    setCurrentScope(scope);
    setScopeScrollKey((prev) => prev + 1);
    const scopeMessage = getScopeChangeMessage(scope);
    const scopeAssistant = getScopeAssistantCopy(scope);
    const actions = getScopeActions(scope);

    setMessages((prev) => [
      ...prev,
      {
        type: 'ai-text',
        message: scopeMessage,
        timestamp: getTimestamp(),
      },
      {
        type: 'scope-actions',
        title: scopeAssistant.title,
        description: scopeAssistant.description,
        actions,
      },
    ]);
  };

  const getScopeChangeMessage = (scope: ScopeSelection): string => {
    switch (scope.level) {
      case 'all':
        return 'Now showing data for all tenants across all regions.';
      case 'region':
        return `Scope changed to ${getScopeDisplayLabel(scope)}. I can help you with operations in this region.`;
      case 'organization':
        return `Now focused on ${getScopeDisplayLabel(scope)}. What would you like to know about this organization?`;
      case 'subscriber':
        return `Viewing subscriber ${getScopeDisplayLabel(scope)}. This level summarizes the subscriber and its gateway devices. Select a gateway device for direct diagnostics and actions.`;
      case 'device':
        return `Viewing gateway device ${getScopeDisplayLabel(scope)}. I can now run device-level diagnostics, actions, and topology for this gateway.`;
      default:
        return 'Scope updated.';
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    if (input.trim().startsWith('/')) {
      handleScopeCommandSubmit();
      return;
    }

    const userInput = input.toLowerCase();

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        message: input,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ]);

    setInput('');
    setIsTyping(true);

    // Check if the query matches a generative scenario
    const matchedScenario = resolveScenario(input);

    if (matchedScenario) {
      setActiveScenario(matchedScenario);
      // Add a brief AI acknowledgment, then the generative workspace will handle the rest
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: 'generative-workspace',
            scenario: matchedScenario,
          },
        ]);
      }, 300);
      return;
    }

    // Simulate AI response with different content based on input
    setTimeout(() => {
      setIsTyping(false);

      if (userInput.includes('device') || userInput.includes('gateway') || userInput.includes('list')) {
        // Show device table
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: `Here is a summary of devices in ${getScopeDisplayLabel(currentScope)}.`,
            timestamp: getTimestamp(),
          },
          {
            type: 'device-table',
          },
        ]);
      } else if (userInput.includes('topology') || userInput.includes('subscriber') || userInput.includes('john')) {
        // Show topology
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: `Here is the network topology for ${getScopeDisplayLabel(currentScope)}.`,
            timestamp: getTimestamp(),
          },
          {
            type: 'topology',
          },
        ]);
      } else if (userInput.includes('chart') || userInput.includes('history') || userInput.includes('bandwidth')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the recent bandwidth usage for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'bandwidth-chart' },
        ]);
      } else if (userInput.includes('speed test') || userInput.includes('speed')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Running a speed test for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'speed-test' },
        ]);
      } else if (userInput.includes('outage') || userInput.includes('down')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here are the active outages for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'outage-map' },
        ]);
      } else if (userInput.includes('plan')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the current service plan for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'service-plan' },
        ]);
      } else if (userInput.includes('work order') || userInput.includes('ticket')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here are the latest work orders for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'work-order' },
        ]);
      } else if (userInput.includes('sla') || userInput.includes('uptime')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the current SLA compliance status for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'sla-status' },
        ]);
      } else if (userInput.includes('provision') || userInput.includes('new user')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the provisioning status for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'provisioning' },
        ]);
      } else {
        // Default response
        const nextMessages = [
          {
            type: 'ai-text',
            message: `I analyzed ${getScopeDisplayLabel(currentScope)}. Here is what I found.`,
            timestamp: getTimestamp(),
          },
          {
            type: 'metric',
          },
          {
            type: 'alerts',
          },
          {
            type: 'subscriber',
          },
        ];

        if (currentScope.level === 'subscriber') {
          nextMessages.push({
            type: 'device-table',
          });
        }

        if (currentScope.level !== 'subscriber') {
          nextMessages.push({
            type: 'action',
          });
        }

        setMessages((prev) => [...prev, ...nextMessages]);
      }
    }, 1500);
  };

  const handleConfirmAction = () => {
    setShowConfirmModal(false);
    toast.success('Action initiated');

    // Add receipt card
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'receipt',
        },
      ]);
    }, 500);
  };

  const renderMessage = (msg: any, idx: number) => {
    switch (msg.type) {
      case 'generative-workspace':
        return (
          <WorkspaceSession
            key={idx}
            scenario={msg.scenario}
            onFollowUp={(prompt) => handleGenerativePrompt(prompt)}
          />
        );

      case 'user':
        return <UserMessage key={idx} message={msg.message} timestamp={msg.timestamp} />;
      
      case 'ai-text':
        return <AITextMessage key={idx} message={msg.message} timestamp={msg.timestamp} />;

      case 'scope-actions':
        return (
          <ScopeActionsCard
            key={idx}
            title={msg.title}
            description={msg.description}
            actions={msg.actions}
            onAction={executeQuickAction}
          />
        );
      
      case 'metric':
        return (
          <MetricCard
            key={idx}
            title={getScopedMetricTitle(currentScope)}
            value="87.3%"
            change={getScopedMetricChange(currentScope)}
            changeType="positive"
            timestamp="10:24 AM"
            source="Network Analytics Engine"
          />
        );
      
      case 'alerts':
        return (
          <AlertListCard
            key={idx}
            alerts={getScopedAlerts(currentScope)}
            timestamp="10:24 AM"
            source="Alert Management System"
          />
        );

      case 'search-results':
        return (
          <SearchResultsCard
            key={idx}
            title={msg.title}
            items={msg.items}
            emptyMessage={msg.emptyMessage}
            timestamp={getTimestamp()}
            source={msg.source}
          />
        );
      
      case 'subscriber': {
        const scopedSubscriberCard = getScopedSubscriberCard(currentScope);
        return (
          <SubscriberCard
            key={idx}
            subscriberId={scopedSubscriberCard.subscriberId}
            name={scopedSubscriberCard.name}
            status="degraded"
            healthScore={73}
            devices={scopedSubscriberCard.devices}
            timestamp="10:24 AM"
            source={scopedSubscriberCard.source}
            onInspect={() => setShowInspectDrawer(true)}
          />
        );
      }

      case 'action': {
        const scopedActionCard = getScopedActionCard(currentScope);
        return (
          <ActionCard
            key={idx}
            title={scopedActionCard.title}
            description={scopedActionCard.description}
            riskLevel="medium"
            primaryAction="Execute"
            secondaryAction="Schedule"
            timestamp="10:24 AM"
            source={scopedActionCard.source}
            onPrimaryAction={() => setShowConfirmModal(true)}
          />
        );
      }
      
      case 'receipt': {
        const scopedReceipt = getScopedReceipt(currentScope);
        return (
          <ReceiptCard
            key={idx}
            action={scopedReceipt.action}
            status="success"
            details={scopedReceipt.details}
            correlationId="act-2024-03-27-1024-7834"
            timestamp="10:25 AM"
            source={scopedReceipt.source}
            onViewAudit={() => navigate('/audit')}
          />
        );
      }
      
      case 'device-table':
        return (
          <DeviceTableCard
            key={idx}
            title={getScopedDeviceTableTitle(currentScope)}
            devices={
              currentScope.level === 'subscriber'
                ? getDevicesForSubscriber(currentScope.subscriber).map((device, deviceIndex) => ({
                    id: device.id,
                    name: `${getGatewaySiteLabel(
                      SUBSCRIBER_LABELS[currentScope.subscriber ?? DEFAULT_SUBSCRIBER_ID] ?? DEFAULT_SUBSCRIBER_NAME,
                      device.name,
                    )} Gateway`,
                    type: 'gateway' as const,
                    status: deviceIndex === 0 ? 'online' as const : 'degraded' as const,
                    location: getGatewaySiteLabel(
                      SUBSCRIBER_LABELS[currentScope.subscriber ?? DEFAULT_SUBSCRIBER_ID] ?? DEFAULT_SUBSCRIBER_NAME,
                      device.name,
                    ),
                    uptime: deviceIndex === 0 ? '45d 12h' : '23d 8h',
                    firmware: deviceIndex === 0 ? 'v2.4.1' : 'v2.4.0',
                  }))
                : [
                    {
                      id: 'DEV-001',
                      name: 'iPhone 14',
                      type: 'gateway' as const,
                      status: 'online' as const,
                      location: getScopedGatewayContext(currentScope).siteName,
                      uptime: '12h 14m',
                      firmware: '5GHz',
                    },
                    {
                      id: 'DEV-002',
                      name: 'MacBook Pro',
                      type: 'router' as const,
                      status: 'online' as const,
                      location: getScopedGatewayContext(currentScope).siteName,
                      uptime: '9h 32m',
                      firmware: '5GHz',
                    },
                    {
                      id: 'DEV-003',
                      name: 'Smart TV',
                      type: 'ap' as const,
                      status: 'online' as const,
                      location: getScopedGatewayContext(currentScope).siteName,
                      uptime: '5h 01m',
                      firmware: 'Ethernet',
                    },
                    {
                      id: 'DEV-004',
                      name: 'Desktop PC',
                      type: 'router' as const,
                      status: 'offline' as const,
                      location: getScopedGatewayContext(currentScope).siteName,
                      uptime: '0h 18m',
                      firmware: 'Ethernet',
                    },
                  ]
            }
            timestamp="10:24 AM"
            source="Device Management System"
          />
        );
      
      case 'topology':
        return (
          <TopologyCard
            key={idx}
            subscriberId={getScopedGatewayContext(currentScope).subscriberId}
            subscriberName={getScopedTopologyName(currentScope)}
            gateway={{
              id: getScopedGatewayContext(currentScope).deviceId,
              name: getScopedGatewayContext(currentScope).gatewayName,
              status: currentScope.level === 'subscriber' ? 'degraded' : 'online',
            }}
            devices={[
              {
                id: 'DEV-001',
                name: 'iPhone 14',
                type: 'smartphone',
                status: 'online',
                connection: '5GHz',
              },
              {
                id: 'DEV-002',
                name: 'MacBook Pro',
                type: 'laptop',
                status: 'online',
                connection: '5GHz',
              },
              {
                id: 'DEV-003',
                name: 'Smart TV',
                type: 'other',
                status: 'online',
                connection: 'Ethernet',
              },
              {
                id: 'DEV-004',
                name: 'iPad Air',
                type: 'tablet',
                status: 'online',
                connection: '2.4GHz',
              },
              {
                id: 'DEV-005',
                name: 'Desktop PC',
                type: 'desktop',
                status: 'offline',
                connection: 'Ethernet',
              },
            ]}
            timestamp="10:24 AM"
            source="Network Topology Service"
          />
        );

      case 'bandwidth-chart':
        return <BandwidthChartCard key={idx} title={getScopedBandwidthTitle(currentScope)} timestamp={getTimestamp()} source="Network Analytics Engine" />;

      case 'speed-test':
        return <SpeedTestCard key={idx} title={getScopedSpeedTestTitle(currentScope)} timestamp={getTimestamp()} source="Speed Test Service" />;

      case 'outage-map':
        return <OutageMapCard key={idx} title={getScopedOutageTitle(currentScope)} timestamp={getTimestamp()} source="NOC Monitoring System" />;

      case 'service-plan':
        return <ServicePlanCard key={idx} title={getScopedServicePlanTitle(currentScope)} timestamp={getTimestamp()} source="Billing System" />;

      case 'work-order': {
        const scopedWorkOrder = getScopedWorkOrder(currentScope);
        return (
          <WorkOrderCard
            key={idx}
            title={scopedWorkOrder.title}
            ticketId={scopedWorkOrder.ticketId}
            category={scopedWorkOrder.category}
            assignedTo={scopedWorkOrder.assignedTo}
            timestamp={getTimestamp()}
            source="Ticketing System"
          />
        );
      }

      case 'sla-status':
        return <SLAStatusCard key={idx} title={getScopedSLATitle(currentScope)} timestamp={getTimestamp()} source="SLA Management System" />;

      case 'provisioning': {
        const scopedProvisioning = getScopedProvisioning(currentScope);
        return (
          <ProvisioningCard
            key={idx}
            title={scopedProvisioning.title}
            accountId={scopedProvisioning.accountId}
            timestamp={getTimestamp()}
            source="Provisioning Service"
          />
        );
      }

      default:
        return null;
    }
  };

  const getMessageMotion = (type: string, idx: number) => {
    const isCard = type !== 'user' && type !== 'ai-text';

    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.09 },
      };
    }

    return {
      initial: { opacity: 0, y: isCard ? 14 : 8, scale: isCard ? 0.985 : 0.99 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -8, scale: 0.985 },
      transition: {
        duration: isCard ? 0.17 : 0.12,
        delay: isCard ? 0.018 : Math.min(idx * 0.01, 0.045),
        type: "spring",
        stiffness: isCard ? 220 : 280,
        damping: isCard ? 24 : 26,
      },
    };
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isScopeCommandMode) {
      if (event.key === 'Enter') {
        handleSend();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!scopeCommandOptions.length) return;
      setActiveCommandIndex((prev) => (prev + 1) % scopeCommandOptions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!scopeCommandOptions.length) return;
      setActiveCommandIndex((prev) =>
        prev === 0 ? scopeCommandOptions.length - 1 : prev - 1,
      );
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setInput('');
      setActiveCommandIndex(0);
      setScopePaletteState(getScopePaletteStateForTarget(null, currentScope));
      return;
    }

    if (event.key === 'Backspace' && !scopePaletteQuery) {
      if (scopePaletteState.step === 'root') return;

      event.preventDefault();

      if (scopePaletteState.step === 'region') {
        setScopePaletteState(getScopePaletteStateForTarget(null, currentScope));
        return;
      }

      if (scopePaletteState.step === 'organization') {
        setScopePaletteState((prev) => ({
          targetLevel: prev.targetLevel,
          step: 'region',
        }));
        return;
      }

      if (scopePaletteState.step === 'subscriber') {
        setScopePaletteState((prev) => ({
          targetLevel: prev.targetLevel,
          step: 'organization',
          region: prev.region,
        }));
        return;
      }

      if (scopePaletteState.step === 'device') {
        setScopePaletteState((prev) => ({
          targetLevel: prev.targetLevel,
          step: 'subscriber',
          region: prev.region,
          organization: prev.organization,
        }));
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleScopeCommandSubmit();
    }
  };

  const handleScopeOptionClick = (option: ScopeCommandOption) => {
    if (option.scope) {
      applyScopeChange(option.scope);
      return;
    }

    if (option.nextState) {
      setScopePaletteState(option.nextState);
      setActiveCommandIndex(0);
    }
  };

  return (
    <AppLayout 
      rightPanel={<ContextPanel scope={currentScope} activeScenario={activeScenario} />} 
      scopeIndicator="Acme ISP • All Regions"
      onScopeChange={handleScopeChange}
      scopeValue={currentScope}
    >
      <div className="h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.035),_transparent_38%)]" />
          <div
            className="ambient-drift absolute -left-[10%] top-[-10%] h-[28rem] w-[28rem] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--ambient-blue) 0%, transparent 68%)',
            }}
          />
          <div
            className="ambient-float absolute right-[-8%] top-[12%] h-[24rem] w-[24rem] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--ambient-cyan) 0%, transparent 70%)',
            }}
          />
          <div
            className="ambient-drift absolute bottom-[-18%] left-[24%] h-[22rem] w-[22rem] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--ambient-violet) 0%, transparent 72%)',
              animationDelay: '-6s',
            }}
          />
          <div
            className="ambient-float absolute bottom-[-10%] right-[8%] h-[18rem] w-[18rem] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--ambient-warm) 0%, transparent 72%)',
              animationDelay: '-9s',
            }}
          />
          <motion.div
            className="absolute inset-0 transition-opacity duration-300"
            animate={{ opacity: !shouldReduceMotion && cursorGlow.active ? 1 : 0 }}
            style={ambientPointerStyle}
          />
        </div>

        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-auto px-3 py-3 lg:px-4 lg:py-4 2xl:px-5 2xl:py-5"
          onPointerMove={(event) => {
            if (shouldReduceMotion) return;
            const rect = event.currentTarget.getBoundingClientRect();
            setCursorGlow({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              active: true,
            });
          }}
          onPointerLeave={() => setCursorGlow((prev) => ({ ...prev, active: false }))}
        >
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="workspace-shell-empty py-4 text-center lg:py-5 2xl:py-7"
            >
              <motion.div
                className="mb-3 inline-flex items-center gap-2"
                initial={{ opacity: 0.85, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.16 }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border"
                  style={{
                    background: 'var(--accent-color)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--primary)',
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold tracking-tight lg:text-lg" style={{ color: 'var(--foreground)' }}>
                  AI Command Center
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.14 }}
                className="mb-3 text-[13px]"
                style={{ color: 'var(--neutral-500)' }}
              >
                Ask me anything about your network operations. Try a generative scenario:
              </motion.p>

              <div className="workspace-shell-suggestions mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {GENERATIVE_PROMPTS.map((prompt, promptIndex) => (
                  <SuggestionCard
                    key={prompt.id}
                    title={prompt.title}
                    onClick={() => handleGenerativePrompt(prompt.query)}
                    delay={0.08 + promptIndex * 0.06}
                  />
                ))}
              </div>

              <div className="mb-2 text-[11px] font-semibold tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
                SCOPE ACTIONS
              </div>
              <div className="workspace-shell-suggestions mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {currentScopeActions.map((action, actionIndex) => (
                  <SuggestionCard
                    key={action.id}
                    title={action.title}
                    onClick={() => executeQuickAction(action)}
                    delay={0.08 + actionIndex * 0.08}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div className="workspace-shell-chat chat-density-compact">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  ref={idx === lastUserMessageIndex ? lastMessageRef : null}
                  {...getMessageMotion(msg.type, idx)}
                >
                  {renderMessage(msg, idx)}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.99 }}
                transition={{ duration: shouldReduceMotion ? 0.075 : 0.11 }}
              >
                <AITextMessage
                  message=""
                  timestamp=""
                  isTyping={true}
                />
              </motion.div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          className="relative z-10 border-t px-3 py-2.5 lg:px-4 lg:py-3"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-base)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 28%, transparent), transparent)',
              opacity: isFocused ? 1 : 0.45,
            }}
          />
          <div className="workspace-shell-chat">
            <div className="flex gap-2">
              <motion.div
                className="relative flex-1 rounded-[var(--radius-control)]"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        boxShadow: isFocused
                          ? '0 16px 34px rgba(0, 0, 0, 0.26)'
                          : input.trim()
                            ? '0 10px 24px rgba(0, 0, 0, 0.18)'
                            : '0 0 0 rgba(0, 0, 0, 0)',
                      }
                }
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                <AnimatePresence>
                  {isScopeCommandMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute inset-x-0 bottom-full z-20 mb-2 overflow-hidden rounded-[calc(var(--radius-control)+4px)] border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]"
                    >
                      <div className="border-b border-[color:var(--border)] px-3 py-2 text-[11px] text-[color:var(--neutral-500)]">
                        Type `/` to start. Use arrows + Enter or click to choose one layer at a time. Press Backspace on an empty filter to go back.
                      </div>
                      <div className="border-b border-[color:var(--border)] px-3 py-2 text-[11px] text-[color:var(--neutral-500)]">
                        <span className="font-medium text-[color:var(--foreground)]">
                          {getScopePalettePlaceholder(scopePaletteState)}
                        </span>
                        {getScopePaletteContextLabel(scopePaletteState) && (
                          <span className="ml-2">
                            {getScopePaletteContextLabel(scopePaletteState)}
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-auto p-1.5">
                        {scopeCommandOptions.length > 0 ? (
                          scopeCommandOptions.map((option, index) => {
                            const isActive = index === activeCommandIndex;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onMouseEnter={() => setActiveCommandIndex(index)}
                                onClick={() => handleScopeOptionClick(option)}
                                className="flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition-colors"
                                style={{
                                  background: isActive ? 'var(--surface-base)' : 'transparent',
                                }}
                              >
                                <div>
                                  <div className="text-[12px] font-medium text-[color:var(--foreground)]">
                                    {option.label}
                                  </div>
                                  <div className="text-[11px] text-[color:var(--neutral-500)]">
                                    {option.description}
                                  </div>
                                </div>
                                <div className="ml-3 flex items-center gap-2">
                                  <span className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--neutral-400)]">
                                    {option.commandLabel}
                                  </span>
                                  {isActive && <Check className="h-3.5 w-3.5 text-[color:var(--primary)]" />}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-3 py-4 text-[12px] text-[color:var(--neutral-500)]">
                            No matches at this level. Keep filtering, or press Backspace to return to the previous layer.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          opacity: isFocused ? 1 : input.trim() ? 0.65 : 0.35,
                          scale: isFocused ? 1.02 : 1,
                        }
                  }
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  style={{
                    background:
                      'radial-gradient(circle at 16% 50%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 58%), linear-gradient(135deg, color-mix(in srgb, var(--ambient-blue) 70%, transparent), transparent 42%)',
                  }}
                />
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={isScopeCommandMode ? getScopePalettePlaceholder(scopePaletteState) : "Ask about network status, or type / to switch scope..."}
                  className="relative z-10 w-full rounded-lg border px-3 py-2 text-[12px] transition-all"
                  style={{
                    background: 'var(--surface-raised)',
                    borderColor: isFocused ? 'var(--primary)' : 'var(--border)',
                    borderRadius: 'var(--radius-control)',
                    boxShadow: isFocused
                      ? '0 0 0 4px var(--focus-ring), inset 0 1px 0 rgba(255,255,255,0.02)'
                      : 'var(--shadow-xs)',
                  }}
                />
                
                <AnimatePresence>
                  {input.length > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.75 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 1.02,
                        y: -1,
                      }
                }
                whileTap={shouldReduceMotion ? undefined : { scale: 0.975 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        boxShadow: input.trim()
                          ? '0 12px 28px rgba(14, 83, 155, 0.28)'
                          : '0 0 0 rgba(0,0,0,0)',
                      }
                }
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="relative overflow-hidden px-3.5"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            opacity: input.trim() ? 1 : 0.35,
                          }
                    }
                    transition={{ duration: 0.1 }}
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%), radial-gradient(circle at 30% 50%, rgba(255,255,255,0.18), transparent 48%)',
                    }}
                  />
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals & Drawers */}
      <ActionConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        action={{
          ...getScopedActionModal(currentScope),
          riskLevel: 'medium',
        }}
      />

      <SubscriberQuickInspectDrawer
        isOpen={showInspectDrawer}
        onClose={() => setShowInspectDrawer(false)}
        subscriber={{
          ...getScopedInspectSubscriber(currentScope),
          healthScore: 73,
          devices: [
            {
              id: 'DEV-001',
              name: 'iPhone 14',
              type: 'smartphone',
              rssi: -68,
              phy: '802.11ax',
              traffic: '1.2 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-002',
              name: 'MacBook Pro',
              type: 'laptop',
              rssi: -52,
              phy: '802.11ax',
              traffic: '4.5 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-003',
              name: 'Smart TV',
              type: 'other',
              rssi: -74,
              phy: '802.11ac',
              traffic: '8.3 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-004',
              name: 'iPad Air',
              type: 'smartphone',
              rssi: -65,
              phy: '802.11ax',
              traffic: '2.1 GB/day',
              status: 'online',
            },
            {
              id: 'DEV-005',
              name: 'Desktop PC',
              type: 'desktop',
              rssi: -58,
              phy: '802.11ax',
              traffic: '6.7 GB/day',
              status: 'offline',
            },
          ],
          wifiKpis: {
            avgRssi: '-63 dBm',
            avgPhy: '802.11ax',
            packetLoss: '0.8%',
            latency: '12ms',
          },
          recentAnomalies: [
            {
              time: '2 hours ago',
              description: 'Intermittent connection drops detected',
              severity: 'medium',
            },
            {
              time: '5 hours ago',
              description: 'High packet loss on 5GHz band',
              severity: 'high',
            },
            {
              time: 'Yesterday',
              description: 'Gateway firmware updated',
              severity: 'low',
            },
          ],
        }}
      />
    </AppLayout>
  );
}

interface SuggestionCardProps {
  title: string;
  onClick: () => void;
  delay?: number;
}

function SuggestionCard({ title, onClick, delay = 0 }: SuggestionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8, scale: 0.992 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: delay * 0.35,
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ 
        y: -1,
        scale: 1.005,
        borderColor: 'var(--border-strong)',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
      }}
      whileTap={{ scale: 0.992, y: 0 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border p-2.5 text-left transition-[border-color,box-shadow,transform] duration-200"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-control)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--card-glow) 62%, transparent), transparent 48%)',
        }}
      />
      <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
        {title}
      </span>
    </motion.button>
  );
}
