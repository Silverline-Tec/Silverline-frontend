'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalCard } from './tactical-card';
import { StatusIndicator } from './status-indicator';
import { cn } from '@/lib/utils';
import type { DeviceSummary } from '@/lib/control-types';

interface CameraFeed {
  id: string;
  label: string;
  unit: string;
  location: string;
  status: 'active' | 'inactive' | 'warning';
  batteryLevel: number;
}

const mockCameras: CameraFeed[] = [
  { id: '1', label: 'Field Device 12', unit: 'node-12', location: 'North Gate', status: 'active', batteryLevel: 85 },
  { id: '2', label: 'Field Device 7', unit: 'node-07', location: 'Downtown', status: 'active', batteryLevel: 92 },
  { id: '3', label: 'Field Device 15', unit: 'node-15', location: 'Harbor District', status: 'active', batteryLevel: 72 },
  { id: '4', label: 'Field Device 9', unit: 'node-09', location: 'Industrial Area', status: 'warning', batteryLevel: 35 },
  { id: '5', label: 'Field Device 3', unit: 'node-03', location: 'Residential', status: 'active', batteryLevel: 88 },
  { id: '6', label: 'Field Device 21', unit: 'node-21', location: 'Commercial', status: 'inactive', batteryLevel: 0 },
];

interface LiveCameraGridProps {
  devices?: DeviceSummary[];
  loading?: boolean;
  heading?: string;
  loadingDescription?: string;
  readyDescription?: string;
  emptyMessage?: string;
}

export function LiveCameraGrid({
  devices,
  loading = false,
  heading = 'Field Devices',
  loadingDescription = 'Checking field device status',
  readyDescription = 'Current status for connected field devices',
  emptyMessage = 'No field devices are visible from Sentinel yet.',
}: LiveCameraGridProps) {
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const cameraFeeds = devices == null ? mockCameras : devices.slice(0, 12).map(mapDeviceToCamera);

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
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg border border-brand-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-brand-400 text-lg font-mono">LIVE FEED - {fullscreen}</div>
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
        <h2 className="font-display text-lg font-bold text-white mb-2">{heading}</h2>
        <p className="text-zinc-500 text-sm">
          {loading && cameraFeeds.length === 0
            ? loadingDescription
            : readyDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameraFeeds.length > 0 ? cameraFeeds.map((camera) => (
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
                    <div className="text-sm font-mono mb-2">CAMERA NOT CONNECTED YET</div>
                    <div className="w-16 h-16 border-2 border-brand-500/20 rounded mx-auto" />
                  </div>
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2 gap-2">
                  <button
                    onClick={() => toggleMute(camera.id)}
                    className="p-2 bg-brand-500/10 hover:bg-brand-500/20 rounded transition-colors"
                  >
                    {muted.has(camera.id) ? (
                      <VolumeX className="w-4 h-4 text-brand-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-brand-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setFullscreen(camera.id)}
                    className="p-2 bg-brand-500/10 hover:bg-brand-500/20 rounded transition-colors"
                  >
                    <Maximize2 className="w-4 h-4 text-brand-400" />
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
                  <div className="text-sm font-bold text-zinc-100">{camera.label}</div>
                  <div className="text-xs text-zinc-500">{camera.unit}</div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">{camera.location}</span>
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
        )) : (
          <div className="md:col-span-2 lg:col-span-3">
            <TacticalCard glow="cyan">
              <p className="text-sm text-zinc-500">
                {emptyMessage}
              </p>
            </TacticalCard>
          </div>
        )}
      </div>
    </div>
  );
}

function mapDeviceToCamera(device: DeviceSummary): CameraFeed {
  return {
    id: device.nodeId,
    label: device.name ?? device.nodeId,
    unit: device.nodeId,
    location: device.locationLabel ?? 'unknown site',
    status: device.isStale
      ? 'warning'
      : device.status === 'active'
        ? 'active'
        : device.status === 'maintenance'
          ? 'inactive'
          : 'warning',
    batteryLevel: device.batteryLevel ?? 0,
  };
}
