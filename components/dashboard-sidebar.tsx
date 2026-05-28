'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Map, AlertCircle, BarChart3, Settings, Radio, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type DashboardView = 'overview' | 'alerts' | 'map' | 'feeds' | 'analytics' | 'settings';

interface DashboardSidebarProps {
  activeView: DashboardView;
  onCollapse?: (collapsed: boolean) => void;
  onViewChange: (view: DashboardView) => void;
}

export function DashboardSidebar({ activeView, onCollapse, onViewChange }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    onCollapse?.(!collapsed);
  };

  const menuItems: Array<{ view: DashboardView; label: string; icon: typeof BarChart3 }> = [
    { view: 'overview', label: 'Overview', icon: BarChart3 },
    { view: 'alerts', label: 'Alerts', icon: AlertCircle },
    { view: 'map', label: 'Device Map', icon: Map },
    { view: 'feeds', label: 'Field Devices', icon: Radio },
    { view: 'analytics', label: 'System Health', icon: Activity },
    { view: 'settings', label: 'Setup', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#0f1215] border-r border-white/[0.07] backdrop-blur-md flex flex-col"
    >
      {/* Collapse Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-4 top-4 w-8 h-8 bg-[#151a1e] hover:bg-brand-500/10 border border-white/[0.12] rounded-full flex items-center justify-center transition-all"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-brand-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-brand-400" />
        )}
      </button>

      {/* Menu Items */}
      <nav className="flex-1 pt-8 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 relative group text-left',
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500 pl-[10px]'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border-l-2 border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-brand-400')} />
              {!collapsed && (
                <span className="text-sm font-mono whitespace-nowrap">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="absolute right-2 w-1 h-1 bg-brand-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
