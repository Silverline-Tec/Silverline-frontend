'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Socket } from 'phoenix';

import { DashboardSidebar, type DashboardView } from '@/components/dashboard-sidebar';
import { DashboardAnalytics } from '@/components/dashboard/dashboard-analytics';
import { DashboardHeader, ConnectionError } from '@/components/dashboard/dashboard-header';
import { DashboardSettings } from '@/components/dashboard/dashboard-settings';
import { DeviceStatusPanel } from '@/components/dashboard/device-status-panel';
import { IncidentHistoryTable } from '@/components/dashboard/incident-history-table';
import { LiveAlertFeed } from '@/components/dashboard/live-alert-feed';
import { OperationsOverview } from '@/components/dashboard/operations-overview';
import { RightSidebar } from '@/components/dashboard/right-sidebar';
import { StatsStrip } from '@/components/dashboard/stats-strip';
import {
  emptyFilters,
  HISTORY_PAGE_SIZE,
  LIVE_ALERT_LIMIT,
  REFRESH_INTERVAL_MS,
  type HistoryFilters,
  type RealtimeBacklogPayload,
  type RealtimeIncidentPayload,
  type SocketState,
} from '@/components/dashboard/types';
import {
  applyRealtimeIncidentToStats,
  buildFallbackStats,
  buildHistorySearchParams,
  buildStatsStrip,
  getErrorMessage,
  getRealtimeSocketUrl,
  getSectionCopy,
  getViewMeta,
  incidentMatchesFilters,
  isDeviceOffline,
  mergeUpdatedIncident,
  normalizeRealtimeIncident,
  sortIncidentsNewestFirst,
} from '@/components/dashboard/utils';
import { LiveCameraGrid } from '@/components/live-camera-grid';
import { Navbar } from '@/components/navbar';
import { TacticalMap } from '@/components/tactical-map';
import { readControlJson, writeControlJson } from '@/lib/control-client';
import type {
  DashboardStats,
  DeviceSummary,
  IncidentDetail,
  IncidentStatus,
  IncidentSummary,
  SystemSnapshot,
} from '@/lib/control-types';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveIncidents, setLiveIncidents] = useState<IncidentSummary[]>([]);
  const [historyIncidents, setHistoryIncidents] = useState<IncidentSummary[]>([]);
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [systemSnapshot, setSystemSnapshot] = useState<SystemSnapshot | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);
  const [selectedIncidentLoading, setSelectedIncidentLoading] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>(emptyFilters);
  const [historyPage, setHistoryPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketState, setSocketState] = useState<SocketState>('connecting');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);
  const filtersRef = useRef(filters);
  const historyPageRef = useRef(historyPage);

  const refreshDashboard = useCallback(async (mode: 'initial' | 'manual' | 'background') => {
    const requestId = ++requestRef.current;

    if (mode === 'initial') {
      setLoading(true);
    } else if (mode === 'manual') {
      setRefreshing(true);
    }

    try {
      const [statsResponse, liveResponse, devicesResponse, systemResponse] = await Promise.all([
        readControlJson<DashboardStats>('/api/control/stats'),
        readControlJson<IncidentSummary[]>(`/api/control/incidents?limit=${LIVE_ALERT_LIMIT}`),
        readControlJson<DeviceSummary[]>('/api/control/devices'),
        readControlJson<SystemSnapshot>('/api/control/system').catch(() => null),
      ]);

      if (!mountedRef.current || requestRef.current !== requestId) {
        return;
      }

      setStats(statsResponse);
      setLiveIncidents(sortIncidentsNewestFirst(liveResponse).slice(0, LIVE_ALERT_LIMIT));
      setDevices(devicesResponse);
      setSystemSnapshot(systemResponse);
      setError(null);
      setLastSyncAt(new Date().toISOString());
    } catch (refreshError) {
      if (!mountedRef.current || requestRef.current !== requestId) {
        return;
      }

      setError(getErrorMessage(refreshError));
    } finally {
      if (!mountedRef.current || requestRef.current !== requestId) {
        return;
      }

      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const incidents = await readControlJson<IncidentSummary[]>(
        `/api/control/incidents?${buildHistorySearchParams(filters, historyPage).toString()}`,
      );

      if (!mountedRef.current) {
        return;
      }

      setHistoryIncidents(sortIncidentsNewestFirst(incidents));
    } catch (historyError) {
      if (!mountedRef.current) {
        return;
      }

      setError(getErrorMessage(historyError));
    } finally {
      if (mountedRef.current) {
        setHistoryLoading(false);
      }
    }
  }, [filters, historyPage]);

  useEffect(() => {
    void refreshDashboard('initial');

    const intervalId = window.setInterval(() => {
      void refreshDashboard('background');
    }, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [refreshDashboard]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    historyPageRef.current = historyPage;
  }, [historyPage]);

  useEffect(() => {
    setSocketState('connecting');

    const socket = new Socket(getRealtimeSocketUrl());
    socket.connect();

    const channel = socket.channel('incidents:live', {});

    channel.on('backlog', (payload: RealtimeBacklogPayload) => {
      const backlog = (payload.incidents ?? [])
        .map(normalizeRealtimeIncident)
        .filter((incident): incident is IncidentSummary => incident != null);

      setLiveIncidents(sortIncidentsNewestFirst(backlog).slice(0, LIVE_ALERT_LIMIT));
    });

    channel.on('new_incident', (payload: RealtimeIncidentPayload) => {
      const incoming = normalizeRealtimeIncident(payload);
      if (!incoming) {
        return;
      }

      setLiveIncidents((current) => {
        if (current.some((incident) => incident.incidentId === incoming.incidentId)) {
          return current;
        }

        setStats((currentStats) => applyRealtimeIncidentToStats(currentStats, incoming));
        setHistoryIncidents((currentHistory) =>
          historyPageRef.current === 0 && incidentMatchesFilters(incoming, filtersRef.current)
            ? [incoming, ...currentHistory.filter((incident) => incident.incidentId !== incoming.incidentId)].slice(0, HISTORY_PAGE_SIZE)
            : currentHistory,
        );
        setLastSyncAt(new Date().toISOString());

        return [incoming, ...current].slice(0, LIVE_ALERT_LIMIT);
      });
    });

    channel
      .join()
      .receive('ok', () => setSocketState('live'))
      .receive('error', () => setSocketState('offline'))
      .receive('timeout', () => setSocketState('offline'));

    socket.onError(() => setSocketState('offline'));
    socket.onOpen(() => setSocketState('live'));
    socket.onClose(() => setSocketState('offline'));

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  const dashboardStats = stats ?? buildFallbackStats(liveIncidents, devices);
  const openIncidents = liveIncidents.filter((incident) => incident.status === 'open');
  const activeDevices = devices.filter((device) => device.status === 'active' && !isDeviceOffline(device)).length;
  const deviceOnlineRate =
    devices.length === 0 ? null : Math.round((activeDevices / devices.length) * 1000) / 10;
  const viewMeta = getViewMeta(activeView);
  const sectionCopy = getSectionCopy(activeView);
  const statsStrip = buildStatsStrip(dashboardStats);

  const openIncidentDetail = useCallback(async (incidentId: number) => {
    setRightSidebarOpen(true);
    setSelectedIncidentLoading(true);

    try {
      const incident = await readControlJson<IncidentDetail>(`/api/control/incidents/${incidentId}`);
      setSelectedIncident(incident);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
    } finally {
      setSelectedIncidentLoading(false);
    }
  }, []);

  const updateIncidentStatus = useCallback(async (incidentId: number, status: IncidentStatus) => {
    try {
      const updated = await writeControlJson<IncidentDetail>(
        `/api/control/incidents/${incidentId}/status`,
        'PATCH',
        { status },
      );

      setLiveIncidents((current) => mergeUpdatedIncident(current, updated));
      setHistoryIncidents((current) => mergeUpdatedIncident(current, updated));
      setSelectedIncident((current) => (current?.incidentId === updated.incidentId ? updated : current));
      void refreshDashboard('background');
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    }
  }, [refreshDashboard]);

  const setFilter = (key: keyof HistoryFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setHistoryPage(0);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setHistoryPage(0);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="hidden md:block">
        <DashboardSidebar
          activeView={activeView}
          onCollapse={setSidebarCollapsed}
          onViewChange={setActiveView}
        />
      </div>

      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-60'} ${
          rightSidebarOpen ? 'xl:mr-[28rem]' : ''
        } pt-20`}
      >
        <div className="max-w-[96rem] p-4 sm:p-6">
          <DashboardHeader
            title={viewMeta.title}
            description={viewMeta.description}
            lastSyncAt={lastSyncAt}
            refreshing={refreshing}
            socketState={socketState}
            rightSidebarOpen={rightSidebarOpen}
            onRefresh={() => void refreshDashboard('manual')}
            onToggleRightSidebar={() => setRightSidebarOpen((current) => !current)}
          />

          {error && <ConnectionError message={error} />}

          <StatsStrip metrics={statsStrip} />

          {activeView === 'overview' && (
            <OperationsOverview
              devices={devices}
              filters={filters}
              historyIncidents={historyIncidents}
              historyLoading={historyLoading}
              historyPage={historyPage}
              liveIncidents={openIncidents}
              loading={loading}
              onClearFilters={clearFilters}
              onFilterChange={setFilter}
              onIncidentClick={openIncidentDetail}
              onPageChange={setHistoryPage}
              onStatusChange={updateIncidentStatus}
            />
          )}

          {activeView === 'alerts' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
              <LiveAlertFeed
                incidents={openIncidents}
                loading={loading}
                onIncidentClick={openIncidentDetail}
              />
              <IncidentHistoryTable
                filters={filters}
                incidents={historyIncidents}
                loading={historyLoading}
                page={historyPage}
                onClearFilters={clearFilters}
                onFilterChange={setFilter}
                onIncidentClick={openIncidentDetail}
                onPageChange={setHistoryPage}
                onStatusChange={updateIncidentStatus}
              />
            </div>
          )}

          {activeView === 'map' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(22rem,0.7fr)_minmax(0,1.3fr)]">
              <TacticalMap devices={devices} loading={loading} {...sectionCopy.map} />
              <DeviceStatusPanel devices={devices} loading={loading} />
            </div>
          )}

          {activeView === 'feeds' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(0,1.2fr)]">
              <DeviceStatusPanel devices={devices} loading={loading} />
              <LiveCameraGrid devices={devices} loading={loading} {...sectionCopy.feeds} />
            </div>
          )}

          {activeView === 'analytics' && (
            <DashboardAnalytics
              dashboardStats={dashboardStats}
              systemSnapshot={systemSnapshot}
              deviceOnlineRate={deviceOnlineRate}
              {...sectionCopy.analytics}
            />
          )}

          {activeView === 'settings' && (
            <DashboardSettings
              error={error}
              lastSyncAt={lastSyncAt}
              refreshing={refreshing}
              socketState={socketState}
              onRefresh={() => void refreshDashboard('manual')}
              {...sectionCopy.settings}
            />
          )}
        </div>
      </div>

      <RightSidebar
        open={rightSidebarOpen}
        incident={selectedIncident}
        loading={selectedIncidentLoading}
        context={{
          stats: dashboardStats,
          devices,
          liveIncidents,
          systemSnapshot,
          lastSyncAt,
          socketState,
          error,
        }}
        onClose={() => setRightSidebarOpen(false)}
        onClearIncident={() => setSelectedIncident(null)}
        onStatusChange={updateIncidentStatus}
      />
    </main>
  );
}
