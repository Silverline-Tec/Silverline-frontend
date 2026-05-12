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
    active: 'bg-green-400',
    inactive: 'bg-gray-500',
    warning: 'bg-yellow-400',
    critical: 'bg-red-500',
  };

  const statusGlows = {
    active: 'shadow-[0_0_10px_rgba(0,255,136,0.6)]',
    inactive: 'shadow-[0_0_10px_rgba(100,116,139,0.4)]',
    warning: 'shadow-[0_0_10px_rgba(250,204,21,0.6)]',
    critical: 'shadow-[0_0_10px_rgba(255,23,68,0.7)]',
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
      {label && <span className="text-xs font-mono text-gray-300">{label}</span>}
    </div>
  );
}
