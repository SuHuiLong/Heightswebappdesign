import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
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

// ─── Types ─────────────────────────────────────────────────────────────────

export type ScopeCommandName = 'all' | 'region' | 'organization' | 'subscriber' | 'device';
type ScopePaletteStep = 'root' | 'region' | 'organization' | 'subscriber' | 'device';

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
}

interface ScopeCommandInput {
  command: ScopeCommandName | null;
  filter: string;
}

export interface ScopeQuickAction {
  id: string;
  title: string;
  description: string;
  prompt: string;
  action?: string;
}

export interface ChatMessage {
  type: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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

  if (!targetLevel) return { targetLevel: null, step: 'root', ...context };
  if (targetLevel === 'all') return { targetLevel, step: 'root', ...context };
  if (targetLevel === 'region') return { targetLevel, step: 'region' };

  if (targetLevel === 'organization') {
    return context.region
      ? { targetLevel, step: 'organization', region: context.region }
      : { targetLevel, step: 'region' };
  }

  if (targetLevel === 'subscriber') {
    if (context.organization) {
      return { targetLevel, step: 'subscriber', region: context.region, organization: context.organization };
    }
    if (context.region) {
      return { targetLevel, step: 'organization', region: context.region };
    }
    return { targetLevel, step: 'region' };
  }

  // device
  if (context.subscriber) {
    return { targetLevel, step: 'device', region: context.region, organization: context.organization, subscriber: context.subscriber };
  }
  if (context.organization) {
    return { targetLevel, step: 'subscriber', region: context.region, organization: context.organization };
  }
  if (context.region) {
    return { targetLevel, step: 'organization', region: context.region };
  }
  return { targetLevel, step: 'region' };
}

function parseScopeCommandInput(input: string): ScopeCommandInput | null {
  if (!input.startsWith('/')) return null;
  const raw = input.slice(1).trim();
  if (!raw) return { command: null, filter: '' };

  const [token, ...rest] = raw.split(/\s+/);
  const command = token?.toLowerCase();
  const knownCommands: ScopeCommandName[] = ['all', 'region', 'organization', 'subscriber', 'device'];

  if (command && knownCommands.includes(command as ScopeCommandName)) {
    return { command: command as ScopeCommandName, filter: rest.join(' ').trim() };
  }
  return { command: null, filter: raw };
}

function getRootScopeCommandOptions(currentScope: ScopeSelection): ScopeCommandOption[] {
  return [
    { id: 'scope-all', label: 'All (Fleet)', description: 'Reset to the global fleet scope.', commandLabel: '/all', scope: { level: 'all' } },
    { id: 'target-region', label: 'Region', description: 'Choose a region scope.', nextState: getScopePaletteStateForTarget('region', currentScope) },
    { id: 'target-organization', label: 'ISP', description: 'Choose region, then ISP.', nextState: getScopePaletteStateForTarget('organization', currentScope) },
    { id: 'target-subscriber', label: 'Subscriber', description: 'Choose region, ISP, then subscriber.', nextState: getScopePaletteStateForTarget('subscriber', currentScope) },
    { id: 'target-device', label: 'Home / Office', description: 'Choose region, ISP, subscriber, then home/office.', nextState: getScopePaletteStateForTarget('device', currentScope) },
  ];
}

export function getScopePalettePlaceholder(state: ScopePaletteState) {
  switch (state.step) {
    case 'root': return 'Choose All, Region, Organization, Subscriber, or Device';
    case 'region': return 'Filter regions';
    case 'organization': return 'Filter organizations in the selected region';
    case 'subscriber': return 'Filter subscribers in the selected organization';
    case 'device': return 'Filter gateway devices for the selected subscriber';
  }
}

export function getScopePaletteContextLabel(state: ScopePaletteState) {
  const parts: string[] = [];
  if (state.region) parts.push(REGION_LABELS[state.region] ?? state.region);
  if (state.organization) parts.push(ORGANIZATION_LABELS[state.organization] ?? state.organization);
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
        description: state.targetLevel === 'region' ? `Switch scope to ${region.name}.` : `Choose ${region.name} and continue.`,
        commandLabel: `/region ${region.id}`,
        scope: state.targetLevel === 'region' ? buildScopeSelection('region', region.id) : undefined,
        nextState: state.targetLevel === 'region'
          ? undefined
          : { ...state, step: 'organization', region: region.id, organization: undefined, subscriber: undefined },
      }));
    case 'organization':
      return getOrganizationsForRegion(state.region)
        .filter((org) => matchesScopeQuery(query, org.id, org.name))
        .map((org) => ({
          id: `organization-${org.id}`,
          label: org.name,
          description: state.targetLevel === 'organization' ? `Switch to organization ${org.name}.` : `Choose ${org.name} and continue.`,
          commandLabel: `/organization ${org.id}`,
          scope: state.targetLevel === 'organization' ? buildScopeSelection('organization', org.id) : undefined,
          nextState: state.targetLevel === 'organization'
            ? undefined
            : { ...state, step: 'subscriber', organization: org.id, subscriber: undefined },
        }));
    case 'subscriber':
      return getSubscribersForOrganization(state.organization)
        .filter((sub) => matchesScopeQuery(query, sub.id, sub.name))
        .map((sub) => ({
          id: `subscriber-${sub.id}`,
          label: `${sub.name} (${sub.id})`,
          description: state.targetLevel === 'subscriber' ? `Switch to subscriber ${sub.name}.` : `Choose ${sub.name} and continue.`,
          commandLabel: `/subscriber ${sub.id}`,
          scope: state.targetLevel === 'subscriber' ? buildScopeSelection('subscriber', sub.id) : undefined,
          nextState: state.targetLevel === 'subscriber'
            ? undefined
            : { ...state, step: 'device', subscriber: sub.id },
        }));
    case 'device':
      return getDevicesForSubscriber(state.subscriber)
        .filter((dev) => matchesScopeQuery(query, dev.id, dev.name))
        .map((dev) => {
          const parentScope = getParentScopeForDevice(dev.id);
          const subscriberName = SUBSCRIBER_LABELS[parentScope.subscriber ?? ''] ?? DEFAULT_SUBSCRIBER_NAME;
          return {
            id: `device-${dev.id}`,
            label: `${dev.name} Gateway`,
            description: `${subscriberName} (${parentScope.subscriber})`,
            commandLabel: `/device ${dev.id}`,
            scope: buildScopeSelection('device', dev.id),
          };
        });
  }
}

export function getScopeDisplayLabel(scope: ScopeSelection): string {
  switch (scope.level) {
    case 'all': return 'all tenants';
    case 'region': return REGION_LABELS[scope.region ?? ''] ?? 'this region';
    case 'organization': return ORGANIZATION_LABELS[scope.organization ?? ''] ?? 'this organization';
    case 'subscriber': {
      const name = SUBSCRIBER_LABELS[scope.subscriber ?? ''];
      if (name && scope.subscriber) return `${name} (${scope.subscriber})`;
      return 'this subscriber';
    }
    case 'device': {
      const subId = scope.subscriber ?? DEFAULT_SUBSCRIBER_ID;
      const subName = SUBSCRIBER_LABELS[subId] ?? DEFAULT_SUBSCRIBER_NAME;
      const devices = getDevicesForSubscriber(subId);
      const fallback = devices[0] ?? { id: 'GW-7834-HOME', name: 'Home' };
      const selected = devices.find((d) => d.id === scope.device) ?? fallback;
      return `${subName} \u2022 ${getGatewaySiteLabel(subName, selected.name)} Gateway`;
    }
    default: return 'the current scope';
  }
}

export function getScopeLabel(scope: ScopeSelection): string {
  switch (scope.level) {
    case 'all': return 'All (Fleet)';
    case 'region': return REGION_LABELS[scope.region ?? ''] ?? 'Region';
    case 'organization': return ORGANIZATION_LABELS[scope.organization ?? ''] ?? 'ISP';
    case 'subscriber': return SUBSCRIBER_LABELS[scope.subscriber ?? ''] ?? 'Subscriber';
    case 'device': return 'Home / Office';
    default: return 'Unknown';
  }
}

export function getScopeTagLabel(scope: ScopeSelection): string {
  switch (scope.level) {
    case 'all': return 'ALL TENANTS (FLEET)';
    case 'region': return REGION_LABELS[scope.region ?? ''] ?? 'REGION';
    case 'organization': return ORGANIZATION_LABELS[scope.organization ?? ''] ?? 'ORGANIZATION';
    case 'subscriber': return SUBSCRIBER_LABELS[scope.subscriber ?? ''] ?? 'SUBSCRIBER';
    case 'device': return 'GATEWAY DEVICE';
    default: return 'UNKNOWN';
  }
}

export const getTimestamp = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useWorkspaceChat() {
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });
  const [currentScope, setCurrentScope] = useState<ScopeSelection>({ level: 'all' });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [scopePaletteState, setScopePaletteState] = useState<ScopePaletteState>(
    getScopePaletteStateForTarget(null, { level: 'all' }),
  );
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);

  // Derived state
  const parsedScopeCommand = useMemo(() => parseScopeCommandInput(input), [input]);
  const scopePaletteQuery = useMemo(() => parsedScopeCommand?.filter ?? '', [parsedScopeCommand]);
  const scopeCommandOptions = useMemo(
    () => getScopeCommandOptions(scopePaletteState, scopePaletteQuery, currentScope),
    [currentScope, scopePaletteQuery, scopePaletteState],
  );
  const isScopeCommandMode = input.startsWith('/');

  const ambientPointerStyle = useMemo(
    () => ({
      background: `radial-gradient(420px circle at ${cursorGlow.x}px ${cursorGlow.y}px, var(--cursor-glow), transparent 60%)`,
      opacity: !shouldReduceMotion && cursorGlow.active ? 1 : 0,
    }),
    [cursorGlow, shouldReduceMotion],
  );

  // Effects
  useEffect(() => { setActiveCommandIndex(0); }, [input, scopePaletteState]);

  useEffect(() => {
    if (!isScopeCommandMode) {
      setScopePaletteState(getScopePaletteStateForTarget(null, currentScope));
      return;
    }
    setScopePaletteState(getScopePaletteStateForTarget(parsedScopeCommand?.command ?? null, currentScope));
  }, [currentScope, isScopeCommandMode, parsedScopeCommand]);

  // Auto-scroll helper
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: smooth && !shouldReduceMotion ? 'smooth' : 'auto' });
      }
    }, 100);
  };

  const scrollToLastMessage = () => {
    const container = scrollContainerRef.current;
    const target = lastMessageRef.current;
    if (!container || !target) return;
    const frame = requestAnimationFrame(() => {
      container.scrollTo({ top: target.offsetTop - 12, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  };

  // Scope change
  const handleScopeChange = (scope: ScopeSelection) => {
    setCurrentScope(scope);
    setHasInteracted(false);
    scrollToBottom();
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
    const activeOption = scopeCommandOptions[Math.min(activeCommandIndex, scopeCommandOptions.length - 1)];
    if (activeOption.scope) { applyScopeChange(activeOption.scope); return; }
    if (activeOption.nextState) { setScopePaletteState(activeOption.nextState); }
  };

  const handleScopeOptionClick = (option: ScopeCommandOption) => {
    if (option.scope) { applyScopeChange(option.scope); return; }
    if (option.nextState) { setScopePaletteState(option.nextState); setActiveCommandIndex(0); }
  };

  // Keyboard
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, onSend: () => void) => {
    if (!isScopeCommandMode) {
      if (event.key === 'Enter') onSend();
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
      setActiveCommandIndex((prev) => (prev === 0 ? scopeCommandOptions.length - 1 : prev - 1));
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
      const stepBack: Record<string, ScopePaletteStep> = {
        region: 'root',
        organization: 'region',
        subscriber: 'organization',
        device: 'subscriber',
      };
      const prevStep = stepBack[scopePaletteState.step];
      if (prevStep === 'root') {
        setScopePaletteState(getScopePaletteStateForTarget(null, currentScope));
      } else {
        setScopePaletteState((prev) => ({ ...prev, step: prevStep }));
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      handleScopeCommandSubmit();
    }
  };

  // Pointer tracking
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setCursorGlow({ x: event.clientX - rect.left, y: event.clientY - rect.top, active: true });
  };

  const handlePointerLeave = () => setCursorGlow((prev) => ({ ...prev, active: false }));

  return {
    // State
    input, setInput,
    isTyping, setIsTyping,
    isFocused, setIsFocused,
    cursorGlow,
    currentScope,
    hasInteracted, setHasInteracted,
    scopePaletteState,
    scopeCommandOptions,
    activeCommandIndex,
    isScopeCommandMode,
    shouldReduceMotion,
    ambientPointerStyle,

    // Actions
    handleScopeChange,
    handleScopeCommandSubmit,
    handleScopeOptionClick,
    handleInputKeyDown,
    scrollToBottom,
    scrollToLastMessage,
    handlePointerMove,
    handlePointerLeave,

    // Refs
    scrollContainerRef,
    inputRef,
    lastMessageRef,
  };
}
