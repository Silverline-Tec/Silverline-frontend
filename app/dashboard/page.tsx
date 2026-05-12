'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { AlertsPanel } from '@/components/alerts-panel';
import { LiveCameraGrid } from '@/components/live-camera-grid';
import { TacticalMap } from '@/components/tactical-map';
import { motion } from 'framer-motion';
import { BarChart3, Activity, Users, AlertTriangle } from 'lucide-react';
import { TacticalCard } from '@/components/tactical-card';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const stats = [
    { icon: Users, label: 'Officers Online', value: '1,247', color: 'cyan' },
    { icon: Activity, label: 'Active Incidents', value: '3', color: 'red' },
    { icon: AlertTriangle, label: 'Alerts Today', value: '24', color: 'yellow' },
    { icon: BarChart3, label: 'Camera Uptime', value: '99.8%', color: 'green' },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="hidden md:block">
        <DashboardSidebar onCollapse={setSidebarCollapsed} />
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-60'} pt-20`}>
        <div className="p-6 max-w-7xl">
          {/* Dashboard header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-cyan-300 mb-2">Command Center Dashboard</h1>
            <p className="text-gray-400">Real-time monitoring and incident management</p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colorMap = {
                cyan: 'border-cyan-400/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]',
                red: 'border-red-400/30 shadow-[0_0_15px_rgba(255,23,68,0.2)]',
                yellow: 'border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.2)]',
                green: 'border-green-400/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]',
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div
                    className={`border rounded-lg p-6 backdrop-blur-md bg-card/40 flex items-start justify-between ${
                      colorMap[stat.color as keyof typeof colorMap]
                    } transition-all duration-300`}
                  >
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-cyan-300">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 opacity-50" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Alerts and Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 space-y-8"
            >
              <AlertsPanel />
              <TacticalMap />
            </motion.div>

            {/* Right column - Camera Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <LiveCameraGrid />
            </motion.div>
          </div>

          {/* Analytics section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-cyan-300 mb-4">System Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Uptime chart placeholder */}
              <TacticalCard glow="cyan">
                <div className="space-y-4">
                  <h3 className="font-bold text-cyan-300">System Uptime</h3>
                  <div className="h-32 flex items-end justify-around gap-2">
                    {[85, 92, 78, 88, 95, 91, 87].map((value, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ delay: 0.05 * i, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-t opacity-50 hover:opacity-100 transition-opacity"
                      />
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-400">Last 7 days</div>
                </div>
              </TacticalCard>

              {/* Response time chart placeholder */}
              <TacticalCard glow="green">
                <div className="space-y-4">
                  <h3 className="font-bold text-cyan-300">Average Response Time</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">2.3s</div>
                    <p className="text-sm text-gray-400">Per alert notification</p>
                  </div>
                  <div className="flex justify-around text-xs text-gray-400 pt-4 border-t border-cyan-400/20">
                    <span>↑ 5% vs last week</span>
                    <span>Peak: 3.2s</span>
                  </div>
                </div>
              </TacticalCard>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
