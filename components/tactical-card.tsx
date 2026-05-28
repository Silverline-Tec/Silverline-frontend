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
    cyan: 'border-white/[0.07]',
    red: 'border-red-400/30 bg-red-500/5',
    green: 'border-brand-500/20 bg-brand-500/5',
  };

  return (
    <div
      className={cn(
        'border bg-[#0f1215] rounded-md p-4 transition-all duration-300',
        glowClasses[glow],
        interactive && 'cursor-pointer hover:bg-white/[0.04] hover:border-brand-500/30',
        className
      )}
    >
      {children}
    </div>
  );
}
