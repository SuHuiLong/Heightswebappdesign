import { ReactNode, useState, useEffect } from 'react';
import { User, Bot, TrendingUp, AlertTriangle, Users, Play, CheckCircle2, Clock, Network, Wifi, Monitor, Smartphone, Laptop, Tablet, Circle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface BandwidthChartCardProps { timestamp: string; source: string; }

export function BandwidthChartCard({ timestamp, source }: BandwidthChartCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
          Bandwidth Usage — Last 7 Days
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={BANDWIDTH_DATA}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} unit=" Mbps" domain={[0, 600]} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
            <Legend />
            <Line type="monotone" dataKey="download" stroke="var(--primary)" strokeWidth={2} dot={false} name="Download" />
            <Line type="monotone" dataKey="upload" stroke="var(--accent-color)" strokeWidth={2} dot={false} name="Upload" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
}

// ─── SpeedTestCard ────────────────────────────────────────────────────────

interface SpeedTestCardProps { timestamp: string; source: string; }

export function SpeedTestCard({ timestamp, source }: SpeedTestCardProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
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

  const Ring = ({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) => {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - (value / max) * progress);
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={r} fill="none" stroke="var(--neutral-200)" strokeWidth={8} />
          <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 50 50)" />
          <text x={50} y={54} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--foreground)">
            {Math.round(value * progress)}
          </text>
        </svg>
        <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>{unit}</div>
      </div>
    );
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--foreground)' }}>Speed Test</div>
        <div className="flex justify-around mb-3">
          <Ring value={targets.download} max={maxValues.download} color="var(--primary)" label="Download" unit="Mbps" />
          <Ring value={targets.upload} max={maxValues.upload} color="var(--accent-color)" label="Upload" unit="Mbps" />
          <Ring value={targets.latency} max={maxValues.latency} color="var(--success)" label="Latency" unit="ms" />
        </div>
        {done && (
          <div className="text-center text-sm font-medium" style={{ color: 'var(--success)' }}>Test Complete ✓</div>
        )}
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

interface OutageMapCardProps { timestamp: string; source: string; }

export function OutageMapCard({ timestamp, source }: OutageMapCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Active Outages</div>
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--severity-critical-bg)', color: 'var(--severity-critical)' }}>
            {OUTAGES.length} Active
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {OUTAGES.map((o) => {
            const col = SEVERITY_COLORS[o.severity];
            return (
              <div key={o.zone} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: col.bg, color: col.text }}>{col.label}</span>
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>{o.zone}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>{o.affected} affected</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>ETA {o.eta}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-xs mt-3" style={{ color: 'var(--neutral-400)' }}>Last updated: {timestamp}</div>
      </div>
    </CardWrapper>
  );
}

// ─── ServicePlanCard ──────────────────────────────────────────────────────

interface ServicePlanCardProps { timestamp: string; source: string; }

export function ServicePlanCard({ timestamp, source }: ServicePlanCardProps) {
  const used = 342;
  const cap = 500;
  const pct = Math.round((used / cap) * 100);
  const barColor = pct > 80 ? 'var(--critical)' : 'var(--primary)';
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Business Pro 500</span>
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>$89.99/mo</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
            <span>Data Usage</span>
            <span>{used} GB / {cap} GB ({pct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--neutral-200)' }}>
            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
          </div>
        </div>
        <div className="text-xs mb-3" style={{ color: 'var(--neutral-500)' }}>
          Billing cycle: Mar 1 – Mar 31, 2026
          <span className="ml-2" style={{ color: 'var(--warning)' }}>3 days remaining</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Static IP', 'Priority Support', '24/7 NOC'].map((f) => (
            <span key={f} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--neutral-100)', color: 'var(--neutral-600)' }}>{f}</span>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── WorkOrderCard ────────────────────────────────────────────────────────

interface WorkOrderCardProps { timestamp: string; source: string; }

export function WorkOrderCard({ timestamp, source }: WorkOrderCardProps) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--success)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Work Order Created</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div><div style={{ color: 'var(--neutral-500)' }}>Ticket ID</div><div className="font-medium" style={{ color: 'var(--foreground)' }}>WO-20480</div></div>
          <div><div style={{ color: 'var(--neutral-500)' }}>Category</div><div className="font-medium" style={{ color: 'var(--foreground)' }}>Network Issue</div></div>
          <div><div style={{ color: 'var(--neutral-500)' }}>Priority</div><div><span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>High</span></div></div>
          <div><div style={{ color: 'var(--neutral-500)' }}>Assigned</div><div className="font-medium" style={{ color: 'var(--foreground)' }}>Marcus Webb</div></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>Open</span>
          <Button size="sm" onClick={() => toast.success('Opening work order WO-20480')} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-control)' }}>
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

interface SLAStatusCardProps { timestamp: string; source: string; }

export function SLAStatusCard({ timestamp, source }: SLAStatusCardProps) {
  const compliant = SLA_METRICS.every((m) => m.pass);
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>SLA Compliance</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: compliant ? 'var(--success-bg)' : 'var(--critical-bg)', color: compliant ? 'var(--success)' : 'var(--critical)' }}>
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

interface ProvisioningCardProps { timestamp: string; source: string; }

export function ProvisioningCard({ timestamp, source }: ProvisioningCardProps) {
  const done = PROVISIONING_STEPS.filter((s) => s.status === 'done').length;
  const pct = Math.round((done / PROVISIONING_STEPS.length) * 100);
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
          Provisioning: Alex Turner <span style={{ color: 'var(--neutral-400)' }}>(ACC-20391)</span>
        </div>
        <div className="flex flex-col">
          {PROVISIONING_STEPS.map((step, i) => {
            const isLast = i === PROVISIONING_STEPS.length - 1;
            const StepIcon = step.status === 'done' ? CheckCircle2 : step.status === 'active' ? Clock : Circle;
            const iconColor = step.status === 'done' ? 'var(--success)' : step.status === 'active' ? 'var(--warning)' : 'var(--neutral-400)';
            const lineColor = step.status === 'done' ? 'var(--success)' : 'var(--neutral-200)';
            return (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <StepIcon className="h-4 w-4 flex-shrink-0" style={{ color: iconColor }} />
                  {!isLast && <div className="w-px flex-1 my-1" style={{ background: lineColor, minHeight: '16px' }} />}
                </div>
                <div className="pb-3">
                  <div className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{step.label}</div>
                  <div className="text-xs" style={{ color: 'var(--neutral-400)' }}>{step.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
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