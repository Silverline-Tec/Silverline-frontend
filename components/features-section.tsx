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
    title: 'Field Devices',
    description: 'See device connection, battery level, and camera readiness in one place.',
  },
  {
    icon: AlertCircle,
    title: 'Urgent Alerts',
    description: 'Review important alerts and clear them once operators have responded.',
  },
  {
    icon: MapPin,
    title: 'Device Map',
    description: 'See where field devices are reporting from across the operating area.',
  },
  {
    icon: BarChart3,
    title: 'System Health',
    description: 'Check whether alerts, device updates, and system traffic are flowing normally.',
  },
  {
    icon: Lock,
    title: 'Protected Access',
    description: 'Sensitive connection keys stay hidden on the server, away from the browser.',
  },
  {
    icon: Radio,
    title: 'Offline Recovery',
    description: 'Field equipment can catch up safely after losing connection.',
  },
  {
    icon: Zap,
    title: 'Operator Response',
    description: 'Mark alerts as handled so the team can see what still needs attention.',
  },
  {
    icon: Users,
    title: 'Fleet Overview',
    description: 'See which devices are online, not reporting, or need a check.',
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
            A clear Silverline view for teams monitoring Sentinel in the field.
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
