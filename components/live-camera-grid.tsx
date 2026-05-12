'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalCard } from './tactical-card';
import { StatusIndicator } from './status-indicator';
import { cn } from '@/lib/utils';

interface CameraFeed {
  id: string;
  officer: string;
  unit: string;
  location: string;
  status: 'active' | 'inactive' | 'warning';
  batteryLevel: number;
}

const mockCameras: CameraFeed[] = [
  { id: '1', officer: 'Officer Johnson', unit: 'Unit 12', location: '5th & Main', status: 'active', batteryLevel: 85 },
  { id: '2', officer: 'Officer Martinez', unit: 'Unit 7', location: 'Downtown', status: 'active', batteryLevel: 92 },
  { id: '3', officer: 'Officer Williams', unit: 'Unit 15', location: 'Harbor District', status: 'active', batteryLevel: 72 },
  { id: '4', officer: 'Officer Chen', unit: 'Unit 9', location: 'Industrial Area', status: 'warning', batteryLevel: 35 },
  { id: '5', officer: 'Officer Davis', unit: 'Unit 3', location: 'Residential', status: 'active', batteryLevel: 88 },
  { id: '6', officer: 'Officer Thompson', unit: 'Unit 21', location: 'Commercial', status: 'inactive', batteryLevel: 0 },
];

export function LiveCameraGrid() {
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  const toggleMute = (id: string) => {
    const newMuted = new Set(muted);
    if (newMuted.has(id)) {
      newMuted.delete(id);
    } else {
      newMuted.add(id);
    }
    setMuted(newMuted);
  };

  if (fullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg border border-cyan-400/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-cyan-400 text-lg font-mono">LIVE FEED - {fullscreen}</div>
          </div>
          <button
            onClick={() => setFullscreen(null)}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition-colors text-white font-mono"
          >
            EXIT FULLSCREEN
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-cyan-300 mb-2">Live Camera Feed</h2>
        <p className="text-gray-400 text-sm">Real-time monitoring of active officers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCameras.map((camera) => (
          <motion.div
            key={camera.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <TacticalCard
              glow={camera.status === 'warning' ? 'red' : 'cyan'}
              className="overflow-hidden flex flex-col"
            >
              {/* Video area */}
              <div className="relative bg-black aspect-video rounded mb-3 overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-sm font-mono mb-2">FEED STREAM</div>
                    <div className="w-16 h-16 border-2 border-cyan-400/30 rounded mx-auto" />
                  </div>
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2 gap-2">
                  <button
                    onClick={() => toggleMute(camera.id)}
                    className="p-2 bg-cyan-400/20 hover:bg-cyan-400/40 rounded transition-colors"
                  >
                    {muted.has(camera.id) ? (
                      <VolumeX className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setFullscreen(camera.id)}
                    className="p-2 bg-cyan-400/20 hover:bg-cyan-400/40 rounded transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <StatusIndicator
                    status={camera.status === 'warning' ? 'warning' : 'active'}
                    pulsing
                  />
                </div>
              </div>

              {/* Camera info */}
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-bold text-cyan-300">{camera.officer}</div>
                  <div className="text-xs text-gray-400">{camera.unit}</div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{camera.location}</span>
                  <span className={cn(
                    'font-mono',
                    camera.batteryLevel > 50 ? 'text-green-400' : camera.batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    {camera.batteryLevel}%
                  </span>
                </div>

                {/* Battery bar */}
                <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${camera.batteryLevel}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      camera.batteryLevel > 50
                        ? 'bg-green-500'
                        : camera.batteryLevel > 20
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    )}
                  />
                </div>
              </div>
            </TacticalCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
