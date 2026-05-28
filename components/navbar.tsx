'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

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
      <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-5 lg:px-8">
        <div className="flex h-14 items-center gap-3 sm:h-16 lg:gap-6">
          {/* Logo */}
          <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded bg-cyan-400 transition-shadow group-hover:shadow-[0_0_15px_rgba(0,212,255,0.5)] sm:h-9 sm:w-9">
              <div className="h-2 w-2 rounded-full bg-black" />
            </div>
            <div className="hidden min-w-0 leading-none min-[420px]:block">
              <span className="hud-text block truncate text-sm font-bold text-cyan-300 sm:text-base">
                SENTINEL
              </span>
              <span className="hidden text-[0.62rem] font-mono tracking-[0.24em] text-cyan-300/60 sm:block">
                OPS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={cn(
                  'relative rounded-full px-3 py-2 pb-2 text-xs font-mono tracking-[0.22em] transition-all duration-300 xl:px-4 xl:text-sm',
                  !item.external && isActive(item.href)
                    ? 'bg-cyan-400/10 text-cyan-300'
                    : 'text-gray-400 hover:bg-cyan-400/10 hover:text-cyan-300'
                )}
              >
                {item.label}
                {!item.external && isActive(item.href) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-500"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Status Badge */}
          <div className="ml-auto hidden shrink-0 items-center gap-2 rounded border border-green-400/30 bg-green-950/20 px-2.5 py-1 sm:flex lg:ml-0 xl:px-3">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden text-[0.68rem] font-mono tracking-[0.18em] text-green-300 xl:inline">
              SYSTEM ONLINE
            </span>
            <span className="text-[0.68rem] font-mono tracking-[0.18em] text-green-300 xl:hidden">
              ONLINE
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="shrink-0 rounded border border-cyan-400/20 p-2 transition-colors hover:bg-cyan-400/10 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-cyan-400" />
            ) : (
              <Menu className="h-5 w-5 text-cyan-400" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="site-mobile-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-cyan-400/20 pb-4 pt-3 lg:hidden"
            >
              <div className="grid gap-2 rounded-2xl border border-cyan-400/15 bg-black/65 p-2 shadow-[0_16px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:grid-cols-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-mono tracking-[0.18em] transition-colors',
                      !item.external && isActive(item.href)
                        ? 'bg-cyan-400/10 text-cyan-300'
                        : 'text-gray-300 hover:bg-cyan-400/10 hover:text-cyan-300'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
