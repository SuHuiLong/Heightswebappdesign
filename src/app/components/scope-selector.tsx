import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Globe, MapPin, Building2, Users, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import {
  REGIONS,
  ORGANIZATIONS,
  SUBSCRIBERS,
  DEVICES,
} from '../lib/scope-data';
import type { ScopeLevel, ScopeSelection } from '../lib/scope-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useIsMobile } from './ui/use-mobile';

export type { ScopeLevel, ScopeSelection } from '../lib/scope-data';

interface ScopeSelectorProps {
  value: ScopeSelection;
  onChange: (value: ScopeSelection) => void;
  compact?: boolean;
}

export function ScopeSelector({ value, onChange, compact = false }: ScopeSelectorProps) {
  const [showRegions, setShowRegions] = useState(false);
  const [showOrganizations, setShowOrganizations] = useState(false);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const isMobile = useIsMobile();

  const getLevelIcon = (level: ScopeLevel) => {
    switch (level) {
      case 'all':
        return Globe;
      case 'region':
        return MapPin;
      case 'organization':
        return Building2;
      case 'subscriber':
        return Users;
      case 'device':
        return Wifi;
    }
  };

  const getLevelColor = (level: ScopeLevel) => {
    switch (level) {
      case 'all':
        return 'var(--primary)';
      case 'region':
        return 'var(--secondary-foreground)';
      case 'organization':
        return 'var(--success)';
      case 'subscriber':
        return 'var(--warning)';
      case 'device':
        return 'var(--primary)';
    }
  };

  const Icon = getLevelIcon(value.level);
  const color = getLevelColor(value.level);
  const levelOrder: ScopeLevel[] = ['all', 'region', 'organization', 'subscriber', 'device'];
  const currentLevelIndex = levelOrder.indexOf(value.level);

  const availableOrganizations = value.region ? ORGANIZATIONS[value.region] || [] : [];
  const availableSubscribers = value.organization ? SUBSCRIBERS[value.organization] || [] : [];
  const availableDevices = value.subscriber ? DEVICES[value.subscriber] || [] : [];

  const visibleLevels = useMemo(() => {
    if (!isMobile) {
      return new Set<ScopeLevel>(levelOrder);
    }

    const levels = new Set<ScopeLevel>([value.level]);
    const previousLevel = levelOrder[currentLevelIndex - 1];
    const nextLevel = levelOrder[currentLevelIndex + 1];

    if (previousLevel) {
      levels.add(previousLevel);
    }

    if (nextLevel) {
      levels.add(nextLevel);
    }

    return levels;
  }, [currentLevelIndex, isMobile, value.level]);

  const showAll = visibleLevels.has('all');
  const showRegion = visibleLevels.has('region');
  const showOrganization = visibleLevels.has('organization') && !!value.region;
  const showSubscriber = visibleLevels.has('subscriber') && !!value.organization;
  const showDevice = visibleLevels.has('device') && !!value.subscriber;

  const buttonClassName = compact
    ? 'flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-all'
    : 'flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium transition-all';

  const formatStatus = (status?: string) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatServiceModel = (serviceModel?: string) => {
    if (!serviceModel) return '';
    return serviceModel.charAt(0).toUpperCase() + serviceModel.slice(1);
  };

  const formatLastSeen = (value?: string) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  };

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      <div className={`${compact ? 'min-w-0 flex flex-1 items-center gap-1' : 'ml-1 flex items-center gap-0.5'}`}>
        {showAll && (
          <motion.button
            onClick={() => onChange({ level: 'all' })}
            className={buttonClassName}
            style={{
              background: value.level === 'all' ? 'var(--primary)' : 'transparent',
              color: value.level === 'all' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {compact && value.level === 'all' ? (
              <>
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: 'currentColor' }} />
                <span>All</span>
              </>
            ) : (
              'All'
            )}
          </motion.button>
        )}

        {showRegion && (
          <>
            {showAll && <ChevronRight className="h-3 w-3 text-[color:var(--neutral-400)]" />}
            <DropdownMenu open={showRegions} onOpenChange={setShowRegions}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className={buttonClassName}
                  style={{
                    background: value.level === 'region' && !value.organization ? 'var(--accent-color)' : 'transparent',
                    color: value.region ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {compact && value.level !== 'region' ? (
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <>
                      {value.region ? <MapPin className="h-3.5 w-3.5 shrink-0" /> : null}
                      <span className={compact ? 'max-w-[120px] truncate' : ''}>
                        {value.region ? REGIONS.find(r => r.id === value.region)?.name : 'Select Region'}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {REGIONS.map((region) => (
                  <DropdownMenuItem
                    key={region.id}
                    onClick={() => {
                      onChange({
                        level: 'region',
                        region: region.id,
                      });
                      setShowRegions(false);
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" style={{ color: 'var(--secondary-foreground)' }} />
                    <div className="flex min-w-0 flex-col">
                      <span>{region.name}</span>
                      <span className="text-[10px] text-[color:var(--neutral-500)]">
                        {formatStatus(region.status)} • {region.organizationCount} orgs • {region.subscriberCount} subscribers
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {showOrganization && (
          <ChevronRight className="h-3 w-3 text-[color:var(--neutral-400)]" />
        )}
        {showOrganization && (
          <DropdownMenu open={showOrganizations} onOpenChange={setShowOrganizations}>
            <DropdownMenuTrigger asChild>
              <motion.button
                className={buttonClassName}
                style={{
                  background: value.level === 'organization' && !value.subscriber ? 'var(--success)' : 'transparent',
                  color: value.organization ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {compact && value.level !== 'organization' ? (
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <>
                    {value.organization ? <Building2 className="h-3.5 w-3.5 shrink-0" /> : null}
                    <span className={compact ? 'max-w-[120px] truncate' : ''}>
                      {value.organization
                        ? availableOrganizations.find(o => o.id === value.organization)?.name
                        : 'Select Org'}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {availableOrganizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => {
                    onChange({
                      level: 'organization',
                      region: value.region,
                      organization: org.id,
                    });
                    setShowOrganizations(false);
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" style={{ color: 'var(--success)' }} />
                  <div className="flex min-w-0 flex-col">
                    <span>{org.name}</span>
                    <span className="text-[10px] text-[color:var(--neutral-500)]">
                      {formatStatus(org.status)} • {formatServiceModel(org.serviceModel)} • {org.subscriberCount} subscribers
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showSubscriber && (
          <ChevronRight className="h-3 w-3 text-[color:var(--neutral-400)]" />
        )}
        {showSubscriber && (
          <>
            <DropdownMenu open={showSubscribers} onOpenChange={setShowSubscribers}>
              <DropdownMenuTrigger asChild>
                <motion.button
                className={buttonClassName}
                style={{
                  background: value.level === 'subscriber' && !value.device ? 'var(--warning)' : 'transparent',
                  color: value.subscriber ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                  {compact && value.level !== 'subscriber' ? (
                    <Users className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <>
                      {value.subscriber ? <Users className="h-3.5 w-3.5 shrink-0" /> : null}
                      <span className={compact ? 'max-w-[120px] truncate' : ''}>
                        {value.subscriber
                          ? availableSubscribers.find(s => s.id === value.subscriber)?.name
                          : 'Select Sub'}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableSubscribers.map((sub) => (
                  <DropdownMenuItem
                    key={sub.id}
                    onClick={() => {
                      onChange({
                        level: 'subscriber',
                        region: value.region,
                        organization: value.organization,
                        subscriber: sub.id,
                        device: undefined,
                      });
                      setShowSubscribers(false);
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" style={{ color: 'var(--warning)' }} />
                    <div className="flex min-w-0 flex-col">
                      <span>
                        {sub.name} <span className="ml-1 text-xs text-[color:var(--neutral-400)]">({sub.id})</span>
                      </span>
                      <span className="text-[10px] text-[color:var(--neutral-500)]">
                        {formatStatus(sub.status)} • {sub.plan} • {sub.city}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {showDevice && (
          <ChevronRight className="h-3 w-3 text-[color:var(--neutral-400)]" />
        )}
        {showDevice && (
          <>
            <DropdownMenu open={showDevices} onOpenChange={setShowDevices}>
              <DropdownMenuTrigger asChild>
                <motion.button
                className={buttonClassName}
                style={{
                  background: value.level === 'device' ? 'var(--primary)' : 'transparent',
                  color: value.device ? 'var(--foreground)' : 'var(--muted-foreground)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                  {compact && value.level !== 'device' ? (
                    <Wifi className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <>
                      {value.device ? <Wifi className="h-3.5 w-3.5 shrink-0" /> : null}
                      <span className={compact ? 'max-w-[120px] truncate' : ''}>
                        {value.device
                          ? availableDevices.find((device) => device.id === value.device)?.name
                          : 'Select Device'}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.id}
                    onClick={() => {
                      onChange({
                        level: 'device',
                        region: value.region,
                        organization: value.organization,
                        subscriber: value.subscriber,
                        device: device.id,
                      });
                      setShowDevices(false);
                    }}
                  >
                    <Wifi className="h-4 w-4 mr-2" style={{ color: 'var(--primary)' }} />
                    <div className="flex min-w-0 flex-col">
                      <span>
                        {device.name}
                        <span className="ml-1 text-xs text-[color:var(--neutral-400)]">Gateway</span>
                      </span>
                      <span className="text-[10px] text-[color:var(--neutral-500)]">
                        {formatStatus(device.status)} • Health {device.healthScore} • Seen {formatLastSeen(device.lastSeen)}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}
