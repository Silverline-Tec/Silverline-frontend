'use client';

import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 hud-grid opacity-40" />

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 opacity-5 blur-3xl rounded-full" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-500 opacity-5 blur-3xl rounded-full" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8 inline-block">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 backdrop-blur-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-cyan-300">SYSTEM STATUS: OPERATIONAL</span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance">
          <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
            Sentinel AI
          </span>
          <br />
          <span className="text-cyan-100">Tactical Response Platform</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Monitor alerts, check field devices, and keep teams informed even when field equipment reconnects after being offline.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-cyan-400 text-black font-bold rounded flex items-center gap-2 hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
          >
            Enter Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="https://sentinel-software.vercel.app/docs"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3 border border-cyan-400/50 text-cyan-300 font-bold rounded hover:bg-cyan-400/10 transition-colors"
          >
            Platform Docs
          </Link>
        </motion.div>

        {/* Live status widget */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { label: 'Field Devices', value: 'LIVE' },
            { label: 'Main System', value: 'ON' },
            { label: 'Works Offline', value: 'YES' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
              className="border border-cyan-400/30 rounded-lg p-4 backdrop-blur-sm bg-cyan-400/5 hover:border-cyan-400/50 transition-all"
            >
              <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="text-gray-500 text-sm font-mono">SCROLL TO EXPLORE</div>
      </motion.div>
    </div>
  );
}
