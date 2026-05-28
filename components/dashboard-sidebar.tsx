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
    { view: 'map', label: 'Location Map', icon: Map },
    { view: 'feeds', label: 'Field Feeds', icon: Radio },
    { view: 'analytics', label: 'Analytics', icon: Activity },
    { view: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border glow-border backdrop-blur-md flex flex-col"
    >
      {/* Collapse Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-4 top-4 w-8 h-8 bg-cyan-400/20 hover:bg-cyan-400/40 border border-cyan-400/50 rounded-full flex items-center justify-center transition-all"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
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
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-cyan-400')} />
              {!collapsed && (
                <span className="text-sm font-mono whitespace-nowrap">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="absolute right-2 w-1 h-1 bg-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <div className="px-3 py-2 text-xs font-mono text-gray-500">
          {collapsed ? 'LIVE' : 'Single-route dynamic view'}
        </div>
      </div>
    </motion.aside>
  );
}
