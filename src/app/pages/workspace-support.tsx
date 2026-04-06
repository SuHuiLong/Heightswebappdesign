import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Users, Search, Send, Sparkles, Home, Ticket, Clock, AlertTriangle, CheckCircle, XCircle, Wifi, Router, Activity, Check, Bot, UserCheck, Zap, History, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AppLayout } from '../components/app-layout';
import { WorkspaceRightPanel } from '../components/workspace-right-panel';
import { WORKSPACES, WORKSPACE_STARTER_TASKS, getWorkspaceContext } from '../lib/workspace-definitions';
import { useRecentQuestions } from '../lib/use-recent-questions';
import { useWorkspaceCards, useScopeActionOverrides } from '../lib/use-workspace-card-settings';
import { toast } from 'sonner';
import { ScopeSelection, ScopeSelector } from '../components/scope-selector';
import { resolveScenarioForWorkspace } from '../lib/scenario-resolver';
import { ScenarioDefinition } from '../lib/scenario-definitions';
import { WorkspaceSession } from '../components/generative/workspace-session';
import {
  buildFallbackClarificationMessage,
  matchPromptCandidate,
} from '../lib/fallback-query-routing';
import {
  buildProcessRailSnapshot,
  DEMO_PROCESS_TIMING,
  getScenarioProcessDuration,
  type WorkbenchProcessPhase,
} from '../lib/workbench-model';
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
  ALL_SUPPORT_SCOPE_ACTIONS as ALL_SUPPORT_SCOPE_ACTIONS_DATA,
  getScopeCommandOptionsForWorkspace,
  getSupportPresetQueryMatch,
  getWorkspaceDefaultScope,
  getWorkspaceExperience,
  getWorkspaceScopeActions,
  getWorkspaceScopeDisplayLabel,
  getWorkspaceScopePaletteContextLabel,
  getWorkspaceScopePalettePlaceholder,
  getWorkspaceScopePaletteStateForTarget,
  getWorkspaceScopeTagLabel,
  parseScopeCommandInputForWorkspace,
  SUPPORT_SCENARIOS as SUPPORT_SCENARIOS_DATA,
} from '../lib/workspace-experience';

// Types
type ViewMode = 'chat' | 'home-dashboard' | 'ticket-workspace';

interface Message {
  type: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** How this ticket was resolved:
   *  - 'autonomous': AI self-discovered and self-resolved the issue
   *  - 'ai-assisted': User-initiated, AI accelerated resolution, but human support finalized it
   *  - 'ai-resolved': User-initiated, AI fully resolved without human intervention
   */
  resolutionType?: 'autonomous' | 'ai-assisted' | 'ai-resolved';
  subscriberId: string;
  subscriberName: string;
  createdAt: string;
  assignedTo?: string;
  description?: string;
  identifiedProblem?: string;
  actionsTaken?: string[];
  verificationResult?: string;
  outcome?: string;
  /** AI Resolution lifecycle details */
  aiResolution?: {
    phases: Array<{
      label: string;
      duration: string;
      status: 'complete' | 'in-progress' | 'pending';
      actor: 'ai' | 'human';
    }>;
    timeSaved?: string;
    contributionPercent: number;
  };
}

interface Subscriber {
  id: string;
  name: string;
  healthScore: number;
  status: 'online' | 'degraded' | 'offline';
  plan: string;
  address: string;
  gateways: number;
  devices: number;
}

const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

export const SUPPORT_SCENARIOS = SUPPORT_SCENARIOS_DATA;

// Mock data
const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-4821',
    title: 'Intermittent connection drops',
    status: 'in-progress',
    priority: 'high',
    resolutionType: 'ai-assisted',
    subscriberId: 'SUB-1234',
    subscriberName: 'John Smith',
    createdAt: '2 hours ago',
    assignedTo: 'Mike Chen',
    description: 'Subscriber reports intermittent WAN disconnects every 4-8 hours over the past 2 days. Affects all devices in the household.',
    identifiedProblem: 'Firmware v2.1 regression causing Broadcom chipset instability on WAN interface',
    actionsTaken: [
      'AI collected 48h connection telemetry from GW-7834-HOME',
      'AI correlated drop pattern with firmware v2.1 rollout on March 18',
      'AI identified 45% increase in disconnects vs baseline',
      'Support engineer verified root cause and initiated rollback',
    ],
    verificationResult: 'Pending — awaiting rollback confirmation to firmware v2.0.9',
    outcome: 'AI accelerated diagnosis (reduced from 4h to 15min). Support engineer is executing staged firmware rollback.',
    aiResolution: {
      phases: [
        { label: 'Telemetry collection', duration: '3min', status: 'complete', actor: 'ai' },
        { label: 'Pattern correlation', duration: '8min', status: 'complete', actor: 'ai' },
        { label: 'Root cause identified', duration: '4min', status: 'complete', actor: 'ai' },
        { label: 'Engineer verification', duration: '12min', status: 'complete', actor: 'human' },
        { label: 'Firmware rollback', duration: '—', status: 'in-progress', actor: 'human' },
      ],
      timeSaved: 'Diagnosis 4h → 15min',
      contributionPercent: 75,
    },
  },
  {
    id: 'TKT-4820',
    title: 'Slow speeds on 5GHz band',
    status: 'resolved',
    priority: 'medium',
    resolutionType: 'ai-resolved',
    subscriberId: 'SUB-1190',
    subscriberName: 'Sarah Johnson',
    createdAt: '5 hours ago',
    assignedTo: 'AI Agent',
    description: 'Subscriber reports streaming buffering on 5GHz Wi-Fi. Speed tests show 120 Mbps vs expected 500 Mbps on the Entertainment 500 plan.',
    identifiedProblem: 'Channel 36 congestion — 8 neighboring APs detected on same channel',
    actionsTaken: [
      'AI ran spectrum analysis on 5GHz band',
      'AI detected high channel utilization (87%) on Ch36',
      'AI auto-steered client devices to Ch149 (DFS clear)',
      'AI verified speed test improved to 485 Mbps',
    ],
    verificationResult: 'Speed test improved to 485 Mbps on 5GHz after channel migration',
    outcome: 'Fully resolved by AI — throughput restored to plan limits. 24h stability monitoring active.',
    aiResolution: {
      phases: [
        { label: 'Spectrum analysis', duration: '2min', status: 'complete', actor: 'ai' },
        { label: 'Channel congestion detected', duration: '1min', status: 'complete', actor: 'ai' },
        { label: 'Channel migration', duration: '30s', status: 'complete', actor: 'ai' },
        { label: 'Speed verification', duration: '3min', status: 'complete', actor: 'ai' },
      ],
      timeSaved: 'Resolution 2h → 6min',
      contributionPercent: 100,
    },
  },
  {
    id: 'TKT-4819',
    title: 'Gateway not provisioning',
    status: 'in-progress',
    priority: 'critical',
    resolutionType: 'ai-assisted',
    subscriberId: 'SUB-1038',
    subscriberName: 'K. Yamamoto',
    createdAt: '1 hour ago',
    assignedTo: 'Lisa Park',
    description: 'New installation gateway failed to provision. Device shows online in ACS but configuration push failed after 3 retry attempts.',
    identifiedProblem: 'Configuration payload rejected — DHCP option 60 mismatch in new firmware',
    actionsTaken: [
      'AI checked ACS provisioning logs for GW-4521',
      'AI verified configuration template compatibility',
      'AI identified firmware-specific DHCP option mismatch',
      'Support engineer preparing custom config payload',
    ],
    verificationResult: 'Pending — custom config push being prepared by support engineer',
    aiResolution: {
      phases: [
        { label: 'ACS log analysis', duration: '2min', status: 'complete', actor: 'ai' },
        { label: 'Template compatibility check', duration: '3min', status: 'complete', actor: 'ai' },
        { label: 'DHCP mismatch identified', duration: '5min', status: 'complete', actor: 'ai' },
        { label: 'Custom config preparation', duration: '—', status: 'in-progress', actor: 'human' },
      ],
      timeSaved: 'Diagnosis 3h → 10min',
      contributionPercent: 70,
    },
  },
  {
    id: 'TKT-4818',
    title: 'Wi-Fi channel interference auto-resolved',
    status: 'closed',
    priority: 'medium',
    resolutionType: 'autonomous',
    subscriberId: 'SUB-1234',
    subscriberName: 'John Smith',
    createdAt: 'Yesterday',
    assignedTo: 'AI Agent',
    description: 'System autonomously detected Wi-Fi degradation at subscriber location. No user report was filed.',
    identifiedProblem: 'Channel 6 congestion from 4 neighboring APs causing signal degradation to -72dBm',
    actionsTaken: [
      'AI detected QoE degradation via continuous monitoring',
      'AI ran channel scan and neighbor analysis (12s)',
      'AI migrated from Ch 6 to Ch 11 (8s)',
      'AI verified signal improved to -48dBm (3min verification)',
      'AI auto-closed case after 4-minute stability confirmation',
    ],
    verificationResult: 'Signal quality restored. All QoE metrics within normal range.',
    outcome: 'Autonomously resolved in 4 minutes. Zero user disruption. No human intervention required.',
    aiResolution: {
      phases: [
        { label: 'QoE degradation detected', duration: '0s', status: 'complete', actor: 'ai' },
        { label: 'Channel scan & analysis', duration: '12s', status: 'complete', actor: 'ai' },
        { label: 'Channel migration', duration: '8s', status: 'complete', actor: 'ai' },
        { label: 'Signal verification', duration: '3min', status: 'complete', actor: 'ai' },
        { label: 'Stability confirmation', duration: '1min', status: 'complete', actor: 'ai' },
      ],
      timeSaved: 'Prevented 2h+ subscriber complaint',
      contributionPercent: 100,
    },
  },
  {
    id: 'TKT-4817',
    title: 'Video call QoS protection applied',
    status: 'closed',
    priority: 'high',
    resolutionType: 'autonomous',
    subscriberId: 'SUB-1234',
    subscriberName: 'John Smith',
    createdAt: 'Yesterday',
    assignedTo: 'AI Agent',
    description: 'System detected a high-value video conference session and proactively applied QoS protection when interference was detected.',
    identifiedProblem: 'New neighboring AP activation threatened active video conference quality',
    actionsTaken: [
      'AI detected high-value video session in progress',
      'AI identified rising interference from new AP on Ch 11',
      'AI applied QoS traffic prioritization and bandwidth reservation',
      'AI verified session maintained MOS 4.2/5.0 throughout',
      'AI released protection after session completed (47 min)',
    ],
    verificationResult: 'Session completed with zero quality degradation. MOS 4.2/5.0 maintained.',
    outcome: 'Autonomous session protection. User experienced no disruption during 47-min video call.',
    aiResolution: {
      phases: [
        { label: 'Video session detected', duration: '0s', status: 'complete', actor: 'ai' },
        { label: 'Interference identified', duration: '5s', status: 'complete', actor: 'ai' },
        { label: 'QoS protection applied', duration: '2s', status: 'complete', actor: 'ai' },
        { label: 'Session monitoring', duration: '47min', status: 'complete', actor: 'ai' },
        { label: 'Protection released', duration: '0s', status: 'complete', actor: 'ai' },
      ],
      timeSaved: 'Prevented call drop & SLA breach',
      contributionPercent: 100,
    },
  },
];

const MOCK_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'SUB-1234',
    name: 'John Smith',
    healthScore: 67,
    status: 'degraded',
    plan: 'Business Pro 1G',
    address: '123 Main St, Boston, MA',
    gateways: 2,
    devices: 18,
  },
  {
    id: 'SUB-1190',
    name: 'Sarah Johnson',
    healthScore: 92,
    status: 'online',
    plan: 'Entertainment 500',
    address: '456 Oak Ave, Cambridge, MA',
    gateways: 1,
    devices: 12,
  },
  {
    id: 'SUB-1038',
    name: 'K. Yamamoto',
    healthScore: 45,
    status: 'offline',
    plan: 'Power User 1G',
    address: '789 Pine Rd, Somerville, MA',
    gateways: 1,
    devices: 8,
  },
];

// Support-specific actions
export const SUPPORT_ACTIONS = [
  {
    id: 'sup-search-ticket',
    title: 'Search Ticket',
    prompt: 'Search for ticket ',
    icon: 'ticket',
    description: 'Find by ticket ID',
  },
  {
    id: 'sup-new-ticket',
    title: 'New Ticket',
    prompt: 'Create a new ticket for subscriber ',
    icon: 'plus',
    description: 'Open new support case',
  },
  {
    id: 'sup-subscriber-health',
    title: 'Subscriber Health',
    prompt: 'Show health summary for subscriber ',
    icon: 'heart',
    description: 'Check subscriber status',
  },
  {
    id: 'sub-home-dashboard',
    title: 'Home Dashboard',
    prompt: '',
    icon: 'home',
    description: 'View static dashboard',
    action: 'open-home-dashboard',
  },
];

// Scope-specific actions for Support
interface ScopeQuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  action?: string;
  scenarioId?: string;
}

function getScopeActions(scope: ScopeSelection): ScopeQuickAction[] {
  return getWorkspaceScopeActions('support', scope);
}

/** All scope action IDs used by this workspace (for settings management) */
export const ALL_SUPPORT_SCOPE_ACTIONS: ScopeQuickAction[] = ALL_SUPPORT_SCOPE_ACTIONS_DATA;

// Scope Palette Types (same as Operations)
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

export function SupportWorkspace() {
  const shouldReduceMotion = useReducedMotion();
  const experience = useMemo(() => getWorkspaceExperience('support'), []);
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scenarioTimerRef = useRef<number[]>([]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });
  const [ticketListFilters, setTicketListFilters] = useState<Record<number, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [activeProcess, setActiveProcess] = useState<{
    scenario: ScenarioDefinition;
    query: string;
    phase: WorkbenchProcessPhase;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai-text',
      message: experience.initialMessage,
      timestamp: getTimestamp(),
    },
  ]);
  const { recentQuestions, addToRecent } = useRecentQuestions('support');

  // Workspace cards from settings
  const visibleScenarios = useWorkspaceCards(SUPPORT_SCENARIOS, 'support', 'scenarios');
  const scopeActionOverrides = useScopeActionOverrides('support');

  // Scope state
  const [currentScope, setCurrentScope] = useState<ScopeSelection>(
    getWorkspaceDefaultScope('support'),
  );
  const [scopePaletteState, setScopePaletteState] = useState<ScopePaletteState>(
    getWorkspaceScopePaletteStateForTarget(
      'support',
      null,
      getWorkspaceDefaultScope('support'),
    ),
  );
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  // Scope command parsing
  const parsedScopeCommand = useMemo(
    () => parseScopeCommandInputForWorkspace(input),
    [input],
  );
  const scopePaletteQuery = useMemo(() => parsedScopeCommand?.filter ?? '', [parsedScopeCommand]);
  const scopeCommandOptions = useMemo(
    () =>
      getScopeCommandOptionsForWorkspace(
        'support',
        scopePaletteState,
        scopePaletteQuery,
        currentScope,
      ),
    [currentScope, scopePaletteQuery, scopePaletteState],
  );
  const isScopeCommandMode = input.startsWith('/');

  const workspaceContext = useMemo(() => getWorkspaceContext('support'), []);
  const starterTasks = useMemo(() => WORKSPACE_STARTER_TASKS.support, []);
  const currentScopeActions = useMemo(() => getScopeActions(currentScope).map(a => {
    const o = scopeActionOverrides.get(a.id);
    if (!o) return a;
    if (o.hidden) return null;
    return { ...a, title: o.title ?? a.title, description: o.description ?? a.description, prompt: o.prompt ?? a.prompt };
  }).filter(Boolean as any), [currentScope, scopeActionOverrides]);
  const scopeLabel = useMemo(
    () => getWorkspaceScopeDisplayLabel('support', currentScope),
    [currentScope],
  );
  const processRail = useMemo(
    () =>
      activeProcess
        ? buildProcessRailSnapshot({
            scenario: activeProcess.scenario,
            activeQuery: activeProcess.query,
            scopeLabel,
            phase: activeProcess.phase,
          })
        : null,
    [activeProcess, scopeLabel],
  );

  const clearScenarioTimers = () => {
    scenarioTimerRef.current.forEach((timerId) => window.clearTimeout(timerId));
    scenarioTimerRef.current = [];
  };

  const showScenarioWorkspace = (query: string, scenario: ScenarioDefinition) => {
    setMessages((prev) => [
      ...prev,
      {
        type: 'generative-workspace',
        scenario,
      },
    ]);
    setActiveProcess({
      scenario,
      query,
      phase: 'intake',
    });
    setIsTyping(true);
    const totalDuration = getScenarioProcessDuration(
      scenario.loadingStages.length,
    );
    const readyAt = Math.max(
      DEMO_PROCESS_TIMING.stageMs * 3,
      totalDuration - DEMO_PROCESS_TIMING.finalPauseMs,
    );
    scenarioTimerRef.current = [
      window.setTimeout(() => {
        setActiveProcess((current) =>
          current?.scenario.id === scenario.id && current.query === query
            ? { ...current, phase: 'evidence' }
            : current,
        );
      }, DEMO_PROCESS_TIMING.stageMs),
      window.setTimeout(() => {
        setActiveProcess((current) =>
          current?.scenario.id === scenario.id && current.query === query
            ? { ...current, phase: 'synthesis' }
            : current,
        );
      }, DEMO_PROCESS_TIMING.stageMs * 2),
      window.setTimeout(() => {
        setActiveProcess((current) =>
          current?.scenario.id === scenario.id && current.query === query
            ? { ...current, phase: 'ready' }
            : current,
        );
      }, readyAt),
      window.setTimeout(() => {
        setIsTyping(false);
      }, totalDuration),
    ];
  };

  // Reset active command index when input changes
  useEffect(() => {
    setActiveCommandIndex(0);
  }, [input, scopePaletteState]);

  // Update scope palette state based on command
  useEffect(() => {
    if (!isScopeCommandMode) {
      setScopePaletteState(
        getWorkspaceScopePaletteStateForTarget('support', null, currentScope),
      );
      return;
    }

    setScopePaletteState(
      getWorkspaceScopePaletteStateForTarget(
        'support',
        parsedScopeCommand?.command ?? null,
        currentScope,
      ),
    );
  }, [currentScope, isScopeCommandMode, parsedScopeCommand]);

  useEffect(() => () => clearScenarioTimers(), []);

  const handleScopeChange = (scope: ScopeSelection) => {
    clearScenarioTimers();
    setActiveProcess(null);
    setIsTyping(false);
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
    setScopePaletteState(
      getWorkspaceScopePaletteStateForTarget('support', null, scope),
    );
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
      setScopePaletteState(
        getWorkspaceScopePaletteStateForTarget('support', null, currentScope),
      );
      return;
    }

    if (event.key === 'Backspace' && !scopePaletteQuery) {
      if (scopePaletteState.step === 'root') return;

      event.preventDefault();

      if (scopePaletteState.step === 'region') {
        setScopePaletteState(
          getWorkspaceScopePaletteStateForTarget('support', null, currentScope),
        );
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

  const handleSend = (queryOverride?: string, preferredScenarioId?: string) => {
    const query = queryOverride || input.trim();
    if (!query) return;

    if (query.startsWith('/')) {
      // Only process scope commands from input, not from cards
      if (!queryOverride) {
        handleScopeCommandSubmit();
      }
      return;
    }

    // Hide the main area cards on first interaction
    setHasInteracted(true);
    addToRecent(query);
    clearScenarioTimers();

    // Only clear input if it's not an override
    if (!queryOverride) {
      setInput('');
      setSuppressSuggestions(true);
    }

    setMessages((prev) => [
      ...prev,
      { type: 'user', message: query, timestamp: getTimestamp() },
    ]);

    const presetMatch = getSupportPresetQueryMatch(query);

    if (presetMatch?.kind === 'ticket') {
      const matchedTicket = MOCK_TICKETS.find(
        (ticket) => ticket.id === presetMatch.ticketId,
      );

      if (matchedTicket) {
        setActiveProcess(null);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setSelectedTicket(matchedTicket);
          setMessages((prev) => [
            ...prev,
            {
              type: 'ai-text',
              message: presetMatch.intro,
              timestamp: getTimestamp(),
            },
            {
              type: 'ticket-found',
              ticket: matchedTicket,
              timestamp: getTimestamp(),
            },
          ]);
        }, 1500);
        return;
      }
    }

    // Try generative scenario first
    const matchedScenario = resolveScenarioForWorkspace(
      query,
      'support',
      preferredScenarioId,
    );
    const matchedAction = matchedScenario
      ? null
      : matchPromptCandidate(query, currentScopeActions);
    const fallbackScenario = matchedAction?.scenarioId
      ? resolveScenarioForWorkspace(
          matchedAction.prompt,
          'support',
          matchedAction.scenarioId,
        )
      : null;

    if (matchedScenario) {
      showScenarioWorkspace(query, matchedScenario);
      return;
    }

    setActiveProcess(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Handle different commands
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('ticket') || lowerQuery.includes('tkt-')) {
        // Extract ticket ID if present
        const ticketMatch = query.match(/TKT-\d+/i);
        if (ticketMatch) {
          const ticket = MOCK_TICKETS.find(t => t.id === ticketMatch[0].toUpperCase());
          if (ticket) {
            setSelectedTicket(ticket);
            setMessages((prev) => [
              ...prev,
              {
                type: 'ticket-found',
                ticket,
                timestamp: getTimestamp(),
              },
            ]);
            return;
          }
        }
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: `I found ${MOCK_TICKETS.length} active tickets. Here's the list:`,
            timestamp: getTimestamp(),
          },
          {
            type: 'ticket-list',
            tickets: MOCK_TICKETS,
          },
        ]);
      } else if (lowerQuery.includes('active') && (lowerQuery.includes('case') || lowerQuery.includes('support'))) {
        const openTickets = MOCK_TICKETS.filter(t => t.status === 'open' || t.status === 'in-progress');
        const criticalCount = openTickets.filter(t => t.priority === 'critical').length;
        const highCount = openTickets.filter(t => t.priority === 'high').length;
        const unassignedCount = openTickets.filter(t => !t.assignedTo || t.assignedTo === 'unassigned').length;
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: `Currently tracking ${openTickets.length} active cases across the fleet. ${criticalCount} critical, ${highCount} high priority, ${unassignedCount} unassigned.`,
            timestamp: getTimestamp(),
          },
          {
            type: 'active-cases',
            cases: openTickets,
            summary: { total: openTickets.length, critical: criticalCount, high: highCount, unassigned: unassignedCount },
          },
        ]);
      } else if (lowerQuery.includes('subscriber') || lowerQuery.includes('sub-')) {
        const subMatch = query.match(/SUB-\d+/i);
        if (subMatch) {
          const sub = MOCK_SUBSCRIBERS.find(s => s.id === subMatch[0].toUpperCase());
          if (sub) {
            setSelectedSubscriber(sub);
            setMessages((prev) => [
              ...prev,
              {
                type: 'subscriber-found',
                subscriber: sub,
                timestamp: getTimestamp(),
              },
            ]);
            return;
          }
        }
        // No specific ID — show subscriber list
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: `I found ${MOCK_SUBSCRIBERS.length} subscribers. Click on one to view details or access their home dashboard.`,
            timestamp: getTimestamp(),
          },
          {
            type: 'subscriber-list',
            subscribers: MOCK_SUBSCRIBERS,
          },
        ]);
      } else if (fallbackScenario) {
        showScenarioWorkspace(query, fallbackScenario);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai-text',
            message: buildFallbackClarificationMessage(
              'Support',
              currentScopeActions.map((action) => action.prompt),
            ),
            timestamp: getTimestamp(),
          },
        ]);
      }
    }, 1500);
  };

  const handleOpenHomeDashboard = (subscriber?: Subscriber) => {
    if (!subscriber) return;
    setSelectedSubscriber(subscriber);
    setViewMode('home-dashboard');
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setMessages((prev) => [
      ...prev,
      { type: 'user', message: `Investigate ticket ${ticket.id}`, timestamp: getTimestamp() },
      {
        type: 'ticket-found',
        ticket,
        timestamp: getTimestamp(),
      },
    ]);
  };

  const RESOLUTION_TYPE_CONFIG = {
    'autonomous': {
      label: 'Self-Healed',
      icon: Zap,
      color: 'var(--success)',
      description: 'AI self-discovered and self-resolved',
    },
    'ai-assisted': {
      label: 'AI + Human',
      icon: UserCheck,
      color: 'var(--primary)',
      description: 'AI accelerated, human finalized',
    },
    'ai-resolved': {
      label: 'AI Resolved',
      icon: Bot,
      color: 'var(--success)',
      description: 'User-initiated, AI fully resolved',
    },
  } as const;

  const renderTicketCard = (ticket: Ticket) => {
    const statusColors = {
      'open': 'var(--neutral-500)',
      'in-progress': 'var(--primary)',
      'resolved': 'var(--success)',
      'closed': 'var(--neutral-400)',
    };
    const priorityColors = {
      'low': 'var(--neutral-400)',
      'medium': 'var(--warning)',
      'high': 'var(--critical)',
      'critical': 'var(--critical)',
    };
    const resolutionConfig = ticket.resolutionType ? RESOLUTION_TYPE_CONFIG[ticket.resolutionType] : null;
    const ResolutionIcon = resolutionConfig?.icon;

    return (
      <motion.div
        key={ticket.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-4 cursor-pointer hover:scale-[1.01] transition-all"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        onClick={() => handleSelectTicket(ticket)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {ticket.id}
            </span>
            {resolutionConfig && ResolutionIcon && (
              <span
                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  background: resolutionConfig.color + '15',
                  color: resolutionConfig.color,
                }}
              >
                <ResolutionIcon className="h-2.5 w-2.5" />
                {resolutionConfig.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: priorityColors[ticket.priority] + '20',
                color: priorityColors[ticket.priority],
              }}
            >
              {ticket.priority}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: statusColors[ticket.status] + '20',
                color: statusColors[ticket.status],
              }}
            >
              {ticket.status}
            </span>
          </div>
        </div>
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          {ticket.title}
        </h4>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--neutral-400)' }}>
          <span>{ticket.subscriberName}</span>
          <span>{ticket.createdAt}</span>
        </div>
      </motion.div>
    );
  };

  const renderMessage = (msg: Message, idx: number) => {
    switch (msg.type) {
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
              <Users className="h-4 w-4" style={{ color: 'var(--primary)' }} />
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

      case 'ticket-list':
        const allTickets = (msg.tickets || []) as Ticket[];
        const activeFilter = ticketListFilters[idx] || (msg.source === 'overview' && msg.resolutionType ? msg.resolutionType : 'all');
        const filteredTickets = activeFilter === 'all'
          ? allTickets
          : allTickets.filter((t: Ticket) => t.resolutionType === activeFilter);
        const filterTabs = [
          { key: 'all', label: 'All', count: allTickets.length },
          { key: 'autonomous', label: 'Self-Healed', count: allTickets.filter((t: Ticket) => t.resolutionType === 'autonomous').length },
          { key: 'ai-assisted', label: 'AI + Human', count: allTickets.filter((t: Ticket) => t.resolutionType === 'ai-assisted').length },
          { key: 'ai-resolved', label: 'AI Resolved', count: allTickets.filter((t: Ticket) => t.resolutionType === 'ai-resolved').length },
        ];
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.17 }}
            className="ml-11 space-y-3"
          >
            {/* Source label */}
            {msg.source === 'overview' && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--neutral-500)' }}>
                <Sparkles className="h-3 w-3" />
                <span>From AI Support Overview</span>
              </div>
            )}
            {/* Filter Tabs */}
            {allTickets.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {filterTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setTicketListFilters(prev => ({ ...prev, [idx]: tab.key }))}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                    style={{
                      background: activeFilter === tab.key ? 'var(--primary)' : 'var(--surface-raised)',
                      color: activeFilter === tab.key ? 'var(--primary-foreground)' : 'var(--neutral-400)',
                      border: activeFilter === tab.key ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            )}
            {filteredTickets.map((ticket: Ticket) => renderTicketCard(ticket))}
            {filteredTickets.length === 0 && (
              <div className="text-xs py-2" style={{ color: 'var(--neutral-400)' }}>
                No tickets match this filter.
              </div>
            )}
          </motion.div>
        );

      case 'ticket-found':
        const ticket = msg.ticket as Ticket;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.17 }}
            className="ml-11 max-w-2xl"
          >
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                      {ticket.id}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--neutral-400)' }}>
                      {ticket.title}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background:
                        ticket.priority === 'critical'
                          ? 'var(--critical)20'
                          : ticket.priority === 'high'
                            ? 'var(--warning)20'
                            : ticket.priority === 'medium'
                              ? 'var(--primary)20'
                              : 'var(--neutral-500)20',
                      color:
                        ticket.priority === 'critical'
                          ? 'var(--critical)'
                          : ticket.priority === 'high'
                            ? 'var(--warning)'
                            : ticket.priority === 'medium'
                              ? 'var(--primary)'
                              : 'var(--neutral-500)',
                    }}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{
                      background: ticket.status === 'resolved' ? 'var(--success)20' : 'var(--surface-raised)',
                      color: ticket.status === 'resolved' ? 'var(--success)' : 'var(--neutral-400)',
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>

              {/* Case Summary */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>Subscriber</span>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {ticket.subscriberName}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                      {ticket.subscriberId}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--neutral-500)' }}>Created</span>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {ticket.createdAt}
                    </div>
                    {ticket.assignedTo && (
                      <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                        Assigned to {ticket.assignedTo}
                      </div>
                    )}
                  </div>
                </div>
                {ticket.description && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral-400)' }}>
                    {ticket.description}
                  </p>
                )}
              </div>

              {/* Identified Problem */}
              {ticket.identifiedProblem && (
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--warning)' }} />
                    <span className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                      Identified Problem
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {ticket.identifiedProblem}
                  </p>
                </div>
              )}

              {/* Actions Taken */}
              {ticket.actionsTaken && ticket.actionsTaken.length > 0 && (
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                    <span className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                      Actions Taken
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {ticket.actionsTaken.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--neutral-400)' }}>
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verification Result */}
              {ticket.verificationResult && (
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--success)' }} />
                    <span className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                      Verification
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {ticket.verificationResult}
                  </p>
                </div>
              )}

              {/* Final Outcome */}
              {ticket.outcome && (
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--success)08' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--success)' }} />
                    <span className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--success)' }}>
                      Outcome
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {ticket.outcome}
                  </p>
                </div>
              )}

              {/* AI Resolution Insight */}
              {ticket.aiResolution && ticket.resolutionType && (() => {
                const rConfig = RESOLUTION_TYPE_CONFIG[ticket.resolutionType];
                const RIcon = rConfig.icon;
                return (
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-raised)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" style={{ color: rConfig.color }} />
                        <span className="text-xs font-semibold tracking-[0.06em] uppercase" style={{ color: 'var(--neutral-500)' }}>
                          AI Resolution Insight
                        </span>
                      </div>
                      <span
                        className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: rConfig.color + '15', color: rConfig.color }}
                      >
                        <RIcon className="h-3 w-3" />
                        {rConfig.label}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-0 mb-3">
                      {ticket.aiResolution.phases.map((phase, pi) => {
                        const isLast = pi === ticket.aiResolution!.phases.length - 1;
                        const statusColor = phase.status === 'complete'
                          ? 'var(--success)'
                          : phase.status === 'in-progress'
                            ? 'var(--warning)'
                            : 'var(--neutral-400)';
                        return (
                          <div key={pi} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                                style={{ background: statusColor + '15' }}
                              >
                                {phase.actor === 'ai' ? (
                                  <Bot className="h-3 w-3" style={{ color: statusColor }} />
                                ) : (
                                  <UserCheck className="h-3 w-3" style={{ color: statusColor }} />
                                )}
                              </div>
                              {!isLast && (
                                <div className="w-px flex-1 min-h-4" style={{ background: 'var(--border-subtle)' }} />
                              )}
                            </div>
                            <div className="pb-3 flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                                  {phase.label}
                                </span>
                                <span className="text-xs ml-2 shrink-0" style={{ color: 'var(--neutral-400)' }}>
                                  {phase.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Impact Metrics */}
                    <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      {ticket.aiResolution.timeSaved && (
                        <div className="flex-1">
                          <span className="text-[10px] uppercase tracking-[0.06em]" style={{ color: 'var(--neutral-500)' }}>
                            Time Saved
                          </span>
                          <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            {ticket.aiResolution.timeSaved}
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-[0.06em]" style={{ color: 'var(--neutral-500)' }}>
                          AI Contribution
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${ticket.aiResolution.contributionPercent}%`,
                                background: rConfig.color,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            {ticket.aiResolution.contributionPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => {
                    const sub = MOCK_SUBSCRIBERS.find(s => s.id === ticket.subscriberId);
                    if (sub) handleOpenHomeDashboard(sub);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  View Home Dashboard
                </button>
                <button
                  onClick={() => handleSend(`Run AI diagnostics on ticket ${ticket.id} for subscriber ${ticket.subscriberName}`)}
                  className="px-3 py-2 rounded-lg text-sm font-medium border"
                  style={{
                    background: 'var(--surface-raised)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  Troubleshoot
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'subscriber-found':
        const subscriber = msg.subscriber as Subscriber;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.17 }}
            className="ml-11"
          >
            <div
              className="rounded-xl border p-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      background:
                        subscriber.status === 'online'
                          ? 'var(--success)20'
                          : subscriber.status === 'degraded'
                            ? 'var(--warning)20'
                            : 'var(--critical)20',
                    }}
                  >
                    <Users className="h-5 w-5"
                      style={{
                        color:
                          subscriber.status === 'online'
                            ? 'var(--success)'
                            : subscriber.status === 'degraded'
                              ? 'var(--warning)'
                              : 'var(--critical)',
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                      {subscriber.name}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--neutral-400)' }}>
                      {subscriber.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    {subscriber.healthScore}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                    Health Score
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                <div className="p-2 rounded-lg" style={{ background: 'var(--surface-base)' }}>
                  <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {subscriber.gateways}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Gateways</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--surface-base)' }}>
                  <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {subscriber.devices}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Devices</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--surface-base)' }}>
                  <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {subscriber.status}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Status</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'var(--surface-base)' }}>
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {subscriber.plan}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Plan</div>
                </div>
              </div>

              <button
                onClick={() => handleOpenHomeDashboard(subscriber)}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                View Home Dashboard
              </button>
            </div>
          </motion.div>
        );

      case 'subscriber-list':
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.17 }}
            className="ml-11 space-y-2"
          >
            {msg.subscribers?.map((sub: Subscriber) => {
              const statusColor =
                sub.status === 'online'
                  ? 'var(--success)'
                  : sub.status === 'degraded'
                    ? 'var(--warning)'
                    : 'var(--critical)';
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border p-4 cursor-pointer hover:scale-[1.01] transition-all"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  onClick={() => {
                    setSelectedSubscriber(sub);
                    setMessages((prev) => [
                      ...prev,
                      { type: 'user', message: `Show details for ${sub.name}`, timestamp: getTimestamp() },
                      { type: 'subscriber-found', subscriber: sub, timestamp: getTimestamp() },
                    ]);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ background: statusColor + '20' }}
                      >
                        <Users className="h-4 w-4" style={{ color: statusColor }} />
                      </div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {sub.name}
                        </span>
                        <span className="text-xs ml-2" style={{ color: 'var(--neutral-400)' }}>
                          {sub.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          {sub.healthScore}%
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>Health</div>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background: statusColor + '20', color: statusColor }}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--neutral-400)' }}>
                    <span>{sub.plan}</span>
                    <span>{sub.gateways} gateways</span>
                    <span>{sub.devices} devices</span>
                    <span className="truncate">{sub.address}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        );

      case 'generative-workspace':
        return (
          <WorkspaceSession
            key={idx}
            scenario={msg.scenario}
            onFollowUp={(prompt) => handleSend(prompt, msg.scenario?.id)}
            stageDurationMs={DEMO_PROCESS_TIMING.stageMs}
            finalPauseMs={DEMO_PROCESS_TIMING.finalPauseMs}
            blockRevealMs={DEMO_PROCESS_TIMING.blockRevealMs}
          />
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

  // Home Dashboard View
  if (viewMode === 'home-dashboard' && selectedSubscriber) {
    return <HomeDashboard subscriber={selectedSubscriber} onBack={() => setViewMode('chat')} />;
  }

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
            {/* Support Scenarios - Fixed at top */}
            {visibleScenarios.length > 0 && (
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
                    {experience.scenarioHeading}
                  </span>
                  <div className="h-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visibleScenarios.map((scenario, i) => (
                    <motion.button
                      key={scenario.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.2 }}
                      onClick={() => {
                        handleSend(scenario.query, scenario.scenarioId);
                      }}
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
            )}

            {/* Messages */}
            <div className="max-w-3xl mx-auto space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <div key={idx} ref={idx === messages.length - 1 ? lastMessageRef : null}>
                    {renderMessage(msg, idx)}
                  </div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--accent-color)' }}
                    >
                      <Users className="h-4 w-4" style={{ color: 'var(--primary)' }} />
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
                  <Users className="h-3 w-3" style={{ color: 'var(--neutral-500)' }} />
                  <span className="text-xs font-semibold tracking-[0.08em]" style={{ color: 'var(--neutral-500)' }}>
                    {experience.scopeActionHeading}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                    ·
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--neutral-500)' }}>
                    {getWorkspaceScopeTagLabel('support', currentScope)}
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
                    onClick={() => {
                      if (action.action === 'open-home-dashboard') {
                        const subscriberId = currentScope.subscriber ?? DEFAULT_SUBSCRIBER_ID;
                        const sub = MOCK_SUBSCRIBERS.find(s => s.id === subscriberId);
                        handleOpenHomeDashboard(sub);
                      } else if (action.prompt) {
                        handleSend(action.prompt, action.scenarioId);
                      }
                    }}
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

          {/* Input Area */}
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
                    placeholder="Ask about cases, homes, or gateway fixes... (Type / to change scope)"
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
                            {recentQuestions.map((q, i) => (
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
                            {WORKSPACES.support.topQuestions.map((q, i) => (
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
                            {getWorkspaceScopePalettePlaceholder('support', scopePaletteState)}
                          </span>
                          {getWorkspaceScopePaletteContextLabel('support', scopePaletteState) && (
                            <span className="ml-2" style={{ color: 'var(--neutral-400)' }}>
                              {getWorkspaceScopePaletteContextLabel('support', scopePaletteState)}
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
          workspaceId="support"
          isActive={isTyping}
          reasoningSteps={processRail?.reasoning}
          backendActions={processRail?.backendActions}
          auditEntries={processRail?.auditEntries}
        />
      </div>
    </AppLayout>
  );
}

// Home Dashboard Component (Static View)
interface HomeDashboardProps {
  subscriber: {
    id: string;
    name: string;
    healthScore: number;
    status: string;
    plan: string;
    address: string;
    gateways: number;
    devices: number;
  };
  onBack: () => void;
}

function HomeDashboard({ subscriber, onBack }: HomeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'gateways' | 'devices' | 'events'>('overview');

  // Mock data for the dashboard
  const healthStatus = subscriber.healthScore >= 80 ? 'healthy' : subscriber.healthScore >= 50 ? 'degraded' : 'critical';

  const gateways = [
    {
      id: 'GW-7834-HOME',
      name: 'Home',
      model: 'Nokia BE-1',
      firmware: 'v2.4.1',
      status: 'online',
      uptime: '45d 12h',
      ip: '192.168.1.1',
      clients: 12,
      '5GHz': { utilization: '34%', channel: 149 },
      '2.4GHz': { utilization: '28%', channel: 6 },
    },
    {
      id: 'GW-7835-OFFICE',
      name: 'Office',
      model: 'Nokia BE-1',
      firmware: 'v2.4.0',
      status: 'degraded',
      uptime: '23d 8h',
      ip: '192.168.2.1',
      clients: 6,
      '5GHz': { utilization: '67%', channel: 36 },
      '2.4GHz': { utilization: '45%', channel: 11 },
    },
  ];

  const recentEvents = [
    { time: '2 hours ago', event: 'Connection drop detected', severity: 'medium', gateway: 'GW-7835-OFFICE' },
    { time: '5 hours ago', event: 'High packet loss on 5GHz', severity: 'high', gateway: 'GW-7835-OFFICE' },
    { time: 'Yesterday', event: 'Gateway firmware updated', severity: 'low', gateway: 'GW-7834-HOME' },
    { time: '2 days ago', event: 'New device connected', severity: 'low', gateway: 'GW-7834-HOME' },
  ];

  const connectedDevices = [
    { id: 'DEV-001', name: 'iPhone 14', type: 'smartphone', connection: '5GHz', rssi: -68, traffic: '1.2 GB/day' },
    { id: 'DEV-002', name: 'MacBook Pro', type: 'laptop', connection: '5GHz', rssi: -52, traffic: '4.5 GB/day' },
    { id: 'DEV-003', name: 'Smart TV', type: 'other', connection: 'Ethernet', rssi: -40, traffic: '8.3 GB/day' },
    { id: 'DEV-004', name: 'iPad Air', type: 'tablet', connection: '5GHz', rssi: -65, traffic: '2.1 GB/day' },
    { id: 'DEV-005', name: 'Desktop PC', type: 'desktop', connection: 'Ethernet', rssi: -40, traffic: '6.7 GB/day' },
    { id: 'DEV-006', name: 'Nest Thermostat', type: 'other', connection: '2.4GHz', rssi: -72, traffic: '0.1 GB/day' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'var(--critical)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--neutral-400)';
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="border-b px-6 py-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}>
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--neutral-400)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background:
                  healthStatus === 'healthy'
                    ? 'var(--success)20'
                    : healthStatus === 'degraded'
                      ? 'var(--warning)20'
                      : 'var(--critical)20',
              }}
            >
              <Home className="h-5 w-5"
                style={{
                  color:
                    healthStatus === 'healthy'
                      ? 'var(--success)'
                      : healthStatus === 'degraded'
                        ? 'var(--warning)'
                        : 'var(--critical)',
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                {subscriber.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--neutral-400)' }}>
                {subscriber.address}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {subscriber.healthScore}%
            </div>
            <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>
              Health Score
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b px-6" style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}>
        <div className="flex gap-1">
          {(['overview', 'gateways', 'devices', 'events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-medium transition-all"
              style={{
                color: activeTab === tab ? 'var(--foreground)' : 'var(--neutral-400)',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>Health Status</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: healthStatus === 'healthy' ? 'var(--success)' : healthStatus === 'degraded' ? 'var(--warning)' : 'var(--critical)' }}
                    />
                    <span className="text-lg font-semibold capitalize" style={{ color: 'var(--foreground)' }}>
                      {healthStatus}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>Gateways</div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {subscriber.gateways}
                  </div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>Connected Devices</div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    {subscriber.devices}
                  </div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>Service Plan</div>
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {subscriber.plan}
                  </div>
                </div>
              </div>

              {/* Gateway Status */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                  Gateway Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {gateways.map((gw) => (
                    <div key={gw.id} className="p-4 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            {gw.name} Gateway
                          </h4>
                          <p className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                            {gw.id}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                          gw.status === 'online' ? 'bg-[var(--success)20] text-[var(--success)]' : 'bg-[var(--warning)20] text-[var(--warning)]'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${gw.status === 'online' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`} />
                          {gw.status}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span style={{ color: 'var(--neutral-500)' }}>Model:</span>{' '}
                          <span style={{ color: 'var(--foreground)' }}>{gw.model}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--neutral-500)' }}>Firmware:</span>{' '}
                          <span style={{ color: 'var(--foreground)' }}>{gw.firmware}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--neutral-500)' }}>Uptime:</span>{' '}
                          <span style={{ color: 'var(--foreground)' }}>{gw.uptime}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--neutral-500)' }}>Clients:</span>{' '}
                          <span style={{ color: 'var(--foreground)' }}>{gw.clients}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex gap-3 text-xs">
                          <div className="flex-1">
                            <span style={{ color: 'var(--neutral-500)' }}>5GHz:</span>{' '}
                            <span style={{ color: 'var(--foreground)' }}>{gw['5GHz'].utilization} (Ch {gw['5GHz'].channel})</span>
                          </div>
                          <div className="flex-1">
                            <span style={{ color: 'var(--neutral-500)' }}>2.4GHz:</span>{' '}
                            <span style={{ color: 'var(--foreground)' }}>{gw['2.4GHz'].utilization} (Ch {gw['2.4GHz'].channel})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Events */}
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                  Recent Events
                </h3>
                <div className="space-y-2">
                  {recentEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="h-2 w-2 rounded-full" style={{ background: getSeverityColor(event.severity) }} />
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>{event.event}</p>
                        <p className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                          {event.gateway} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gateways' && (
            <div className="space-y-4">
              {gateways.map((gw) => (
                <div key={gw.id} className="p-5 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Router className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                      <div>
                        <h4 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                          {gw.name} Gateway
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--neutral-400)' }}>
                          {gw.id} • {gw.model}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      gw.status === 'online' ? 'bg-[var(--success)20] text-[var(--success)]' : 'bg-[var(--warning)20] text-[var(--warning)]'
                    }`}>
                      {gw.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>IP Address</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{gw.ip}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Firmware</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{gw.firmware}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Uptime</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{gw.uptime}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>Connected Clients</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{gw.clients}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--surface-base)' }}>
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>5GHz Band</span>
                      <span className="text-sm" style={{ color: 'var(--neutral-400)' }}>
                        Channel {gw['5GHz'].channel} • {gw['5GHz'].utilization} utilization
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--surface-base)' }}>
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>2.4GHz Band</span>
                      <span className="text-sm" style={{ color: 'var(--neutral-400)' }}>
                        Channel {gw['2.4GHz'].channel} • {gw['2.4GHz'].utilization} utilization
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-2">
              {connectedDevices.map((device) => (
                <div key={device.id} className="flex items-center gap-4 p-3 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-raised)' }}>
                    {device.type === 'smartphone' && <span className="text-sm">📱</span>}
                    {device.type === 'laptop' && <span className="text-sm">💻</span>}
                    {device.type === 'tablet' && <span className="text-sm">📟</span>}
                    {device.type === 'desktop' && <span className="text-sm">🖥️</span>}
                    {device.type === 'other' && <span className="text-sm">📡</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{device.name}</p>
                    <p className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                      {device.connection} • {device.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--neutral-500)' }}>Signal</p>
                    <p className="text-sm font-medium" style={{ color: device.rssi > -60 ? 'var(--success)' : device.rssi > -70 ? 'var(--warning)' : 'var(--critical)' }}>
                      {device.rssi} dBm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--neutral-500)' }}>Daily Traffic</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{device.traffic}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-2">
              {recentEvents.map((event, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: getSeverityColor(event.severity) + '20' }}>
                    {event.severity === 'critical' && <AlertTriangle className="h-4 w-4" style={{ color: getSeverityColor(event.severity) }} />}
                    {event.severity === 'high' && <AlertTriangle className="h-4 w-4" style={{ color: getSeverityColor(event.severity) }} />}
                    {event.severity === 'medium' && <Clock className="h-4 w-4" style={{ color: getSeverityColor(event.severity) }} />}
                    {event.severity === 'low' && <CheckCircle className="h-4 w-4" style={{ color: getSeverityColor(event.severity) }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{event.event}</p>
                    <p className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                      {event.gateway} • {event.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    event.severity === 'critical' ? 'bg-[var(--critical)20] text-[var(--critical)]' :
                    event.severity === 'high' ? 'bg-[var(--warning)20] text-[var(--warning)]' :
                    event.severity === 'medium' ? 'bg-[var(--warning)20] text-[var(--warning)]' :
                    'bg-[var(--neutral-500)20] text-[var(--neutral-400)]'
                  }`}>
                    {event.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
