'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Shield, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDashboard = pathname.startsWith('/dashboard');

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
    { href: '/docs', label: 'Docs' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
        scrolled || isDashboard
          ? 'border-b border-white/[0.07] bg-[#0a0c0e]/90 backdrop-blur-md'
          : 'bg-transparent'
      )}
    >
      <div
        className={cn(
          'mx-auto w-full px-3 sm:px-5',
          isDashboard ? 'max-w-none lg:px-0' : 'max-w-[92rem] lg:px-8'
        )}
      >
        <div className="flex h-14 items-center gap-3 sm:h-16 lg:gap-6">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              'group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3',
              isDashboard && 'md:h-full md:w-60 md:border-r md:border-white/[0.07] md:px-4 lg:px-5'
            )}
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-500/30 bg-brand-500/20 transition-colors group-hover:bg-brand-500/30 sm:h-9 sm:w-9">
              <Shield className="h-4 w-4 text-brand-400" />
            </div>
            <div className="hidden min-w-0 leading-none min-[420px]:block">
              <span className="font-display block truncate text-sm font-bold tracking-tight text-white sm:text-base">
                SENTINEL
              </span>
              <span className="hidden text-[0.62rem] font-mono uppercase tracking-[0.24em] text-zinc-500 sm:block">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div
            className={cn(
              'hidden min-w-0 flex-1 items-center lg:flex',
              isDashboard ? 'justify-start px-2 xl:px-4' : 'justify-center'
            )}
          >
            <div className="flex min-w-0 items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.02] p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-full px-3 py-2 text-xs font-mono tracking-[0.2em] transition-all duration-300 xl:px-4 xl:text-sm',
                    isActive(item.href)
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-brand-400 to-brand-600"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Status Badge */}
          <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/5 px-2.5 py-1 sm:flex lg:ml-0 lg:mr-5 xl:px-3">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="hidden text-[0.68rem] font-mono tracking-[0.18em] text-brand-400 xl:inline">
              SYSTEM ONLINE
            </span>
            <span className="text-[0.68rem] font-mono tracking-[0.18em] text-brand-400 xl:hidden">
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
            className="shrink-0 rounded-md border border-white/[0.07] p-2 text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
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
              className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-white/[0.07] pb-4 pt-3 lg:hidden"
            >
              <div className="grid gap-2 rounded-xl border border-white/[0.07] bg-[#0f1215]/95 p-2 shadow-[0_16px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:grid-cols-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-mono tracking-[0.18em] transition-colors',
                      isActive(item.href)
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
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
