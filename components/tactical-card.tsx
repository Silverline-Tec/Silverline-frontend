'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'red' | 'green';
  interactive?: boolean;
}

export function TacticalCard({
  children,
  className,
  glow = 'cyan',
  interactive = false,
}: TacticalCardProps) {
  const glowClasses = {
    cyan: 'border-cyan-400/30 shadow-[0_0_15px_rgba(0,212,255,0.3),inset_0_0_15px_rgba(0,212,255,0.1)]',
    red: 'border-red-500/40 shadow-[0_0_15px_rgba(255,23,68,0.4),inset_0_0_15px_rgba(255,23,68,0.1)]',
    green: 'border-green-400/30 shadow-[0_0_15px_rgba(0,255,136,0.3),inset_0_0_15px_rgba(0,255,136,0.1)]',
  };

  return (
    <div
      className={cn(
        'border backdrop-blur-md bg-card/40 rounded-md p-4 transition-all duration-300',
        glowClasses[glow],
        interactive && 'hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] cursor-pointer hover:border-cyan-300/50',
        className
      )}
    >
      {children}
    </div>
  );
}
