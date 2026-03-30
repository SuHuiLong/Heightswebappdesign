import { ReactNode, useState, useEffect, useMemo } from 'react';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Download,
  Users,
  Shield,
  Monitor,
  Zap,
  Target,
  ChevronRight,
  BarChart3,
  Cpu,
  Clock,
  CheckCircle2,
  Smartphone,
  Gamepad2,
  Baby,
  Speaker,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, useReducedMotion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  SummaryBlock,
  StatsBlock,
  BarChartBlock,
  TimeSeriesBlock,
  TableBlock,
  RiskMatrixBlock,
  ForecastBlock,
  DeviceInsightBlock,
  SubscriberListBlock,
  ActionsBlock,
  BandwidthTimelineBlock,
  ScenarioBlock,
} from '../lib/scenario-definitions';

// ─── Card Wrapper (matches existing style) ────────────────────────────────

function CardWrapper({ children, timestamp, source }: { children: ReactNode; timestamp: string; source: string }) {
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
              : { y: -2, borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-sm)' }
          }
          transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
          onPointerMove={(event) => {
            if (shouldReduceMotion) return;
            const rect = event.currentTarget.getBoundingClientRect();
            setHoverGlow({ x: event.clientX - rect.left, y: event.clientY - rect.top, active: true });
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

// ─── Summary Card ──────────────────────────────────────────────────────────

function SummaryCard({ block, timestamp, source }: { block: SummaryBlock; timestamp: string; source: string }) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
        </div>
        <p className="text-[13px] leading-[1.4] text-[color:var(--neutral-600)]">{block.body}</p>
      </div>
    </CardWrapper>
  );
}

// ─── Stats Card ────────────────────────────────────────────────────────────

function StatsCard({ block, timestamp, source }: { block: StatsBlock; timestamp: string; source: string }) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {block.items.map((item, idx) => {
            const TrendIcon =
              item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
            const trendColor =
              item.trend === 'up'
                ? 'var(--critical)'
                : item.trend === 'down'
                  ? 'var(--success)'
                  : 'var(--neutral-500)';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-base)] p-2.5"
              >
                <div className="chat-card-caption mb-1 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
                  {item.label}
                </div>
                <div className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  {item.value}
                </div>
                {item.change && (
                  <div className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: trendColor }}>
                    <TrendIcon className="h-3 w-3" />
                    {item.change}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── Bar Chart Card ────────────────────────────────────────────────────────

function BarChartCard({ block, timestamp, source }: { block: BarChartBlock; timestamp: string; source: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-2.5"
          whileHover={
            shouldReduceMotion ? undefined : { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-xs)' }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            animate={{ opacity: isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-blue) 80%, transparent) 100%)',
            }}
          />
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={block.data} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: isHovered ? 'var(--foreground)' : 'var(--neutral-500)' }}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill={isHovered ? '#4cb3ff' : 'var(--primary)'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── Time Series Card ──────────────────────────────────────────────────────

function TimeSeriesCard({
  block,
  timestamp,
  source,
}: {
  block: TimeSeriesBlock;
  timestamp: string;
  source: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
          {block.showAnomalies && (
            <span className="ml-auto rounded bg-[var(--neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--neutral-600)]">
              Anomalies marked
            </span>
          )}
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-2.5"
          whileHover={
            shouldReduceMotion ? undefined : { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-xs)' }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            animate={{ opacity: isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-blue) 80%, transparent) 100%)',
            }}
          />
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={block.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 12,
                  }}
                />
                {block.showAnomalies &&
                  block.data
                    .filter((d) => d.anomaly)
                    .map((d, i) => (
                      <ReferenceLine
                        key={i}
                        x={d.time}
                        stroke="var(--critical)"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                      />
                    ))}
                <Line
                  type="monotone"
                  dataKey="a"
                  stroke={isHovered ? '#4cb3ff' : 'var(--primary)'}
                  strokeWidth={isHovered ? 2.5 : 2}
                  dot={false}
                  name={block.legendA}
                />
                <Line
                  type="monotone"
                  dataKey="b"
                  stroke={isHovered ? '#7dd3fc' : 'var(--accent-color)'}
                  strokeWidth={isHovered ? 2.5 : 2}
                  dot={false}
                  name={block.legendB}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── Table Card ────────────────────────────────────────────────────────────

function TableCard({ block, timestamp, source }: { block: TableBlock; timestamp: string; source: string }) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <Monitor className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {block.columns.map((col, idx) => (
                  <th key={idx} className="px-2 py-1.5 text-left text-[12px]" style={{ color: 'var(--neutral-500)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIdx) => (
                <motion.tr
                  key={rowIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.025 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-2 py-1.5" style={{ color: 'var(--foreground)' }}>
                      {cellIdx === row.length - 1 && (cell === 'Regression' || cell === 'At Risk') ? (
                        <span
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                          style={{
                            background: 'var(--severity-critical-bg)',
                            color: 'var(--critical)',
                          }}
                        >
                          {cell}
                        </span>
                      ) : cellIdx === row.length - 1 && (cell === 'Stable' || cell === 'Compliant') ? (
                        <span
                          className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                          style={{
                            background: 'var(--success-bg)',
                            color: 'var(--success)',
                          }}
                        >
                          {cell}
                        </span>
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── Risk Matrix Card ──────────────────────────────────────────────────────

function RiskMatrixCard({ block, timestamp, source }: { block: RiskMatrixBlock; timestamp: string; source: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const { highDegradation, lowDegradation, highContract, lowContract } = block.quadrants;

  interface MatrixPoint {
    id: string;
    name: string;
    risk: number;
    quadrant: string;
  }

  const allPoints: MatrixPoint[] = [
    ...highDegradation.map((p) => ({ ...p, quadrant: 'hd-hc' })),
    ...lowDegradation.map((p) => ({ ...p, quadrant: 'ld-hc' })),
    ...highContract.map((p) => ({ ...p, quadrant: 'hd-lc' })),
    ...lowContract.map((p) => ({ ...p, quadrant: 'ld-lc' })),
  ];

  const getColor = (quadrant: string) => {
    switch (quadrant) {
      case 'hd-hc':
        return 'var(--critical)';
      case 'hd-lc':
        return 'var(--warning)';
      case 'ld-hc':
        return 'var(--severity-high)';
      case 'ld-lc':
        return 'var(--success)';
      default:
        return 'var(--neutral-500)';
    }
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <Target className="h-5 w-5" style={{ color: 'var(--critical)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4"
          whileHover={
            shouldReduceMotion ? undefined : { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-xs)' }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Axes labels */}
          <div className="mb-2 flex items-center justify-between text-[11px] font-medium" style={{ color: 'var(--neutral-500)' }}>
            <span>Low Degradation</span>
            <span>High Degradation →</span>
          </div>
          <div className="relative min-h-[240px]">
            {/* Quadrant grid */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
              <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--success)]/5 p-2">
                <div className="text-[10px] font-medium" style={{ color: 'var(--success)' }}>Low Risk</div>
                {lowContract.map((p) => (
                  <div key={p.id} className="mt-1 text-[11px]" style={{ color: 'var(--foreground)' }}>
                    {p.name} <span style={{ color: 'var(--neutral-400)' }}>({p.risk}%)</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-dashed border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 p-2">
                <div className="text-[10px] font-medium" style={{ color: 'var(--warning)' }}>Monitor</div>
                {highContract.map((p) => (
                  <div key={p.id} className="mt-1 text-[11px]" style={{ color: 'var(--foreground)' }}>
                    {p.name} <span style={{ color: 'var(--neutral-400)' }}>({p.risk}%)</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-dashed border-[color:var(--severity-high)]/40 bg-[color:var(--severity-high)]/5 p-2">
                <div className="text-[10px] font-medium" style={{ color: 'var(--severity-high)' }}>Watch</div>
                {lowDegradation.map((p) => (
                  <div key={p.id} className="mt-1 text-[11px]" style={{ color: 'var(--foreground)' }}>
                    {p.name} <span style={{ color: 'var(--neutral-400)' }}>({p.risk}%)</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-dashed border-[color:var(--critical)]/40 bg-[color:var(--critical)]/5 p-2">
                <div className="text-[10px] font-medium" style={{ color: 'var(--critical)' }}>Critical</div>
                {highDegradation.map((p) => (
                  <div key={p.id} className="mt-1 text-[11px]" style={{ color: 'var(--foreground)' }}>
                    {p.name} <span style={{ color: 'var(--neutral-400)' }}>({p.risk}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-medium" style={{ color: 'var(--neutral-500)' }}>
            ← Short Contract &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Long Contract →
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── Forecast Card ─────────────────────────────────────────────────────────

function ForecastCard({ block, timestamp, source }: { block: ForecastBlock; timestamp: string; source: string }) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const chartData = useMemo(() => {
    const historical = block.historical.map((d) => ({
      month: d.month,
      actual: d.value,
      predicted: null as number | null,
      upper: null as number | null,
      lower: null as number | null,
    }));
    const lastHist = block.historical[block.historical.length - 1];
    const bridge = block.predicted.map((d, i) => ({
      month: d.month,
      actual: i === 0 ? lastHist.value : null,
      predicted: d.value,
      upper: d.upper,
      lower: d.lower,
    }));
    return [...historical, ...bridge];
  }, [block]);

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
          <span className="ml-auto rounded bg-[var(--neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--neutral-600)]">
            {block.growthAssumption}% growth
          </span>
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-2.5"
          whileHover={
            shouldReduceMotion ? undefined : { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-xs)' }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            animate={{ opacity: isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-cyan) 80%, transparent) 100%)',
            }}
          />
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="var(--primary)"
                  fillOpacity={0.08}
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="var(--surface-base)"
                  fillOpacity={1}
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={isHovered ? '#4cb3ff' : 'var(--primary)'}
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--primary)' }}
                  name="Actual"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--accent-color)"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ r: 3, fill: 'var(--accent-color)' }}
                  name="Forecast"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4" style={{ background: 'var(--primary)' }} /> Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 border-dashed" style={{ borderColor: 'var(--accent-color)', borderWidth: 1 }} /> Forecast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-2 rounded-sm opacity-20" style={{ background: 'var(--primary)' }} /> 90% CI
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── Device Insight Card ───────────────────────────────────────────────────

function DeviceInsightCard({
  block,
  timestamp,
  source,
}: {
  block: DeviceInsightBlock;
  timestamp: string;
  source: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const getDeviceIcon = (category: string) => {
    if (category.toLowerCase().includes('gaming')) return Gamepad2;
    if (category.toLowerCase().includes('kids') || category.toLowerCase().includes("children")) return Baby;
    if (category.toLowerCase().includes('speaker')) return Speaker;
    return Smartphone;
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <Cpu className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-3"
          whileHover={
            shouldReduceMotion ? undefined : { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-xs)' }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {block.insights.map((insight, idx) => {
              const Icon = getDeviceIcon(insight.category);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: `${insight.color}18` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: insight.color }} />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                        {insight.category}
                      </div>
                      <div className="text-[11px] font-semibold" style={{ color: insight.color }}>
                        {insight.count} devices
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insight.examples.map((ex) => (
                      <span
                        key={ex}
                        className="rounded px-1.5 py-0.5 text-[10px]"
                        style={{ background: `${insight.color}12`, color: 'var(--neutral-600)' }}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── Subscriber List Card ──────────────────────────────────────────────────

function SubscriberListCard({
  block,
  timestamp,
  source,
}: {
  block: SubscriberListBlock;
  timestamp: string;
  source: string;
}) {
  const riskConfig = {
    critical: { color: 'var(--critical)', bg: 'var(--severity-critical-bg)', label: 'Critical' },
    high: { color: 'var(--severity-high)', bg: 'var(--severity-high-bg)', label: 'High' },
    medium: { color: 'var(--warning)', bg: 'var(--severity-medium-bg)', label: 'Medium' },
  };

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <Users className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
          <span className="ml-auto rounded bg-[var(--neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--neutral-600)]">
            {block.subscribers.length} subscribers
          </span>
        </div>
        <div className="space-y-2">
          {block.subscribers.map((sub, idx) => {
            const config = riskConfig[sub.risk];
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-base)] p-2.5"
              >
                <div
                  className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: config.bg, color: config.color }}
                >
                  {config.label[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                      {sub.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--neutral-400)' }}>
                      {sub.id}
                    </span>
                    <span
                      className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ background: config.bg, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px]" style={{ color: 'var(--neutral-500)' }}>
                    {sub.reason}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── Bandwidth Timeline Card ───────────────────────────────────────────────

function BandwidthTimelineCard({
  block,
  timestamp,
  source,
}: {
  block: BandwidthTimelineBlock;
  timestamp: string;
  source: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: 'var(--warning)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {block.title}
          </h3>
          <span className="ml-auto rounded px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            {block.saturationHours} hrs saturated
          </span>
        </div>
        <motion.div
          className="relative overflow-hidden rounded-[var(--radius-control)] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-2.5"
          whileHover={
            shouldReduceMotion ? undefined : { borderColor: 'var(--border-strong)', boxShadow: 'var(--shadow-xs)' }
          }
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            animate={{ opacity: isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.12 }}
            style={{
              background: 'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--ambient-warm) 80%, transparent) 100%)',
            }}
          />
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={block.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 12,
                  }}
                />
                <ReferenceLine y={85} stroke="var(--critical)" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'Threshold', fontSize: 10, fill: 'var(--critical)' }} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke={isHovered ? '#f59e0b' : 'var(--warning)'}
                  fill="var(--warning)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  name="Usage %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </CardWrapper>
  );
}

// ─── Actions Card ──────────────────────────────────────────────────────────

function ActionsCard({ block, timestamp, source }: { block: ActionsBlock; timestamp: string; source: string }) {
  return (
    <CardWrapper timestamp={timestamp} source={source}>
      <div className="chat-card-content p-3.5">
        <div className="mb-2.5 flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: 'var(--primary)' }} />
          <h3 className="chat-card-title text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            Recommended Actions
          </h3>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {block.items.map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -1, scale: 1.004 }}
              whileTap={{ scale: 0.992 }}
              className="group rounded-xl border border-[color:var(--border)] bg-[var(--surface-base)] px-3 py-2.5 text-left transition-[border-color,box-shadow,transform] duration-200 hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-xs)]"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[12px] font-medium text-[color:var(--foreground)]">{action.label}</span>
                <ChevronRight className="h-3 w-3 text-[color:var(--neutral-400)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[11px] leading-[1.15rem] text-[color:var(--neutral-500)]">{action.description}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </CardWrapper>
  );
}

// ─── Block Renderer ────────────────────────────────────────────────────────

export function GenerativeBlockRenderer({
  block,
  timestamp,
  source,
}: {
  block: ScenarioBlock;
  timestamp: string;
  source: string;
}) {
  switch (block.type) {
    case 'summary':
      return <SummaryCard block={block} timestamp={timestamp} source={source} />;
    case 'stats':
      return <StatsCard block={block} timestamp={timestamp} source={source} />;
    case 'bar-chart':
      return <BarChartCard block={block} timestamp={timestamp} source={source} />;
    case 'time-series':
      return <TimeSeriesCard block={block} timestamp={timestamp} source={source} />;
    case 'table':
      return <TableCard block={block} timestamp={timestamp} source={source} />;
    case 'risk-matrix':
      return <RiskMatrixCard block={block} timestamp={timestamp} source={source} />;
    case 'forecast':
      return <ForecastCard block={block} timestamp={timestamp} source={source} />;
    case 'device-insight':
      return <DeviceInsightCard block={block} timestamp={timestamp} source={source} />;
    case 'subscriber-list':
      return <SubscriberListCard block={block} timestamp={timestamp} source={source} />;
    case 'bandwidth-timeline':
      return <BandwidthTimelineCard block={block} timestamp={timestamp} source={source} />;
    case 'actions':
      return <ActionsCard block={block} timestamp={timestamp} source={source} />;
    default:
      return null;
  }
}
