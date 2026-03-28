import { X, Wifi, Smartphone, Laptop, Monitor, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';

interface SubscriberQuickInspectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: {
    id: string;
    name: string;
    healthScore: number;
    devices: Array<{
      id: string;
      name: string;
      type: 'smartphone' | 'laptop' | 'desktop' | 'other';
      rssi: number;
      phy: string;
      traffic: string;
      status: 'online' | 'offline';
    }>;
    wifiKpis: {
      avgRssi: string;
      avgPhy: string;
      packetLoss: string;
      latency: string;
    };
    recentAnomalies: Array<{
      time: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
}

export function SubscriberQuickInspectDrawer({
  isOpen,
  onClose,
  subscriber,
}: SubscriberQuickInspectDrawerProps) {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return Smartphone;
      case 'laptop':
        return Laptop;
      case 'desktop':
        return Monitor;
      default:
        return Wifi;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'var(--critical)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--critical)';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl h-full overflow-auto shadow-xl"
            style={{ background: 'var(--card)' }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-6 border-b"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                  {subscriber.name}
                </h2>
                <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                  ID: {subscriber.id}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Home Health Score */}
              <section>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
                  HOME HEALTH SCORE
                </h3>
                <div
                  className="p-6 rounded-lg border text-center"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="text-5xl font-bold mb-2" style={{ color: getHealthColor(subscriber.healthScore) }}>
                    {subscriber.healthScore}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Overall Health
                  </div>
                </div>
              </section>

              {/* Wi-Fi KPIs */}
              <section>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
                  WI-FI KPIs
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label="Avg RSSI" value={subscriber.wifiKpis.avgRssi} />
                  <KpiCard label="Avg PHY" value={subscriber.wifiKpis.avgPhy} />
                  <KpiCard label="Packet Loss" value={subscriber.wifiKpis.packetLoss} />
                  <KpiCard label="Latency" value={subscriber.wifiKpis.latency} />
                </div>
              </section>

              {/* Device List */}
              <section>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
                  DEVICES ({subscriber.devices.length})
                </h3>
                <div className="space-y-2">
                  {subscriber.devices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <div
                        key={device.id}
                        className="p-4 rounded-lg border"
                        style={{
                          background: 'var(--card)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ background: 'var(--neutral-100)' }}
                            >
                              <DeviceIcon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                            </div>
                            <div>
                              <div className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                {device.name}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                                {device.id}
                              </div>
                            </div>
                          </div>
                          <div
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              background:
                                device.status === 'online'
                                  ? 'var(--success-bg)'
                                  : 'var(--neutral-200)',
                              color:
                                device.status === 'online' ? 'var(--success)' : 'var(--neutral-600)',
                            }}
                          >
                            {device.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
                              RSSI
                            </div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                              {device.rssi} dBm
                            </div>
                          </div>
                          <div>
                            <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
                              PHY
                            </div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                              {device.phy}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs mb-1" style={{ color: 'var(--neutral-500)' }}>
                              Traffic
                            </div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                              {device.traffic}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Recent Anomalies */}
              <section>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
                  RECENT ANOMALIES
                </h3>
                <div className="space-y-2">
                  {subscriber.recentAnomalies.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border flex items-start gap-3"
                      style={{
                        background: 'var(--card)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: getSeverityColor(anomaly.severity) }}
                      />
                      <div className="flex-1">
                        <div className="text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                          {anomaly.description}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                          {anomaly.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
                  QUICK ACTIONS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    style={{ borderRadius: 'var(--radius-control)' }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Restart Gateway
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    style={{ borderRadius: 'var(--radius-control)' }}
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Optimize Wi-Fi
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start col-span-2"
                    style={{ borderRadius: 'var(--radius-control)' }}
                  >
                    Run Diagnostics
                  </Button>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
}

function KpiCard({ label, value }: KpiCardProps) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="text-xs mb-2" style={{ color: 'var(--neutral-500)' }}>
        {label}
      </div>
      <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
        {value}
      </div>
    </div>
  );
}