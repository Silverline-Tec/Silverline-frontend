'use client';

import { Search } from 'lucide-react';
import type React from 'react';
import type { IncidentStatus, IncidentSummary } from '@/lib/control-types';
import { PriorityBadge, StatusBadge } from './common';
import type { HistoryFilters } from './types';
import { HISTORY_PAGE_SIZE } from './types';
import { formatRelativeTime, humanizeEventType } from './utils';

export function IncidentHistoryTable({
  filters,
  incidents,
  loading,
  page,
  onClearFilters,
  onFilterChange,
  onIncidentClick,
  onPageChange,
  onStatusChange,
}: {
  filters: HistoryFilters;
  incidents: IncidentSummary[];
  loading: boolean;
  page: number;
  onClearFilters: () => void;
  onFilterChange: (key: keyof HistoryFilters, value: string) => void;
  onIncidentClick: (incidentId: number) => void;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
  onStatusChange: (incidentId: number, status: IncidentStatus) => void;
}) {
  const canGoNext = incidents.length === HISTORY_PAGE_SIZE;

  return (
    <section className="rounded-xl border border-white/[0.07] bg-[#0f1215]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] px-4 py-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Incident History</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Search older incidents and mark alerts as seen or closed.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
        >
          <Search className="h-4 w-4" />
          Clear Filters
        </button>
      </div>

      <div className="grid gap-3 border-b border-white/[0.07] p-4 md:grid-cols-2 xl:grid-cols-6">
        <FilterInput
          label="Device"
          value={filters.nodeId}
          placeholder="node-12"
          onChange={(value) => onFilterChange('nodeId', value)}
        />
        <FilterInput
          label="Alert type"
          value={filters.eventType}
          placeholder="motion"
          onChange={(value) => onFilterChange('eventType', value)}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={['open', 'acknowledged', 'closed']}
          onChange={(value) => onFilterChange('status', value)}
        />
        <FilterSelect
          label="Priority"
          value={filters.priority}
          options={['low', 'high', 'critical']}
          onChange={(value) => onFilterChange('priority', value)}
        />
        <FilterInput
          label="From"
          value={filters.fromDate}
          type="date"
          onChange={(value) => onFilterChange('fromDate', value)}
        />
        <FilterInput
          label="To"
          value={filters.toDate}
          type="date"
          onChange={(value) => onFilterChange('toDate', value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/[0.07] text-sm">
          <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.12em] text-zinc-600">
            <tr>
              <th className="px-4 py-3 text-left font-mono">Priority</th>
              <th className="px-4 py-3 text-left font-mono">Alert type</th>
              <th className="px-4 py-3 text-left font-mono">Device</th>
              <th className="px-4 py-3 text-left font-mono">Location</th>
              <th className="px-4 py-3 text-left font-mono">Status</th>
              <th className="px-4 py-3 text-left font-mono">Repeat</th>
              <th className="px-4 py-3 text-left font-mono">Received</th>
              <th className="px-4 py-3 text-right font-mono">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.07]">
            {incidents.length > 0 ? (
              incidents.map((incident) => (
                <tr
                  key={incident.incidentId}
                  onClick={() => onIncidentClick(incident.incidentId)}
                  className="cursor-pointer transition hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3"><PriorityBadge priority={incident.priority} /></td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{humanizeEventType(incident.eventType)}</td>
                  <td className="px-4 py-3 text-zinc-300">{incident.nodeId ?? 'Not assigned'}</td>
                  <td className="px-4 py-3 text-zinc-500">{incident.locationLabel ?? 'Unknown site'}</td>
                  <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                  <td className="px-4 py-3">
                    {incident.dedupUncertain ? (
                      <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-2 py-1 text-[11px] text-yellow-200">
                        Possible repeat
                      </span>
                    ) : (
                      <span className="text-zinc-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatRelativeTime(incident.receivedAtUtc)}</td>
                  <td className="px-4 py-3">
                    <InlineStatusActions incident={incident} onStatusChange={onStatusChange} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">
                  {loading ? 'Loading incident history...' : 'No incidents match the current filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-zinc-500">Page {page + 1}</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => onPageChange((current) => Math.max(0, current - 1))}
            className="rounded-md border border-white/[0.07] px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!canGoNext || loading}
            onClick={() => onPageChange((current) => current + 1)}
            className="rounded-md border border-white/[0.07] px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-white/[0.07] bg-[#151a1e] px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-brand-500/50"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-white/[0.07] bg-[#151a1e] px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-brand-500/50"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{humanizeEventType(option)}</option>
        ))}
      </select>
    </label>
  );
}

function InlineStatusActions({
  incident,
  onStatusChange,
}: {
  incident: IncidentSummary;
  onStatusChange: (incidentId: number, status: IncidentStatus) => void;
}) {
  return (
    <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
      {incident.status === 'open' && (
        <button
          type="button"
          onClick={() => onStatusChange(incident.incidentId, 'acknowledged')}
          className="rounded-md border border-yellow-400/30 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-200 transition hover:bg-yellow-500/20"
        >
          Seen
        </button>
      )}
      {incident.status !== 'closed' && (
        <button
          type="button"
          onClick={() => onStatusChange(incident.incidentId, 'closed')}
          className="rounded-md border border-brand-500/20 bg-brand-500/5 px-2 py-1 text-xs text-brand-400 transition hover:bg-brand-500/10"
        >
          Close
        </button>
      )}
    </div>
  );
}
