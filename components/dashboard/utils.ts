import { Activity, AlertTriangle, Clock, Users, Wifi } from 'lucide-react';
import type { DashboardView } from '@/components/dashboard-sidebar';
import type {
  DashboardStats,
  DeviceSummary,
  IncidentDetail,
  IncidentSummary,
  SystemSnapshot,
} from '@/lib/control-types';
import type {
  DashboardPanelCopy,
  HeaderMetric,
  HistoryFilters,
  RealtimeIncidentPayload,
} from './types';
import { HISTORY_PAGE_SIZE } from './types';

export function buildStatsStrip(stats: DashboardStats): HeaderMetric[] {
  return [
    { icon: Activity, label: 'Total open incidents', value: formatCount(stats.openIncidents), color: stats.openIncidents > 0 ? 'red' : 'brand' },
    { icon: AlertTriangle, label: 'Critical count', value: formatCount(stats.criticalIncidents), color: stats.criticalIncidents > 0 ? 'red' : 'brand' },
    { icon: Clock, label: 'Incidents last hour', value: formatCount(stats.incidentsLastHour), color: stats.incidentsLastHour > 0 ? 'yellow' : 'brand' },
    { icon: Users, label: 'Active devices', value: formatCount(stats.activeDevices), color: 'zinc' },
    { icon: Wifi, label: 'Stale devices', value: formatCount(stats.staleDevices), color: stats.staleDevices > 0 ? 'yellow' : 'brand' },
  ];
}

export function buildFallbackStats(
  incidents: IncidentSummary[],
  devices: DeviceSummary[],
): DashboardStats {
  return {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter((incident) => incident.status === 'open').length,
    criticalIncidents: incidents.filter((incident) => incident.priority === 'critical' && incident.status === 'open').length,
    incidentsLastHour: incidents.filter((incident) => isWithinLastHour(incident.receivedAtUtc)).length,
    activeDevices: devices.filter((device) => device.status === 'active' && !isDeviceOffline(device)).length,
    staleDevices: devices.filter(isDeviceOffline).length,
    nodesExceedingBaseline: 0,
  };
}

export function buildAnalyticsBars(stats: DashboardStats, systemSnapshot: SystemSnapshot | null) {
  return [
    stats.totalIncidents,
    stats.openIncidents,
    stats.criticalIncidents,
    stats.incidentsLastHour,
    stats.activeDevices,
    stats.staleDevices,
    systemSnapshot?.metrics.recoveryBacklogPending ?? 0,
  ].map((value) => Math.max(8, Math.min(100, value * 12)));
}

export function applyRealtimeIncidentToStats(currentStats: DashboardStats | null, incident: IncidentSummary) {
  if (!currentStats) {
    return currentStats;
  }

  return {
    ...currentStats,
    totalIncidents: currentStats.totalIncidents + 1,
    openIncidents: currentStats.openIncidents + (incident.status === 'open' ? 1 : 0),
    criticalIncidents: currentStats.criticalIncidents + (incident.priority === 'critical' && incident.status === 'open' ? 1 : 0),
    incidentsLastHour: currentStats.incidentsLastHour + (isWithinLastHour(incident.receivedAtUtc) ? 1 : 0),
  };
}

export function buildHistorySearchParams(filters: HistoryFilters, page: number) {
  const searchParams = new URLSearchParams({
    limit: String(HISTORY_PAGE_SIZE),
    offset: String(page * HISTORY_PAGE_SIZE),
  });

  if (filters.nodeId.trim()) searchParams.set('node_id', filters.nodeId.trim());
  if (filters.eventType.trim()) searchParams.set('event_type', filters.eventType.trim());
  if (filters.status) searchParams.set('status', filters.status);
  if (filters.priority) searchParams.set('priority', filters.priority);
  if (filters.fromDate) searchParams.set('from_ts', `${filters.fromDate}T00:00:00Z`);
  if (filters.toDate) searchParams.set('to_ts', `${filters.toDate}T23:59:59Z`);

  return searchParams;
}

export function incidentMatchesFilters(incident: IncidentSummary, filters: HistoryFilters) {
  if (filters.nodeId.trim() && !incident.nodeId?.toLowerCase().includes(filters.nodeId.trim().toLowerCase())) return false;
  if (filters.eventType.trim() && !incident.eventType.toLowerCase().includes(filters.eventType.trim().toLowerCase())) return false;
  if (filters.status && incident.status !== filters.status) return false;
  if (filters.priority && incident.priority !== filters.priority) return false;
  if (filters.fromDate && new Date(incident.receivedAtUtc) < new Date(`${filters.fromDate}T00:00:00Z`)) return false;
  if (filters.toDate && new Date(incident.receivedAtUtc) > new Date(`${filters.toDate}T23:59:59Z`)) return false;
  return true;
}

export function mergeUpdatedIncident<T extends IncidentSummary>(incidents: T[], updated: IncidentDetail) {
  return incidents.map((incident) =>
    incident.incidentId === updated.incidentId
      ? { ...incident, ...updated }
      : incident,
  );
}

export function normalizeRealtimeIncident(payload: RealtimeIncidentPayload): IncidentSummary | null {
  const incidentId = payload.incidentId ?? payload.incident_id;
  const eventType = payload.eventType ?? payload.event_type;
  const receivedAtUtc = payload.receivedAtUtc ?? payload.received_at_utc;

  if (!incidentId || !eventType || !receivedAtUtc || !payload.priority || !payload.status) {
    return null;
  }

  return {
    incidentId,
    nodeId: payload.nodeId ?? payload.node_id ?? null,
    eventType,
    confidence: Number(payload.confidence ?? 0),
    priority: payload.priority,
    status: payload.status,
    receivedAtUtc,
    locationLabel: payload.locationLabel ?? payload.location_label ?? null,
    dedupUncertain: Boolean(payload.dedupUncertain ?? payload.dedup_uncertain ?? false),
  };
}

export function getRealtimeSocketUrl() {
  if (process.env.NEXT_PUBLIC_SENTINEL_REALTIME_URL) {
    return process.env.NEXT_PUBLIC_SENTINEL_REALTIME_URL;
  }

  if (typeof window === 'undefined') {
    return '/socket';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const isLocalhost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);
  const host = isLocalhost ? `${window.location.hostname}:4000` : window.location.host;
  return `${protocol}//${host}/socket`;
}

export function getSectionCopy(view: DashboardView): DashboardPanelCopy {
  switch (view) {
    case 'map':
      return {
        map: {
          heading: 'Device Location Map',
          loadingDescription: 'Loading field device locations',
          readyDescription: 'Current device locations reported to the main system',
        },
        feeds: {
          heading: 'Mapped Device Feeds',
          loadingDescription: 'Checking the devices shown on the map',
          readyDescription: 'Status for devices currently shown on the map',
          emptyMessage: 'No mapped device feeds are available yet.',
        },
        analytics: {
          heading: 'Coverage Summary',
          description: 'How many devices are visible, online, or not reporting.',
        },
        settings: {
          heading: 'Map Data Settings',
          description: 'Shows whether device locations are updating from the main system.',
        },
      };
    case 'feeds':
      return {
        map: {
          heading: 'Device Locations',
          loadingDescription: 'Finding where devices are reporting from',
          readyDescription: 'Where visible devices currently sit in the field',
        },
        feeds: {
          heading: 'Field Device Status',
          loadingDescription: 'Checking live field device status',
          readyDescription: 'Device connection, health, and battery status',
          emptyMessage: 'No live field devices are visible from Sentinel yet.',
        },
        analytics: {
          heading: 'Device Health Summary',
          description: 'Which devices are online, not reporting, or need attention.',
        },
        settings: {
          heading: 'Device View Settings',
          description: 'Shows how often this page refreshes device status from Sentinel.',
        },
      };
    case 'analytics':
      return {
        map: {
          heading: 'Devices Counted Here',
          loadingDescription: 'Checking device health',
          readyDescription: 'Device health included in this system summary',
        },
        feeds: {
          heading: 'Device Status Counted Here',
          loadingDescription: 'Checking field device status',
          readyDescription: 'Device status currently included in this summary',
          emptyMessage: 'No device status is available for this summary yet.',
        },
        analytics: {
          heading: 'System Health Summary',
          description: 'How much data is waiting, how old it is, and whether Sentinel is slowing requests.',
        },
        settings: {
          heading: 'System Health Settings',
          description: 'Shows the connection and refresh settings behind this summary.',
        },
      };
    case 'settings':
      return {
        map: {
          heading: 'Devices This Page Can See',
          loadingDescription: 'Checking which devices this page can see',
          readyDescription: 'Devices available to this dashboard',
        },
        feeds: {
          heading: 'Device Feeds This Page Can See',
          loadingDescription: 'Checking which device feeds this page can see',
          readyDescription: 'Device feeds available to this dashboard',
          emptyMessage: 'No device feeds are visible with the current settings.',
        },
        analytics: {
          heading: 'Connection Check',
          description: 'Shows whether this dashboard can reach Sentinel and keep itself updated.',
        },
        settings: {
          heading: 'Dashboard Setup',
          description: 'Connection status, update timing, and safe server-side settings.',
        },
      };
    default:
      return {
        map: {
          heading: 'Device Map',
          loadingDescription: 'Loading field device locations',
          readyDescription: 'Current field device locations',
        },
        feeds: {
          heading: 'Field Devices',
          loadingDescription: 'Checking field device status',
          readyDescription: 'Current status for connected field devices',
          emptyMessage: 'No field devices are visible from Sentinel yet.',
        },
        analytics: {
          heading: 'System Health',
          description: 'Alerts, device status, and data waiting to be sent in one place.',
        },
        settings: {
          heading: 'Dashboard Setup',
          description: 'Connection state and page update settings.',
        },
      };
  }
}

export function getViewMeta(view: DashboardView) {
  switch (view) {
    case 'alerts':
      return {
        title: 'Active Alerts',
        description: 'Alerts that may need a person to review or respond.',
      };
    case 'map':
      return {
        title: 'Device Map',
        description: 'Where field devices are currently reporting from.',
      };
    case 'feeds':
      return {
        title: 'Field Devices',
        description: 'Device connection, battery, and health status.',
      };
    case 'analytics':
      return {
        title: 'System Health',
        description: 'A simple view of alerts, device health, and data waiting to send.',
      };
    case 'settings':
      return {
        title: 'Dashboard Setup',
        description: 'Connection state and page update settings.',
      };
    default:
      return {
        title: 'Command Center',
        description: 'Live Sentinel alerts, field devices, and system health in one place.',
      };
  }
}

export function sortIncidentsNewestFirst(incidents: IncidentSummary[]) {
  return [...incidents].sort(
    (left, right) => new Date(right.receivedAtUtc).getTime() - new Date(left.receivedAtUtc).getTime(),
  );
}

export function isDeviceOffline(device: DeviceSummary) {
  if (device.isStale) {
    return true;
  }

  if (!device.lastSeenAt) {
    return device.status !== 'active';
  }

  return Date.now() - new Date(device.lastSeenAt).getTime() > 10 * 60_000;
}

export function isWithinLastHour(value: string) {
  return Date.now() - new Date(value).getTime() <= 60 * 60_000;
}

export function getBatteryClassName(level: number | null) {
  if (level == null) return 'text-zinc-500';
  if (level <= 20) return 'text-red-300';
  if (level <= 50) return 'text-yellow-300';
  return 'text-brand-400';
}

export function formatCount(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return '--';
  }

  return String(Math.round(value)).padStart(2, '0');
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return '--';
  }

  return `${Math.round(value * 100)}%`;
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0s';
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  }

  return `${Math.round(seconds / 3600)}h`;
}

export function formatClockDrift(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return 'Unknown';
  }

  if (Math.abs(value) < 1000) {
    return `${Math.round(value)} ms`;
  }

  return `${Math.round(value / 1000)} s`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.round(diffHours / 24)}d ago`;
}

export function humanizeEventType(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to reach the main Sentinel system.';
}
