export type ScopeLevel = 'all' | 'region' | 'organization' | 'subscriber' | 'device';

export interface ScopeSelection {
  level: ScopeLevel;
  region?: string;
  organization?: string;
  subscriber?: string;
  device?: string;
}

export const REGIONS = [
  { id: 'north', name: 'North Region' },
  { id: 'south', name: 'South Region' },
  { id: 'east', name: 'East Region' },
  { id: 'west', name: 'West Region' },
  { id: 'central', name: 'Central Region' },
];

export const ORGANIZATIONS: Record<string, Array<{ id: string; name: string }>> = {
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

export const SUBSCRIBERS: Record<string, Array<{ id: string; name: string }>> = {
  'acme-isp': [
    { id: 'SUB-7834', name: 'John Smith' },
    { id: 'SUB-7835', name: 'Sarah Johnson' },
    { id: 'SUB-7836', name: 'Michael Chen' },
  ],
  technet: [
    { id: 'SUB-8901', name: 'Emily Davis' },
    { id: 'SUB-8902', name: 'David Wilson' },
  ],
  fastfiber: [
    { id: 'SUB-4521', name: 'Robert Brown' },
    { id: 'SUB-4522', name: 'Jennifer Taylor' },
  ],
  netpro: [
    { id: 'SUB-3344', name: 'William Anderson' },
    { id: 'SUB-3345', name: 'Lisa Martinez' },
  ],
  eastlink: [
    { id: 'SUB-5567', name: 'James Garcia' },
    { id: 'SUB-5568', name: 'Mary Rodriguez' },
  ],
  cityconnect: [
    { id: 'SUB-6678', name: 'Thomas Lee' },
    { id: 'SUB-6679', name: 'Patricia White' },
  ],
  westcom: [
    { id: 'SUB-7789', name: 'Christopher Harris' },
    { id: 'SUB-7790', name: 'Barbara Clark' },
  ],
  skywave: [
    { id: 'SUB-8890', name: 'Daniel Lewis' },
    { id: 'SUB-8891', name: 'Elizabeth Walker' },
  ],
  centralnet: [
    { id: 'SUB-9901', name: 'Matthew Hall' },
    { id: 'SUB-9902', name: 'Susan Allen' },
  ],
  corefiber: [
    { id: 'SUB-1012', name: 'Joseph Young' },
    { id: 'SUB-1013', name: 'Jessica King' },
  ],
};

export const DEVICES: Record<string, Array<{ id: string; name: string }>> = {
  'SUB-7834': [
    { id: 'GW-7834-HOME', name: 'Home' },
    { id: 'GW-7834-OFFICE', name: 'Office' },
  ],
  'SUB-7835': [
    { id: 'GW-7835-HOME', name: 'Home' },
    { id: 'GW-7835-GARAGE', name: 'Garage' },
  ],
  'SUB-7836': [
    { id: 'GW-7836-HOME', name: 'Home' },
    { id: 'GW-7836-STUDIO', name: 'Studio' },
  ],
  'SUB-8901': [
    { id: 'GW-8901-HOME', name: 'Home' },
    { id: 'GW-8901-BRANCH', name: 'Branch' },
  ],
  'SUB-8902': [
    { id: 'GW-8902-HOME', name: 'Home' },
  ],
  'SUB-4521': [
    { id: 'GW-4521-HOME', name: 'Home' },
    { id: 'GW-4521-OFFICE', name: 'Office' },
  ],
  'SUB-4522': [
    { id: 'GW-4522-HOME', name: 'Home' },
  ],
  'SUB-3344': [
    { id: 'GW-3344-HOME', name: 'Home' },
    { id: 'GW-3344-WAREHOUSE', name: 'Warehouse' },
  ],
  'SUB-3345': [
    { id: 'GW-3345-HOME', name: 'Home' },
  ],
  'SUB-5567': [
    { id: 'GW-5567-HOME', name: 'Home' },
  ],
  'SUB-5568': [
    { id: 'GW-5568-HOME', name: 'Home' },
    { id: 'GW-5568-OFFICE', name: 'Office' },
  ],
  'SUB-6678': [
    { id: 'GW-6678-HOME', name: 'Home' },
  ],
  'SUB-6679': [
    { id: 'GW-6679-HOME', name: 'Home' },
    { id: 'GW-6679-SHOP', name: 'Shop' },
  ],
  'SUB-7789': [
    { id: 'GW-7789-HOME', name: 'Home' },
  ],
  'SUB-7790': [
    { id: 'GW-7790-HOME', name: 'Home' },
    { id: 'GW-7790-OFFICE', name: 'Office' },
  ],
  'SUB-8890': [
    { id: 'GW-8890-HOME', name: 'Home' },
  ],
  'SUB-8891': [
    { id: 'GW-8891-HOME', name: 'Home' },
    { id: 'GW-8891-CABIN', name: 'Cabin' },
  ],
  'SUB-9901': [
    { id: 'GW-9901-HOME', name: 'Home' },
    { id: 'GW-9901-OFFICE', name: 'Office' },
  ],
  'SUB-9902': [
    { id: 'GW-9902-HOME', name: 'Home' },
  ],
  'SUB-1012': [
    { id: 'GW-1012-HOME', name: 'Home' },
  ],
  'SUB-1013': [
    { id: 'GW-1013-HOME', name: 'Home' },
    { id: 'GW-1013-LAB', name: 'Lab' },
  ],
};

export const REGION_LABELS: Record<string, string> = Object.fromEntries(
  REGIONS.map((region) => [region.id, region.name]),
);

export const ORGANIZATION_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(ORGANIZATIONS).flat().map((organization) => [organization.id, organization.name]),
);

export const SUBSCRIBER_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SUBSCRIBERS).flat().map((subscriber) => [subscriber.id, subscriber.name]),
);

export const DEVICE_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(DEVICES).flat().map((device) => [device.id, device.name]),
);

export const DEFAULT_SUBSCRIBER_ID = 'SUB-7834';
export const DEFAULT_SUBSCRIBER_NAME = SUBSCRIBER_LABELS[DEFAULT_SUBSCRIBER_ID] ?? 'John Smith';

const ORGANIZATION_TO_REGION = Object.fromEntries(
  Object.entries(ORGANIZATIONS).flatMap(([regionId, organizations]) =>
    organizations.map((organization) => [organization.id, regionId]),
  ),
) as Record<string, string>;

const SUBSCRIBER_TO_ORGANIZATION = Object.fromEntries(
  Object.entries(SUBSCRIBERS).flatMap(([organizationId, subscribers]) =>
    subscribers.map((subscriber) => [subscriber.id, organizationId]),
  ),
) as Record<string, string>;

const DEVICE_TO_SUBSCRIBER = Object.fromEntries(
  Object.entries(DEVICES).flatMap(([subscriberId, devices]) =>
    devices.map((device) => [device.id, subscriberId]),
  ),
) as Record<string, string>;

export function getOrganizationsForRegion(regionId?: string) {
  return regionId ? ORGANIZATIONS[regionId] ?? [] : Object.values(ORGANIZATIONS).flat();
}

export function getSubscribersForOrganization(organizationId?: string) {
  return organizationId ? SUBSCRIBERS[organizationId] ?? [] : Object.values(SUBSCRIBERS).flat();
}

export function getDevicesForSubscriber(subscriberId?: string) {
  return subscriberId ? DEVICES[subscriberId] ?? [] : Object.values(DEVICES).flat();
}

export function getParentScopeForOrganization(organizationId: string) {
  const region = ORGANIZATION_TO_REGION[organizationId];
  return {
    region,
    organization: organizationId,
  };
}

export function getParentScopeForSubscriber(subscriberId: string) {
  const organization = SUBSCRIBER_TO_ORGANIZATION[subscriberId];
  const region = organization ? ORGANIZATION_TO_REGION[organization] : undefined;
  return {
    region,
    organization,
    subscriber: subscriberId,
  };
}

export function getParentScopeForDevice(deviceId: string) {
  const subscriber = DEVICE_TO_SUBSCRIBER[deviceId];
  const parent = subscriber ? getParentScopeForSubscriber(subscriber) : {};
  return {
    ...parent,
    device: deviceId,
  };
}

export function buildScopeSelection(level: ScopeLevel, id?: string): ScopeSelection {
  switch (level) {
    case 'all':
      return { level: 'all' };
    case 'region':
      return { level: 'region', region: id };
    case 'organization': {
      const parent = id ? getParentScopeForOrganization(id) : {};
      return { level: 'organization', ...parent };
    }
    case 'subscriber': {
      const parent = id ? getParentScopeForSubscriber(id) : {};
      return { level: 'subscriber', ...parent };
    }
    case 'device': {
      const parent = id ? getParentScopeForDevice(id) : {};
      return { level: 'device', ...parent };
    }
  }
}

export function getDisplayTextForScope(scope: ScopeSelection) {
  if (scope.level === 'all') return 'All Tenants';

  const parts: string[] = [];

  if (scope.region) {
    const regionName = REGION_LABELS[scope.region];
    if (regionName) parts.push(regionName);
  }

  if (scope.organization) {
    const organizationName = ORGANIZATION_LABELS[scope.organization];
    if (organizationName) parts.push(organizationName);
  }

  if (scope.subscriber) {
    const subscriberName = SUBSCRIBER_LABELS[scope.subscriber];
    if (subscriberName) parts.push(`${subscriberName} (${scope.subscriber})`);
  }

  if (scope.device) {
    const deviceName = DEVICE_LABELS[scope.device];
    if (deviceName) parts.push(`${deviceName} Gateway`);
  }

  return parts.join(' • ');
}

export function normalizeScopeSearchValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}
