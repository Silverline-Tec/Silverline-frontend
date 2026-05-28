'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar, type DashboardView } from '@/components/dashboard-sidebar';
import { AlertsPanel } from '@/components/alerts-panel';
import { LiveCameraGrid } from '@/components/live-camera-grid';
import { TacticalMap } from '@/components/tactical-map';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Battery,
  Clock,
  Database,
  Gauge,
  type LucideIcon,
  MapPin,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
  Wifi,
} from 'lucide-react';
import { TacticalCard } from '@/components/tactical-card';
import { readControlJson } from '@/lib/control-client';
import type {
  DashboardStats,
  DeviceSummary,
  IncidentSummary,
  SystemSnapshot,
} from '@/lib/control-types';

const REFRESH_INTERVAL_MS = 10_000;

type AlertsPanelCopy = Pick<
  React.ComponentProps<typeof AlertsPanel>,
  'heading' | 'loadingDescription' | 'countDescription' | 'emptyStatus' | 'emptyMessage'
>;
type TacticalMapCopy = Pick<
  React.ComponentProps<typeof TacticalMap>,
  'heading' | 'loadingDescription' | 'readyDescription'
>;
type LiveFeedCopy = Pick<
  React.ComponentProps<typeof LiveCameraGrid>,
  'heading' | 'loadingDescription' | 'readyDescription' | 'emptyMessage'
>;

interface SectionCopy {
  alerts: AlertsPanelCopy;
  map: TacticalMapCopy;
  feeds: LiveFeedCopy;
  analytics: {
    heading: string;
    description: string;
  };
  settings: {
    heading: string;
    description: string;
  };
}

type MetricColor = 'cyan' | 'red' | 'yellow' | 'green';

interface HeaderMetric {
  icon: LucideIcon;
  label: string;
  value: string;
  color: MetricColor;
}

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
  const statCards = buildHeaderMetrics({
    view: activeView,
    dashboardStats,
    devices,
    incidents,
    openIncidents,
    nodeUptime,
    systemSnapshot,
    error,
    lastSyncAt,
  });
  const viewMeta = getViewMeta(activeView);
  const sectionCopy = getSectionCopy(activeView);

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
                    LAST UPDATE FROM MAIN SYSTEM {formatRelativeTime(lastSyncAt)}
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
                Refresh Now
              </button>
            </div>
          </motion.div>

          {error && (
            <div className="mb-8 rounded-lg border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-100">
              <div className="font-mono text-xs uppercase tracking-wider text-red-300">Main system connection problem</div>
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
              const colorMap: Record<MetricColor, string> = {
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
                      colorMap[stat.color]
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
                  <AlertsPanel incidents={openIncidents} loading={loading} {...sectionCopy.alerts} />
                  <TacticalMap devices={devices} loading={loading} {...sectionCopy.map} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <LiveCameraGrid devices={devices} loading={loading} {...sectionCopy.feeds} />
                </motion.div>
              </div>

              <DashboardAnalytics
                dashboardStats={dashboardStats}
                systemSnapshot={systemSnapshot}
                {...sectionCopy.analytics}
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
              <AlertsPanel incidents={openIncidents} loading={loading} {...sectionCopy.alerts} />
            </motion.section>
          )}

          {activeView === 'map' && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="max-w-3xl"
            >
              <TacticalMap devices={devices} loading={loading} {...sectionCopy.map} />
            </motion.section>
          )}

          {activeView === 'feeds' && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <LiveCameraGrid devices={devices} loading={loading} {...sectionCopy.feeds} />
            </motion.section>
          )}

          {activeView === 'analytics' && (
            <DashboardAnalytics
              dashboardStats={dashboardStats}
              systemSnapshot={systemSnapshot}
              {...sectionCopy.analytics}
            />
          )}

          {activeView === 'settings' && (
            <DashboardSettings
              error={error}
              lastSyncAt={lastSyncAt}
              refreshing={refreshing}
              onRefresh={() => void refreshDashboard('manual')}
              {...sectionCopy.settings}
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

function buildHeaderMetrics({
  view,
  dashboardStats,
  devices,
  incidents,
  openIncidents,
  nodeUptime,
  systemSnapshot,
  error,
  lastSyncAt,
}: {
  view: DashboardView;
  dashboardStats: DashboardStats;
  devices: DeviceSummary[];
  incidents: IncidentSummary[];
  openIncidents: IncidentSummary[];
  nodeUptime: number | null;
  systemSnapshot: SystemSnapshot | null;
  error: string | null;
  lastSyncAt: string | null;
}): HeaderMetric[] {
  const criticalOpen = openIncidents.filter((incident) => incident.priority === 'critical').length;
  const dedupWatch = incidents.filter((incident) => incident.dedupUncertain).length;
  const staleDevices = devices.filter((device) => device.isStale).length;
  const needsReviewDevices = devices.filter((device) => device.status === 'needs_review').length;
  const knownBatteryLevels = devices
    .map((device) => device.batteryLevel)
    .filter((level): level is number => typeof level === 'number' && Number.isFinite(level));
  const averageBattery =
    knownBatteryLevels.length === 0
      ? null
      : Math.round(knownBatteryLevels.reduce((sum, level) => sum + level, 0) / knownBatteryLevels.length);
  const backlogPending = systemSnapshot?.metrics.recoveryBacklogPending ?? 0;
  const backlogAgeSeconds = systemSnapshot?.metrics.queueBacklogOldestAgeSeconds ?? 0;
  const rateLimitedTotal = systemSnapshot?.metrics.ingestRateLimitedTotal ?? 0;
  const authFailuresTotal = systemSnapshot?.metrics.ingestAuthFailuresTotal ?? 0;
  const baselineBreaches = systemSnapshot?.metrics.nodesExceedingBaseline ?? dashboardStats.nodesExceedingBaseline;

  switch (view) {
    case 'alerts':
      return [
        { icon: Activity, label: 'Open Alerts', value: formatCount(openIncidents.length), color: 'red' },
        { icon: AlertTriangle, label: 'Critical Alerts', value: formatCount(criticalOpen), color: 'yellow' },
        { icon: Clock, label: 'New This Hour', value: formatCount(dashboardStats.incidentsLastHour), color: 'cyan' },
        { icon: ShieldCheck, label: 'Possible Repeats', value: formatCount(dedupWatch), color: dedupWatch > 0 ? 'yellow' : 'green' },
      ];
    case 'map':
      return [
        { icon: MapPin, label: 'Devices Shown', value: formatCount(devices.length), color: 'cyan' },
        { icon: Users, label: 'Devices Online', value: formatCount(dashboardStats.activeDevices), color: 'green' },
        { icon: AlertTriangle, label: 'Not Reporting', value: formatCount(staleDevices), color: staleDevices > 0 ? 'yellow' : 'green' },
        { icon: Gauge, label: 'Online Rate', value: nodeUptime == null ? '--' : `${nodeUptime}%`, color: 'cyan' },
      ];
    case 'feeds':
      return [
        { icon: Radio, label: 'Live Devices', value: formatCount(dashboardStats.activeDevices), color: 'cyan' },
        { icon: AlertTriangle, label: 'Not Reporting', value: formatCount(staleDevices), color: staleDevices > 0 ? 'yellow' : 'green' },
        { icon: Battery, label: 'Average Battery', value: averageBattery == null ? '--' : `${averageBattery}%`, color: averageBattery != null && averageBattery < 30 ? 'red' : 'green' },
        { icon: ShieldCheck, label: 'Needs Check', value: formatCount(needsReviewDevices), color: needsReviewDevices > 0 ? 'yellow' : 'green' },
      ];
    case 'analytics':
      return [
        { icon: Database, label: 'Waiting To Send', value: formatCount(backlogPending), color: backlogPending > 0 ? 'yellow' : 'green' },
        { icon: Clock, label: 'Waiting Time', value: formatDuration(backlogAgeSeconds), color: backlogAgeSeconds > 60 ? 'yellow' : 'cyan' },
        { icon: Gauge, label: 'Slowed Requests', value: formatCount(rateLimitedTotal), color: rateLimitedTotal > 0 ? 'yellow' : 'green' },
        { icon: BarChart3, label: 'Unusual Devices', value: formatCount(baselineBreaches), color: baselineBreaches > 0 ? 'red' : 'green' },
      ];
    case 'settings':
      return [
        { icon: Server, label: 'Main System', value: error ? 'DOWN' : 'OK', color: error ? 'red' : 'green' },
        { icon: Wifi, label: 'Last Update', value: lastSyncAt ? formatRelativeTime(lastSyncAt) : 'WAITING', color: lastSyncAt ? 'cyan' : 'yellow' },
        { icon: RefreshCw, label: 'Auto Refresh', value: `${REFRESH_INTERVAL_MS / 1000}s`, color: 'cyan' },
        { icon: ShieldCheck, label: 'Security Blocks', value: formatCount(authFailuresTotal), color: authFailuresTotal > 0 ? 'red' : 'green' },
      ];
    default:
      return [
        { icon: Users, label: 'Devices Online', value: formatCount(dashboardStats.activeDevices), color: 'cyan' },
        { icon: Activity, label: 'Open Alerts', value: formatCount(dashboardStats.openIncidents), color: 'red' },
        { icon: AlertTriangle, label: 'Critical Alerts', value: formatCount(dashboardStats.criticalIncidents), color: 'yellow' },
        { icon: BarChart3, label: 'Online Rate', value: nodeUptime == null ? '--' : `${nodeUptime}%`, color: 'green' },
      ];
  }
}

function DashboardAnalytics({
  dashboardStats,
  systemSnapshot,
  heading,
  description,
}: {
  dashboardStats: DashboardStats;
  systemSnapshot: SystemSnapshot | null;
  heading: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-cyan-300">{heading}</h2>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TacticalCard glow="cyan">
          <div className="space-y-4">
            <h3 className="font-bold text-cyan-300">Current System Picture</h3>
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
            <div className="text-center text-sm text-gray-400">Alerts, devices, and data waiting to be sent</div>
          </div>
        </TacticalCard>

        <TacticalCard glow="green">
          <div className="space-y-4">
            <h3 className="font-bold text-cyan-300">Oldest Waiting Data</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {formatDuration(systemSnapshot?.metrics.queueBacklogOldestAgeSeconds ?? 0)}
              </div>
              <p className="text-sm text-gray-400">Oldest item still waiting for the main system</p>
            </div>
            <div className="flex justify-around text-xs text-gray-400 pt-4 border-t border-cyan-400/20">
              <span>{formatCount(systemSnapshot?.metrics.recoveryBacklogPending ?? 0)} waiting</span>
              <span>{formatCount(systemSnapshot?.metrics.ingestRateLimitedTotal ?? 0)} slowed</span>
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
  heading,
  description,
}: {
  error: string | null;
  lastSyncAt: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  heading: string;
  description: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-cyan-300">{heading}</h2>
        <p className="mt-2 text-sm text-gray-400">{description}</p>
      </div>
      <TacticalCard glow={error ? 'red' : 'cyan'}>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-cyan-300">Main System Connection</h3>
            <p className="mt-2 text-sm text-gray-400">
              The dashboard connects to Sentinel using saved settings. The secret key stays on the server.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SettingReadout label="Connection state" value={error ? 'problem detected' : 'connected'} />
            <SettingReadout
              label="Last update"
              value={lastSyncAt ? formatRelativeTime(lastSyncAt) : 'waiting'}
            />
            <SettingReadout label="Auto refresh" value={`${REFRESH_INTERVAL_MS / 1000}s`} />
            <SettingReadout label="Page style" value="single page" />
          </div>

          {error && (
            <div className="rounded border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-100">
              <div className="font-mono text-xs uppercase tracking-wider text-red-300">Current connection error</div>
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
            Try Connection Again
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

function getSectionCopy(view: DashboardView): SectionCopy {
  switch (view) {
    case 'alerts':
      return {
        alerts: {
          heading: 'Alerts Needing Attention',
          loadingDescription: 'Checking for open alerts',
          countDescription: (count) => `${count} open alert${count !== 1 ? 's' : ''} may need review`,
          emptyStatus: '✓ NO OPEN ALERTS',
          emptyMessage: 'No alerts are waiting for operator action',
        },
        map: {
          heading: 'Where Alerts Started',
          loadingDescription: 'Finding the devices linked to these alerts',
          readyDescription: 'Device locations linked to current alerts',
        },
        feeds: {
          heading: 'Devices Behind These Alerts',
          loadingDescription: 'Checking the devices linked to these alerts',
          readyDescription: 'Field devices linked to current alerts',
          emptyMessage: 'No device feeds are attached to the current alerts.',
        },
        analytics: {
          heading: 'Alert Summary',
          description: 'How many alerts are open, how serious they are, and whether the system is keeping up.',
        },
        settings: {
          heading: 'Alert Delivery Settings',
          description: 'Shows whether the main system is ready to send and manage operator alerts.',
        },
      };
    case 'map':
      return {
        alerts: {
          heading: 'Alerts With Locations',
          loadingDescription: 'Checking alerts with device locations',
          countDescription: (count) => `${count} alert${count !== 1 ? 's' : ''} linked to mapped devices`,
          emptyStatus: '✓ NO LOCATION ALERTS',
          emptyMessage: 'No mapped devices have active alerts right now',
        },
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
        alerts: {
          heading: 'Alerts From Devices',
          loadingDescription: 'Checking alerts linked to field devices',
          countDescription: (count) => `${count} feed-linked alert${count !== 1 ? 's' : ''} requiring review`,
          emptyStatus: '✓ FEEDS QUIET',
          emptyMessage: 'No connected feeds are producing active alerts',
        },
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
        alerts: {
          heading: 'Alerts Counted Here',
          loadingDescription: 'Counting current alerts',
          countDescription: (count) => `${count} alert${count !== 1 ? 's' : ''} included in this summary`,
          emptyStatus: '✓ NO ACTIVE ALERTS',
          emptyMessage: 'There are no active alerts affecting the system summary',
        },
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
        alerts: {
          heading: 'Connection Alerts',
          loadingDescription: 'Checking for connection-related alerts',
          countDescription: (count) => `${count} connection alert${count !== 1 ? 's' : ''}`,
          emptyStatus: '✓ CONNECTION LOOKS GOOD',
          emptyMessage: 'No connection alerts are visible from Sentinel',
        },
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
        alerts: {
          heading: 'Priority Alerts',
          loadingDescription: 'Checking current alerts',
          countDescription: (count) => `${count} alert${count !== 1 ? 's' : ''} requiring attention`,
          emptyStatus: '✓ ALL SYSTEMS NORMAL',
          emptyMessage: 'No active alerts at this time',
        },
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

function getViewMeta(view: DashboardView) {
  switch (view) {
    case 'alerts':
      return {
        title: 'Active Alerts',
        description: 'Alerts that may need a person to review or respond',
      };
    case 'map':
      return {
        title: 'Device Map',
        description: 'Where field devices are currently reporting from',
      };
    case 'feeds':
      return {
        title: 'Field Devices',
        description: 'Device connection, battery, and health status',
      };
    case 'analytics':
      return {
        title: 'System Health',
        description: 'A simple view of alerts, device health, and data waiting to send',
      };
    case 'settings':
      return {
        title: 'Dashboard Setup',
        description: 'Connection state and page update settings',
      };
    default:
      return {
        title: 'Command Center',
        description: 'Live Sentinel alerts, field devices, and system health in one place',
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

  return 'Unable to reach the main Sentinel system.';
}
