'use client';

import React from 'react';
import {
  Camera,
  AlertCircle,
  MapPin,
  BarChart3,
  Lock,
  Radio,
  Zap,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TacticalCard } from './tactical-card';

const features = [
  {
    icon: Camera,
    title: 'Field Node Feeds',
    description: 'Live node health, stream placeholders, battery state, and central visibility',
  },
  {
    icon: AlertCircle,
    title: 'Incident Alerts',
    description: 'Critical incident queue backed by Sentinel central alerting and deduplication',
  },
  {
    icon: MapPin,
    title: 'Tactical Positioning',
    description: 'Derived field-node grid until backend GPS coordinates are available',
  },
  {
    icon: BarChart3,
    title: 'Control Analytics',
    description: 'Incident totals, stale nodes, replay pressure, and recovery backlog metrics',
  },
  {
    icon: Lock,
    title: 'Safe API Proxy',
    description: 'Dashboard API keys stay server-side through Next.js control routes',
  },
  {
    icon: Radio,
    title: 'Edge Replay',
    description: 'Visibility into central recovery pressure when edge nodes reconnect',
  },
  {
    icon: Zap,
    title: 'Operator Response',
    description: 'Acknowledge and close incidents through the central backend workflow',
  },
  {
    icon: Users,
    title: 'Fleet Overview',
    description: 'Centralized view of active, stale, and review-needed field devices',
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 hud-grid opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 opacity-3 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              Advanced Features
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A combined Silverline interface for Sentinel central operations
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <TacticalCard
                  glow="cyan"
                  interactive
                  className="h-full flex flex-col gap-3"
                >
                  <div className="p-3 bg-cyan-400/10 rounded inline-flex w-fit">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-cyan-200">{feature.title}</h3>
                  <p className="text-sm text-gray-400 flex-1">{feature.description}</p>
                </TacticalCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
