'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'active' | 'inactive' | 'warning' | 'critical';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  pulsing?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  pulsing = true,
  className,
}: StatusIndicatorProps) {
  const statusColors = {
    active: 'bg-brand-400',
    inactive: 'bg-zinc-500',
    warning: 'bg-yellow-400',
    critical: 'bg-red-500',
  };

  const statusGlows = {
    active: '',
    inactive: '',
    warning: '',
    critical: '',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'w-3 h-3 rounded-full',
          statusColors[status],
          statusGlows[status],
          pulsing && 'animate-pulse'
        )}
      />
      {label && <span className="text-xs font-mono text-zinc-400">{label}</span>}
    </div>
  );
}
