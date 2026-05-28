'use client';

import React from 'react';
import { MapPin, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalCard } from './tactical-card';
import type { DeviceSummary } from '@/lib/control-types';

interface NodeMarker {
  id: string;
  name: string;
  unit: string;
  x: number;
  y: number;
  status: 'active' | 'inactive';
}

const mockNodes: NodeMarker[] = [
  { id: '1', name: 'North Gate', unit: 'node-12', x: 35, y: 45, status: 'active' },
  { id: '2', name: 'Downtown', unit: 'node-07', x: 62, y: 28, status: 'active' },
  { id: '3', name: 'Harbor', unit: 'node-15', x: 78, y: 65, status: 'active' },
  { id: '4', name: 'Industrial', unit: 'node-09', x: 48, y: 72, status: 'active' },
  { id: '5', name: 'Residential', unit: 'node-03', x: 25, y: 82, status: 'active' },
  { id: '6', name: 'Commercial', unit: 'node-21', x: 85, y: 38, status: 'inactive' },
];

interface TacticalMapProps {
  devices?: DeviceSummary[];
  loading?: boolean;
  heading?: string;
  loadingDescription?: string;
  readyDescription?: string;
}

export function TacticalMap({
  devices,
  loading = false,
  heading = 'Device Map',
  loadingDescription = 'Loading field device locations',
  readyDescription = 'Current field device locations',
}: TacticalMapProps) {
  const nodes = devices == null ? mockNodes : devices.slice(0, 18).map(mapDeviceToNodeMarker);
  const activeCount = nodes.filter((node) => node.status === 'active').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            {heading}
          </h2>
          <p className="text-zinc-500 text-sm">
            {loading && nodes.length === 0
              ? loadingDescription
              : readyDescription}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5">
          <Grid3x3 className="w-4 h-4 text-brand-400" />
          <span className="text-xs text-brand-400 font-mono">{activeCount} ACTIVE</span>
        </div>
      </div>

      <TacticalCard glow="cyan">
        <div className="relative w-full aspect-square bg-[#0a0c0e] rounded overflow-hidden border border-white/[0.07]">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20 hud-grid" />

          {/* Coordinate labels */}
          <div className="absolute top-2 left-2 text-xs text-brand-400 font-mono">GRID: A1</div>
          <div className="absolute bottom-2 right-2 text-xs text-brand-400 font-mono">SCALE: 1:1000</div>

          {/* Compass rose */}
          <div className="absolute top-4 right-4 w-12 h-12 border border-white/[0.07] rounded-full flex items-center justify-center">
            <div className="text-xs font-mono text-brand-400">N</div>
          </div>

          {/* Node markers */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.03 * getMarkerDelay(node.id), duration: 0.4 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`relative w-6 h-6 rounded-full flex items-center justify-center ${
                node.status === 'active'
                  ? 'bg-brand-500/15 border border-brand-500/40'
                  : 'bg-zinc-500/15 border border-zinc-500/40'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  node.status === 'active' ? 'bg-brand-400' : 'bg-zinc-400'
                }`} />

                {/* Hover tooltip */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileHover={{ opacity: 1, y: -20 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none"
                >
                  <div className="bg-[#0f1215]/95 border border-brand-500/30 rounded px-2 py-1 text-xs text-brand-400 font-mono whitespace-nowrap">
                    {node.unit} - {node.name}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Center crosshair */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6">
            <div className="absolute inset-0 border border-white/[0.07] rounded-full" />
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-brand-400/40 rounded-full" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-400" />
            <span className="text-xs text-zinc-500">Device Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-400" />
            <span className="text-xs text-zinc-500">Not Reporting</span>
          </div>
        </div>
      </TacticalCard>
    </div>
  );
}

function mapDeviceToNodeMarker(device: DeviceSummary): NodeMarker {
  const point = getGridPoint(device.nodeId);

  return {
    id: device.nodeId,
    name: device.name ?? device.nodeId,
    unit: device.nodeId,
    x: point.x,
    y: point.y,
    status: device.status === 'active' && !device.isStale ? 'active' : 'inactive',
  };
}

function getGridPoint(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }

  return {
    x: 12 + (hash % 76),
    y: 12 + ((hash * 17) % 76),
  };
}

function getMarkerDelay(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index)) % 12;
  }

  return hash;
}
