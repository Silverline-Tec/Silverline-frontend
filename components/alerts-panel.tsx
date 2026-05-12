'use client';

import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmergencyAlert } from './emergency-alert';

interface Alert {
  id: string;
  title: string;
  description: string;
  level: 'high' | 'medium' | 'low';
  timestamp: string;
}

const initialAlerts: Alert[] = [
  {
    id: '1',
    title: 'Officer Needs Assistance',
    description: 'Unit 12 - Officer Johnson requesting backup at 5th & Main',
    level: 'high',
    timestamp: new Date(Date.now() - 2 * 60000).toLocaleTimeString(),
  },
  {
    id: '2',
    title: 'Low Battery Alert',
    description: 'Unit 9 - Officer Chen body camera battery at 35%',
    level: 'medium',
    timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
  },
  {
    id: '3',
    title: 'GPS Location Update',
    description: 'All units have been repositioned per dispatch orders',
    level: 'low',
    timestamp: new Date(Date.now() - 10 * 60000).toLocaleTimeString(),
  },
];

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  const handleDismissAll = () => {
    setAlerts([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <Zap className="w-6 h-6 text-red-400" />
            Active Alerts
          </h2>
          <p className="text-gray-400 text-sm">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} requiring attention</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={handleDismissAll}
            className="px-3 py-1 text-xs font-mono bg-gray-500/20 hover:bg-gray-500/40 border border-gray-500/30 rounded transition-colors text-gray-300"
          >
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {alerts.length > 0 ? (
          <motion.div
            layout
            className="space-y-3 max-h-[600px] overflow-y-auto pr-2"
          >
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EmergencyAlert
                  title={alert.title}
                  description={alert.description}
                  level={alert.level}
                  timestamp={alert.timestamp}
                  onDismiss={() => handleDismiss(alert.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-green-400/30 rounded-lg p-8 text-center bg-green-950/10 backdrop-blur-sm"
          >
            <div className="text-green-400 text-sm font-mono mb-2">✓ ALL SYSTEMS NORMAL</div>
            <p className="text-gray-400">No active alerts at this time</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
