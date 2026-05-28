'use client';

import { PanelRightClose, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type {
  IncidentDetail,
  IncidentStatus,
} from '@/lib/control-types';
import { cn } from '@/lib/utils';
import {
  AlertDeliveryRow,
  DetailReadout,
  PriorityBadge,
  StatusBadge,
} from './common';
import type { DashboardContextSnapshot } from './types';
import {
  formatClockDrift,
  formatCount,
  formatDateTime,
  formatDuration,
  formatPercent,
  formatRelativeTime,
  humanizeEventType,
} from './utils';

export function RightSidebar({
  open,
  incident,
  loading,
  context,
  onClose,
  onClearIncident,
  onStatusChange,
}: {
  open: boolean;
  incident: IncidentDetail | null;
  loading: boolean;
  context: DashboardContextSnapshot;
  onClose: () => void;
  onClearIncident: () => void;
  onStatusChange: (incidentId: number, status: IncidentStatus) => void;
}) {
  return (
    <motion.aside
      initial={false}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="fixed right-0 top-16 z-[60] h-[calc(100vh-4rem)] w-full max-w-[28rem] border-l border-white/[0.07] bg-[#0f1215]/98 shadow-[-24px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-md"
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">
              Right panel
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-white">
              {incident ? 'Incident detail' : 'System status'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/[0.07] p-2 text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
            aria-label="Close right sidebar"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {loading && !incident ? (
            <div className="flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] p-4 text-sm text-zinc-400">
              <RefreshCw className="h-4 w-4 animate-spin text-brand-400" />
              Loading incident detail...
            </div>
          ) : incident ? (
            <IncidentDetailPanel
              incident={incident}
              onStatusChange={onStatusChange}
              onClearIncident={onClearIncident}
            />
          ) : (
            <SystemStatusPanel context={context} />
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function IncidentDetailPanel({
  incident,
  onStatusChange,
  onClearIncident,
}: {
  incident: IncidentDetail;
  onStatusChange: (incidentId: number, status: IncidentStatus) => void;
  onClearIncident: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={incident.priority} />
          <StatusBadge status={incident.status} />
          {incident.dedupUncertain && (
            <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-2 py-1 text-[11px] text-yellow-200">
              Possible repeat
            </span>
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-white">{humanizeEventType(incident.eventType)}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Device {incident.nodeId ?? 'not assigned'} · {incident.locationLabel ?? 'unknown site'}
        </p>
      </div>

      <div>
        <DetailReadout label="Event time" value={incident.eventTimeUtc ? formatDateTime(incident.eventTimeUtc) : 'Not provided'} />
        <DetailReadout label="Received time" value={formatDateTime(incident.receivedAtUtc)} />
        <DetailReadout label="Clock drift" value={formatClockDrift(incident.clockDriftMs)} />
        <DetailReadout label="Evidence" value={incident.evidenceRef ?? 'Not provided'} />
        <DetailReadout label="Certainty" value={formatPercent(incident.confidence)} />
        <DetailReadout label="Transmission count" value={String(incident.transmissionCount)} />
        <DetailReadout label="Time source" value={humanizeEventType(incident.timeSource)} />
      </div>

      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02]">
        <div className="border-b border-white/[0.07] px-4 py-3">
          <h3 className="font-semibold text-zinc-100">Linked alert deliveries</h3>
        </div>
        <div className="px-4">
          {incident.alerts.length > 0 ? (
            incident.alerts.map((alert) => <AlertDeliveryRow key={alert.id} alert={alert} />)
          ) : (
            <p className="py-4 text-sm text-zinc-500">No delivery records are linked to this incident yet.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {incident.status === 'open' && (
          <button
            type="button"
            onClick={() => onStatusChange(incident.incidentId, 'acknowledged')}
            className="rounded-md border border-yellow-400/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200 transition hover:bg-yellow-500/20"
          >
            Mark seen
          </button>
        )}
        {incident.status !== 'closed' && (
          <button
            type="button"
            onClick={() => onStatusChange(incident.incidentId, 'closed')}
            className="rounded-md border border-brand-500/20 bg-brand-500/5 px-3 py-2 text-sm text-brand-400 transition hover:bg-brand-500/10"
          >
            Close incident
          </button>
        )}
        <button
          type="button"
          onClick={onClearIncident}
          className="ml-auto rounded-md border border-white/[0.07] p-2 text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
          aria-label="Clear selected incident"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SystemStatusPanel({ context }: { context: DashboardContextSnapshot }) {
  const openIncidents = context.liveIncidents.filter((incident) => incident.status === 'open').length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-500">
        Keep this panel open while monitoring. Incident details will replace this status view when you click an alert or table row.
      </p>

      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02]">
        <StatusLine label="Live updates" value={context.socketState === 'live' ? 'Connected' : context.socketState} tone={context.socketState === 'live' ? 'good' : 'warn'} />
        <StatusLine label="Last update" value={context.lastSyncAt ? formatRelativeTime(context.lastSyncAt) : 'Waiting'} />
        <StatusLine label="Main system" value={context.error ? 'Problem detected' : 'Connected'} tone={context.error ? 'bad' : 'good'} />
      </div>

      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02]">
        <StatusLine label="Open incidents" value={formatCount(openIncidents)} />
        <StatusLine label="Active devices" value={formatCount(context.stats.activeDevices)} />
        <StatusLine label="Stale devices" value={formatCount(context.stats.staleDevices)} tone={context.stats.staleDevices > 0 ? 'warn' : 'good'} />
        <StatusLine label="Waiting to send" value={formatCount(context.systemSnapshot?.metrics.recoveryBacklogPending ?? 0)} />
        <StatusLine label="Oldest waiting data" value={formatDuration(context.systemSnapshot?.metrics.queueBacklogOldestAgeSeconds ?? 0)} />
      </div>
    </div>
  );
}

function StatusLine({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'good' | 'warn' | 'bad' | 'neutral';
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-4 py-3 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span
        className={cn(
          'text-sm font-medium',
          tone === 'good' && 'text-brand-400',
          tone === 'warn' && 'text-yellow-300',
          tone === 'bad' && 'text-red-300',
          tone === 'neutral' && 'text-zinc-200',
        )}
      >
        {value}
      </span>
    </div>
  );
}
