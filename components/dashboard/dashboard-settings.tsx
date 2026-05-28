'use client';

import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { SettingReadout } from './common';
import type { SocketState } from './types';
import { REFRESH_INTERVAL_MS } from './types';
import { formatRelativeTime } from './utils';

export function DashboardSettings({
  error,
  lastSyncAt,
  refreshing,
  socketState,
  onRefresh,
  heading,
  description,
}: {
  error: string | null;
  lastSyncAt: string | null;
  refreshing: boolean;
  socketState: SocketState;
  onRefresh: () => void;
  heading: string;
  description: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl rounded-xl border border-white/[0.07] bg-[#0f1215]"
    >
      <div className="border-b border-white/[0.07] px-4 py-4">
        <h2 className="font-display text-lg font-bold text-white">{heading}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <div className="space-y-6 p-4">
        <div>
          <h3 className="font-semibold text-zinc-100">Main System Connection</h3>
          <p className="mt-2 text-sm text-zinc-500">
            The dashboard connects to Sentinel using saved settings. The secret key stays on the server.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SettingReadout label="Connection state" value={error ? 'problem detected' : 'connected'} />
          <SettingReadout label="Live updates" value={socketState === 'live' ? 'connected' : socketState} />
          <SettingReadout label="Last update" value={lastSyncAt ? formatRelativeTime(lastSyncAt) : 'waiting'} />
          <SettingReadout label="Auto refresh" value={`${REFRESH_INTERVAL_MS / 1000}s`} />
        </div>

        {error && (
          <div className="rounded border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-red-300">Current connection error</div>
            <p className="mt-2">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border border-brand-500/20 bg-brand-500/5 px-4 py-2 text-xs font-mono uppercase tracking-[0.12em] text-brand-400 transition hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Try Connection Again
        </button>
      </div>
    </motion.section>
  );
}
