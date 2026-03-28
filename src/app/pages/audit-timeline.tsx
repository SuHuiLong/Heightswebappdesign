import { useState } from 'react';
import { Download, Filter, CheckCircle2, XCircle, Clock, User, Target } from 'lucide-react';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';

interface AuditEvent {
  id: string;
  correlationId: string;
  actor: string;
  actorType: 'user' | 'system' | 'ai';
  action: string;
  target: string;
  time: string;
  status: 'success' | 'failed' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

const mockEvents: AuditEvent[] = [
  {
    id: '1',
    correlationId: 'act-2024-03-27-1025-7834',
    actor: 'AI Assistant',
    actorType: 'ai',
    action: 'Gateway Restart',
    target: 'GW-4521-A',
    time: '10:25 AM',
    status: 'success',
    severity: 'medium',
    details: 'Restarted gateway to resolve connectivity issues for SUB-7834',
  },
  {
    id: '2',
    correlationId: 'act-2024-03-27-1018-9012',
    actor: 'sarah.johnson@acme.com',
    actorType: 'user',
    action: 'Channel Optimization',
    target: 'Region: Downtown',
    time: '10:18 AM',
    status: 'success',
    severity: 'low',
    details: 'Optimized WiFi channels for 15 gateways in downtown region',
  },
  {
    id: '3',
    correlationId: 'act-2024-03-27-1012-4523',
    actor: 'System Monitor',
    actorType: 'system',
    action: 'Alert Generated',
    target: 'GW-4521-A',
    time: '10:12 AM',
    status: 'success',
    severity: 'high',
    details: 'Gateway offline alert triggered after 3 consecutive health check failures',
  },
  {
    id: '4',
    correlationId: 'act-2024-03-27-1005-1234',
    actor: 'AI Assistant',
    actorType: 'ai',
    action: 'Firmware Update',
    target: 'GW-7834-B',
    time: '10:05 AM',
    status: 'failed',
    severity: 'critical',
    details: 'Firmware update failed due to insufficient storage space',
  },
  {
    id: '5',
    correlationId: 'act-2024-03-27-0958-5678',
    actor: 'mike.chen@acme.com',
    actorType: 'user',
    action: 'Subscriber Query',
    target: 'SUB-7834',
    time: '9:58 AM',
    status: 'success',
    severity: 'low',
    details: 'Retrieved subscriber health metrics and device list',
  },
  {
    id: '6',
    correlationId: 'act-2024-03-27-0945-9876',
    actor: 'System Monitor',
    actorType: 'system',
    action: 'Health Check',
    target: 'Fleet-wide',
    time: '9:45 AM',
    status: 'success',
    severity: 'low',
    details: 'Completed scheduled health check for 12,489 devices',
  },
  {
    id: '7',
    correlationId: 'act-2024-03-27-0930-3456',
    actor: 'AI Assistant',
    actorType: 'ai',
    action: 'Bulk Channel Update',
    target: 'Region: Suburbs',
    time: '9:30 AM',
    status: 'pending',
    severity: 'medium',
    details: 'Channel optimization in progress for 23 gateways',
  },
  {
    id: '8',
    correlationId: 'act-2024-03-27-0915-7890',
    actor: 'lisa.wong@acme.com',
    actorType: 'user',
    action: 'Gateway Reboot',
    target: 'GW-2345-C',
    time: '9:15 AM',
    status: 'success',
    severity: 'medium',
    details: 'Manual reboot initiated to clear memory leak',
  },
];

export function AuditTimeline() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredEvents = mockEvents.filter((event) => {
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && event.status !== selectedStatus) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return CheckCircle2;
      case 'failed':
        return XCircle;
      case 'pending':
        return Clock;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'var(--success)';
      case 'failed':
        return 'var(--critical)';
      case 'pending':
        return 'var(--warning)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--critical)';
      case 'high':
        return 'var(--severity-high)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--neutral-500)';
    }
  };

  const getActorIcon = (actorType: string) => {
    return User;
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div
          className="border-b p-6"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-base)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                Audit Timeline
              </h1>
              <p style={{ color: 'var(--neutral-500)' }}>
                Immutable event log of all system actions and operations
              </p>
            </div>
            <Button
              variant="outline"
              style={{ borderRadius: 'var(--radius-control)' }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" style={{ borderRadius: 'var(--radius-control)' }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Severity: {selectedSeverity === 'all' ? 'All' : selectedSeverity}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedSeverity('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedSeverity('critical')}>
                  Critical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSeverity('high')}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSeverity('medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedSeverity('low')}>
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" style={{ borderRadius: 'var(--radius-control)' }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {selectedStatus === 'all' ? 'All' : selectedStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedStatus('success')}>
                  Success
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('failed')}>
                  Failed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus('pending')}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Column Headers */}
            <div
              className="grid grid-cols-12 gap-4 px-4 py-3 mb-2 text-xs font-semibold"
              style={{ color: 'var(--neutral-500)' }}
            >
              <div className="col-span-2">ACTOR</div>
              <div className="col-span-2">ACTION</div>
              <div className="col-span-2">TARGET</div>
              <div className="col-span-2">TIME</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-2">CORRELATION ID</div>
            </div>

            {/* Event Cards */}
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const StatusIcon = getStatusIcon(event.status);
                const ActorIcon = getActorIcon(event.actorType);

                return (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-card)',
                      borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
                    }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center mb-3">
                      {/* Actor */}
                      <div className="col-span-2 flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              event.actorType === 'ai'
                                ? 'var(--primary)'
                                : event.actorType === 'system'
                                ? 'var(--neutral-300)'
                                : 'var(--accent-color)',
                          }}
                        >
                          <ActorIcon
                            className="h-4 w-4"
                            style={{
                              color:
                                event.actorType === 'ai' || event.actorType === 'user'
                                  ? '#ffffff'
                                  : 'var(--neutral-700)',
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                            {event.actor}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--neutral-500)' }}>
                            {event.actorType}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="col-span-2">
                        <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {event.action}
                        </div>
                      </div>

                      {/* Target */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" style={{ color: 'var(--neutral-400)' }} />
                          <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                            {event.target}
                          </span>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="col-span-2">
                        <div className="text-sm" style={{ color: 'var(--neutral-600)' }}>
                          {event.time}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" style={{ color: getStatusColor(event.status) }} />
                          <span
                            className="text-sm font-medium"
                            style={{ color: getStatusColor(event.status) }}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>

                      {/* Correlation ID */}
                      <div className="col-span-2">
                        <code
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: 'var(--neutral-100)',
                            color: 'var(--neutral-700)',
                          }}
                        >
                          {event.correlationId}
                        </code>
                      </div>
                    </div>

                    {/* Details */}
                    <div
                      className="text-sm pl-10"
                      style={{ color: 'var(--neutral-600)' }}
                    >
                      {event.details}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p style={{ color: 'var(--neutral-500)' }}>
                  No events found matching the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
