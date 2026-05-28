'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: 'https://sentinel-software.vercel.app/docs', label: 'Docs', external: true },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/40 backdrop-blur-xl border-b border-cyan-400/20 shadow-[0_0_20px_rgba(0,212,255,0.1)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center relative group-hover:shadow-[0_0_15px_rgba(0,212,255,0.5)] transition-shadow">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <span className="font-bold text-cyan-300 hidden sm:inline hud-text">SENTINEL OPS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={cn(
                  'text-sm font-mono tracking-wider transition-all duration-300 relative pb-2',
                  !item.external && isActive(item.href)
                    ? 'text-cyan-300'
                    : 'text-gray-400 hover:text-cyan-300'
                )}
              >
                {item.label}
                {!item.external && isActive(item.href) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-500"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded border border-green-400/30 bg-green-950/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-green-300">SYSTEM ONLINE</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-cyan-400/10 rounded transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-cyan-400" />
            ) : (
              <Menu className="w-5 h-5 text-cyan-400" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden pb-4 border-t border-cyan-400/20"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={cn(
                  'block px-4 py-2 text-sm font-mono transition-colors',
                  !item.external && isActive(item.href)
                    ? 'text-cyan-300 bg-cyan-400/10'
                    : 'text-gray-400 hover:text-cyan-300'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
