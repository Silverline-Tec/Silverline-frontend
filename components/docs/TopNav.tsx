"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Shield, ExternalLink } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { SearchBar } from "./SearchBar";

interface TopNavProps {
  homeHref?: string;
  homeLabel?: string;
  sectionLabel?: string;
  badgeLabel?: string | null;
  showSearch?: boolean;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  renderMobileNav?: ((controls: { open: boolean; onClose: () => void }) => React.ReactNode) | null;
}

export function TopNav({
  homeHref = "/docs",
  homeLabel = "Sentinel AI Docs Home",
  sectionLabel = "docs",
  badgeLabel = "v1.0",
  showSearch = true,
  centerContent,
  rightContent,
  renderMobileNav = ({ open, onClose }) => <MobileNav open={open} onClose={onClose} />,
}: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNav = renderMobileNav
    ? renderMobileNav({ open: mobileOpen, onClose: () => setMobileOpen(false) })
    : null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/[0.07] bg-[#0a0c0e]/90 backdrop-blur-md">
        <div className="flex items-center h-full px-4 gap-4">
          {/* Logo */}
          <Link
            href={homeHref}
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label={homeLabel}
          >
            <div className="w-7 h-7 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center group-hover:bg-brand-500/30 transition-colors">
              <Shield className="w-4 h-4 text-brand-400" strokeWidth={2} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-sm text-white tracking-tight">
                SENTINEL
              </span>
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                AI
              </span>
            </div>
            <span className="hidden sm:block text-zinc-700 text-sm">/</span>
            <span className="hidden sm:block text-zinc-500 text-xs font-mono">
              {sectionLabel}
            </span>
          </Link>

          {/* Badge */}
          {badgeLabel ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-brand-500/20 bg-brand-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
              <span className="text-xs font-mono text-brand-400">{badgeLabel}</span>
            </div>
          ) : null}

          <div className="flex-1 min-w-0">
            {showSearch ? (
              <div className="max-w-xs">
                <SearchBar />
              </div>
            ) : centerContent ? (
              centerContent
            ) : null}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {rightContent ?? (
              <a
                href="#"
                className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
              >
                <span className="font-mono">CONFIDENTIAL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Mobile menu button */}
            {renderMobileNav ? (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {mobileNav}
    </>
  );
}
