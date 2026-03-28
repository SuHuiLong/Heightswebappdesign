import { ReactNode } from 'react';
import { User, Bot, TrendingUp, AlertTriangle, Users, Play, CheckCircle2, Clock, Network, Wifi, Monitor, Smartphone, Laptop, Tablet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

interface UserMessageProps {
  message: string;
  timestamp: string;
}

export function UserMessage({ message, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end gap-3 mb-4">
      <div className="max-w-[70%]">
        <div
          className="px-4 py-3 rounded-lg"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p>{message}</p>
        </div>
        <div className="text-xs mt-1 text-right" style={{ color: 'var(--neutral-400)' }}>
          {timestamp}
        </div>
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--neutral-200)' }}
      >
        <User className="h-5 w-5" style={{ color: 'var(--neutral-600)' }} />
      </div>
    </div>
  );
}

interface AITextMessageProps {
  message: string;
  timestamp: string;
  isTyping?: boolean;
}

export function AITextMessage({ message, timestamp, isTyping }: AITextMessageProps) {
  return (
    <div className="flex gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--primary)' }}
      >
        <Bot className="h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
      </div>
      <div className="flex-1 max-w-[70%]">
        <div
          className="px-4 py-3 rounded-lg border"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p style={{ color: 'var(--foreground)' }}>{message}</p>
          )}
        </div>
        {!isTyping && (
          <div className="text-xs mt-1" style={{ color: 'var(--neutral-400)' }}>
            {timestamp}
          </div>
        )}
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
  return (
    <div className="flex gap-3 mb-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--primary)' }}
      >
        <Bot className="h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
      </div>
      <div className="flex-1">
        <motion.div
          className="border rounded-lg overflow-hidden"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius-card)',
          }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {children}
          <div
            className="px-4 py-2 border-t flex justify-between text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--neutral-400)' }}
          >
            <span>Source: {source}</span>
            <span>{timestamp}</span>
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
      <div className="p-4">
        <div className="text-sm mb-2" style={{ color: 'var(--neutral-600)' }}>
          {title}
        </div>
        <div className="text-3xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
          {value}
        </div>
        <div className="flex items-center gap-1 text-sm" style={{ color: changeColor }}>
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
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Active Alerts
          </h3>
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--neutral-50)', border: `1px solid var(--border)` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: getSeverityColor(alert.severity) }}
                />
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                  {alert.message}
                </span>
              </div>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: 'var(--neutral-200)',
                  color: 'var(--foreground)',
                }}
              >
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
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {name}
              </h3>
            </div>
            <div className="text-sm" style={{ color: 'var(--neutral-500)' }}>
              ID: {subscriberId}
            </div>
          </div>
          <div
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              background: statusColor + '20',
              color: statusColor,
            }}
          >
            {status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
              Health Score
            </div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {healthScore}%
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
              Devices
            </div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
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
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--neutral-600)' }}>
              {description}
            </p>
          </div>
          <div
            className="px-2 py-1 rounded text-xs font-medium"
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
          <Button
            onClick={onPrimaryAction}
            className="flex-1"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius-control)',
            }}
          >
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
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <StatusIcon className="h-5 w-5" style={{ color: config.color }} />
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {action}
          </h3>
          <div
            className="ml-auto px-2 py-1 rounded text-xs font-medium"
            style={{
              background: config.color + '20',
              color: config.color,
            }}
          >
            {config.label}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {details.map((detail, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span style={{ color: 'var(--neutral-500)' }}>{detail.label}</span>
              <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                {detail.value}
              </span>
            </div>
          ))}
        </div>

        <div className="text-xs mb-3" style={{ color: 'var(--neutral-400)' }}>
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
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
          <div
            className="ml-auto px-2 py-1 rounded text-xs font-medium"
            style={{
              background: 'var(--neutral-100)',
              color: 'var(--neutral-600)',
            }}
          >
            {devices.length} devices
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 px-2" style={{ color: 'var(--neutral-500)' }}>
                  Device
                </th>
                <th className="text-left py-2 px-2" style={{ color: 'var(--neutral-500)' }}>
                  Status
                </th>
                <th className="text-left py-2 px-2" style={{ color: 'var(--neutral-500)' }}>
                  Location
                </th>
                <th className="text-left py-2 px-2" style={{ color: 'var(--neutral-500)' }}>
                  Uptime
                </th>
                <th className="text-left py-2 px-2" style={{ color: 'var(--neutral-500)' }}>
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
                    transition={{ delay: idx * 0.05 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="group hover:bg-opacity-50"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <DevIcon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                        <div>
                          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {device.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>
                            {device.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ background: getStatusColor(device.status) }}
                          animate={{
                            boxShadow: [
                              `0 0 0px ${getStatusColor(device.status)}`,
                              `0 0 8px ${getStatusColor(device.status)}`,
                              `0 0 0px ${getStatusColor(device.status)}`,
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <span style={{ color: 'var(--foreground)' }}>{device.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2" style={{ color: 'var(--foreground)' }}>
                      {device.location}
                    </td>
                    <td className="py-3 px-2" style={{ color: 'var(--foreground)' }}>
                      {device.uptime}
                    </td>
                    <td className="py-3 px-2" style={{ color: 'var(--neutral-600)' }}>
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
        return 'var(--accent)';
      case 'Ethernet':
        return 'var(--success)';
      default:
        return 'var(--neutral-500)';
    }
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Network className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Network Topology: {subscriberName}
          </h3>
        </div>

        <div className="relative">
          {/* ISP Internet Cloud */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="relative"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="px-4 py-2 rounded-lg border-2"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--primary)',
                  boxShadow: '0 0 20px var(--primary)',
                }}
              >
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
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-0.5 h-12"
              style={{ background: 'var(--primary)' }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Gateway */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="px-6 py-4 rounded-lg border-2"
                style={{
                  background: 'var(--card)',
                  borderColor: getStatusColor(gateway.status),
                  boxShadow: `0 0 30px ${getStatusColor(gateway.status)}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <Wifi className="h-6 w-6" style={{ color: getStatusColor(gateway.status) }} />
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--foreground)' }}>
                      {gateway.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                      {gateway.id}
                    </div>
                  </div>
                  <motion.div
                    className="ml-2 w-3 h-3 rounded-full"
                    style={{ background: getStatusColor(gateway.status) }}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${getStatusColor(gateway.status)}`,
                        `0 0 10px ${getStatusColor(gateway.status)}`,
                        `0 0 0px ${getStatusColor(gateway.status)}`,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Connection lines to devices */}
          <div className="flex justify-center mb-4">
            <div className="relative w-full max-w-md">
              <motion.div
                className="h-0.5 w-full"
                style={{ background: 'var(--border)' }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Vertical lines */}
              <div className="absolute inset-x-0 top-0 flex justify-around">
                {devices.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="w-0.5 h-8"
                    style={{ background: 'var(--border)' }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Client Devices */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            {devices.map((device, idx) => {
              const DevIcon = getDeviceIcon(device.type);
              return (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div
                    className="p-3 rounded-lg border"
                    style={{
                      background: 'var(--card)',
                      borderColor: device.status === 'online' ? 'var(--border)' : 'var(--critical)',
                      opacity: device.status === 'online' ? 1 : 0.6,
                    }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <DevIcon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {device.name}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--neutral-400)' }}>
                          {device.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          background: getConnectionColor(device.connection) + '20',
                          color: getConnectionColor(device.connection),
                        }}
                      >
                        {device.connection}
                      </span>
                      <div className="flex items-center gap-1">
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: getStatusColor(device.status) }}
                          animate={device.status === 'online' ? {
                            boxShadow: [
                              `0 0 0px ${getStatusColor(device.status)}`,
                              `0 0 6px ${getStatusColor(device.status)}`,
                              `0 0 0px ${getStatusColor(device.status)}`,
                            ],
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
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
      </div>
    </CardWrapper>
  );
}