'use client';

import type { DeviceSummary } from '@/lib/control-types';
import { cn } from '@/lib/utils';
import { EmptyPanel } from './common';
import { formatCount, formatRelativeTime, getBatteryClassName, isDeviceOffline } from './utils';

export function DeviceStatusPanel({
  devices,
  loading,
}: {
  devices: DeviceSummary[];
  loading: boolean;
}) {
  return (
    <section className="rounded-xl border border-white/[0.07] bg-[#0f1215]">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Device Status</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Red means a device has not reported for more than 10 minutes.
          </p>
        </div>
        <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-xs font-mono text-zinc-400">
          {formatCount(devices.length)} devices
        </span>
      </div>

      {devices.length > 0 ? (
        <div className="max-h-[42rem] overflow-y-auto">
          {devices.map((device) => {
            const offline = isDeviceOffline(device);

            return (
              <div
                key={device.nodeId}
                className="grid gap-3 border-b border-white/[0.07] px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1fr)_9rem_7rem]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-zinc-100">{device.nodeId}</h3>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
                        offline
                          ? 'border-red-400/30 bg-red-500/10 text-red-200'
                          : 'border-brand-500/20 bg-brand-500/5 text-brand-400',
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', offline ? 'bg-red-400' : 'bg-brand-400')} />
                      {offline ? 'Not reporting' : 'Online'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500">{device.locationLabel ?? 'Unknown site'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">Last seen</p>
                  <p className="mt-1 text-sm text-zinc-300">{device.lastSeenAt ? formatRelativeTime(device.lastSeenAt) : 'Never'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">Battery</p>
                  <p className={cn('mt-1 text-sm font-semibold', getBatteryClassName(device.batteryLevel))}>
                    {device.batteryLevel == null ? 'Unknown' : `${device.batteryLevel}%`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4">
          <EmptyPanel
            loading={loading}
            title={loading ? 'Checking devices' : 'No devices visible'}
            description={loading ? 'Sentinel is loading device status.' : 'No field devices are visible from Sentinel yet.'}
          />
        </div>
      )}
    </section>
  );
}
