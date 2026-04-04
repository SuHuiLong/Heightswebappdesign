import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Activity, Search, Send, Sparkles, Users, Zap, Check, History, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScopeSelection, ScopeSelector } from '../components/scope-selector';
import { AppLayout } from '../components/app-layout';
import { WorkspaceRightPanel } from '../components/workspace-right-panel';
import { WORKSPACES, WORKSPACE_STARTER_TASKS, getWorkspaceContext } from '../lib/workspace-definitions';
import { toast } from 'sonner';
import { resolveScenario } from '../lib/scenario-resolver';
import { ScenarioDefinition } from '../lib/scenario-definitions';
import { WorkspaceSession } from '../components/generative/workspace-session';
import { ScopeActionsCard, ScopeActionOption } from '../components/chat-messages';
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

// Types
type ResultMessageType =
  | 'metric'
  | 'alerts'
  | 'subscriber'
  | 'action'
  | 'search-results'
  | 'device-table'
  | 'topology'
  | 'bandwidth-chart'
  | 'outage-map';

interface Message {
  type: string;
  message?: string;
  timestamp?: string;
  scenario?: ScenarioDefinition;
  [key: string]: any;
}

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

// Operations-specific scenario prompts
const OPERATIONS_SCENARIOS = [
  {
    id: 'ops-firmware',
    title: 'Firmware Regression',
    description: 'Find gateways with connection drops correlated to firmware versions',
    query: 'Show me all home gateways with unusual connection drops in the last 24 hours, group failing devices by MAC vendor, and correlate with recent firmware updates.',
    icon: 'bug',
  },
  {
    id: 'ops-traffic',
    title: 'Traffic Anomalies',
    description: 'Compare L7 streaming vs gaming traffic and highlight TLS classification gaps',
    query: 'Compare L7 streaming vs gaming traffic across Europe this week and highlight anomalies in TLS traffic classification.',
    icon: 'activity',
  },
  {
    id: 'ops-forecast',
    title: 'Cost Forecast',
    description: 'Forecast next month\'s ingestion cost with growth assumptions',
    query: 'Forecast next month\'s ingestion cost with 15% device growth.',
    icon: 'trending-up',
  },
];

// Operations-specific quick actions
const OPERATIONS_ACTIONS = [
  {
    id: 'ops-fleet-health',
    title: 'Fleet Health Summary',
    description: 'Get overall fleet health status across all regions',
    prompt: 'Run a fleet health analysis and show me the current status across all regions.',
    icon: 'heart',
  },
  {
    id: 'ops-active-incidents',
    title: 'Active Incidents',
    description: 'View all currently active incidents and their status',
    prompt: 'Show me all active incidents across the fleet.',
    icon: 'alert-triangle',
  },
  {
    id: 'ops-regional-view',
    title: 'Regional Overview',
    description: 'Compare health metrics across all regions',
    prompt: 'Show me a regional breakdown comparing health metrics.',
    icon: 'globe',
  },
  {
    id: 'ops-cohort-analysis',
    title: 'Cohort Analysis',
    description: 'Analyze specific device cohorts for patterns',
    prompt: 'Analyze the Broadcom device cohort for connection patterns.',
    icon: 'layers',
  },
];

// Scope-specific actions for Operations
interface ScopeQuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

function getScopeActions(scope: ScopeSelection): ScopeQuickAction[] {
  const getScopeDisplayLabel = (scope: ScopeSelection) => {
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
        const subscriberId = scope.subscriber ?? DEFAULT_SUBSCRIBER_ID;
        const subscriberName = SUBSCRIBER_LABELS[subscriberId] ?? DEFAULT_SUBSCRIBER_NAME;
        const scopedDevices = getDevicesForSubscriber(subscriberId);
        const fallbackDevice = scopedDevices[0] ?? { id: 'GW-7834-HOME', name: 'Home' };
        const selectedDevice =
          scopedDevices.find((device) => device.id === scope.device) ?? fallbackDevice;
        return `${subscriberName} • ${getGatewaySiteLabel(subscriberName, selectedDevice.name)} Gateway`;
      }
      default:
        return 'the current scope';
    }
  };

  const scopeLabel = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return [
        {
          id: 'all-device-list',
          title: 'Show fleet device list',
          description: 'Review gateways, routers, and APs across the fleet.',
          prompt: 'Show the fleet device list across all tenants',
        },
        {
          id: 'all-outages',
          title: 'View active outages',
          description: 'See current outages and impacted zones.',
          prompt: 'Show all active outages across the fleet',
        },
        {
          id: 'all-bandwidth',
          title: 'Review bandwidth overview',
          description: 'Look at aggregate traffic history and usage.',
          prompt: 'Show the fleet bandwidth overview',
        },
        {
          id: 'all-health',
          title: 'Run fleet health analysis',
          description: 'Summarize current health, alerts, and recommended actions.',
          prompt: 'Run a fleet health analysis',
        },
      ];
    case 'region':
      return [
        {
          id: 'region-devices',
          title: 'Show region devices',
          description: 'List devices in the selected region.',
          prompt: `Show me all devices in ${scopeLabel}`,
        },
        {
          id: 'region-outages',
          title: 'View regional outages',
          description: 'Inspect incidents affecting this region.',
          prompt: `Show active outages in ${scopeLabel}`,
        },
        {
          id: 'region-bandwidth',
          title: 'Analyze regional bandwidth',
          description: 'Review usage trends for the selected region.',
          prompt: `Analyze bandwidth usage in ${scopeLabel}`,
        },
        {
          id: 'region-optimize',
          title: 'Recommend channel optimization',
          description: 'Generate optimization actions for this region.',
          prompt: `Recommend channel optimization for ${scopeLabel}`,
        },
      ];
    case 'organization':
      return [
        {
          id: 'org-health',
          title: 'Review org health',
          description: 'Summarize health, alerts, and next actions.',
          prompt: `Review operational health for ${scopeLabel}`,
        },
        {
          id: 'org-sla',
          title: 'Check SLA compliance',
          description: 'Inspect current SLA performance for this organization.',
          prompt: `Check SLA compliance for ${scopeLabel}`,
        },
        {
          id: 'org-work-orders',
          title: 'Open work orders',
          description: 'Review recent work orders and escalations.',
          prompt: `Show open work orders for ${scopeLabel}`,
        },
        {
          id: 'org-plans',
          title: 'Review service plans',
          description: 'Check current plan mix and subscriber plan details.',
          prompt: `Review service plans for ${scopeLabel}`,
        },
      ];
    case 'subscriber':
      return [
        {
          id: 'sub-gateways',
          title: 'List gateway devices',
          description: 'Review all gateway devices under this subscriber.',
          prompt: `Show gateway devices for ${scopeLabel}`,
        },
        {
          id: 'sub-health',
          title: 'Review subscriber health',
          description: 'Summarize gateway health and subscriber-level alerts.',
          prompt: `Review gateway health for ${scopeLabel}`,
        },
        {
          id: 'sub-topology',
          title: 'View subscriber topology',
          description: 'Inspect all gateway locations and connected client segments.',
          prompt: `Show topology for ${scopeLabel}`,
        },
        {
          id: 'sub-plan',
          title: 'Review service plan',
          description: 'Check plan context before drilling into a gateway device.',
          prompt: `Show the current service plan for ${scopeLabel}`,
        },
      ];
    case 'device':
      return [
        {
          id: 'device-topology',
          title: 'View gateway topology',
          description: 'Inspect this gateway and its connected client devices.',
          prompt: `Show topology for ${scopeLabel}`,
        },
        {
          id: 'device-speed-test',
          title: 'Run speed test',
          description: 'Measure current download, upload, and latency for this gateway.',
          prompt: `Run a speed test for ${scopeLabel}`,
        },
        {
          id: 'device-plan',
          title: 'Review current plan',
          description: 'Check service tier, usage, and billing context for this gateway.',
          prompt: `Show the current service plan for ${scopeLabel}`,
        },
        {
          id: 'device-diagnostics',
          title: 'Run diagnostics',
          description: 'Open detailed diagnostic analysis for this gateway.',
          prompt: `Run diagnostics for ${scopeLabel}`,
        },
      ];
    default:
      return [];
  }
}

// Scope Palette Types
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

export function OperationsWorkspace() {
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });
  const [currentScope, setCurrentScope] = useState<ScopeSelection>({ level: 'all' });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai-text',
      message: `Welcome to Operations. I can help you investigate fleet-wide incidents, analyze cohorts, and manage network-wide issues. What would you like to focus on today?`,
      timestamp: getTimestamp(),
    },
  ]);

  // Scope palette state
  const [scopePaletteState, setScopePaletteState] = useState<ScopePaletteState>(
    getScopePaletteStateForTarget(null, { level: 'all' }),
  );
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  const workspaceContext = useMemo(() => getWorkspaceContext('operations'), []);
  const starterTasks = useMemo(() => WORKSPACE_STARTER_TASKS.operations, []);
  const currentScopeActions = useMemo(() => getScopeActions(currentScope), [currentScope]);

  // Scope command parsing
  const parsedScopeCommand = useMemo(() => parseScopeCommandInput(input), [input]);
  const scopePaletteQuery = useMemo(() => parsedScopeCommand?.filter ?? '', [parsedScopeCommand]);
  const scopeCommandOptions = useMemo(
    () => getScopeCommandOptions(scopePaletteState, scopePaletteQuery, currentScope),
    [currentScope, scopePaletteQuery, scopePaletteState],
  );
  const isScopeCommandMode = input.startsWith('/');

  // Reset active command index when input changes
  useEffect(() => {
    setActiveCommandIndex(0);
  }, [input, scopePaletteState]);

  // Update scope palette state based on command
  useEffect(() => {
    if (!isScopeCommandMode) {
      setScopePaletteState(getScopePaletteStateForTarget(null, currentScope));
      return;
    }

    setScopePaletteState(getScopePaletteStateForTarget(parsedScopeCommand?.command ?? null, currentScope));
  }, [currentScope, isScopeCommandMode, parsedScopeCommand]);

  // Auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    const target = lastMessageRef.current;

    if (!container || !target) return;

    const frame = requestAnimationFrame(() => {
      container.scrollTo({
        top: target.offsetTop - 12,
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages.length, shouldReduceMotion]);

  const handleScopeChange = (scope: ScopeSelection) => {
    setCurrentScope(scope);
    // Reset interaction state to show cards again when scope changes
    setHasInteracted(false);

    // Scroll to bottom when scope changes
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
        });
      }
    }, 100);

    // Don't add message when changing scope to keep recommendation cards visible
    // const scopeMessage = getScopeChangeMessage(scope);
    // setMessages((prev) => [
    //   ...prev,
    //   {
    //     type: 'ai-text',
    //     message: scopeMessage,
    //     timestamp: getTimestamp(),
    //   },
    // ]);
  };

  const getScopeChangeMessage = (scope: ScopeSelection): string => {
    const getScopeDisplayLabel = (scope: ScopeSelection) => {
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
          const subscriberId = scope.subscriber ?? DEFAULT_SUBSCRIBER_ID;
          const subscriberName = SUBSCRIBER_LABELS[subscriberId] ?? DEFAULT_SUBSCRIBER_NAME;
          const scopedDevices = getDevicesForSubscriber(subscriberId);
          const fallbackDevice = scopedDevices[0] ?? { id: 'GW-7834-HOME', name: 'Home' };
          const selectedDevice =
            scopedDevices.find((device) => device.id === scope.device) ?? fallbackDevice;
          return `${subscriberName} • ${getGatewaySiteLabel(subscriberName, selectedDevice.name)} Gateway`;
        }
        default:
          return 'the current scope';
      }
    };

    switch (scope.level) {
      case 'all':
        return 'Now showing data for all tenants across all regions.';
      case 'region':
        return `Scope changed to ${getScopeDisplayLabel(scope)}. I can help you with operations in this region.`;
      case 'organization':
        return `Now focused on ${getScopeDisplayLabel(scope)}. What would you like to know about this organization?`;
      case 'subscriber':
        return `Viewing subscriber ${getScopeDisplayLabel(scope)}. Select a gateway device for direct diagnostics and actions.`;
      case 'device':
        return `Viewing gateway device ${getScopeDisplayLabel(scope)}. I can now run device-level diagnostics, actions, and topology for this gateway.`;
      default:
        return 'Scope updated.';
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

  const handleGenerativePrompt = (query: string) => {
    // Hide the main area cards on first interaction
    setHasInteracted(true);

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
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: `I've analyzed the fleet data for "${query}". Here's what I found.`,
            timestamp: getTimestamp(),
          },
          {
            type: 'metric',
          },
          {
            type: 'alerts',
          },
        ]);
      }, 1500);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    if (input.trim().startsWith('/')) {
      handleScopeCommandSubmit();
      return;
    }

    const query = input;
    setInput('');
    setSuppressSuggestions(true);
    handleGenerativePrompt(query);
  };

  const renderMessage = (msg: Message, idx: number) => {
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
        return (
          <motion.div
            key={idx}
            className="flex justify-end"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-2.5"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              <p className="text-sm">{msg.message}</p>
              <span className="mt-1 text-xs opacity-70">{msg.timestamp}</span>
            </div>
          </motion.div>
        );

      case 'ai-text':
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            className="flex gap-3"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'var(--accent-color)' }}
            >
              <Activity className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="flex-1">
              <div
                className="inline-block rounded-2xl px-4 py-2.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                  {msg.message}
                </p>
                <span className="mt-1 text-xs" style={{ color: 'var(--neutral-500)' }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </motion.div>
        );

      case 'metric':
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.17 }}
            className="ml-11 max-w-2xl"
          >
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Fleet Network Quality
                </h4>
                <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                  {getTimestamp()}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-semibold" style={{ color: 'var(--success)' }}>
                  94.2%
                </span>
                <span className="mb-1 text-sm" style={{ color: 'var(--success)' }}>
                  +2.3% vs yesterday
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Avg Latency</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>18ms</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Packet Loss</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>0.12%</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Jitter</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>4ms</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>Source: Network Analytics Engine</span>
              </div>
            </div>
          </motion.div>
        );

      case 'alerts':
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.17 }}
            className="ml-11 max-w-2xl"
          >
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Active Alerts
                </h4>
                <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                  {getTimestamp()}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { severity: 'critical', message: 'Gateway GW-4521 offline affecting 12 users', count: 1 },
                  { severity: 'medium', message: 'High interference on channel 6 in US-East', count: 3 },
                  { severity: 'low', message: 'Firmware updates available for 847 gateways', count: 12 },
                ].map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg p-2.5"
                    style={{ background: 'var(--surface-base)' }}
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full mt-1.5"
                      style={{
                        background:
                          alert.severity === 'critical'
                            ? 'var(--critical)'
                            : alert.severity === 'medium'
                              ? 'var(--warning)'
                              : 'var(--neutral-400)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {alert.message}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-xs font-medium"
                      style={{ color: 'var(--neutral-500)' }}
                    >
                      {alert.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const ambientPointerStyle = useMemo(
    () => ({
      background: `radial-gradient(420px circle at ${cursorGlow.x}px ${cursorGlow.y}px, var(--cursor-glow), transparent 60%)`,
      opacity: !shouldReduceMotion && cursorGlow.active ? 1 : 0,
    }),
    [cursorGlow, shouldReduceMotion],
  );

  return (
    <AppLayout
      scopeValue={currentScope}
      onScopeChange={handleScopeChange}
    >
      <div className="flex h-full overflow-hidden">
        {/* Center - AI Workspace */}
        <main className="relative flex flex-col flex-1 overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.035),_transparent_38%)]" />
            <motion.div
              className="absolute inset-0 transition-opacity duration-300"
              animate={{ opacity: !shouldReduceMotion && cursorGlow.active ? 1 : 0 }}
              style={ambientPointerStyle}
            />
          </div>

          {/* Chat Area */}
          <div
            ref={scrollContainerRef}
            className="relative z-10 flex-1 overflow-auto px-4 py-4"
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
            {/* Operations Scenarios - Fixed at top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="max-w-3xl mx-auto mb-6"
            >
              <div className="mb-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                  <span className="text-xs font-semibold tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
                    WHAT YOU CAN ASK
                  </span>
                  <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {OPERATIONS_SCENARIOS.map((scenario, i) => (
                    <motion.button
                      key={scenario.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.2 }}
                      onClick={() => handleGenerativePrompt(scenario.query)}
                      className="text-left p-3 rounded-xl border transition-all hover:scale-[1.02]"
                      style={{
                        background: 'var(--card)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        {scenario.title}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--neutral-400)' }}>
                        {scenario.description}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <div key={idx} ref={idx === messages.length - 1 ? lastMessageRef : null}>
                    {renderMessage(msg, idx)}
                  </div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--accent-color)' }}
                    >
                      <Activity className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" style={{ color: 'var(--neutral-400)' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" style={{ color: 'var(--neutral-400)', animationDelay: '0.2s' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" style={{ color: 'var(--neutral-400)', animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scope Actions - Dynamic based on current scope */}
            <AnimatePresence>
              {!hasInteracted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="max-w-3xl mx-auto mt-8 pb-4"
                >
              {/* Current Scope Label */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3" style={{ color: 'var(--neutral-500)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--neutral-500)' }}>
                    {(() => {
                      switch (currentScope.level) {
                        case 'all': return 'ALL TENANTS (FLEET)';
                        case 'region': return REGION_LABELS[currentScope.region ?? ''] ?? 'REGION';
                        case 'organization': return ORGANIZATION_LABELS[currentScope.organization ?? ''] ?? 'ORGANIZATION';
                        case 'subscriber': return SUBSCRIBER_LABELS[currentScope.subscriber ?? ''] ?? 'SUBSCRIBER';
                        case 'device': return 'GATEWAY DEVICE';
                        default: return 'UNKNOWN';
                      }
                    })()}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                    · Type / to change
                  </span>
                </div>
                <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {currentScopeActions.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                    onClick={() => handleGenerativePrompt(action.prompt)}
                    className="text-left px-3 py-2.5 rounded-lg border transition-all hover:scale-[1.02]"
                    style={{
                      background: 'var(--surface-raised)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                      {action.title}
                    </div>
                  </motion.button>
                ))}
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}>
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--neutral-400)' }} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onFocus={() => { setIsFocused(true); setSuppressSuggestions(false); }}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask about fleet operations, incidents, or cohorts... (Type / to change scope)"
                    className="w-full rounded-lg border pl-9 pr-3 py-2.5 text-sm transition-all"
                    style={{
                      background: 'var(--surface-raised)',
                      borderColor: isFocused ? 'var(--primary)' : 'var(--border)',
                      boxShadow: isFocused ? '0 0 0 3px var(--focus-ring)' : 'var(--shadow-xs)',
                    }}
                  />
                  {/* Question Suggestions Dropdown */}
                  <AnimatePresence>
                    {isFocused && !input.trim() && !isScopeCommandMode && !suppressSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-x-0 bottom-full z-20 mb-2 overflow-hidden rounded-xl border shadow-lg"
                        style={{
                          background: 'var(--card)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        {/* Recent Questions */}
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-1.5 mb-2">
                            <History className="h-3 w-3" style={{ color: 'var(--neutral-500)' }} />
                            <span className="text-[11px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                              Recent
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {WORKSPACES.operations.recentQuestions.map((q, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setInput(q);
                                  inputRef.current?.focus();
                                }}
                                className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-[var(--surface-base)]"
                                style={{ color: 'var(--neutral-400)' }}
                              >
                                <span className="line-clamp-1">{q}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="h-px" style={{ background: 'var(--border-subtle)' }} />
                        {/* Top Questions */}
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-1.5 mb-2">
                            <TrendingUp className="h-3 w-3" style={{ color: 'var(--neutral-500)' }} />
                            <span className="text-[11px] font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                              Top Questions
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {WORKSPACES.operations.topQuestions.map((q, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setInput(q);
                                  inputRef.current?.focus();
                                }}
                                className="flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-[var(--surface-base)]"
                                style={{ color: 'var(--neutral-400)' }}
                              >
                                <span className="line-clamp-1">{q}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Scope Palette Dropdown */}
                  <AnimatePresence>
                    {isScopeCommandMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.12 }}
                        className="absolute inset-x-0 bottom-full z-20 mb-2 overflow-hidden rounded-xl border shadow-lg"
                        style={{
                          background: 'var(--card)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="border-b px-3 py-2 text-[11px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--neutral-500)' }}>
                          Type / to start. Use arrows + Enter or click to choose one layer at a time.
                        </div>
                        <div className="border-b px-3 py-2 text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {getScopePalettePlaceholder(scopePaletteState)}
                          </span>
                          {getScopePaletteContextLabel(scopePaletteState) && (
                            <span className="ml-2" style={{ color: 'var(--neutral-400)' }}>
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
                                  className="flex w-full items-start justify-between rounded-lg px-3 py-2 text-left transition-colors"
                                  style={{
                                    background: isActive ? 'var(--surface-base)' : 'transparent',
                                  }}
                                >
                                  <div>
                                    <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                                      {option.label}
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                                      {option.description}
                                    </div>
                                  </div>
                                  <div className="ml-3 flex items-center gap-2">
                                    {option.commandLabel && (
                                      <span className="text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--neutral-400)' }}>
                                        {option.commandLabel}
                                      </span>
                                    )}
                                    {isActive && <Check className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />}
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-3 py-4 text-xs text-center" style={{ color: 'var(--neutral-500)' }}>
                              No matches at this level. Keep filtering, or press Backspace to return to the previous layer.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Reasoning / Actions / Audit */}
        <WorkspaceRightPanel
          workspaceId="operations"
          isActive={isTyping}
        />
      </div>
    </AppLayout>
  );
}
