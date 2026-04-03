/**
 * Mock Fleet Data for Fleet Overview Dashboard
 */

export interface FleetKPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  color?: string;
}

export interface RegionHealth {
  id: string;
  name: string;
  healthScore: number;
  totalGateways: number;
  onlineGateways: number;
  degradedGateways: number;
  offlineGateways: number;
  alertCount: number;
}

export interface FleetAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  region: string;
  affectedGateways: number;
  timestamp: string;
  description: string;
}

export interface FirmwareDistribution {
  version: string;
  count: number;
  percentage: number;
  releaseDate: string;
  isLatest: boolean;
}

export interface PerformanceTrend {
  time: string;
  latency: number;
  throughput: number;
  packetLoss: number;
}

// ─── Fleet KPIs ────────────────────────────────────────────────────────────

export const FLEET_KPIS: FleetKPI[] = [
  { label: 'Total Gateways', value: '12,489', change: '+142 this month', trend: 'up' },
  { label: 'Online', value: '12,458', change: '99.8%', trend: 'up', color: 'var(--success)' },
  { label: 'Degraded', value: '23', change: '-5 vs yesterday', trend: 'down', color: 'var(--warning)' },
  { label: 'Offline', value: '8', change: '-2 vs yesterday', trend: 'down', color: 'var(--critical)' },
];

export const FLEET_HEALTH_SCORE = {
  value: 94.2,
  change: 2.3,
  trend: 'up' as const,
  label: 'Fleet Health Score',
};

// ─── Regional Health ───────────────────────────────────────────────────────

export const REGION_HEALTH: RegionHealth[] = [
  { id: 'north', name: 'North', healthScore: 97.1, totalGateways: 2845, onlineGateways: 2838, degradedGateways: 5, offlineGateways: 2, alertCount: 3 },
  { id: 'south', name: 'South', healthScore: 95.3, totalGateways: 2102, onlineGateways: 2095, degradedGateways: 4, offlineGateways: 3, alertCount: 5 },
  { id: 'east', name: 'East', healthScore: 91.7, totalGateways: 1987, onlineGateways: 1974, degradedGateways: 8, offlineGateways: 5, alertCount: 8 },
  { id: 'west', name: 'West', healthScore: 96.8, totalGateways: 2563, onlineGateways: 2557, degradedGateways: 4, offlineGateways: 2, alertCount: 2 },
  { id: 'central', name: 'Central', healthScore: 93.2, totalGateways: 1892, onlineGateways: 1880, degradedGateways: 7, offlineGateways: 5, alertCount: 6 },
  { id: 'northeast', name: 'Northeast', healthScore: 90.8, totalGateways: 1100, onlineGateways: 1092, degradedGateways: 5, offlineGateways: 3, alertCount: 4 },
];

// ─── Active Alerts ─────────────────────────────────────────────────────────

export const FLEET_ALERTS: FleetAlert[] = [
  {
    id: 'alert-001',
    severity: 'critical',
    title: 'Gateway GW-4521 fully offline',
    region: 'East',
    affectedGateways: 1,
    timestamp: '12 min ago',
    description: 'Gateway has been unresponsive for 45 minutes. 12 subscribers affected. ACS provisioning may have failed.',
  },
  {
    id: 'alert-002',
    severity: 'high',
    title: 'High interference on channel 6',
    region: 'East',
    affectedGateways: 47,
    timestamp: '38 min ago',
    description: 'Cluster of 47 gateways in US-East detecting high 2.4GHz channel 6 utilization (>85%). Auto-steering in progress.',
  },
  {
    id: 'alert-003',
    severity: 'high',
    title: 'Firmware v2.3.x regression detected',
    region: 'Central',
    affectedGateways: 23,
    timestamp: '1 hour ago',
    description: 'Gateways on firmware v2.3.8 showing 34% increase in WAN disconnects. Correlation confidence: 91%.',
  },
  {
    id: 'alert-004',
    severity: 'medium',
    title: 'DNS resolution latency spike',
    region: 'West',
    affectedGateways: 156,
    timestamp: '2 hours ago',
    description: 'Average DNS resolution time increased from 12ms to 45ms in the West region.',
  },
  {
    id: 'alert-005',
    severity: 'medium',
    title: 'Bandwidth saturation detected',
    region: 'South',
    affectedGateways: 89,
    timestamp: '3 hours ago',
    description: '89 gateways reporting >90% WAN utilization during peak hours (7-10 PM).',
  },
  {
    id: 'alert-006',
    severity: 'low',
    title: 'Firmware updates available',
    region: 'All',
    affectedGateways: 847,
    timestamp: '6 hours ago',
    description: 'v2.4.2 is available for 847 gateways currently running v2.4.1. Staged rollout recommended.',
  },
];

// ─── Firmware Distribution ────────────────────────────────────────────────

export const FIRMWARE_DISTRIBUTION: FirmwareDistribution[] = [
  { version: 'v2.4.1', count: 9741, percentage: 78, releaseDate: 'Mar 15, 2026', isLatest: true },
  { version: 'v2.4.0', count: 2248, percentage: 18, releaseDate: 'Feb 28, 2026', isLatest: false },
  { version: 'v2.3.8', count: 312, percentage: 2.5, releaseDate: 'Jan 20, 2026', isLatest: false },
  { version: 'v2.3.x', count: 188, percentage: 1.5, releaseDate: 'Dec 2025', isLatest: false },
];

// ─── Performance Trends (24h) ─────────────────────────────────────────────

export const PERFORMANCE_TRENDS: PerformanceTrend[] = [
  { time: '00:00', latency: 16, throughput: 842, packetLoss: 0.08 },
  { time: '02:00', latency: 15, throughput: 654, packetLoss: 0.06 },
  { time: '04:00', latency: 14, throughput: 423, packetLoss: 0.05 },
  { time: '06:00', latency: 17, throughput: 789, packetLoss: 0.09 },
  { time: '08:00', latency: 21, throughput: 1245, packetLoss: 0.12 },
  { time: '10:00', latency: 19, throughput: 1156, packetLoss: 0.11 },
  { time: '12:00', latency: 18, throughput: 1034, packetLoss: 0.10 },
  { time: '14:00', latency: 17, throughput: 987, packetLoss: 0.09 },
  { time: '16:00', latency: 20, throughput: 1198, packetLoss: 0.13 },
  { time: '18:00', latency: 22, throughput: 1345, packetLoss: 0.15 },
  { time: '20:00', latency: 24, throughput: 1456, packetLoss: 0.18 },
  { time: '22:00', latency: 19, throughput: 1067, packetLoss: 0.10 },
];
