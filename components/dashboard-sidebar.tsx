'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Map, AlertCircle, BarChart3, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export function DashboardSidebar({ onCollapse }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    onCollapse?.(!collapsed);
  };

  const menuItems = [
    { href: '#overview', label: 'Overview', icon: BarChart3 },
    { href: '#alerts', label: 'Alerts', icon: AlertCircle },
    { href: '#map', label: 'Location Map', icon: Map },
    { href: '#settings', label: 'Settings', icon: Settings },
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
          const isActive = pathname.includes(item.label.toLowerCase());

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 relative group',
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
            </a>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <button className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200'
        )}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-mono whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
