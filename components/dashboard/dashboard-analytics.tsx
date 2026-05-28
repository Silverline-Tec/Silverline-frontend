'use client';

import { motion } from 'framer-motion';
import type { DashboardStats, SystemSnapshot } from '@/lib/control-types';
import { DetailReadout } from './common';
import {
  buildAnalyticsBars,
  formatCount,
  formatDuration,
} from './utils';

export function DashboardAnalytics({
  dashboardStats,
  systemSnapshot,
  deviceOnlineRate,
  heading,
  description,
}: {
  dashboardStats: DashboardStats;
  systemSnapshot: SystemSnapshot | null;
  deviceOnlineRate: number | null;
  heading: string;
  description: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-white/[0.07] bg-[#0f1215]"
    >
      <div className="border-b border-white/[0.07] px-4 py-4">
        <h2 className="font-display text-lg font-bold text-white">{heading}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-white/[0.07]">
        <div className="border-b border-white/[0.07] p-4 lg:border-b-0">
          <h3 className="font-semibold text-zinc-100">Current System Picture</h3>
          <div className="mt-6 flex h-32 items-end justify-around gap-2">
            {buildAnalyticsBars(dashboardStats, systemSnapshot).map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: 0.05 * index, duration: 0.5 }}
                className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400 opacity-70 transition-opacity hover:opacity-100"
              />
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-zinc-500">Alerts, devices, and data waiting to be sent</div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-zinc-100">System Readiness</h3>
          <div className="mt-3">
            <DetailReadout label="Device online rate" value={deviceOnlineRate == null ? 'Unknown' : `${deviceOnlineRate}%`} />
            <DetailReadout label="Oldest waiting data" value={formatDuration(systemSnapshot?.metrics.queueBacklogOldestAgeSeconds ?? 0)} />
            <DetailReadout label="Waiting to send" value={formatCount(systemSnapshot?.metrics.recoveryBacklogPending ?? 0)} />
            <DetailReadout label="Slowed updates" value={formatCount(systemSnapshot?.metrics.ingestRateLimitedTotal ?? 0)} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
