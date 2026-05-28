'use client';

import { CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertRecord, IncidentPriority, IncidentStatus } from '@/lib/control-types';
import {
  formatDateTime,
  humanizeEventType,
} from './utils';

export function PriorityBadge({ priority }: { priority: IncidentPriority }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.12em]',
        priority === 'critical' && 'border-red-400/30 bg-red-500/10 text-red-200',
        priority === 'high' && 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
        priority === 'low' && 'border-brand-500/20 bg-brand-500/5 text-brand-400',
      )}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.12em]',
        status === 'open' && 'border-red-400/30 bg-red-500/10 text-red-200',
        status === 'acknowledged' && 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
        status === 'closed' && 'border-brand-500/20 bg-brand-500/5 text-brand-400',
      )}
    >
      {status === 'acknowledged' ? 'seen' : status}
    </span>
  );
}

export function EmptyPanel({
  loading,
  title,
  description,
}: {
  loading?: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/5">
        {loading ? <RefreshCw className="h-5 w-5 animate-spin text-brand-400" /> : <CheckCircle2 className="h-5 w-5 text-brand-400" />}
      </div>
      <h3 className="font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

export function DetailReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/[0.07] py-3">
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}

export function SettingReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">{label}</p>
      <p className="mt-2 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

export function AlertDeliveryRow({ alert }: { alert: AlertRecord }) {
  return (
    <div className="border-b border-white/[0.07] py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-zinc-100">{alert.ruleName}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {humanizeEventType(alert.channel)} to {alert.recipient ?? 'default recipient'}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-1 text-[11px] font-mono uppercase tracking-[0.12em]',
            alert.status === 'delivered'
              ? 'border-brand-500/20 bg-brand-500/5 text-brand-400'
              : alert.status === 'failed'
                ? 'border-red-400/30 bg-red-500/10 text-red-200'
                : 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200',
          )}
        >
          {humanizeEventType(alert.status)}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
        <span>Triggered {formatDateTime(alert.triggeredAt)}</span>
        <span>Delivered {alert.deliveredAt ? formatDateTime(alert.deliveredAt) : 'not yet'}</span>
      </div>
      {alert.failureReason && (
        <p className="mt-2 text-xs text-red-200">{alert.failureReason}</p>
      )}
    </div>
  );
}
