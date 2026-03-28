import React from 'react';
import { X, Wifi, Smartphone, Laptop, Monitor, Play } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
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
  const shouldReduceMotion = useReducedMotion();
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[color:var(--overlay-scrim)] backdrop-blur-[6px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative h-full w-full max-w-2xl overflow-auto border-l border-[color:var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]"
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div>
                <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  {subscriber.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                  ID: {subscriber.id}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4 p-3.5">
              <section>
                <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--neutral-500)]">
                  HOME HEALTH SCORE
                </h3>
                <div
                  className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-4 text-center shadow-[var(--shadow-xs)]"
                  style={{
                  }}
                >
                  <div className="mb-1.5 text-4xl font-bold" style={{ color: getHealthColor(subscriber.healthScore) }}>
                    {subscriber.healthScore}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                    Overall Health
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--neutral-500)]">
                  WI-FI KPIs
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <KpiCard label="Avg RSSI" value={subscriber.wifiKpis.avgRssi} />
                  <KpiCard label="Avg PHY" value={subscriber.wifiKpis.avgPhy} />
                  <KpiCard label="Packet Loss" value={subscriber.wifiKpis.packetLoss} />
                  <KpiCard label="Latency" value={subscriber.wifiKpis.latency} />
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--neutral-500)]">
                  DEVICES ({subscriber.devices.length})
                </h3>
                <div className="space-y-2">
                  {subscriber.devices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <InteractiveSurface
                        key={device.id}
                        className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-3.5 shadow-[var(--shadow-xs)]"
                        shouldReduceMotion={shouldReduceMotion}
                      >
                        <div className="mb-2.5 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-color)]">
                              <DeviceIcon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                            </div>
                            <div>
                              <div className="mb-0.5 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                {device.name}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                                {device.id}
                              </div>
                            </div>
                          </div>
                          <div className="rounded px-2 py-0.5 text-xs font-medium" style={{
                            background: device.status === 'online' ? 'var(--success-bg)' : 'var(--neutral-200)',
                            color: device.status === 'online' ? 'var(--success)' : 'var(--neutral-600)',
                          }}>
                            {device.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="mb-0.5 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
                              RSSI
                            </div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                              {device.rssi} dBm
                            </div>
                          </div>
                          <div>
                            <div className="mb-0.5 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
                              PHY
                            </div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                              {device.phy}
                            </div>
                          </div>
                          <div>
                            <div className="mb-0.5 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
                              Traffic
                            </div>
                            <div className="font-medium" style={{ color: 'var(--foreground)' }}>
                              {device.traffic}
                            </div>
                          </div>
                        </div>
                      </InteractiveSurface>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--neutral-500)]">
                  RECENT ANOMALIES
                </h3>
                <div className="space-y-2">
                  {subscriber.recentAnomalies.map((anomaly, idx) => (
                    <InteractiveSurface
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-2.5 shadow-[var(--shadow-xs)]"
                      shouldReduceMotion={shouldReduceMotion}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: getSeverityColor(anomaly.severity) }}
                      />
                      <div className="flex-1">
                        <div className="mb-0.5 text-xs" style={{ color: 'var(--foreground)' }}>
                          {anomaly.description}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                          {anomaly.time}
                        </div>
                      </div>
                    </InteractiveSurface>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--neutral-500)]">
                  QUICK ACTIONS
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    className="justify-start rounded-[var(--radius-control)]"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Restart Gateway
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start rounded-[var(--radius-control)]"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Optimize Wi-Fi
                  </Button>
                  <Button
                    variant="outline"
                    className="col-span-2 justify-start rounded-[var(--radius-control)]"
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
    <InteractiveSurface className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-xs)]">
      <div className="mb-2 text-xs text-[color:var(--neutral-500)]">
        {label}
      </div>
      <div className="text-lg font-semibold text-[color:var(--foreground)]">
        {value}
      </div>
    </InteractiveSurface>
  );
}

interface InteractiveSurfaceProps {
  children: React.ReactNode;
  className: string;
  shouldReduceMotion?: boolean;
}

function InteractiveSurface({
  children,
  className,
  shouldReduceMotion = false,
}: InteractiveSurfaceProps) {
  const [hoverGlow, setHoverGlow] = React.useState({ x: 0, y: 0, active: false });

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -2,
              borderColor: 'var(--border-strong)',
              boxShadow: 'var(--shadow-sm)',
            }
      }
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}
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
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: !shouldReduceMotion && hoverGlow.active ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        style={{
          background: `radial-gradient(220px circle at ${hoverGlow.x}px ${hoverGlow.y}px, var(--card-glow), transparent 62%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
