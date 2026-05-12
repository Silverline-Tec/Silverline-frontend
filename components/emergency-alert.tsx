'use client';

import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AlertLevel = 'high' | 'medium' | 'low';

interface EmergencyAlertProps {
  title: string;
  description: string;
  level: AlertLevel;
  timestamp?: string;
  onDismiss?: () => void;
  className?: string;
}

export function EmergencyAlert({
  title,
  description,
  level,
  timestamp,
  onDismiss,
  className,
}: EmergencyAlertProps) {
  const levelConfig = {
    high: {
      icon: AlertTriangle,
      borderColor: 'border-red-500/50',
      glowColor: 'shadow-[0_0_20px_rgba(255,23,68,0.5)]',
      bgColor: 'bg-red-950/20',
      textColor: 'text-red-200',
      dotColor: 'bg-red-500',
    },
    medium: {
      icon: AlertCircle,
      borderColor: 'border-yellow-500/50',
      glowColor: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]',
      bgColor: 'bg-yellow-950/20',
      textColor: 'text-yellow-200',
      dotColor: 'bg-yellow-500',
    },
    low: {
      icon: AlertCircle,
      borderColor: 'border-blue-400/50',
      glowColor: 'shadow-[0_0_15px_rgba(0,212,255,0.3)]',
      bgColor: 'bg-blue-950/20',
      textColor: 'text-blue-200',
      dotColor: 'bg-blue-400',
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'border rounded-lg p-4 backdrop-blur-md',
        config.borderColor,
        config.bgColor,
        config.glowColor,
        className
      )}
    >
      <div className="flex gap-3">
        {/* Pulsing dot indicator */}
        <div className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0 animate-pulse', config.dotColor)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-5 h-5 flex-shrink-0', config.textColor)} />
              <h3 className={cn('font-bold text-sm', config.textColor)}>{title}</h3>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity px-2"
              >
                ✕
              </button>
            )}
          </div>
          <p className={cn('text-xs mt-1 opacity-90', config.textColor)}>{description}</p>
          {timestamp && (
            <p className="text-xs opacity-50 mt-2 font-mono">{timestamp}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
