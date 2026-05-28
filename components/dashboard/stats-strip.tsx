'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HeaderMetric, MetricColor } from './types';

export function StatsStrip({ metrics }: { metrics: HeaderMetric[] }) {
  const colorMap: Record<MetricColor, string> = {
    brand: 'text-brand-400',
    red: 'text-red-300',
    yellow: 'text-yellow-300',
    zinc: 'text-zinc-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-6 rounded-xl border border-white/[0.07] bg-[#0f1215] divide-y divide-white/[0.07] overflow-hidden xl:flex xl:divide-x xl:divide-y-0"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div key={metric.label} className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">
                {metric.label}
              </p>
              <p className={cn('mt-1 font-display text-2xl font-bold leading-none', colorMap[metric.color])}>
                {metric.value}
              </p>
            </div>
            <Icon className="h-5 w-5 shrink-0 text-zinc-600" />
          </div>
        );
      })}
    </motion.div>
  );
}
