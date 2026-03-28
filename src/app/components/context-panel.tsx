import { TrendingUp, Wifi, Radio, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ContextPanel() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
          Context & Metrics
        </h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Live Metrics */}
        <section>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
            LIVE METRICS
          </h4>
          <div className="space-y-3">
            <MetricItem
              icon={<Wifi className="h-4 w-4" />}
              label="Avg WiFi Quality"
              value="87%"
              trend="+2.3%"
              trendType="positive"
            />
            <MetricItem
              icon={<Radio className="h-4 w-4" />}
              label="Avg RSSI"
              value="-52 dBm"
              trend="Stable"
              trendType="neutral"
            />
            <MetricItem
              icon={<TrendingUp className="h-4 w-4" />}
              label="Bandwidth Util"
              value="68%"
              trend="+5.1%"
              trendType="neutral"
            />
          </div>
        </section>

        {/* Action Progress */}
        <section>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
            ACTION PROGRESS
          </h4>
          <div className="space-y-2">
            <ActionProgressItem
              action="Gateway restart"
              status="completed"
              device="GW-4521-A"
              time="2m ago"
            />
            <ActionProgressItem
              action="Channel optimization"
              status="in-progress"
              device="GW-7834-B"
              time="Running..."
            />
          </div>
        </section>

        {/* Recommended Next Actions */}
        <section>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
            RECOMMENDED ACTIONS
          </h4>
          <div className="space-y-2">
            <RecommendedAction
              title="Optimize channel allocation"
              description="3 gateways showing interference"
              severity="medium"
            />
            <RecommendedAction
              title="Review firmware updates"
              description="12 devices pending"
              severity="low"
            />
            <RecommendedAction
              title="Investigate offline device"
              description="GW-9012-C unresponsive"
              severity="high"
            />
          </div>
        </section>

        {/* Recent Context */}
        <section>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--neutral-600)' }}>
            RECENT CONTEXT
          </h4>
          <div
            className="text-sm p-3 rounded-lg"
            style={{
              background: 'var(--neutral-50)',
              borderLeft: '3px solid var(--primary)',
            }}
          >
            <p style={{ color: 'var(--neutral-700)' }}>
              Last query analyzed 23 subscribers in the downtown region. 2 anomalies detected
              requiring attention.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
}

function MetricItem({ icon, label, value, trend, trendType }: MetricItemProps) {
  const trendColor =
    trendType === 'positive'
      ? 'var(--success)'
      : trendType === 'negative'
      ? 'var(--critical)'
      : 'var(--neutral-500)';

  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--neutral-600)' }}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          {value}
        </span>
        <span className="text-xs" style={{ color: trendColor }}>
          {trend}
        </span>
      </div>
    </div>
  );
}

interface ActionProgressItemProps {
  action: string;
  status: 'completed' | 'in-progress' | 'failed';
  device: string;
  time: string;
}

function ActionProgressItem({ action, status, device, time }: ActionProgressItemProps) {
  const statusConfig = {
    completed: { color: 'var(--success)', icon: CheckCircle2 },
    'in-progress': { color: 'var(--warning)', icon: Clock },
    failed: { color: 'var(--critical)', icon: AlertCircle },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-start gap-2">
        <StatusIcon className="h-4 w-4 mt-0.5" style={{ color: config.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {action}
          </div>
          <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
            {device} • {time}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecommendedActionProps {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

function RecommendedAction({ title, description, severity }: RecommendedActionProps) {
  const severityColors = {
    low: 'var(--success)',
    medium: 'var(--warning)',
    high: 'var(--critical)',
  };

  return (
    <Button
      variant="outline"
      className="w-full h-auto p-3 text-left justify-start"
      style={{
        borderColor: 'var(--border)',
        borderRadius: 'var(--radius-control)',
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: severityColors[severity] }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {title}
          </span>
        </div>
        <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
          {description}
        </div>
      </div>
    </Button>
  );
}
