import type React from 'react';
import type {
  DashboardStats,
  DeviceSummary,
  IncidentPriority,
  IncidentStatus,
  IncidentSummary,
  SystemSnapshot,
} from '@/lib/control-types';

export const REFRESH_INTERVAL_MS = 10_000;
export const HISTORY_PAGE_SIZE = 20;
export const LIVE_ALERT_LIMIT = 50;

export type MetricColor = 'brand' | 'red' | 'yellow' | 'zinc';
export type SocketState = 'connecting' | 'live' | 'offline';

export interface HeaderMetric {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: MetricColor;
}

export interface HistoryFilters {
  nodeId: string;
  eventType: string;
  status: '' | IncidentStatus;
  priority: '' | IncidentPriority;
  fromDate: string;
  toDate: string;
}

export interface DashboardPanelCopy {
  map: {
    heading: string;
    loadingDescription: string;
    readyDescription: string;
  };
  feeds: {
    heading: string;
    loadingDescription: string;
    readyDescription: string;
    emptyMessage: string;
  };
  analytics: {
    heading: string;
    description: string;
  };
  settings: {
    heading: string;
    description: string;
  };
}

export interface DashboardContextSnapshot {
  stats: DashboardStats;
  devices: DeviceSummary[];
  liveIncidents: IncidentSummary[];
  systemSnapshot: SystemSnapshot | null;
  lastSyncAt: string | null;
  socketState: SocketState;
  error: string | null;
}

export type RealtimeIncidentPayload = {
  incident_id?: number;
  incidentId?: number;
  node_id?: string | null;
  nodeId?: string | null;
  event_type?: string;
  eventType?: string;
  confidence?: number;
  priority?: IncidentPriority;
  status?: IncidentStatus;
  received_at_utc?: string;
  receivedAtUtc?: string;
  location_label?: string | null;
  locationLabel?: string | null;
  dedup_uncertain?: boolean;
  dedupUncertain?: boolean;
};

export type RealtimeBacklogPayload = {
  incidents?: RealtimeIncidentPayload[];
};

export const emptyFilters: HistoryFilters = {
  nodeId: '',
  eventType: '',
  status: '',
  priority: '',
  fromDate: '',
  toDate: '',
};
