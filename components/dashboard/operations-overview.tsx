'use client';

import type React from 'react';
import type {
  DeviceSummary,
  IncidentStatus,
  IncidentSummary,
} from '@/lib/control-types';
import { DeviceStatusPanel } from './device-status-panel';
import { IncidentHistoryTable } from './incident-history-table';
import { LiveAlertFeed } from './live-alert-feed';
import type { HistoryFilters } from './types';

export function OperationsOverview({
  devices,
  filters,
  historyIncidents,
  historyLoading,
  historyPage,
  liveIncidents,
  loading,
  onClearFilters,
  onFilterChange,
  onIncidentClick,
  onPageChange,
  onStatusChange,
}: {
  devices: DeviceSummary[];
  filters: HistoryFilters;
  historyIncidents: IncidentSummary[];
  historyLoading: boolean;
  historyPage: number;
  liveIncidents: IncidentSummary[];
  loading: boolean;
  onClearFilters: () => void;
  onFilterChange: (key: keyof HistoryFilters, value: string) => void;
  onIncidentClick: (incidentId: number) => void;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
  onStatusChange: (incidentId: number, status: IncidentStatus) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(22rem,0.78fr)_minmax(0,1.22fr)]">
        <LiveAlertFeed
          incidents={liveIncidents}
          loading={loading}
          onIncidentClick={onIncidentClick}
        />
        <DeviceStatusPanel devices={devices} loading={loading} />
      </div>

      <IncidentHistoryTable
        filters={filters}
        incidents={historyIncidents}
        loading={historyLoading}
        page={historyPage}
        onClearFilters={onClearFilters}
        onFilterChange={onFilterChange}
        onIncidentClick={onIncidentClick}
        onPageChange={onPageChange}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
