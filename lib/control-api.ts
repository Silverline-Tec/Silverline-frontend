import { NextResponse } from 'next/server';

import type {
  AlertRecord,
  DashboardStats,
  DeviceSummary,
  HealthSnapshot,
  IncidentDetail,
  IncidentPriority,
  IncidentStatus,
  IncidentSummary,
  SystemMetrics,
  WebhookSummary,
} from '@/lib/control-types';

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8000';

export interface BackendAlertRecord {
  id: number;
  rule_name: string;
  channel: string;
  recipient: string | null;
  status: string;
  fallback_channel: string | null;
  triggered_at: string;
  delivered_at: string | null;
  failure_reason: string | null;
}

export interface BackendIncidentSummary {
  incident_id: number;
  node_id: string | null;
  event_type: string;
  confidence: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  received_at_utc: string;
  location_label: string | null;
  dedup_uncertain: boolean;
}

export interface BackendIncidentDetail extends BackendIncidentSummary {
  event_time_utc: string | null;
  clock_drift_ms: number | null;
  time_source: string;
  evidence_ref: string | null;
  transmission_count: number;
  created_at: string;
  alerts: BackendAlertRecord[];
}

export interface BackendDeviceSummary {
  node_id: string;
  name: string | null;
  status: DeviceSummary['status'];
  battery_level: number | null;
  last_seen_at: string | null;
  location_label: string | null;
  is_stale: boolean;
}

export interface BackendDashboardStats {
  total_incidents: number;
  open_incidents: number;
  critical_incidents: number;
  incidents_last_hour: number;
  active_devices: number;
  stale_devices: number;
  nodes_exceeding_baseline: number;
}

export interface BackendWebhookSummary {
  id: number;
  name: string;
  url: string;
  event_types: string[];
  priorities: string[];
  active: boolean;
  created_at: string;
}

export type BackendHealthSnapshot = HealthSnapshot;

class ControlBackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ControlBackendError';
  }
}

function getControlBackendConfig() {
  return {
    baseUrl:
      process.env.SENTINEL_BACKEND_URL ??
      process.env.BACKEND_URL ??
      DEFAULT_BACKEND_URL,
    dashboardApiKey:
      process.env.SENTINEL_DASHBOARD_API_KEY ??
      process.env.DASHBOARD_API_KEY ??
      'dev-dashboard-key',
  };
}

function buildBackendUrl(pathname: string, searchParams?: URLSearchParams) {
  const { baseUrl } = getControlBackendConfig();
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(pathname, normalizedBase);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url;
}

async function getErrorMessage(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const payload = (await response.json()) as { detail?: string; error?: string };
      return payload.detail ?? payload.error ?? response.statusText;
    } catch {
      return response.statusText;
    }
  }

  try {
    const text = await response.text();
    return text || response.statusText;
  } catch {
    return response.statusText;
  }
}

interface BackendRequestOptions extends Omit<RequestInit, 'body'> {
  authenticated?: boolean;
  body?: unknown;
  searchParams?: URLSearchParams;
}

export async function requestBackend(
  pathname: string,
  {
    authenticated = true,
    body,
    headers,
    searchParams,
    ...init
  }: BackendRequestOptions = {},
) {
  const { dashboardApiKey } = getControlBackendConfig();
  const resolvedHeaders = new Headers(headers);

  if (body != null && !resolvedHeaders.has('Content-Type')) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }

  if (authenticated && !resolvedHeaders.has('X-API-Key')) {
    resolvedHeaders.set('X-API-Key', dashboardApiKey);
  }

  const response = await fetch(buildBackendUrl(pathname, searchParams), {
    ...init,
    body: body == null ? undefined : JSON.stringify(body),
    cache: 'no-store',
    headers: resolvedHeaders,
  });

  if (!response.ok) {
    throw new ControlBackendError(response.status, await getErrorMessage(response));
  }

  return response;
}

export async function requestBackendJson<T>(
  pathname: string,
  options?: BackendRequestOptions,
) {
  const response = await requestBackend(pathname, options);
  return (await response.json()) as T;
}

export async function requestBackendText(
  pathname: string,
  options?: BackendRequestOptions,
) {
  const response = await requestBackend(pathname, options);
  return response.text();
}

export function pickSearchParams(searchParams: URLSearchParams, allowedKeys: string[]) {
  const picked = new URLSearchParams();

  for (const key of allowedKeys) {
    const values = searchParams.getAll(key);
    for (const value of values) {
      picked.append(key, value);
    }
  }

  return picked;
}

function normalizeAlertRecord(payload: BackendAlertRecord): AlertRecord {
  return {
    id: payload.id,
    ruleName: payload.rule_name,
    channel: payload.channel,
    recipient: payload.recipient,
    status: payload.status,
    fallbackChannel: payload.fallback_channel,
    triggeredAt: payload.triggered_at,
    deliveredAt: payload.delivered_at,
    failureReason: payload.failure_reason,
  };
}

export function normalizeIncidentSummary(payload: BackendIncidentSummary): IncidentSummary {
  return {
    incidentId: payload.incident_id,
    nodeId: payload.node_id,
    eventType: payload.event_type,
    confidence: payload.confidence,
    priority: payload.priority,
    status: payload.status,
    receivedAtUtc: payload.received_at_utc,
    locationLabel: payload.location_label,
    dedupUncertain: payload.dedup_uncertain,
  };
}

export function normalizeIncidentDetail(payload: BackendIncidentDetail): IncidentDetail {
  return {
    ...normalizeIncidentSummary(payload),
    eventTimeUtc: payload.event_time_utc,
    clockDriftMs: payload.clock_drift_ms,
    timeSource: payload.time_source,
    evidenceRef: payload.evidence_ref,
    transmissionCount: payload.transmission_count,
    createdAt: payload.created_at,
    alerts: payload.alerts.map(normalizeAlertRecord),
  };
}

export function normalizeDeviceSummary(payload: BackendDeviceSummary): DeviceSummary {
  return {
    nodeId: payload.node_id,
    name: payload.name,
    status: payload.status,
    batteryLevel: payload.battery_level,
    lastSeenAt: payload.last_seen_at,
    locationLabel: payload.location_label,
    isStale: payload.is_stale,
  };
}

export function normalizeDashboardStats(payload: BackendDashboardStats): DashboardStats {
  return {
    totalIncidents: payload.total_incidents,
    openIncidents: payload.open_incidents,
    criticalIncidents: payload.critical_incidents,
    incidentsLastHour: payload.incidents_last_hour,
    activeDevices: payload.active_devices,
    staleDevices: payload.stale_devices,
    nodesExceedingBaseline: payload.nodes_exceeding_baseline,
  };
}

export function normalizeWebhookSummary(payload: BackendWebhookSummary): WebhookSummary {
  return {
    id: payload.id,
    name: payload.name,
    url: payload.url,
    eventTypes: payload.event_types,
    priorities: payload.priorities,
    active: payload.active,
    createdAt: payload.created_at,
  };
}

export function parsePrometheusMetrics(text: string): SystemMetrics {
  const defaults: SystemMetrics = {
    rateLimitHitsTotal: 0,
    circuitBreakerTripsTotal: 0,
    anomalyAlertsTotal: 0,
    revokedNodeAttemptsTotal: 0,
    ingestInvalidTotal: 0,
    ingestAuthFailuresTotal: 0,
    ingestRateLimitedTotal: 0,
    nodesExceedingBaseline: 0,
    queueBacklogOldestAgeSeconds: 0,
    recoveryBacklogPending: 0,
  };

  const metricMap: Record<string, keyof SystemMetrics> = {
    sentinel_rate_limit_hits_total: 'rateLimitHitsTotal',
    sentinel_circuit_breaker_trips_total: 'circuitBreakerTripsTotal',
    sentinel_anomaly_alerts_total: 'anomalyAlertsTotal',
    sentinel_revoked_node_attempts_total: 'revokedNodeAttemptsTotal',
    sentinel_ingest_invalid_total: 'ingestInvalidTotal',
    sentinel_ingest_auth_failures_total: 'ingestAuthFailuresTotal',
    sentinel_ingest_rate_limited_total: 'ingestRateLimitedTotal',
    sentinel_nodes_exceeding_baseline: 'nodesExceedingBaseline',
    sentinel_queue_backlog_oldest_age_s: 'queueBacklogOldestAgeSeconds',
    sentinel_recovery_backlog_pending: 'recoveryBacklogPending',
  };

  for (const line of text.split('\n')) {
    const [metricName, rawValue] = line.trim().split(/\s+/, 2);
    if (!metricName || !rawValue) {
      continue;
    }

    const target = metricMap[metricName];
    if (!target) {
      continue;
    }

    const value = Number(rawValue);
    if (!Number.isNaN(value)) {
      defaults[target] = value;
    }
  }

  return defaults;
}

export function errorResponse(error: unknown) {
  if (error instanceof ControlBackendError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json(
    { error: 'Unable to reach the Sentinel control backend.' },
    { status: 500 },
  );
}
