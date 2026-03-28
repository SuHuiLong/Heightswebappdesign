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
}

export function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
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

  const buttonClassName =
    'flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium transition-all';

  return (
    <div className="flex items-center gap-1.5">
      <div className="ml-1 flex items-center gap-0.5">
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
            All
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
                  {value.region ? <MapPin className="h-3.5 w-3.5 shrink-0" /> : null}
                  {value.region ? REGIONS.find(r => r.id === value.region)?.name : 'Select Region'}
                  <ChevronDown className="h-3 w-3" />
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
                    {region.name}
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
                {value.organization ? <Building2 className="h-3.5 w-3.5 shrink-0" /> : null}
                {value.organization
                  ? availableOrganizations.find(o => o.id === value.organization)?.name
                  : 'Select Org'}
                <ChevronDown className="h-3 w-3" />
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
                  {org.name}
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
                  {value.subscriber ? <Users className="h-3.5 w-3.5 shrink-0" /> : null}
                  {value.subscriber
                    ? availableSubscribers.find(s => s.id === value.subscriber)?.name
                    : 'Select Sub'}
                  <ChevronDown className="h-3 w-3" />
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
                    {sub.name} <span className="ml-1 text-xs text-[color:var(--neutral-400)]">({sub.id})</span>
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
                  {value.device ? <Wifi className="h-3.5 w-3.5 shrink-0" /> : null}
                  {value.device
                    ? availableDevices.find((device) => device.id === value.device)?.name
                    : 'Select Device'}
                  <ChevronDown className="h-3 w-3" />
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
                    {device.name}
                    <span className="ml-1 text-xs text-[color:var(--neutral-400)]">Gateway</span>
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
