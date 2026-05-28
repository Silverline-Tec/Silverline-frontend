'use client';

import type { IncidentSummary } from '@/lib/control-types';
import { EmptyPanel, PriorityBadge } from './common';
import { formatCount, formatPercent, formatRelativeTime, humanizeEventType } from './utils';
import { LIVE_ALERT_LIMIT } from './types';

export function LiveAlertFeed({
  incidents,
  loading,
  onIncidentClick,
}: {
  incidents: IncidentSummary[];
  loading: boolean;
  onIncidentClick: (incidentId: number) => void;
}) {
  return (
    <section className="rounded-xl border border-white/[0.07] bg-[#0f1215]">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Live Alert Feed</h2>
          <p className="mt-1 text-sm text-zinc-500">
            New alerts appear first. Showing the last {LIVE_ALERT_LIMIT}.
          </p>
        </div>
        <span className="rounded-full border border-brand-500/20 bg-brand-500/5 px-3 py-1 text-xs font-mono text-brand-400">
          {formatCount(incidents.length)} live
        </span>
      </div>

      <div className="max-h-[42rem] overflow-y-auto">
        {incidents.length > 0 ? (
          incidents.map((incident) => (
            <button
              key={incident.incidentId}
              type="button"
              onClick={() => onIncidentClick(incident.incidentId)}
              className="grid w-full gap-3 border-b border-white/[0.07] px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.04] md:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <PriorityBadge priority={incident.priority} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-medium text-zinc-100">{humanizeEventType(incident.eventType)}</h3>
                  {incident.dedupUncertain && (
                    <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-2 py-0.5 text-[11px] text-yellow-200">
                      Possible repeat
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-zinc-500">
                  Device {incident.nodeId ?? 'not assigned'} · {incident.locationLabel ?? 'unknown site'}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm font-semibold text-brand-400">{formatPercent(incident.confidence)}</p>
                <p className="text-xs font-mono text-zinc-600">{formatRelativeTime(incident.receivedAtUtc)}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="p-4">
            <EmptyPanel
              loading={loading}
              title={loading ? 'Checking for alerts' : 'No live alerts'}
              description={loading ? 'Sentinel is loading the latest alert list.' : 'No open alerts are waiting for review.'}
            />
          </div>
        )}
      </div>
    </section>
  );
}
