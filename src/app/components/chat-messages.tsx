import { ReactNode, useState, useEffect } from 'react';
import { User, Bot, TrendingUp, AlertTriangle, Users, Play, CheckCircle2, Clock, Network, Wifi, Monitor, Smartphone, Laptop, Tablet, Circle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserMessageProps {
  message: string;
  timestamp: string;
}

export function UserMessage({ message, timestamp }: UserMessageProps) {
  return (
    <div className="chat-message-row mb-3 flex justify-end gap-2.5">
      <div className="chat-message-shell max-w-[70%]">
        <div className="chat-message-bubble rounded-[var(--radius-card)] bg-[var(--primary)] px-3.5 py-2 text-[13px] text-[color:var(--primary-foreground)] shadow-[var(--shadow-xs)]">
          <p>{message}</p>
        </div>
        <div className="chat-message-meta mt-1 text-right text-[11px] text-[color:var(--neutral-400)]">
          {timestamp}
        </div>
      </div>
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--neutral-200)]">
        <User className="h-4 w-4 text-[color:var(--neutral-600)]" />
      </div>
    </div>
  );
}

interface AITextMessageProps {
  message: string;
  timestamp: string;
  isTyping?: boolean;
}

export interface ScopeActionOption {
  id: string;
  title: string;
  description: string;
}

export function AITextMessage({ message, timestamp, isTyping }: AITextMessageProps) {
  return (
    <div className="chat-message-row mb-3 flex gap-2.5">
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)]">
        <Bot className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <div className="chat-message-shell max-w-[70%] flex-1">
        <div className="chat-message-bubble rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] px-3.5 py-2 shadow-[var(--shadow-xs)]">
          {isTyping ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-[13px] leading-[1.35rem] text-[color:var(--foreground)]">{message}</p>
          )}
        </div>
        {!isTyping && (
          <div className="chat-message-meta mt-1 text-[11px] text-[color:var(--neutral-400)]">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

interface ScopeActionsCardProps {
  title: string;
  description: string;
  actions: ScopeActionOption[];
  onAction: (action: ScopeActionOption) => void;
}

export function ScopeActionsCard({
  title,
  description,
  actions,
  onAction,
}: ScopeActionsCardProps) {
  return (
    <div className="chat-card-row mb-3 flex gap-2.5">
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)]">
        <Bot className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <div className="flex-1">
        <div className="chat-card-shell relative overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-xs)]">
          <div className="chat-card-content p-3.5">
            <div className="mb-1 text-[13px] font-semibold text-[color:var(--foreground)]">
              {title}
            </div>
            <div className="mb-3 text-[12px] leading-[1.25rem] text-[color:var(--neutral-500)]">
              {description}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {actions.map((action) => (
                <motion.button
                  key={action.id}
                  type="button"
                  onClick={() => onAction(action)}
                  whileHover={{ y: -1, scale: 1.004 }}
                  whileTap={{ scale: 0.992 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="group rounded-xl border border-[color:var(--border)] bg-[var(--surface-base)] px-3 py-2.5 text-left transition-[border-color,box-shadow,transform] duration-200 hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-xs)]"
                >
                  <div className="mb-1 text-[12px] font-medium text-[color:var(--foreground)]">
                    {action.title}
                  </div>
                  <div className="text-[11px] leading-[1.15rem] text-[color:var(--neutral-500)]">
                    {action.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          <div className="chat-card-meta flex justify-between border-t border-[color:var(--border)] px-3.5 py-1 text-[11px] text-[color:var(--neutral-400)]">
            <span>Source: Scope Assistant</span>
            <span>Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CardWrapperProps {
  children: ReactNode;
  timestamp: string;
  source: string;
}

function CardWrapper({ children, timestamp, source }: CardWrapperProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hoverGlow, setHoverGlow] = useState({ x: 0, y: 0, active: false });

  return (
    <div className="chat-card-row mb-3 flex gap-2.5">
      <div className="chat-message-avatar flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)]">
        <Bot className="h-4 w-4 text-[color:var(--primary)]" />
      </div>
      <div className="flex-1">
        <motion.div
          className="chat-card-shell relative overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-xs)]"
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  y: -2,
                  borderColor: 'var(--border-strong)',
                  boxShadow: 'var(--shadow-sm)',
                }
          }
          transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.7 }}
          onPointerMove={(event) => {
            if (shouldReduceMotion) return;
            const rect = event.currentTarget.getBoundingClientRect();
            setHoverGlow({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              active: true,
            });
          }}
          onPointerLeave={() => setHoverGlow((prev) => ({ ...prev, active: false }))}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-0"
            animate={{ opacity: !shouldReduceMotion && hoverGlow.active ? 1 : 0 }}
            transition={{ duration: 0.1 }}
            style={{
              background: `radial-gradient(240px circle at ${hoverGlow.x}px ${hoverGlow.y}px, var(--card-glow), transparent 62%)`,
            }}
          />
          <div className="relative z-10">
          {children}
          <div className="chat-card-meta flex justify-between border-t border-[color:var(--border)] px-3.5 py-1 text-[11px] text-[color:var(--neutral-400)]">
            <span>Source: {source}</span>
            <span>{timestamp}</span>
          </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  source: string;
}

export function MetricCard({ title, value, change, changeType, timestamp, source }: MetricCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'var(--success)'
      : changeType === 'negative'
      ? 'var(--critical)'
      : 'var(--neutral-500)';

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3">
        <div className="chat-card-caption mb-1.5 text-[13px]" style={{ color: 'var(--neutral-600)' }}>
          {title}
        </div>
        <div className="mb-1 text-[1.375rem] font-semibold leading-none" style={{ color: 'var(--foreground)' }}>
          {value}
        </div>
        <div className="chat-card-body flex items-center gap-1 text-[13px]" style={{ color: changeColor }}>
          <TrendingUp className="h-4 w-4" />
          <span>{change}</span>
        </div>
      </div>
    </CardWrapper>
  );
}

interface AlertListCardProps {
  alerts: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    count: number;
  }>;
  timestamp: string;
  source: string;
}

export function AlertListCard({ alerts, timestamp, source }: AlertListCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--critical)';
      case 'high':
        return 'var(--severity-high)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--severity-low)';
      default:
        return 'var(--neutral-500)';
    }
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
          <h3 className="chat-card-title font-semibold" style={{ color: 'var(--foreground)' }}>
            Active Alerts
          </h3>
        </div>
        <div className="space-y-1.5">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--surface-base)] p-2.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: getSeverityColor(alert.severity) }}
                />
                <span className="chat-card-body text-[13px]" style={{ color: 'var(--foreground)' }}>
                  {alert.message}
                </span>
              </div>
              <span className="chat-card-chip rounded bg-[var(--neutral-200)] px-2 py-1 text-[11px] font-medium text-[color:var(--foreground)]">
                {alert.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

interface SubscriberCardProps {
  subscriberId: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  healthScore: number;
  devices: number;
  timestamp: string;
  source: string;
  onInspect?: () => void;
}

export function SubscriberCard({
  subscriberId,
  name,
  status,
  healthScore,
  devices,
  timestamp,
  source,
  onInspect,
}: SubscriberCardProps) {
  const statusColor =
    status === 'healthy'
      ? 'var(--success)'
      : status === 'degraded'
      ? 'var(--warning)'
      : 'var(--critical)';

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3">
        <div className="mb-2.5 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <h3 className="chat-card-title font-semibold" style={{ color: 'var(--foreground)' }}>
                {name}
              </h3>
            </div>
            <div className="chat-card-caption text-[12px]" style={{ color: 'var(--neutral-500)' }}>
              ID: {subscriberId}
            </div>
          </div>
          <div className="chat-card-chip rounded px-2 py-1 text-[11px] font-medium" style={{ background: `${statusColor}20`, color: statusColor }}>
            {status}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <div className="chat-card-caption mb-1 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
              Health Score
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {healthScore}%
            </div>
          </div>
          <div>
            <div className="chat-card-caption mb-1 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
              Devices
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {devices}
            </div>
          </div>
        </div>

        <Button
          onClick={onInspect}
          className="w-full"
          variant="outline"
          style={{
            borderRadius: 'var(--radius-control)',
          }}
        >
          Quick Inspect
        </Button>
      </div>
    </CardWrapper>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryAction: string;
  secondaryAction?: string;
  timestamp: string;
  source: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export function ActionCard({
  title,
  description,
  riskLevel,
  primaryAction,
  secondaryAction,
  timestamp,
  source,
  onPrimaryAction,
  onSecondaryAction,
}: ActionCardProps) {
  const riskColors = {
    low: 'var(--success)',
    medium: 'var(--warning)',
    high: 'var(--severity-high)',
    critical: 'var(--critical)',
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3">
        <div className="mb-2.5 flex items-start justify-between">
          <div>
            <h3 className="chat-card-title mb-1 font-semibold" style={{ color: 'var(--foreground)' }}>
              {title}
            </h3>
            <p className="chat-card-body text-[13px]" style={{ color: 'var(--neutral-600)' }}>
              {description}
            </p>
          </div>
          <div
            className="chat-card-chip rounded px-2 py-1 text-[11px] font-medium"
            style={{
              background: riskColors[riskLevel] + '20',
              color: riskColors[riskLevel],
            }}
          >
            {riskLevel} risk
          </div>
        </div>

        <div className="flex gap-2">
          {secondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="flex-1"
              style={{ borderRadius: 'var(--radius-control)' }}
            >
              {secondaryAction}
            </Button>
          )}
          <Button onClick={onPrimaryAction} className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            {primaryAction}
          </Button>
        </div>
      </div>
    </CardWrapper>
  );
}

interface ReceiptCardProps {
  action: string;
  status: 'success' | 'failed' | 'in-progress';
  details: Array<{ label: string; value: string }>;
  correlationId: string;
  timestamp: string;
  source: string;
  onViewAudit?: () => void;
}

export function ReceiptCard({
  action,
  status,
  details,
  correlationId,
  timestamp,
  source,
  onViewAudit,
}: ReceiptCardProps) {
  const statusConfig = {
    success: { color: 'var(--success)', icon: CheckCircle2, label: 'Success' },
    failed: { color: 'var(--critical)', icon: AlertTriangle, label: 'Failed' },
    'in-progress': { color: 'var(--warning)', icon: Clock, label: 'In Progress' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <StatusIcon className="h-5 w-5" style={{ color: config.color }} />
          <h3 className="chat-card-title font-semibold" style={{ color: 'var(--foreground)' }}>
            {action}
          </h3>
          <div className="chat-card-chip ml-auto rounded px-2 py-1 text-[11px] font-medium" style={{ background: `${config.color}20`, color: config.color }}>
            {config.label}
          </div>
        </div>

        <div className="mb-3 space-y-1.5">
          {details.map((detail, idx) => (
            <div key={idx} className="flex justify-between text-[13px]">
              <span className="chat-card-caption" style={{ color: 'var(--neutral-500)' }}>{detail.label}</span>
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                {detail.value}
              </span>
            </div>
          ))}
        </div>

        <div className="chat-card-caption mb-2.5 text-[11px]" style={{ color: 'var(--neutral-400)' }}>
          Correlation ID: {correlationId}
        </div>

        <Button
          onClick={onViewAudit}
          variant="outline"
          className="w-full"
          style={{ borderRadius: 'var(--radius-control)' }}
        >
          View in Audit Log
        </Button>
      </div>
    </CardWrapper>
  );
}

// Device Table Card
interface DeviceTableCardProps {
  title: string;
  devices: Array<{
    id: string;
    name: string;
    type: 'gateway' | 'router' | 'ap' | 'other';
    status: 'online' | 'offline' | 'degraded';
    location: string;
    uptime: string;
    firmware: string;
  }>;
  timestamp: string;
  source: string;
}

export function DeviceTableCard({ title, devices, timestamp, source }: DeviceTableCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'var(--success)';
      case 'offline':
        return 'var(--critical)';
      case 'degraded':
        return 'var(--warning)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'gateway':
        return Network;
      case 'router':
        return Wifi;
      case 'ap':
        return Wifi;
      default:
        return Monitor;
    }
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-3 flex items-center gap-2">
          <Monitor className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
          <div className="chat-card-chip ml-auto rounded bg-[var(--neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--neutral-600)]">
            {devices.length} devices
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="px-2 py-1.5 text-left" style={{ color: 'var(--neutral-500)' }}>
                  Device
                </th>
                <th className="px-2 py-1.5 text-left" style={{ color: 'var(--neutral-500)' }}>
                  Status
                </th>
                <th className="px-2 py-1.5 text-left" style={{ color: 'var(--neutral-500)' }}>
                  Location
                </th>
                <th className="px-2 py-1.5 text-left" style={{ color: 'var(--neutral-500)' }}>
                  Uptime
                </th>
                <th className="px-2 py-1.5 text-left" style={{ color: 'var(--neutral-500)' }}>
                  Firmware
                </th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device, idx) => {
                const DevIcon = getDeviceIcon(device.type);
                return (
                  <motion.tr
                    key={device.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.025 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="group hover:bg-opacity-50"
                  >
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <DevIcon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <div>
                          <div className="chat-card-body font-medium" style={{ color: 'var(--foreground)' }}>
                            {device.name}
                          </div>
                          <div className="chat-card-caption text-[11px]" style={{ color: 'var(--neutral-400)' }}>
                            {device.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: getStatusColor(device.status) }} />
                        <span style={{ color: 'var(--foreground)' }}>{device.status}</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5" style={{ color: 'var(--foreground)' }}>
                      {device.location}
                    </td>
                    <td className="px-2 py-1.5" style={{ color: 'var(--foreground)' }}>
                      {device.uptime}
                    </td>
                    <td className="px-2 py-1.5" style={{ color: 'var(--neutral-600)' }}>
                      {device.firmware}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </CardWrapper>
  );
}

// Network Topology Card
interface TopologyCardProps {
  subscriberId: string;
  subscriberName: string;
  gateway: {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'degraded';
  };
  devices: Array<{
    id: string;
    name: string;
    type: 'smartphone' | 'laptop' | 'desktop' | 'tablet' | 'other';
    status: 'online' | 'offline';
    connection: '5GHz' | '2.4GHz' | 'Ethernet';
  }>;
  timestamp: string;
  source: string;
}

export function TopologyCard({
  subscriberId,
  subscriberName,
  gateway,
  devices,
  timestamp,
  source,
}: TopologyCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isTopologyHovered, setIsTopologyHovered] = useState(false);
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return Smartphone;
      case 'laptop':
        return Laptop;
      case 'desktop':
        return Monitor;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'var(--success)';
      case 'offline':
        return 'var(--critical)';
      case 'degraded':
        return 'var(--warning)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const getConnectionColor = (connection: string) => {
    switch (connection) {
      case '5GHz':
        return 'var(--primary)';
      case '2.4GHz':
        return 'var(--secondary-foreground)';
      case 'Ethernet':
        return 'var(--success)';
      default:
        return 'var(--neutral-500)';
    }
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-4">
        <div className="mb-4 flex items-center gap-2">
          <Network className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title font-semibold" style={{ color: 'var(--foreground)' }}>
            Network Topology: {subscriberName}
          </h3>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-3.5"
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  borderColor: 'var(--border-strong)',
                  boxShadow: 'var(--shadow-xs)',
                }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsTopologyHovered(true)}
          onHoverEnd={() => setIsTopologyHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: isTopologyHovered ? 1 : 0.4,
                  }
            }
            transition={{ duration: 0.12 }}
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-violet) 82%, transparent) 100%)',
            }}
          />
        <div className="relative z-10">
          {/* ISP Internet Cloud */}
          <div className="mb-6 flex justify-center">
            <motion.div className="relative">
              <div className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] px-4 py-2 shadow-[var(--shadow-xs)]">
                <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                  Internet
                </div>
                <div className="font-semibold" style={{ color: 'var(--primary)' }}>
                  ISP Network
                </div>
              </div>
            </motion.div>
          </div>

          {/* Connection line to gateway */}
          <div className="mb-6 flex justify-center">
            <motion.div
              className="h-12 w-0.5"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      backgroundColor: isTopologyHovered ? 'rgba(76, 179, 255, 0.55)' : 'var(--border-strong)',
                    }
              }
              transition={{ duration: 0.12 }}
            />
          </div>

          {/* Gateway */}
          <div className="mb-6 flex justify-center">
            <motion.div
              className="relative"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: 1.03,
                      y: -2,
                    }
              }
            >
              <div
                className="rounded-xl border bg-[var(--card)] px-6 py-4 shadow-[var(--shadow-xs)]"
                style={{
                  borderColor: isTopologyHovered ? getStatusColor(gateway.status) : getStatusColor(gateway.status),
                  boxShadow: isTopologyHovered ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Wifi className="h-6 w-6" style={{ color: getStatusColor(gateway.status) }} />
                  <div>
                      <div className="chat-card-body font-semibold" style={{ color: 'var(--foreground)' }}>
                        {gateway.name}
                      </div>
                      <div className="chat-card-caption text-[11px]" style={{ color: 'var(--neutral-500)' }}>
                        {gateway.id}
                      </div>
                  </div>
                  <div className="ml-2 h-3 w-3 rounded-full" style={{ background: getStatusColor(gateway.status) }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Connection lines to devices */}
          <div className="mb-3 flex justify-center">
            <div className="relative w-full max-w-md">
              <motion.div
                className="h-0.5 w-full"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        backgroundColor: isTopologyHovered ? 'rgba(125, 211, 252, 0.42)' : 'var(--border)',
                      }
                }
                transition={{ duration: 0.12 }}
              />
              {/* Vertical lines */}
              <div className="absolute inset-x-0 top-0 flex justify-around">
                {devices.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="h-8 w-0.5"
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            backgroundColor: isTopologyHovered ? 'rgba(125, 211, 252, 0.36)' : 'var(--border)',
                          }
                    }
                    transition={{ duration: 0.12, delay: idx * 0.015 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Client Devices */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-3">
            {devices.map((device, idx) => {
              const DevIcon = getDeviceIcon(device.type);
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 1.03,
                          y: -4,
                        }
                  }
                >
                  <div
                    className="rounded-xl border bg-[var(--card)] p-2.5 shadow-[var(--shadow-xs)]"
                    style={{
                      borderColor:
                        device.status === 'online'
                          ? isTopologyHovered
                            ? 'var(--border-strong)'
                            : 'var(--border)'
                          : 'var(--critical)',
                      opacity: device.status === 'online' ? 1 : 0.6,
                      boxShadow: isTopologyHovered ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                    }}
                  >
                    <div className="mb-1.5 flex items-start gap-2">
                      <DevIcon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="chat-card-body truncate text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                          {device.name}
                        </div>
                        <div className="chat-card-caption truncate text-[11px]" style={{ color: 'var(--neutral-400)' }}>
                          {device.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span
                        className="chat-card-chip rounded px-2 py-0.5"
                        style={{
                          background: isTopologyHovered
                            ? `color-mix(in srgb, ${getConnectionColor(device.connection)} 24%, transparent)`
                            : `color-mix(in srgb, ${getConnectionColor(device.connection)} 16%, transparent)`,
                          color: getConnectionColor(device.connection),
                        }}
                      >
                        {device.connection}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: getStatusColor(device.status) }} />
                        <span style={{ color: getStatusColor(device.status) }}>
                          {device.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── BandwidthChartCard ───────────────────────────────────────────────────

const BANDWIDTH_DATA = [
  { day: 'Mon', download: 423, upload: 78 },
  { day: 'Tue', download: 387, upload: 82 },
  { day: 'Wed', download: 512, upload: 95 },
  { day: 'Thu', download: 467, upload: 88 },
  { day: 'Fri', download: 498, upload: 91 },
  { day: 'Sat', download: 341, upload: 63 },
  { day: 'Sun', download: 298, upload: 54 },
];

interface BandwidthChartCardProps { title?: string; timestamp: string; source: string; }

export function BandwidthChartCard({ title = 'Bandwidth Usage - Last 7 Days', timestamp, source }: BandwidthChartCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isChartHovered, setIsChartHovered] = useState(false);

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="chat-card-title mb-2.5 text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
          {title}
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-2.5"
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  borderColor: 'var(--border-strong)',
                  boxShadow: 'var(--shadow-xs)',
                }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsChartHovered(true)}
          onHoverEnd={() => setIsChartHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: isChartHovered ? 1 : 0.55,
                  }
            }
            transition={{ duration: 0.12 }}
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-blue) 80%, transparent) 100%)',
            }}
          />
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={176}>
              <LineChart data={BANDWIDTH_DATA}>
                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: 11,
                    fill: isChartHovered ? 'var(--foreground)' : 'var(--neutral-500)',
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: isChartHovered ? 'var(--neutral-600)' : 'var(--neutral-500)',
                  }}
                  unit=" Mbps"
                  domain={[0, 600]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: `1px solid ${isChartHovered ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: isChartHovered ? 'var(--foreground)' : 'var(--neutral-500)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="download"
                  stroke={isChartHovered ? '#4cb3ff' : 'var(--primary)'}
                  strokeWidth={isChartHovered ? 2.5 : 2}
                  dot={false}
                  activeDot={{ r: isChartHovered ? 4 : 3 }}
                  name="Download"
                />
                <Line
                  type="monotone"
                  dataKey="upload"
                  stroke={isChartHovered ? '#7dd3fc' : 'var(--accent-color)'}
                  strokeWidth={isChartHovered ? 2.5 : 2}
                  dot={false}
                  activeDot={{ r: isChartHovered ? 4 : 3 }}
                  name="Upload"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── SpeedTestCard ────────────────────────────────────────────────────────

interface SpeedTestCardProps { title?: string; timestamp: string; source: string; }

export function SpeedTestCard({ title = 'Speed Test', timestamp, source }: SpeedTestCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [isSpeedHovered, setIsSpeedHovered] = useState(false);
  const targets = { download: 487, upload: 92, latency: 8 };
  const maxValues = { download: 600, upload: 150, latency: 100 };

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;
    const frame = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(frame);
      else setDone(true);
    };
    requestAnimationFrame(frame);
  }, []);

  const Ring = ({
    value,
    max,
    color,
    hoverColor,
    label,
    unit,
  }: {
    value: number;
    max: number;
    color: string;
    hoverColor: string;
    label: string;
    unit: string;
  }) => {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - (value / max) * progress);
    return (
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: isSpeedHovered ? -2 : 0,
                scale: isSpeedHovered ? 1.01 : 1,
              }
        }
        transition={{ duration: 0.12, ease: 'easeOut' }}
      >
        <svg width={92} height={92} viewBox="0 0 100 100">
          <circle
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={isSpeedHovered ? 'var(--neutral-300)' : 'var(--neutral-200)'}
            strokeWidth={7}
          />
          <circle
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={isSpeedHovered ? hoverColor : color}
            strokeWidth={isSpeedHovered ? 8 : 7}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 50 50)" />
          <text x={50} y={54} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--foreground)">
            {Math.round(value * progress)}
          </text>
        </svg>
        <div className="text-xs font-medium" style={{ color: isSpeedHovered ? 'var(--foreground)' : 'var(--neutral-700)' }}>{label}</div>
        <div className="text-xs" style={{ color: isSpeedHovered ? 'var(--neutral-500)' : 'var(--neutral-400)' }}>{unit}</div>
      </motion.div>
    );
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="chat-card-title mb-3 text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{title}</div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-2.5"
          whileHover={
            shouldReduceMotion
              ? undefined
              : {
                  borderColor: 'var(--border-strong)',
                  boxShadow: 'var(--shadow-xs)',
                }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsSpeedHovered(true)}
          onHoverEnd={() => setIsSpeedHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    opacity: isSpeedHovered ? 1 : 0.5,
                  }
            }
            transition={{ duration: 0.12 }}
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-cyan) 82%, transparent) 100%)',
            }}
          />
          <div className="relative z-10">
            <div className="mb-2.5 flex justify-around gap-2">
              <Ring
                value={targets.download}
                max={maxValues.download}
                color="var(--primary)"
                hoverColor="#4cb3ff"
                label="Download"
                unit="Mbps"
              />
              <Ring
                value={targets.upload}
                max={maxValues.upload}
                color="var(--accent-color)"
                hoverColor="#7dd3fc"
                label="Upload"
                unit="Mbps"
              />
              <Ring
                value={targets.latency}
                max={maxValues.latency}
                color="var(--success)"
                hoverColor="#4ade80"
                label="Latency"
                unit="ms"
              />
            </div>
            {done && (
              <motion.div
                className="text-center text-[13px] font-medium"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: isSpeedHovered ? 1 : 0.9,
                        y: isSpeedHovered ? -1 : 0,
                      }
                }
                transition={{ duration: 0.18 }}
                style={{ color: 'var(--success)' }}
              >
                Test Complete ✓
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── OutageMapCard ────────────────────────────────────────────────────────

const OUTAGES = [
  { severity: 'critical' as const, zone: 'Downtown Core', affected: 847, eta: '14:30' },
  { severity: 'high' as const, zone: 'East District', affected: 312, eta: '15:00' },
  { severity: 'medium' as const, zone: 'West Suburb', affected: 89, eta: '16:45' },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'var(--severity-critical-bg)', text: 'var(--severity-critical)', label: 'Critical' },
  high: { bg: 'var(--severity-high-bg)', text: 'var(--severity-high)', label: 'High' },
  medium: { bg: 'var(--severity-medium-bg)', text: 'var(--severity-medium)', label: 'Medium' },
};

interface OutageMapCardProps { title?: string; timestamp: string; source: string; }

export function OutageMapCard({ title = 'Active Outages', timestamp, source }: OutageMapCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="chat-card-title text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{title}</div>
          <span className="chat-card-chip rounded px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--severity-critical-bg)', color: 'var(--severity-critical)' }}>
            {OUTAGES.length} Active
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {OUTAGES.map((o) => {
            const col = SEVERITY_COLORS[o.severity];
            return (
              <div key={o.zone} className="flex items-center justify-between rounded px-2.5 py-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="chat-card-chip rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: col.bg, color: col.text }}>{col.label}</span>
                  <span className="chat-card-body text-[13px]" style={{ color: 'var(--foreground)' }}>{o.zone}</span>
                </div>
                <div className="text-right">
                  <div className="chat-card-caption text-[11px]" style={{ color: 'var(--neutral-500)' }}>{o.affected} affected</div>
                  <div className="chat-card-caption text-[11px]" style={{ color: 'var(--neutral-400)' }}>ETA {o.eta}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="chat-card-caption mt-2.5 text-[11px]" style={{ color: 'var(--neutral-400)' }}>Last updated: {timestamp}</div>
      </div>
    </CardWrapper>
  );
}

// ─── ServicePlanCard ──────────────────────────────────────────────────────

interface ServicePlanCardProps { title?: string; timestamp: string; source: string; }

export function ServicePlanCard({ title = 'Service Plan', timestamp, source }: ServicePlanCardProps) {
  const used = 342;
  const cap = 500;
  const pct = Math.round((used / cap) * 100);
  const barColor = pct > 80 ? 'var(--critical)' : 'var(--primary)';
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="chat-card-title text-[13px] font-medium text-[color:var(--foreground)]">
            {title}
          </div>
        </div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="chat-card-chip rounded px-2 py-1 text-[11px] font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Business Pro 500</span>
          <span className="chat-card-body text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>$89.99/mo</span>
        </div>
        <div className="mb-2.5">
          <div className="chat-card-caption mb-1 flex justify-between text-[11px]" style={{ color: 'var(--neutral-500)' }}>
            <span>Data Usage</span>
            <span>{used} GB / {cap} GB ({pct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--neutral-200)' }}>
            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
          </div>
        </div>
        <div className="chat-card-caption mb-2.5 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
          Billing cycle: Mar 1 – Mar 31, 2026
          <span className="ml-2" style={{ color: 'var(--warning)' }}>3 days remaining</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Static IP', 'Priority Support', '24/7 NOC'].map((f) => (
            <span key={f} className="chat-card-chip rounded px-2 py-0.5 text-[11px]" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-600)' }}>{f}</span>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── WorkOrderCard ────────────────────────────────────────────────────────

interface WorkOrderCardProps {
  title?: string;
  ticketId?: string;
  category?: string;
  assignedTo?: string;
  timestamp: string;
  source: string;
}

export function WorkOrderCard({
  title = 'Work Order Created',
  ticketId = 'WO-20480',
  category = 'Network Issue',
  assignedTo = 'Marcus Webb',
  timestamp,
  source,
}: WorkOrderCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />
          <span className="chat-card-title text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{title}</span>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
          <div><div className="chat-card-caption" style={{ color: 'var(--neutral-500)' }}>Ticket ID</div><div className="chat-card-body font-medium" style={{ color: 'var(--foreground)' }}>{ticketId}</div></div>
          <div><div className="chat-card-caption" style={{ color: 'var(--neutral-500)' }}>Category</div><div className="chat-card-body font-medium" style={{ color: 'var(--foreground)' }}>{category}</div></div>
          <div><div className="chat-card-caption" style={{ color: 'var(--neutral-500)' }}>Priority</div><div><span className="chat-card-chip rounded px-1.5 py-0.5 text-[11px] font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>High</span></div></div>
          <div><div className="chat-card-caption" style={{ color: 'var(--neutral-500)' }}>Assigned</div><div className="chat-card-body font-medium" style={{ color: 'var(--foreground)' }}>{assignedTo}</div></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="chat-card-chip rounded px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Open</span>
          <Button size="sm" onClick={() => toast.success(`Opening work order ${ticketId}`)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-control)' }}>
            View Full Ticket
          </Button>
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── SLAStatusCard ────────────────────────────────────────────────────────

const SLA_METRICS = [
  { name: 'Uptime', target: '99.9%', actual: '99.97%', pass: true },
  { name: 'Avg Response Time', target: '2.0h', actual: '2.1h', pass: false },
  { name: 'Avg Resolution Time', target: '4.0h', actual: '3.8h', pass: true },
];

interface SLAStatusCardProps {
  title?: string;
  timestamp: string;
  source: string;
}

export function SLAStatusCard({ title = 'SLA Compliance', timestamp, source }: SLAStatusCardProps) {
  const compliant = SLA_METRICS.every((m) => m.pass);
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="chat-card-title text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>{title}</span>
          <span className="chat-card-chip rounded px-2 py-0.5 text-[11px] font-medium" style={{ background: compliant ? 'var(--success-bg)' : 'var(--critical-bg)', color: compliant ? 'var(--success)' : 'var(--critical)' }}>
            {compliant ? 'Compliant' : 'At Risk'}
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: 'var(--neutral-500)' }}>
              <th className="text-left pb-2">Metric</th>
              <th className="text-right pb-2">Target</th>
              <th className="text-right pb-2">Actual</th>
              <th className="text-right pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {SLA_METRICS.map((m) => (
              <tr key={m.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="py-2" style={{ color: 'var(--foreground)' }}>{m.name}</td>
                <td className="py-2 text-right" style={{ color: 'var(--neutral-500)' }}>{m.target}</td>
                <td className="py-2 text-right font-medium" style={{ color: m.pass ? 'var(--success)' : 'var(--critical)' }}>{m.actual}</td>
                <td className="py-2 text-right" style={{ color: m.pass ? 'var(--success)' : 'var(--critical)' }}>{m.pass ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  );
}

// ─── ProvisioningCard ─────────────────────────────────────────────────────

const PROVISIONING_STEPS = [
  { label: 'Account Created', status: 'done' as const, time: 'Mar 25, 10:00' },
  { label: 'Equipment Ordered', status: 'done' as const, time: 'Mar 25, 10:02' },
  { label: 'Equipment Shipped', status: 'active' as const, time: 'In transit — ETA Mar 30' },
  { label: 'ONT Online', status: 'pending' as const, time: 'Pending' },
  { label: 'Service Activated', status: 'pending' as const, time: 'Pending' },
];

interface ProvisioningCardProps {
  title?: string;
  accountId?: string;
  timestamp: string;
  source: string;
}

export function ProvisioningCard({
  title = 'Provisioning',
  accountId = 'ACC-20391',
  timestamp,
  source,
}: ProvisioningCardProps) {
  const done = PROVISIONING_STEPS.filter((s) => s.status === 'done').length;
  const pct = Math.round((done / PROVISIONING_STEPS.length) * 100);
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="chat-card-title mb-2.5 text-[13px] font-medium" style={{ color: 'var(--foreground)' }}>
          {title} <span style={{ color: 'var(--neutral-400)' }}>({accountId})</span>
        </div>
        <div className="flex flex-col">
          {PROVISIONING_STEPS.map((step, i) => {
            const isLast = i === PROVISIONING_STEPS.length - 1;
            const StepIcon = step.status === 'done' ? CheckCircle2 : step.status === 'active' ? Clock : Circle;
            const iconColor = step.status === 'done' ? 'var(--success)' : step.status === 'active' ? 'var(--warning)' : 'var(--neutral-400)';
            const lineColor = step.status === 'done' ? 'var(--success)' : 'var(--neutral-200)';
            return (
              <div key={step.label} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <StepIcon className="h-4 w-4 flex-shrink-0" style={{ color: iconColor }} />
                  {!isLast && <div className="w-px flex-1 my-1" style={{ background: lineColor, minHeight: '16px' }} />}
                </div>
                <div className="pb-2.5">
                  <div className="chat-card-body text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>{step.label}</div>
                  <div className="chat-card-caption text-[11px]" style={{ color: 'var(--neutral-400)' }}>{step.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1">
          <div className="chat-card-caption mb-1 flex justify-between text-[11px]" style={{ color: 'var(--neutral-500)' }}>
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--neutral-200)' }}>
            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
