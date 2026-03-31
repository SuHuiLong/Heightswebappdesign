export type ScopeLevel = 'all' | 'region' | 'organization' | 'subscriber' | 'device';

export interface ScopeSelection {
  level: ScopeLevel;
  region?: string;
  organization?: string;
  subscriber?: string;
  device?: string;
}

type RegionStatus = 'healthy' | 'watch' | 'critical';
type OrganizationTier = 'national' | 'regional' | 'local';
type OrganizationStatus = 'online' | 'watch' | 'incident';
type SubscriberStatus = 'active' | 'watch' | 'delinquent';
type PremiseType = 'residential' | 'business' | 'mixed-use';
type DeviceStatus = 'online' | 'degraded' | 'offline';

export interface RegionEntity {
  id: string;
  name: string;
  code: string;
  market: string;
  timezone: string;
  climateRisk: 'low' | 'moderate' | 'high';
  status: RegionStatus;
  organizationCount: number;
  subscriberCount: number;
  deviceCount: number;
}

export interface OrganizationEntity {
  id: string;
  name: string;
  regionId: string;
  code: string;
  tier: OrganizationTier;
  status: OrganizationStatus;
  serviceModel: 'fiber' | 'wireless' | 'hybrid';
  nocRegion: string;
  subscriberCount: number;
  deviceCount: number;
}

export interface SubscriberEntity {
  id: string;
  name: string;
  organizationId: string;
  status: SubscriberStatus;
  plan: string;
  city: string;
  serviceAddress: string;
  premiseType: PremiseType;
  lastTicketAt: string;
  deviceCount: number;
}

export interface DeviceEntity {
  id: string;
  name: string;
  subscriberId: string;
  status: DeviceStatus;
  model: string;
  firmware: string;
  serial: string;
  connectionType: 'ethernet' | 'mesh' | 'fiber';
  healthScore: number;
  lastSeen: string;
}

type RegionSeed = Omit<RegionEntity, 'organizationCount' | 'subscriberCount' | 'deviceCount'>;
type OrganizationSeed = Omit<OrganizationEntity, 'subscriberCount' | 'deviceCount'>;
type SubscriberSeed = Omit<SubscriberEntity, 'organizationId' | 'deviceCount'> & {
  sites: string[];
};

const REGION_SEEDS: RegionSeed[] = [
  { id: 'all', name: 'All Tenants (Fleet)', code: 'ALL', market: 'Global', timezone: 'UTC', climateRisk: 'low', status: 'healthy' },
  { id: 'north', name: 'North Region', code: 'NRTH', market: 'Northeast', timezone: 'America/New_York', climateRisk: 'moderate', status: 'healthy' },
  { id: 'south', name: 'South Region', code: 'STH', market: 'Southeast', timezone: 'America/Chicago', climateRisk: 'high', status: 'watch' },
  { id: 'east', name: 'East Region', code: 'EST', market: 'Mid-Atlantic', timezone: 'America/New_York', climateRisk: 'moderate', status: 'healthy' },
  { id: 'west', name: 'West Region', code: 'WST', market: 'Pacific', timezone: 'America/Los_Angeles', climateRisk: 'high', status: 'watch' },
  { id: 'central', name: 'Central Region', code: 'CTRL', market: 'Midwest', timezone: 'America/Chicago', climateRisk: 'low', status: 'healthy' },
];

const ORGANIZATION_SEEDS: Record<string, OrganizationSeed[]> = {
  north: [
    { id: 'acme-isp', name: 'Acme ISP', regionId: 'north', code: 'ACM', tier: 'national', status: 'online', serviceModel: 'fiber', nocRegion: 'Boston Core' },
    { id: 'technet', name: 'TechNet Co.', regionId: 'north', code: 'TNC', tier: 'regional', status: 'watch', serviceModel: 'hybrid', nocRegion: 'Albany Edge' },
    { id: 'pinenet', name: 'PineNet Broadband', regionId: 'north', code: 'PNB', tier: 'local', status: 'online', serviceModel: 'wireless', nocRegion: 'Portland Field Ops' },
  ],
  south: [
    { id: 'fastfiber', name: 'FastFiber Inc.', regionId: 'south', code: 'FFI', tier: 'national', status: 'watch', serviceModel: 'fiber', nocRegion: 'Atlanta Core' },
    { id: 'netpro', name: 'NetPro Services', regionId: 'south', code: 'NPS', tier: 'regional', status: 'online', serviceModel: 'hybrid', nocRegion: 'Nashville Service Desk' },
    { id: 'gulfstream', name: 'GulfStream Connect', regionId: 'south', code: 'GSC', tier: 'local', status: 'incident', serviceModel: 'wireless', nocRegion: 'Tampa Recovery Hub' },
  ],
  east: [
    { id: 'eastlink', name: 'EastLink Networks', regionId: 'east', code: 'ELN', tier: 'regional', status: 'online', serviceModel: 'fiber', nocRegion: 'Philadelphia Core' },
    { id: 'cityconnect', name: 'CityConnect', regionId: 'east', code: 'CTC', tier: 'local', status: 'watch', serviceModel: 'hybrid', nocRegion: 'Baltimore Metro NOC' },
    { id: 'harborwave', name: 'HarborWave Fiber', regionId: 'east', code: 'HWF', tier: 'local', status: 'online', serviceModel: 'fiber', nocRegion: 'Norfolk Edge Pod' },
  ],
  west: [
    { id: 'westcom', name: 'WestCom ISP', regionId: 'west', code: 'WCI', tier: 'regional', status: 'online', serviceModel: 'hybrid', nocRegion: 'Seattle Core' },
    { id: 'skywave', name: 'SkyWave Internet', regionId: 'west', code: 'SWI', tier: 'regional', status: 'watch', serviceModel: 'wireless', nocRegion: 'San Jose Wireless Ops' },
    { id: 'redwood', name: 'Redwood Fiber', regionId: 'west', code: 'RWF', tier: 'local', status: 'online', serviceModel: 'fiber', nocRegion: 'Sacramento Field NOC' },
  ],
  central: [
    { id: 'centralnet', name: 'CentralNet', regionId: 'central', code: 'CNT', tier: 'regional', status: 'online', serviceModel: 'fiber', nocRegion: 'Chicago Core' },
    { id: 'corefiber', name: 'CoreFiber LLC', regionId: 'central', code: 'CFL', tier: 'regional', status: 'watch', serviceModel: 'hybrid', nocRegion: 'St. Louis Edge' },
    { id: 'heartland', name: 'Heartland Wireless', regionId: 'central', code: 'HLW', tier: 'local', status: 'online', serviceModel: 'wireless', nocRegion: 'Omaha Service Desk' },
  ],
};

const SUBSCRIBER_SEEDS: Record<string, SubscriberSeed[]> = {
  'acme-isp': [
    { id: 'SUB-7834', name: 'John Smith', status: 'active', plan: 'Gigabit 1000', city: 'Raleigh, NC', serviceAddress: '1428 Beacon Ridge Dr', premiseType: 'residential', lastTicketAt: '2026-03-25T09:15:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-7835', name: 'Sarah Johnson', status: 'watch', plan: 'Fiber 500', city: 'Durham, NC', serviceAddress: '88 Lakeview Ave', premiseType: 'mixed-use', lastTicketAt: '2026-03-27T14:42:00Z', sites: ['Home', 'Garage'] },
    { id: 'SUB-7836', name: 'Michael Chen', status: 'active', plan: 'Gigabit 1000', city: 'Cary, NC', serviceAddress: '17 Orchard Way', premiseType: 'business', lastTicketAt: '2026-03-21T08:10:00Z', sites: ['Home', 'Studio'] },
  ],
  technet: [
    { id: 'SUB-8901', name: 'Emily Davis', status: 'active', plan: 'Business 1G', city: 'Albany, NY', serviceAddress: '301 State Plaza', premiseType: 'business', lastTicketAt: '2026-03-24T16:20:00Z', sites: ['Home', 'Branch'] },
    { id: 'SUB-8902', name: 'David Wilson', status: 'watch', plan: 'Fiber 300', city: 'Syracuse, NY', serviceAddress: '51 Hickory Ln', premiseType: 'residential', lastTicketAt: '2026-03-26T11:05:00Z', sites: ['Home', 'Workshop'] },
    { id: 'SUB-8903', name: 'Olivia Martin', status: 'active', plan: 'Business 500', city: 'Buffalo, NY', serviceAddress: '902 Pearl St', premiseType: 'business', lastTicketAt: '2026-03-23T19:00:00Z', sites: ['Office', 'Lab'] },
  ],
  pinenet: [
    { id: 'SUB-8911', name: 'Noah Carter', status: 'active', plan: 'Wireless 200', city: 'Portland, ME', serviceAddress: '14 Harbor Point Rd', premiseType: 'residential', lastTicketAt: '2026-03-22T10:12:00Z', sites: ['Home', 'Cabin'] },
    { id: 'SUB-8912', name: 'Ava Mitchell', status: 'watch', plan: 'Wireless 300', city: 'Bangor, ME', serviceAddress: '67 Pine St', premiseType: 'mixed-use', lastTicketAt: '2026-03-28T07:55:00Z', sites: ['Home', 'Studio'] },
    { id: 'SUB-8913', name: 'Ethan Brooks', status: 'active', plan: 'Wireless 500', city: 'Augusta, ME', serviceAddress: '800 Capitol Cir', premiseType: 'business', lastTicketAt: '2026-03-20T13:30:00Z', sites: ['Office', 'Warehouse'] },
  ],
  fastfiber: [
    { id: 'SUB-4521', name: 'Robert Brown', status: 'watch', plan: 'Gigabit 1000', city: 'Atlanta, GA', serviceAddress: '902 Peachtree St', premiseType: 'business', lastTicketAt: '2026-03-28T05:10:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-4522', name: 'Jennifer Taylor', status: 'active', plan: 'Fiber 500', city: 'Savannah, GA', serviceAddress: '10 Riverwalk Dr', premiseType: 'residential', lastTicketAt: '2026-03-18T09:40:00Z', sites: ['Home', 'Guest House'] },
    { id: 'SUB-4523', name: 'Andrew Thomas', status: 'active', plan: 'Business 2G', city: 'Macon, GA', serviceAddress: '44 Riverside Park', premiseType: 'business', lastTicketAt: '2026-03-19T12:18:00Z', sites: ['Office', 'Warehouse'] },
  ],
  netpro: [
    { id: 'SUB-3344', name: 'William Anderson', status: 'watch', plan: 'Fiber 300', city: 'Nashville, TN', serviceAddress: '75 Broadway', premiseType: 'mixed-use', lastTicketAt: '2026-03-26T20:05:00Z', sites: ['Home', 'Warehouse'] },
    { id: 'SUB-3345', name: 'Lisa Martinez', status: 'active', plan: 'Fiber 500', city: 'Knoxville, TN', serviceAddress: '18 Market Row', premiseType: 'residential', lastTicketAt: '2026-03-17T06:42:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-3346', name: 'Kevin Scott', status: 'active', plan: 'Business 1G', city: 'Chattanooga, TN', serviceAddress: '501 Walnut St', premiseType: 'business', lastTicketAt: '2026-03-14T18:48:00Z', sites: ['Office', 'Back Office'] },
  ],
  gulfstream: [
    { id: 'SUB-3351', name: 'Mia Perez', status: 'watch', plan: 'Wireless 150', city: 'Tampa, FL', serviceAddress: '701 Bayshore Blvd', premiseType: 'residential', lastTicketAt: '2026-03-28T16:10:00Z', sites: ['Home', 'Dock'] },
    { id: 'SUB-3352', name: 'Lucas Rivera', status: 'delinquent', plan: 'Wireless 300', city: 'Orlando, FL', serviceAddress: '220 Orange Ave', premiseType: 'mixed-use', lastTicketAt: '2026-03-27T12:00:00Z', sites: ['Home', 'Shop'] },
    { id: 'SUB-3353', name: 'Charlotte Cox', status: 'active', plan: 'Fiber 500', city: 'Sarasota, FL', serviceAddress: '19 Sunset Key', premiseType: 'business', lastTicketAt: '2026-03-16T15:00:00Z', sites: ['Office', 'Annex'] },
  ],
  eastlink: [
    { id: 'SUB-5567', name: 'James Garcia', status: 'active', plan: 'Fiber 500', city: 'Philadelphia, PA', serviceAddress: '909 Walnut St', premiseType: 'residential', lastTicketAt: '2026-03-23T08:22:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-5568', name: 'Mary Rodriguez', status: 'watch', plan: 'Gigabit 1000', city: 'Pittsburgh, PA', serviceAddress: '317 Liberty Ave', premiseType: 'mixed-use', lastTicketAt: '2026-03-25T11:33:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-5569', name: 'Henry Flores', status: 'active', plan: 'Business 2G', city: 'Allentown, PA', serviceAddress: '120 Hamilton St', premiseType: 'business', lastTicketAt: '2026-03-12T17:30:00Z', sites: ['Office', 'Lab'] },
  ],
  cityconnect: [
    { id: 'SUB-6678', name: 'Thomas Lee', status: 'active', plan: 'Fiber 300', city: 'Baltimore, MD', serviceAddress: '77 Harbor East', premiseType: 'residential', lastTicketAt: '2026-03-18T14:00:00Z', sites: ['Home', 'Studio'] },
    { id: 'SUB-6679', name: 'Patricia White', status: 'watch', plan: 'Fiber 500', city: 'Annapolis, MD', serviceAddress: '45 Market Quay', premiseType: 'mixed-use', lastTicketAt: '2026-03-28T09:10:00Z', sites: ['Home', 'Shop'] },
    { id: 'SUB-6680', name: 'Grace Hall', status: 'active', plan: 'Business 1G', city: 'Frederick, MD', serviceAddress: '60 Carroll Creek', premiseType: 'business', lastTicketAt: '2026-03-15T10:50:00Z', sites: ['Office', 'Back Office'] },
  ],
  harborwave: [
    { id: 'SUB-6681', name: 'Jack Allen', status: 'active', plan: 'Fiber 500', city: 'Norfolk, VA', serviceAddress: '801 Waterside Dr', premiseType: 'residential', lastTicketAt: '2026-03-13T11:35:00Z', sites: ['Home', 'Garage'] },
    { id: 'SUB-6682', name: 'Sofia Young', status: 'watch', plan: 'Fiber 300', city: 'Virginia Beach, VA', serviceAddress: '211 Shoreline Rd', premiseType: 'mixed-use', lastTicketAt: '2026-03-26T19:22:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-6683', name: 'Daniel King', status: 'active', plan: 'Business 1G', city: 'Chesapeake, VA', serviceAddress: '503 Commerce Pkwy', premiseType: 'business', lastTicketAt: '2026-03-11T07:15:00Z', sites: ['Office', 'Warehouse'] },
  ],
  westcom: [
    { id: 'SUB-7789', name: 'Christopher Harris', status: 'active', plan: 'Fiber 500', city: 'Seattle, WA', serviceAddress: '88 Pike St', premiseType: 'residential', lastTicketAt: '2026-03-24T07:44:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-7790', name: 'Barbara Clark', status: 'watch', plan: 'Gigabit 1000', city: 'Tacoma, WA', serviceAddress: '12 Dockyard Ave', premiseType: 'mixed-use', lastTicketAt: '2026-03-27T18:05:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-7791', name: 'Logan Lewis', status: 'active', plan: 'Business 2G', city: 'Spokane, WA', serviceAddress: '400 Sprague Ave', premiseType: 'business', lastTicketAt: '2026-03-10T10:12:00Z', sites: ['Office', 'Warehouse'] },
  ],
  skywave: [
    { id: 'SUB-8890', name: 'Daniel Lewis', status: 'active', plan: 'Wireless 300', city: 'San Jose, CA', serviceAddress: '510 Santa Clara St', premiseType: 'residential', lastTicketAt: '2026-03-19T06:55:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-8891', name: 'Elizabeth Walker', status: 'watch', plan: 'Wireless 500', city: 'Fresno, CA', serviceAddress: '91 Vineyard Rd', premiseType: 'mixed-use', lastTicketAt: '2026-03-28T04:45:00Z', sites: ['Home', 'Cabin'] },
    { id: 'SUB-8892', name: 'Amelia Robinson', status: 'active', plan: 'Wireless 750', city: 'Monterey, CA', serviceAddress: '30 Ocean View', premiseType: 'business', lastTicketAt: '2026-03-17T17:20:00Z', sites: ['Office', 'Studio'] },
  ],
  redwood: [
    { id: 'SUB-8893', name: 'Benjamin Wright', status: 'active', plan: 'Fiber 500', city: 'Sacramento, CA', serviceAddress: '208 Capitol Mall', premiseType: 'residential', lastTicketAt: '2026-03-16T08:05:00Z', sites: ['Home', 'Workshop'] },
    { id: 'SUB-8894', name: 'Harper Lopez', status: 'watch', plan: 'Gigabit 1000', city: 'Santa Rosa, CA', serviceAddress: '14 Redwood Square', premiseType: 'mixed-use', lastTicketAt: '2026-03-26T12:40:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-8895', name: 'Sebastian Hill', status: 'active', plan: 'Business 1G', city: 'Eureka, CA', serviceAddress: '621 Harbor St', premiseType: 'business', lastTicketAt: '2026-03-08T15:50:00Z', sites: ['Office', 'Warehouse'] },
  ],
  centralnet: [
    { id: 'SUB-9901', name: 'Matthew Hall', status: 'active', plan: 'Fiber 500', city: 'Chicago, IL', serviceAddress: '701 W Madison St', premiseType: 'business', lastTicketAt: '2026-03-20T12:45:00Z', sites: ['Home', 'Office'] },
    { id: 'SUB-9902', name: 'Susan Allen', status: 'watch', plan: 'Fiber 300', city: 'Springfield, IL', serviceAddress: '12 Lincoln Sq', premiseType: 'residential', lastTicketAt: '2026-03-28T02:35:00Z', sites: ['Home', 'Studio'] },
    { id: 'SUB-9903', name: 'Zoe Green', status: 'active', plan: 'Business 1G', city: 'Peoria, IL', serviceAddress: '400 Riverfront Dr', premiseType: 'business', lastTicketAt: '2026-03-09T18:12:00Z', sites: ['Office', 'Lab'] },
  ],
  corefiber: [
    { id: 'SUB-1012', name: 'Joseph Young', status: 'active', plan: 'Fiber 500', city: 'St. Louis, MO', serviceAddress: '95 Olive Blvd', premiseType: 'residential', lastTicketAt: '2026-03-22T21:00:00Z', sites: ['Home', 'Workshop'] },
    { id: 'SUB-1013', name: 'Jessica King', status: 'watch', plan: 'Gigabit 1000', city: 'Columbia, MO', serviceAddress: '16 Broadway', premiseType: 'mixed-use', lastTicketAt: '2026-03-27T09:48:00Z', sites: ['Home', 'Lab'] },
    { id: 'SUB-1014', name: 'Isaac Baker', status: 'active', plan: 'Business 2G', city: 'Kansas City, MO', serviceAddress: '502 Grand Blvd', premiseType: 'business', lastTicketAt: '2026-03-13T13:35:00Z', sites: ['Office', 'Warehouse'] },
  ],
  heartland: [
    { id: 'SUB-1015', name: 'Ella Nelson', status: 'active', plan: 'Wireless 200', city: 'Omaha, NE', serviceAddress: '1818 Farnam St', premiseType: 'residential', lastTicketAt: '2026-03-18T16:40:00Z', sites: ['Home', 'Barn'] },
    { id: 'SUB-1016', name: 'Wyatt Carter', status: 'watch', plan: 'Wireless 300', city: 'Lincoln, NE', serviceAddress: '12 Haymarket Sq', premiseType: 'mixed-use', lastTicketAt: '2026-03-25T05:55:00Z', sites: ['Home', 'Shop'] },
    { id: 'SUB-1017', name: 'Lily Murphy', status: 'active', plan: 'Wireless 500', city: 'Kearney, NE', serviceAddress: '77 Platte Rd', premiseType: 'business', lastTicketAt: '2026-03-07T09:05:00Z', sites: ['Office', 'Warehouse'] },
  ],
};

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const key = getKey(item);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

function buildGatewayId(subscriberId: string, site: string) {
  const subscriberCode = subscriberId.replace('SUB-', '');
  const siteCode = site.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  return `GW-${subscriberCode}-${siteCode}`;
}

function buildSerial(subscriberId: string, site: string, index: number) {
  const siteCode = site.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 4).padEnd(4, 'X');
  return `SN-${subscriberId.replace('SUB-', '')}-${siteCode}-${String(index + 1).padStart(2, '0')}`;
}

const BASE_ORGANIZATIONS = Object.values(ORGANIZATION_SEEDS).flat();

const BASE_SUBSCRIBERS: SubscriberEntity[] = Object.entries(SUBSCRIBER_SEEDS).flatMap(
  ([organizationId, subscribers]) =>
    subscribers.map((subscriber) => ({
      id: subscriber.id,
      name: subscriber.name,
      organizationId,
      status: subscriber.status,
      plan: subscriber.plan,
      city: subscriber.city,
      serviceAddress: subscriber.serviceAddress,
      premiseType: subscriber.premiseType,
      lastTicketAt: subscriber.lastTicketAt,
      deviceCount: subscriber.sites.length,
    })),
);

const DEVICE_ENTITIES_LIST: DeviceEntity[] = Object.entries(SUBSCRIBER_SEEDS).flatMap(
  ([, subscribers]) =>
    subscribers.flatMap((subscriber) =>
      subscriber.sites.map((site, index) => ({
        id: buildGatewayId(subscriber.id, site),
        name: site,
        subscriberId: subscriber.id,
        status:
          subscriber.status === 'delinquent'
            ? index === 0
              ? 'degraded'
              : 'offline'
            : subscriber.status === 'watch' && index > 0
              ? 'degraded'
              : 'online',
        model:
          subscriber.premiseType === 'business'
            ? 'Calix GigaSpire BLAST u10xe'
            : subscriber.premiseType === 'mixed-use'
              ? 'Nokia Beacon G6'
              : 'Adtran SDG 8733',
        firmware: index === 0 ? '24.3.1' : '24.1.8',
        serial: buildSerial(subscriber.id, site, index),
        connectionType:
          site === 'Office' || site === 'Warehouse' || site === 'Lab' || site === 'Branch' || site === 'Back Office'
            ? 'ethernet'
            : subscriber.premiseType === 'residential'
              ? 'mesh'
              : 'fiber',
        healthScore: Math.max(62, 96 - index * 8 - (subscriber.status === 'watch' ? 10 : subscriber.status === 'delinquent' ? 22 : 0)),
        lastSeen: subscriber.status === 'delinquent' && index > 0 ? '2026-03-26T04:15:00Z' : index === 0 ? '2026-03-29T08:45:00Z' : '2026-03-29T07:05:00Z',
      })),
    ),
);

const subscriberCountByOrganization = BASE_SUBSCRIBERS.reduce<Record<string, number>>((accumulator, subscriber) => {
  accumulator[subscriber.organizationId] = (accumulator[subscriber.organizationId] ?? 0) + 1;
  return accumulator;
}, {});

const deviceCountBySubscriber = DEVICE_ENTITIES_LIST.reduce<Record<string, number>>((accumulator, device) => {
  accumulator[device.subscriberId] = (accumulator[device.subscriberId] ?? 0) + 1;
  return accumulator;
}, {});

const deviceCountByOrganization = BASE_SUBSCRIBERS.reduce<Record<string, number>>((accumulator, subscriber) => {
  accumulator[subscriber.organizationId] =
    (accumulator[subscriber.organizationId] ?? 0) + (deviceCountBySubscriber[subscriber.id] ?? 0);
  return accumulator;
}, {});

const organizationCountByRegion = BASE_ORGANIZATIONS.reduce<Record<string, number>>((accumulator, organization) => {
  accumulator[organization.regionId] = (accumulator[organization.regionId] ?? 0) + 1;
  return accumulator;
}, {});

const subscriberCountByRegion = BASE_ORGANIZATIONS.reduce<Record<string, number>>((accumulator, organization) => {
  accumulator[organization.regionId] =
    (accumulator[organization.regionId] ?? 0) + (subscriberCountByOrganization[organization.id] ?? 0);
  return accumulator;
}, {});

const deviceCountByRegion = BASE_ORGANIZATIONS.reduce<Record<string, number>>((accumulator, organization) => {
  accumulator[organization.regionId] =
    (accumulator[organization.regionId] ?? 0) + (deviceCountByOrganization[organization.id] ?? 0);
  return accumulator;
}, {});

export const REGIONS: RegionEntity[] = REGION_SEEDS.map((region) => ({
  ...region,
  organizationCount: organizationCountByRegion[region.id] ?? 0,
  subscriberCount: subscriberCountByRegion[region.id] ?? 0,
  deviceCount: deviceCountByRegion[region.id] ?? 0,
}));

export const ORGANIZATION_ENTITIES: OrganizationEntity[] = BASE_ORGANIZATIONS.map((organization) => ({
  ...organization,
  subscriberCount: subscriberCountByOrganization[organization.id] ?? 0,
  deviceCount: deviceCountByOrganization[organization.id] ?? 0,
}));

export const SUBSCRIBER_ENTITIES: SubscriberEntity[] = BASE_SUBSCRIBERS.map((subscriber) => ({
  ...subscriber,
  deviceCount: deviceCountBySubscriber[subscriber.id] ?? 0,
}));

export const DEVICE_ENTITIES = DEVICE_ENTITIES_LIST;

export const ORGANIZATIONS = groupBy(ORGANIZATION_ENTITIES, (organization) => organization.regionId) as Record<
  string,
  OrganizationEntity[]
>;

export const SUBSCRIBERS = groupBy(SUBSCRIBER_ENTITIES, (subscriber) => subscriber.organizationId) as Record<
  string,
  SubscriberEntity[]
>;

export const DEVICES = groupBy(DEVICE_ENTITIES, (device) => device.subscriberId) as Record<string, DeviceEntity[]>;

export const REGION_LABELS: Record<string, string> = Object.fromEntries(
  REGIONS.map((region) => [region.id, region.name]),
);

export const ORGANIZATION_LABELS: Record<string, string> = Object.fromEntries(
  ORGANIZATION_ENTITIES.map((organization) => [organization.id, organization.name]),
);

export const SUBSCRIBER_LABELS: Record<string, string> = Object.fromEntries(
  SUBSCRIBER_ENTITIES.map((subscriber) => [subscriber.id, subscriber.name]),
);

export const DEVICE_LABELS: Record<string, string> = Object.fromEntries(
  DEVICE_ENTITIES.map((device) => [device.id, device.name]),
);

export const DEFAULT_SUBSCRIBER_ID = 'SUB-7834';
export const DEFAULT_SUBSCRIBER_NAME = SUBSCRIBER_LABELS[DEFAULT_SUBSCRIBER_ID] ?? 'John Smith';

const ORGANIZATION_TO_REGION = Object.fromEntries(
  ORGANIZATION_ENTITIES.map((organization) => [organization.id, organization.regionId]),
) as Record<string, string>;

const SUBSCRIBER_TO_ORGANIZATION = Object.fromEntries(
  SUBSCRIBER_ENTITIES.map((subscriber) => [subscriber.id, subscriber.organizationId]),
) as Record<string, string>;

const DEVICE_TO_SUBSCRIBER = Object.fromEntries(
  DEVICE_ENTITIES.map((device) => [device.id, device.subscriberId]),
) as Record<string, string>;

export function getOrganizationsForRegion(regionId?: string) {
  return regionId ? ORGANIZATIONS[regionId] ?? [] : ORGANIZATION_ENTITIES;
}

export function getSubscribersForOrganization(organizationId?: string) {
  return organizationId ? SUBSCRIBERS[organizationId] ?? [] : SUBSCRIBER_ENTITIES;
}

export function getDevicesForSubscriber(subscriberId?: string) {
  return subscriberId ? DEVICES[subscriberId] ?? [] : DEVICE_ENTITIES;
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
    const subscriberName = scope.subscriber ? SUBSCRIBER_LABELS[scope.subscriber] : undefined;
    if (deviceName && subscriberName) {
      parts.push(`${getGatewaySiteLabel(subscriberName, deviceName)} Gateway`);
    } else if (deviceName) {
      parts.push(`${deviceName} Gateway`);
    }
  }

  return parts.join(' • ');
}

export function normalizeScopeSearchValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function toPossessive(name: string) {
  return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

export function getGatewaySiteLabel(subscriberName: string, deviceName: string) {
  const firstName = subscriberName.trim().split(/\s+/)[0] ?? subscriberName;
  return `${toPossessive(firstName)} ${deviceName}`;
}
