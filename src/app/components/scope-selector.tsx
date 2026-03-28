import { useState } from 'react';
import { ChevronDown, ChevronRight, Globe, MapPin, Building2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type ScopeLevel = 'all' | 'region' | 'organization' | 'subscriber';

export interface ScopeSelection {
  level: ScopeLevel;
  region?: string;
  organization?: string;
  subscriber?: string;
}

interface ScopeSelectorProps {
  value: ScopeSelection;
  onChange: (value: ScopeSelection) => void;
}

// Mock data
const REGIONS = [
  { id: 'north', name: 'North Region' },
  { id: 'south', name: 'South Region' },
  { id: 'east', name: 'East Region' },
  { id: 'west', name: 'West Region' },
  { id: 'central', name: 'Central Region' },
];

const ORGANIZATIONS: Record<string, Array<{ id: string; name: string }>> = {
  north: [
    { id: 'acme-isp', name: 'Acme ISP' },
    { id: 'technet', name: 'TechNet Co.' },
  ],
  south: [
    { id: 'fastfiber', name: 'FastFiber Inc.' },
    { id: 'netpro', name: 'NetPro Services' },
  ],
  east: [
    { id: 'eastlink', name: 'EastLink Networks' },
    { id: 'cityconnect', name: 'CityConnect' },
  ],
  west: [
    { id: 'westcom', name: 'WestCom ISP' },
    { id: 'skywave', name: 'SkyWave Internet' },
  ],
  central: [
    { id: 'centralnet', name: 'CentralNet' },
    { id: 'corefiber', name: 'CoreFiber LLC' },
  ],
};

const SUBSCRIBERS: Record<string, Array<{ id: string; name: string }>> = {
  'acme-isp': [
    { id: 'SUB-7834', name: 'John Smith' },
    { id: 'SUB-7835', name: 'Sarah Johnson' },
    { id: 'SUB-7836', name: 'Michael Chen' },
  ],
  'technet': [
    { id: 'SUB-8901', name: 'Emily Davis' },
    { id: 'SUB-8902', name: 'David Wilson' },
  ],
  'fastfiber': [
    { id: 'SUB-4521', name: 'Robert Brown' },
    { id: 'SUB-4522', name: 'Jennifer Taylor' },
  ],
  'netpro': [
    { id: 'SUB-3344', name: 'William Anderson' },
    { id: 'SUB-3345', name: 'Lisa Martinez' },
  ],
  'eastlink': [
    { id: 'SUB-5567', name: 'James Garcia' },
    { id: 'SUB-5568', name: 'Mary Rodriguez' },
  ],
  'cityconnect': [
    { id: 'SUB-6678', name: 'Thomas Lee' },
    { id: 'SUB-6679', name: 'Patricia White' },
  ],
  'westcom': [
    { id: 'SUB-7789', name: 'Christopher Harris' },
    { id: 'SUB-7790', name: 'Barbara Clark' },
  ],
  'skywave': [
    { id: 'SUB-8890', name: 'Daniel Lewis' },
    { id: 'SUB-8891', name: 'Elizabeth Walker' },
  ],
  'centralnet': [
    { id: 'SUB-9901', name: 'Matthew Hall' },
    { id: 'SUB-9902', name: 'Susan Allen' },
  ],
  'corefiber': [
    { id: 'SUB-1012', name: 'Joseph Young' },
    { id: 'SUB-1013', name: 'Jessica King' },
  ],
};

export function ScopeSelector({ value, onChange }: ScopeSelectorProps) {
  const [showRegions, setShowRegions] = useState(false);
  const [showOrganizations, setShowOrganizations] = useState(false);
  const [showSubscribers, setShowSubscribers] = useState(false);

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
    }
  };

  const getLevelColor = (level: ScopeLevel) => {
    switch (level) {
      case 'all':
        return 'var(--primary)';
      case 'region':
        return 'var(--accent)';
      case 'organization':
        return 'var(--success)';
      case 'subscriber':
        return 'var(--warning)';
    }
  };

  const getDisplayText = () => {
    if (value.level === 'all') return 'All Tenants';
    
    const parts = [];
    if (value.region) {
      const region = REGIONS.find(r => r.id === value.region);
      if (region) parts.push(region.name);
    }
    if (value.organization) {
      const orgs = value.region ? ORGANIZATIONS[value.region] : [];
      const org = orgs.find(o => o.id === value.organization);
      if (org) parts.push(org.name);
    }
    if (value.subscriber) {
      const subs = value.organization ? SUBSCRIBERS[value.organization] : [];
      const sub = subs.find(s => s.id === value.subscriber);
      if (sub) parts.push(`${sub.name} (${sub.id})`);
    }
    
    return parts.join(' • ');
  };

  const Icon = getLevelIcon(value.level);
  const color = getLevelColor(value.level);

  const availableOrganizations = value.region ? ORGANIZATIONS[value.region] || [] : [];
  const availableSubscribers = value.organization ? SUBSCRIBERS[value.organization] || [] : [];

  return (
    <div className="flex items-center gap-2">
      {/* Current Scope Display */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {getDisplayText()}
        </span>
      </motion.div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1">
        {/* All Button */}
        <motion.button
          onClick={() => onChange({ level: 'all' })}
          className="px-2 py-1 rounded text-xs font-medium transition-all"
          style={{
            background: value.level === 'all' ? 'var(--primary)' : 'transparent',
            color: value.level === 'all' ? 'var(--primary-foreground)' : 'var(--neutral-500)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>

        {/* Region Selector */}
        {value.level !== 'all' && (
          <>
            <ChevronRight className="h-3 w-3" style={{ color: 'var(--neutral-400)' }} />
            <DropdownMenu open={showRegions} onOpenChange={setShowRegions}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1"
                  style={{
                    background: value.level === 'region' && !value.organization ? 'var(--accent)' : 'transparent',
                    color: value.region ? 'var(--foreground)' : 'var(--neutral-500)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                    <MapPin className="h-4 w-4 mr-2" style={{ color: 'var(--accent)' }} />
                    {region.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Organization Selector */}
        {value.region && (
          <>
            <ChevronRight className="h-3 w-3" style={{ color: 'var(--neutral-400)' }} />
            <DropdownMenu open={showOrganizations} onOpenChange={setShowOrganizations}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1"
                  style={{
                    background: value.level === 'organization' && !value.subscriber ? 'var(--success)' : 'transparent',
                    color: value.organization ? 'var(--foreground)' : 'var(--neutral-500)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
          </>
        )}

        {/* Subscriber Selector */}
        {value.organization && (
          <>
            <ChevronRight className="h-3 w-3" style={{ color: 'var(--neutral-400)' }} />
            <DropdownMenu open={showSubscribers} onOpenChange={setShowSubscribers}>
              <DropdownMenuTrigger asChild>
                <motion.button
                  className="px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1"
                  style={{
                    background: value.level === 'subscriber' ? 'var(--warning)' : 'transparent',
                    color: value.subscriber ? 'var(--foreground)' : 'var(--neutral-500)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                      });
                      setShowSubscribers(false);
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" style={{ color: 'var(--warning)' }} />
                    {sub.name} <span className="text-xs ml-1" style={{ color: 'var(--neutral-400)' }}>({sub.id})</span>
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
