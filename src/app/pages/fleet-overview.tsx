import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Globe,
  Wifi,
  WifiOff,
  Gauge,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Cpu,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { AppLayout } from '../components/app-layout';
import {
  FLEET_KPIS,
  FLEET_HEALTH_SCORE,
  REGION_HEALTH,
  FLEET_ALERTS,
  FIRMWARE_DISTRIBUTION,
  PERFORMANCE_TRENDS,
} from '../lib/mock-fleet-data';
import type { FleetAlert, RegionHealth } from '../lib/mock-fleet-data';

// ─── Sub-Components ────────────────────────────────────────────────────────

function KPICard({ kpi }: { kpi: typeof FLEET_KPIS[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl border p-4"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="text-xs font-medium mb-1" style={{ color: 'var(--neutral-500)' }}>
        {kpi.label}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold" style={{ color: kpi.color ?? 'var(--foreground)' }}>
          {kpi.value}
        </span>
        <span className="mb-1 text-xs flex items-center gap-1" style={{
          color: kpi.trend === 'up' ? 'var(--success)' : kpi.trend === 'down' ? 'var(--critical)' : 'var(--neutral-400)',
        }}>
          {kpi.trend === 'up' && <TrendingUp className="h-3 w-3" />}
          {kpi.trend === 'down' && <TrendingDown className="h-3 w-3" />}
          {kpi.trend === 'neutral' && <Minus className="h-3 w-3" />}
          {kpi.change}
        </span>
      </div>
    </motion.div>
  );
}

function HealthScoreGauge() {
  const { value, change, trend } = FLEET_HEALTH_SCORE;
  const color = value >= 90 ? 'var(--success)' : value >= 70 ? 'var(--warning)' : 'var(--critical)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="rounded-xl border p-5"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Fleet Health Score
        </h3>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: trend === 'up' ? 'var(--success)' : 'var(--critical)' }}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          +{change}% vs yesterday
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--surface-raised)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </div>
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>
          {value}%
        </span>
      </div>
    </motion.div>
  );
}

function SeverityBadge({ severity }: { severity: FleetAlert['severity'] }) {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'var(--critical)20', text: 'var(--critical)' },
    high: { bg: 'var(--warning)20', text: 'var(--warning)' },
    medium: { bg: 'var(--primary)20', text: 'var(--primary)' },
    low: { bg: 'var(--neutral-500)20', text: 'var(--neutral-400)' },
  };
  const c = colors[severity];
  return (
    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {severity}
    </span>
  );
}

function AlertRow({ alert }: { alert: FleetAlert }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left hover:opacity-90 transition-opacity"
      >
        <div className="h-2 w-2 rounded-full shrink-0" style={{
          background: alert.severity === 'critical' ? 'var(--critical)' : alert.severity === 'high' ? 'var(--warning)' : 'var(--neutral-400)',
        }} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{alert.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge severity={alert.severity} />
          <span className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>{alert.timestamp}</span>
          <ChevronRight
            className="h-3 w-3 transition-transform"
            style={{ color: 'var(--neutral-400)', transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }}
          />
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--neutral-400)' }}>
            {alert.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-[10px]" style={{ color: 'var(--neutral-500)' }}>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {alert.region}</span>
            <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> {alert.affectedGateways} gateways</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RegionCard({ region }: { region: RegionHealth }) {
  const healthColor = region.healthScore >= 95 ? 'var(--success)' : region.healthScore >= 90 ? 'var(--warning)' : 'var(--critical)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 cursor-pointer hover:border-[var(--primary)] transition-colors"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{region.name}</h4>
        <span className="text-lg font-bold" style={{ color: healthColor }}>
          {region.healthScore}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--surface-raised)' }}>
        <div className="h-full rounded-full" style={{ width: `${region.healthScore}%`, background: healthColor }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--success)' }}>{region.onlineGateways.toLocaleString()}</div>
          <div className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>Online</div>
        </div>
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--warning)' }}>{region.degradedGateways}</div>
          <div className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>Degraded</div>
        </div>
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--critical)' }}>{region.offlineGateways}</div>
          <div className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>Offline</div>
        </div>
      </div>
      {region.alertCount > 0 && (
        <div className="mt-2 pt-2 border-t flex items-center gap-1" style={{ borderColor: 'var(--border-subtle)' }}>
          <AlertTriangle className="h-3 w-3" style={{ color: 'var(--warning)' }} />
          <span className="text-[10px]" style={{ color: 'var(--neutral-400)' }}>{region.alertCount} active alerts</span>
        </div>
      )}
    </motion.div>
  );
}

function FirmwareBar({ fw }: { fw: typeof FIRMWARE_DISTRIBUTION[number] }) {
  const barColor = fw.isLatest ? 'var(--success)' : fw.percentage > 10 ? 'var(--primary)' : 'var(--warning)';

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs font-mono" style={{ color: fw.isLatest ? 'var(--success)' : 'var(--foreground)' }}>
        {fw.version}
        {fw.isLatest && <span className="ml-1 text-[9px] px-1 py-0.5 rounded" style={{ background: 'var(--success)20', color: 'var(--success)' }}>LATEST</span>}
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-raised)' }}>
        <div className="h-full rounded-full" style={{ width: `${fw.percentage}%`, background: barColor }} />
      </div>
      <span className="text-xs tabular-nums w-10 text-right" style={{ color: 'var(--foreground)' }}>{fw.percentage}%</span>
      <span className="text-[10px] w-16 text-right" style={{ color: 'var(--neutral-500)' }}>{fw.count.toLocaleString()}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export function FleetOverview() {
  const chartData = PERFORMANCE_TRENDS;

  return (
    <AppLayout showTopBar={true}>
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Fleet Overview
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--neutral-400)' }}>
                Real-time fleet health, performance trends, and active alerts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
                <Clock className="h-3 w-3" style={{ color: 'var(--neutral-400)' }} />
                <span style={{ color: 'var(--neutral-400)' }}>Last updated: just now</span>
              </div>
              <Link
                to="/operations"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                <Activity className="h-3 w-3" />
                Open Fleet Intelligence
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            {FLEET_KPIS.map((kpi, i) => (
              <KPICard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          {/* Health Score Bar */}
          <HealthScoreGauge />

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Performance Trends */}
            <div className="col-span-2 rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  <Gauge className="h-4 w-4 inline mr-2" style={{ color: 'var(--primary)' }} />
                  Performance Trends (24h)
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: 'var(--primary)' }} /> Latency (ms)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: 'var(--success)' }} /> Throughput (Mbps)
                  </span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--neutral-500)' }} axisLine={{ stroke: 'var(--border)' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--neutral-500)' }} axisLine={{ stroke: 'var(--border)' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--neutral-500)' }} axisLine={{ stroke: 'var(--border)' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface-overlay)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--foreground)',
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="latency" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="var(--success)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                  <AlertTriangle className="h-4 w-4" style={{ color: 'var(--warning)' }} />
                  Active Alerts
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--critical)20', color: 'var(--critical)' }}>
                  {FLEET_ALERTS.length}
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-auto">
                {FLEET_ALERTS.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          </div>

          {/* Regional Breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <Globe className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              Regional Breakdown
            </h3>
            <div className="grid grid-cols-6 gap-3">
              {REGION_HEALTH.map((region) => (
                <RegionCard key={region.id} region={region} />
              ))}
            </div>
          </div>

          {/* Firmware Distribution */}
          <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Cpu className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                Firmware Distribution
              </h3>
              <span className="text-[10px]" style={{ color: 'var(--neutral-500)' }}>
                {FIRMWARE_DISTRIBUTION.reduce((sum, fw) => sum + fw.count, 0).toLocaleString()} total gateways
              </span>
            </div>
            <div className="space-y-3">
              {FIRMWARE_DISTRIBUTION.map((fw) => (
                <FirmwareBar key={fw.version} fw={fw} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Open Fleet Intelligence', to: '/operations', icon: Activity },
                { label: 'View Active Incidents', to: '/operations', icon: AlertTriangle },
                { label: 'Support Ticket Queue', to: '/support', icon: CheckCircle2 },
                { label: 'Growth Opportunities', to: '/growth', icon: TrendingUp },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-2 p-3 rounded-lg border text-sm hover:border-[var(--primary)] transition-colors"
                  style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)' }}
                >
                  <action.icon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  <span style={{ color: 'var(--foreground)' }}>{action.label}</span>
                  <ArrowRight className="h-3 w-3 ml-auto" style={{ color: 'var(--neutral-400)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
