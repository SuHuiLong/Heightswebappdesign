import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AppLayout } from '../components/app-layout';
import { ContextPanel } from '../components/context-panel';
import { ScopeSelection } from '../components/scope-selector';
import {
  UserMessage,
  AITextMessage,
  ScopeActionsCard,
  ScopeActionOption,
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

type ResultMessageType =
  | 'metric'
  | 'alerts'
  | 'subscriber'
  | 'action'
  | 'device-table'
  | 'topology'
  | 'bandwidth-chart'
  | 'speed-test'
  | 'outage-map'
  | 'service-plan'
  | 'work-order'
  | 'sla-status'
  | 'provisioning';

interface ScopeQuickAction extends ScopeActionOption {
  prompt: string;
  response: string;
  resultTypes?: ResultMessageType[];
  openInspectDrawer?: boolean;
}

const REGION_LABELS: Record<string, string> = {
  north: 'North Region',
  south: 'South Region',
  east: 'East Region',
  west: 'West Region',
  central: 'Central Region',
};

const ORGANIZATION_LABELS: Record<string, string> = {
  'acme-isp': 'Acme ISP',
  technet: 'TechNet Co.',
  fastfiber: 'FastFiber Inc.',
  netpro: 'NetPro Services',
  eastlink: 'EastLink Networks',
  cityconnect: 'CityConnect',
  westcom: 'WestCom ISP',
  skywave: 'SkyWave Internet',
  centralnet: 'CentralNet',
  corefiber: 'CoreFiber LLC',
};

const SUBSCRIBER_LABELS: Record<string, string> = {
  'SUB-7834': 'John Smith',
  'SUB-7835': 'Sarah Johnson',
  'SUB-7836': 'Michael Chen',
  'SUB-8901': 'Emily Davis',
  'SUB-8902': 'David Wilson',
  'SUB-4521': 'Robert Brown',
  'SUB-4522': 'Jennifer Taylor',
  'SUB-3344': 'William Anderson',
  'SUB-3345': 'Lisa Martinez',
  'SUB-5567': 'James Garcia',
  'SUB-5568': 'Mary Rodriguez',
  'SUB-6678': 'Thomas Lee',
  'SUB-6679': 'Patricia White',
  'SUB-7789': 'Christopher Harris',
  'SUB-7790': 'Barbara Clark',
  'SUB-8890': 'Daniel Lewis',
  'SUB-8891': 'Elizabeth Walker',
  'SUB-9901': 'Matthew Hall',
  'SUB-9902': 'Susan Allen',
  'SUB-1012': 'Joseph Young',
  'SUB-1013': 'Jessica King',
};

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
        description: `Diagnostic shortcuts for ${getScopeDisplayLabel(scope)} including topology, speed, plan, and quick inspection.`,
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
      return `${getScopeDisplayLabel(scope)} Devices`;
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
      return `Current Plan - ${getScopeDisplayLabel(scope)}`;
    default:
      return 'Service Plan';
  }
}

function getScopedTopologyName(scope: ScopeSelection) {
  return scope.level === 'subscriber' ? getScopeDisplayLabel(scope) : 'John Smith';
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
      return `Speed Test - ${getScopeDisplayLabel(scope)}`;
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
      return `Service Incidents - ${getScopeDisplayLabel(scope)}`;
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
      return `${getScopeDisplayLabel(scope)} Health Score`;
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
        { id: '1', severity: 'critical' as const, message: `${label} experienced a gateway disconnect`, count: 1 },
        { id: '2', severity: 'medium' as const, message: `Packet loss is elevated for ${label}`, count: 3 },
        { id: '3', severity: 'low' as const, message: `Wi-Fi optimization recommendations available`, count: 2 },
      ];
    default:
      return [];
  }
}

function getScopedSubscriberCard(scope: ScopeSelection) {
  if (scope.level === 'subscriber') {
    return {
      subscriberId: scope.subscriber ?? 'SUB-7834',
      name: SUBSCRIBER_LABELS[scope.subscriber ?? 'SUB-7834'] ?? 'John Smith',
      source: 'Subscriber Diagnostics',
    };
  }

  if (scope.level === 'organization') {
    return {
      subscriberId: 'ORG-PRIMARY',
      name: `${getScopeDisplayLabel(scope)} Priority Subscriber`,
      source: 'Organization Health Monitor',
    };
  }

  if (scope.level === 'region') {
    return {
      subscriberId: 'REG-IMPACT-1',
      name: `${getScopeDisplayLabel(scope)} Impacted Subscriber`,
      source: 'Regional Subscriber Monitor',
    };
  }

  return {
    subscriberId: 'SUB-7834',
    name: 'John Smith',
    source: 'Subscriber Database',
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
        title: `Restart subscriber gateway for ${getScopeDisplayLabel(scope)}`,
        description: 'This will briefly interrupt service while the subscriber gateway restarts.',
        source: 'Subscriber Remediation Engine',
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
          { label: 'Scope', value: 'All Tenants' },
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
        action: `Subscriber Remediation Completed`,
        details: [
          { label: 'Subscriber', value: label },
          { label: 'Duration', value: '45 seconds' },
          { label: 'Device', value: 'GW-4521-A' },
        ],
        source: 'Subscriber Remediation Engine',
      };
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
        category: 'Subscriber Remediation',
        assignedTo: 'Mike Chen',
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
        accountId: scope.subscriber ?? 'SUB-7834',
      };
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
        title: `Restart Gateway - ${getScopeDisplayLabel(scope)}`,
        description: 'This action will restart the subscriber gateway to resolve connectivity issues.',
        scope: `1 Gateway • ${getScopeDisplayLabel(scope)}`,
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
  if (scope.level === 'subscriber') {
    return {
      id: scope.subscriber ?? 'SUB-7834',
      name: SUBSCRIBER_LABELS[scope.subscriber ?? 'SUB-7834'] ?? 'John Smith',
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
    id: 'SUB-7834',
    name: 'John Smith',
  };
}

function getScopeActions(scope: ScopeSelection): ScopeQuickAction[] {
  const scopeLabel = getScopeDisplayLabel(scope);

  switch (scope.level) {
    case 'all':
      return [
        {
          id: 'all-device-list',
          title: 'Show fleet device list',
          description: 'Review gateways, routers, and APs across the fleet.',
          prompt: 'Show the fleet device list across all tenants',
          response: `Here is the current device inventory for ${scopeLabel}.`,
          resultTypes: ['device-table'],
        },
        {
          id: 'all-outages',
          title: 'View active outages',
          description: 'See current outages and impacted zones.',
          prompt: 'Show all active outages across the fleet',
          response: `Here are the active outages for ${scopeLabel}.`,
          resultTypes: ['outage-map'],
        },
        {
          id: 'all-bandwidth',
          title: 'Review bandwidth overview',
          description: 'Look at aggregate traffic history and usage.',
          prompt: 'Show the fleet bandwidth overview',
          response: `Here is the bandwidth overview for ${scopeLabel}.`,
          resultTypes: ['bandwidth-chart'],
        },
        {
          id: 'all-health',
          title: 'Run fleet health analysis',
          description: 'Summarize current health, alerts, and recommended actions.',
          prompt: 'Run a fleet health analysis',
          response: `I analyzed the current health signals for ${scopeLabel}.`,
          resultTypes: ['metric', 'alerts', 'subscriber', 'action'],
        },
      ];
    case 'region':
      return [
        {
          id: 'region-devices',
          title: 'Show region devices',
          description: 'List devices in the selected region.',
          prompt: `Show me all devices in ${scopeLabel}`,
          response: `Here are the devices currently operating in ${scopeLabel}.`,
          resultTypes: ['device-table'],
        },
        {
          id: 'region-outages',
          title: 'View regional outages',
          description: 'Inspect incidents affecting this region.',
          prompt: `Show active outages in ${scopeLabel}`,
          response: `These are the active outages affecting ${scopeLabel}.`,
          resultTypes: ['outage-map'],
        },
        {
          id: 'region-bandwidth',
          title: 'Analyze regional bandwidth',
          description: 'Review usage trends for the selected region.',
          prompt: `Analyze bandwidth usage in ${scopeLabel}`,
          response: `Here is the recent bandwidth trend for ${scopeLabel}.`,
          resultTypes: ['bandwidth-chart'],
        },
        {
          id: 'region-optimize',
          title: 'Recommend channel optimization',
          description: 'Generate optimization actions for this region.',
          prompt: `Recommend channel optimization for ${scopeLabel}`,
          response: `I generated optimization guidance for ${scopeLabel}.`,
          resultTypes: ['metric', 'alerts', 'action'],
        },
      ];
    case 'organization':
      return [
        {
          id: 'org-health',
          title: 'Review org health',
          description: 'Summarize health, alerts, and next actions.',
          prompt: `Review operational health for ${scopeLabel}`,
          response: `Here is the current health summary for ${scopeLabel}.`,
          resultTypes: ['metric', 'alerts', 'action'],
        },
        {
          id: 'org-sla',
          title: 'Check SLA compliance',
          description: 'Inspect current SLA performance for this organization.',
          prompt: `Check SLA compliance for ${scopeLabel}`,
          response: `Here is the SLA compliance status for ${scopeLabel}.`,
          resultTypes: ['sla-status'],
        },
        {
          id: 'org-work-orders',
          title: 'Open work orders',
          description: 'Review recent work orders and escalations.',
          prompt: `Show open work orders for ${scopeLabel}`,
          response: `Here are the latest work orders for ${scopeLabel}.`,
          resultTypes: ['work-order'],
        },
        {
          id: 'org-plans',
          title: 'Review service plans',
          description: 'Check current plan mix and subscriber plan details.',
          prompt: `Review service plans for ${scopeLabel}`,
          response: `Here are the current service plan details for ${scopeLabel}.`,
          resultTypes: ['service-plan'],
        },
      ];
    case 'subscriber':
      return [
        {
          id: 'sub-topology',
          title: 'View subscriber topology',
          description: 'Inspect gateway and connected client devices.',
          prompt: `Show topology for ${scopeLabel}`,
          response: `Here is the network topology for ${scopeLabel}.`,
          resultTypes: ['topology'],
        },
        {
          id: 'sub-speed-test',
          title: 'Run speed test',
          description: 'Measure current download, upload, and latency.',
          prompt: `Run a speed test for ${scopeLabel}`,
          response: `Running a speed test for ${scopeLabel}.`,
          resultTypes: ['speed-test'],
        },
        {
          id: 'sub-plan',
          title: 'Review current plan',
          description: 'Check service tier, usage, and billing context.',
          prompt: `Show the current service plan for ${scopeLabel}`,
          response: `Here is the current service plan for ${scopeLabel}.`,
          resultTypes: ['service-plan'],
        },
        {
          id: 'sub-inspect',
          title: 'Quick inspect subscriber',
          description: 'Open the detailed diagnostic drawer for this subscriber.',
          prompt: `Open a quick inspection for ${scopeLabel}`,
          response: `Opening the quick inspection view for ${scopeLabel}.`,
          openInspectDrawer: true,
        },
      ];
    default:
      return [];
  }
}

export function CommandCenter() {
  const shouldReduceMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInspectDrawer, setShowInspectDrawer] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });
  const [currentScope, setCurrentScope] = useState<ScopeSelection>({ level: 'all' });
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

  const currentScopeActions = useMemo(() => getScopeActions(currentScope), [currentScope]);

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

      if (action.openInspectDrawer) {
        setShowInspectDrawer(true);
      }

      setMessages((prev) => [...prev, ...nextMessages]);
    }, 700);
  };

  const handleScopeChange = (scope: ScopeSelection) => {
    setCurrentScope(scope);
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
        return `Viewing subscriber ${getScopeDisplayLabel(scope)}. I can show you their device topology, health metrics, and recent activity.`;
      default:
        return 'Scope updated.';
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

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
      } else if (userInput.includes('chart') || userInput.includes('history') || userInput.includes('历史') || userInput.includes('bandwidth')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the recent bandwidth usage for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'bandwidth-chart' },
        ]);
      } else if (userInput.includes('speed test') || userInput.includes('speed') || userInput.includes('测速')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Running a speed test for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'speed-test' },
        ]);
      } else if (userInput.includes('outage') || userInput.includes('故障') || userInput.includes('停服') || userInput.includes('down')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here are the active outages for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'outage-map' },
        ]);
      } else if (userInput.includes('plan') || userInput.includes('套餐')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the current service plan for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'service-plan' },
        ]);
      } else if (userInput.includes('work order') || userInput.includes('ticket') || userInput.includes('工单')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here are the latest work orders for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'work-order' },
        ]);
      } else if (userInput.includes('sla') || userInput.includes('uptime') || userInput.includes('可用性')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the current SLA compliance status for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'sla-status' },
        ]);
      } else if (userInput.includes('provision') || userInput.includes('开通') || userInput.includes('新用户')) {
        setMessages((prev) => [...prev,
          { type: 'ai-text', message: `Here is the provisioning status for ${getScopeDisplayLabel(currentScope)}.`, timestamp: getTimestamp() },
          { type: 'provisioning' },
        ]);
      } else {
        // Default response
        setMessages((prev) => [
          ...prev,
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
          {
            type: 'action',
          },
        ]);
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
      
      case 'subscriber': {
        const scopedSubscriberCard = getScopedSubscriberCard(currentScope);
        return (
          <SubscriberCard
            key={idx}
            subscriberId={scopedSubscriberCard.subscriberId}
            name={scopedSubscriberCard.name}
            status="degraded"
            healthScore={73}
            devices={5}
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
            devices={[
              {
                id: 'GW-4521',
                name: 'Gateway Downtown-01',
                type: 'gateway',
                status: 'online',
                location: 'Main St & 5th Ave',
                uptime: '45d 12h',
                firmware: 'v2.4.1',
              },
              {
                id: 'GW-4522',
                name: 'Gateway Downtown-02',
                type: 'gateway',
                status: 'degraded',
                location: 'Park Ave & 3rd St',
                uptime: '23d 8h',
                firmware: 'v2.4.0',
              },
              {
                id: 'RT-1245',
                name: 'Router Central Hub',
                type: 'router',
                status: 'online',
                location: 'City Center',
                uptime: '89d 5h',
                firmware: 'v3.1.2',
              },
              {
                id: 'AP-8821',
                name: 'Access Point East',
                type: 'ap',
                status: 'online',
                location: 'East District',
                uptime: '12d 3h',
                firmware: 'v1.8.5',
              },
              {
                id: 'GW-4523',
                name: 'Gateway West Zone',
                type: 'gateway',
                status: 'offline',
                location: 'West End Plaza',
                uptime: '0d 0h',
                firmware: 'v2.3.9',
              },
            ]}
            timestamp="10:24 AM"
            source="Device Management System"
          />
        );
      
      case 'topology':
        return (
          <TopologyCard
            key={idx}
            subscriberId="SUB-7834"
            subscriberName={getScopedTopologyName(currentScope)}
            gateway={{
              id: 'GW-4521-A',
              name: 'Gateway Downtown-01',
              status: 'online',
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

  return (
    <AppLayout 
      rightPanel={<ContextPanel />} 
      scopeIndicator="Acme ISP • All Regions"
      onScopeChange={handleScopeChange}
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
                Ask me anything about your network operations. I can help you:
              </motion.p>

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
                className="relative flex-1 overflow-hidden rounded-[var(--radius-control)]"
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
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Ask about network status, subscribers, or request actions..."
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
