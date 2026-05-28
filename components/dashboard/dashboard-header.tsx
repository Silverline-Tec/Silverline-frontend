'use client';

import { PanelRight, RefreshCw, Signal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SocketState } from './types';
import { formatRelativeTime } from './utils';

export function DashboardHeader({
  title,
  description,
  lastSyncAt,
  refreshing,
  socketState,
  rightSidebarOpen,
  onRefresh,
  onToggleRightSidebar,
}: {
  title: string;
  description: string;
  lastSyncAt: string | null;
  refreshing: boolean;
  socketState: SocketState;
  rightSidebarOpen: boolean;
  onRefresh: () => void;
  onToggleRightSidebar: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <SocketBadge state={socketState} />
            {lastSyncAt && (
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-600">
                Updated {formatRelativeTime(lastSyncAt)}
              </span>
            )}
          </div>
          <h1 className="font-display mb-2 text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">
            {title}
          </h1>
          <p className="max-w-3xl text-zinc-400">{description}</p>
          <div className="mt-4 h-px bg-gradient-to-r from-brand-500/20 via-brand-500/5 to-transparent" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleRightSidebar}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] transition',
              rightSidebarOpen
                ? 'border-brand-500/30 bg-brand-500/10 text-brand-400'
                : 'border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
            )}
          >
            <PanelRight className="h-4 w-4" />
            Details
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-md border border-brand-500/20 bg-brand-500/5 px-3 py-2 text-xs font-mono uppercase tracking-[0.12em] text-brand-400 transition hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SocketBadge({ state }: { state: SocketState }) {
  const label =
    state === 'live'
      ? 'Live updates on'
      : state === 'connecting'
        ? 'Connecting live updates'
        : 'Live updates offline';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-[0.12em]',
        state === 'live' && 'border-brand-500/20 bg-brand-500/5 text-brand-400',
        state === 'connecting' && 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
        state === 'offline' && 'border-red-400/30 bg-red-500/10 text-red-200',
      )}
    >
      <Signal className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function ConnectionError({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-red-300">
        Main system connection problem
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
}
