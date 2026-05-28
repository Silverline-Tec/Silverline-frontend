export type IncidentStatus = 'open' | 'acknowledged' | 'closed';
export type IncidentPriority = 'low' | 'high' | 'critical';
export type DeviceStatus = 'active' | 'needs_review' | 'maintenance';

export interface AlertRecord {
  id: number;
  ruleName: string;
  channel: string;
  recipient: string | null;
  status: string;
  fallbackChannel: string | null;
  triggeredAt: string;
  deliveredAt: string | null;
  failureReason: string | null;
}

export interface IncidentSummary {
  incidentId: number;
  nodeId: string | null;
  eventType: string;
  confidence: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  receivedAtUtc: string;
  locationLabel: string | null;
  dedupUncertain: boolean;
}

export interface IncidentDetail extends IncidentSummary {
  eventTimeUtc: string | null;
  clockDriftMs: number | null;
  timeSource: string;
  evidenceRef: string | null;
  transmissionCount: number;
  createdAt: string;
  alerts: AlertRecord[];
}

export interface DeviceSummary {
  nodeId: string;
  name: string | null;
  status: DeviceStatus;
  batteryLevel: number | null;
  lastSeenAt: string | null;
  locationLabel: string | null;
  isStale: boolean;
}

export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  incidentsLastHour: number;
  activeDevices: number;
  staleDevices: number;
  nodesExceedingBaseline: number;
}

export interface WebhookSummary {
  id: number;
  name: string;
  url: string;
  active: boolean;
  eventTypes: string[];
  priorities: string[];
  createdAt: string;
}

export interface HealthSnapshot {
  status: string;
  app: string;
  version: string;
}

export interface SystemMetrics {
  rateLimitHitsTotal: number;
  circuitBreakerTripsTotal: number;
  anomalyAlertsTotal: number;
  revokedNodeAttemptsTotal: number;
  ingestInvalidTotal: number;
  ingestAuthFailuresTotal: number;
  ingestRateLimitedTotal: number;
  nodesExceedingBaseline: number;
  queueBacklogOldestAgeSeconds: number;
  recoveryBacklogPending: number;
}

export interface SystemSnapshot {
  health: HealthSnapshot;
  metrics: SystemMetrics;
}

export interface WebhookCreateInput {
  name: string;
  url: string;
  eventTypes: string[];
  priorities: string[];
  secret: string;
}
