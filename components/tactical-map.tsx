'use client';

import React from 'react';
import { MapPin, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalCard } from './tactical-card';

interface Officer {
  id: string;
  name: string;
  unit: string;
  x: number;
  y: number;
  status: 'active' | 'inactive';
}

const mockOfficers: Officer[] = [
  { id: '1', name: 'Johnson', unit: 'Unit 12', x: 35, y: 45, status: 'active' },
  { id: '2', name: 'Martinez', unit: 'Unit 7', x: 62, y: 28, status: 'active' },
  { id: '3', name: 'Williams', unit: 'Unit 15', x: 78, y: 65, status: 'active' },
  { id: '4', name: 'Chen', unit: 'Unit 9', x: 48, y: 72, status: 'active' },
  { id: '5', name: 'Davis', unit: 'Unit 3', x: 25, y: 82, status: 'active' },
  { id: '6', name: 'Thompson', unit: 'Unit 21', x: 85, y: 38, status: 'inactive' },
];

export function TacticalMap() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Tactical Map
          </h2>
          <p className="text-gray-400 text-sm">Real-time officer positions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded border border-cyan-400/30 bg-cyan-400/5">
          <Grid3x3 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-cyan-300 font-mono">{mockOfficers.filter(o => o.status === 'active').length} ACTIVE</span>
        </div>
      </div>

      <TacticalCard glow="cyan">
        <div className="relative w-full aspect-square bg-black/50 rounded overflow-hidden border border-cyan-400/20">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20 hud-grid" />

          {/* Coordinate labels */}
          <div className="absolute top-2 left-2 text-xs text-cyan-400 font-mono">GRID: A1</div>
          <div className="absolute bottom-2 right-2 text-xs text-cyan-400 font-mono">SCALE: 1:1000</div>

          {/* Compass rose */}
          <div className="absolute top-4 right-4 w-12 h-12 border border-cyan-400/20 rounded-full flex items-center justify-center">
            <div className="text-xs font-mono text-cyan-400">N</div>
          </div>

          {/* Officers markers */}
          {mockOfficers.map((officer) => (
            <motion.div
              key={officer.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 * parseInt(officer.id), duration: 0.4 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${officer.x}%`, top: `${officer.y}%` }}
            >
              <div className={`relative w-6 h-6 rounded-full flex items-center justify-center ${
                officer.status === 'active'
                  ? 'bg-green-500/20 border border-green-400 shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                  : 'bg-gray-500/20 border border-gray-400 shadow-[0_0_10px_rgba(100,116,139,0.2)]'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  officer.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                }`} />

                {/* Hover tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: -20 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none"
                >
                  <div className="bg-black/80 border border-cyan-400/50 rounded px-2 py-1 text-xs text-cyan-300 font-mono whitespace-nowrap">
                    {officer.unit} - {officer.name}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Center crosshair */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6">
            <div className="absolute inset-0 border border-cyan-400/20 rounded-full" />
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400/40 rounded-full" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-cyan-400/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
            <span className="text-xs text-gray-400">Active Officer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-xs text-gray-400">Inactive</span>
          </div>
        </div>
      </TacticalCard>
    </div>
  );
}
