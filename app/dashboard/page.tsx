'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar, type DashboardView } from '@/components/dashboard-sidebar';
import { AlertsPanel } from '@/components/alerts-panel';
import { LiveCameraGrid } from '@/components/live-camera-grid';
import { TacticalMap } from '@/components/tactical-map';
import { motion } from 'framer-motion';
import { BarChart3, Activity, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import { TacticalCard } from '@/components/tactical-card';
import { readControlJson } from '@/lib/control-client';
import type {
  DashboardStats,
  DeviceSummary,
  IncidentSummary,
  SystemSnapshot,
} from '@/lib/control-types';

const REFRESH_INTERVAL_MS = 10_000;

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [devices, setDevices] = useState<DeviceSummary[]>([]);
  const [systemSnapshot, setSystemSnapshot] = useState<SystemSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const refreshDashboard = useCallback(async (mode: 'initial' | 'manual' | 'background') => {
    const requestId = ++requestRef.current;

    if (mode === 'initial') {
      setLoading(true);
    } else if (mode === 'manual') {
      setRefreshing(true);
    }

    try {
      const [statsResponse, incidentsResponse, devicesResponse, systemResponse] = await Promise.all([
        readControlJson<DashboardStats>('/api/control/stats'),
        readControlJson<IncidentSummary[]>('/api/control/incidents?limit=80'),
        readControlJson<DeviceSummary[]>('/api/control/devices'),
        readControlJson<SystemSnapshot>('/api/control/system').catch(() => null),
      ]);

      if (!mountedRef.current || requestRef.current !== requestId) {
        return;
      }

      setStats(statsResponse);
      setIncidents(incidentsResponse);
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

  const dashboardStats = stats ?? buildFallbackStats(incidents, devices);
  const openIncidents = incidents.filter((incident) => incident.status === 'open');
  const activeDevices = devices.filter((device) => device.status === 'active' && !device.isStale).length;
  const nodeUptime =
    devices.length === 0 ? null : Math.round((activeDevices / devices.length) * 1000) / 10;

  const statCards = [
    { icon: Users, label: 'Nodes Online', value: formatCount(dashboardStats.activeDevices), color: 'cyan' },
    { icon: Activity, label: 'Active Incidents', value: formatCount(dashboardStats.openIncidents), color: 'red' },
    { icon: AlertTriangle, label: 'Critical Alerts', value: formatCount(dashboardStats.criticalIncidents), color: 'yellow' },
    { icon: BarChart3, label: 'Node Uptime', value: nodeUptime == null ? '--' : `${nodeUptime}%`, color: 'green' },
  ];
  const viewMeta = getViewMeta(activeView);

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

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-60'} pt-20`}>
        <div className="p-6 max-w-7xl">
          {/* Dashboard header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-cyan-300 mb-2">{viewMeta.title}</h1>
                <p className="text-gray-400">
                  {viewMeta.description}
                </p>
                {lastSyncAt && (
                  <p className="mt-2 text-xs font-mono text-gray-500">
                    LAST CENTRAL SYNC {formatRelativeTime(lastSyncAt)}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void refreshDashboard('manual')}
                disabled={refreshing}
                className="inline-flex w-fit items-center gap-2 rounded border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-mono uppercase tracking-wider text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Sync Live
              </button>
            </div>
          </motion.div>

          {error && (
            <div className="mb-8 rounded-lg border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-100">
              <div className="font-mono text-xs uppercase tracking-wider text-red-300">Control link degraded</div>
              <p className="mt-2">{error}</p>
            </div>
          )}

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              const colorMap = {
                cyan: 'border-cyan-400/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]',
                red: 'border-red-400/30 shadow-[0_0_15px_rgba(255,23,68,0.2)]',
                yellow: 'border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
                green: 'border-green-400/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]',
              };

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div
                    className={`border rounded-lg p-6 backdrop-blur-md bg-card/40 flex items-start justify-between ${
                      colorMap[stat.color as keyof typeof colorMap]
                    } transition-all duration-300`}
                  >
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-cyan-300">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 opacity-50" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {activeView === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-1 space-y-8"
                >
                  <AlertsPanel incidents={openIncidents} loading={loading} />
                  <TacticalMap devices={devices} loading={loading} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <LiveCameraGrid devices={devices} loading={loading} />
                </motion.div>
              </div>

              <DashboardAnalytics
                dashboardStats={dashboardStats}
                systemSnapshot={systemSnapshot}
              />
            </>
          )}

          {activeView === 'alerts' && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-4xl"
            >
              <AlertsPanel incidents={openIncidents} loading={loading} />
            </motion.section>
          )}

          {activeView === 'map' && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl"
            >
              <TacticalMap devices={devices} loading={loading} />
            </motion.section>
          )}

          {activeView === 'feeds' && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <LiveCameraGrid devices={devices} loading={loading} />
            </motion.section>
          )}

          {activeView === 'analytics' && (
            <DashboardAnalytics
              dashboardStats={dashboardStats}
              systemSnapshot={systemSnapshot}
            />
          )}

          {activeView === 'settings' && (
            <DashboardSettings
              error={error}
              lastSyncAt={lastSyncAt}
              refreshing={refreshing}
              onRefresh={() => void refreshDashboard('manual')}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function buildFallbackStats(
  incidents: IncidentSummary[],
  devices: DeviceSummary[],
): DashboardStats {
  return {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter((incident) => incident.status === 'open').length,
    criticalIncidents: incidents.filter((incident) => incident.priority === 'critical').length,
    incidentsLastHour: incidents.length,
    activeDevices: devices.filter((device) => device.status === 'active').length,
    staleDevices: devices.filter((device) => device.isStale).length,
    nodesExceedingBaseline: 0,
  };
}

function buildAnalyticsBars(stats: DashboardStats, systemSnapshot: SystemSnapshot | null) {
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

function DashboardAnalytics({
  dashboardStats,
  systemSnapshot,
}: {
  dashboardStats: DashboardStats;
  systemSnapshot: SystemSnapshot | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">System Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TacticalCard glow="cyan">
          <div className="space-y-4">
            <h3 className="font-bold text-cyan-300">Control Snapshot</h3>
            <div className="h-32 flex items-end justify-around gap-2">
              {buildAnalyticsBars(dashboardStats, systemSnapshot).map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ delay: 0.05 * i, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-t opacity-50 hover:opacity-100 transition-opacity"
                />
              ))}
            </div>
            <div className="text-center text-sm text-gray-400">Incidents, nodes, and replay pressure</div>
          </div>
        </TacticalCard>

        <TacticalCard glow="green">
          <div className="space-y-4">
            <h3 className="font-bold text-cyan-300">Recovery Backlog Age</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {formatDuration(systemSnapshot?.metrics.queueBacklogOldestAgeSeconds ?? 0)}
              </div>
              <p className="text-sm text-gray-400">Oldest central recovery backlog item</p>
            </div>
            <div className="flex justify-around text-xs text-gray-400 pt-4 border-t border-cyan-400/20">
              <span>{formatCount(systemSnapshot?.metrics.recoveryBacklogPending ?? 0)} pending</span>
              <span>{formatCount(systemSnapshot?.metrics.ingestRateLimitedTotal ?? 0)} rate-limited</span>
            </div>
          </div>
        </TacticalCard>
      </div>
    </motion.div>
  );
}

function DashboardSettings({
  error,
  lastSyncAt,
  refreshing,
  onRefresh,
}: {
  error: string | null;
  lastSyncAt: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl"
    >
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">Dashboard Settings</h2>
      <TacticalCard glow={error ? 'red' : 'cyan'}>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-cyan-300">Control Backend</h3>
            <p className="mt-2 text-sm text-gray-400">
              The backend URL and dashboard API key are loaded server-side from this app&apos;s env file.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SettingReadout label="Backend state" value={error ? 'degraded' : 'reachable'} />
            <SettingReadout
              label="Last sync"
              value={lastSyncAt ? formatRelativeTime(lastSyncAt) : 'waiting'}
            />
            <SettingReadout label="Refresh cadence" value={`${REFRESH_INTERVAL_MS / 1000}s`} />
            <SettingReadout label="Routing mode" value="single route" />
          </div>

          {error && (
            <div className="rounded border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-100">
              <div className="font-mono text-xs uppercase tracking-wider text-red-300">Current backend error</div>
              <p className="mt-2">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-mono uppercase tracking-wider text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Retry Backend Link
          </button>
        </div>
      </TacticalCard>
    </motion.section>
  );
}

function SettingReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-cyan-400/20 bg-black/20 p-4">
      <p className="text-xs font-mono uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-cyan-200">{value}</p>
    </div>
  );
}

function getViewMeta(view: DashboardView) {
  switch (view) {
    case 'alerts':
      return {
        title: 'Active Alerts',
        description: 'Open Sentinel incidents requiring operator attention',
      };
    case 'map':
      return {
        title: 'Location Map',
        description: 'Field-node positioning in the current central control window',
      };
    case 'feeds':
      return {
        title: 'Field Feeds',
        description: 'Connected device feed placeholders, status, and battery telemetry',
      };
    case 'analytics':
      return {
        title: 'System Analytics',
        description: 'Central replay pressure, recovery age, and incident metrics',
      };
    case 'settings':
      return {
        title: 'Dashboard Settings',
        description: 'Runtime link state and frontend control configuration',
      };
    default:
      return {
        title: 'Command Center Dashboard',
        description: 'Live Sentinel incidents, field nodes, and control-plane telemetry',
      };
  }
}

function formatCount(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return '--';
  }

  return String(Math.round(value)).padStart(2, '0');
}

function formatDuration(seconds: number) {
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

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60_000));

  if (diffMinutes < 1) {
    return 'JUST NOW';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}M AGO`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}H AGO`;
  }

  return `${Math.round(diffHours / 24)}D AGO`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to reach the Sentinel control backend.';
}
