"use client";
import { useEffect, useEffectEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getNavAreaFromPathname, getNavSections, type DocsArea } from "@/lib/docs-nav";
import { clsx } from "clsx";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const activeArea = getNavAreaFromPathname(pathname);
  const sections = getNavSections(activeArea);
  const handleClose = useEffectEvent(onClose);

  // Close on route change
  useEffect(() => {
    handleClose();
  }, [pathname]);

  // Trap scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <nav
        className="relative w-72 max-w-[85vw] bg-[#0f1215] border-r border-white/[0.07] h-full overflow-y-auto pt-14"
        aria-label="Mobile navigation"
      >
        <div className="px-4 py-6 space-y-6">
          <DocsAreaSwitch activeArea={activeArea} />

          {Array.from(sections.entries()).map(([section, items]) => (
            <div key={section}>
              <div className="px-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-zinc-600">
                  {section}
                </span>
              </div>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const href = item.slug === "" ? "/docs" : `/docs/${item.slug}`;
                  const isActive =
                    item.slug === ""
                      ? pathname === "/docs"
                      : pathname === `/docs/${item.slug}`;

                  return (
                    <li key={item.slug}>
                      <Link
                        href={href}
                        className={clsx(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
                          isActive
                            ? "bg-brand-500/10 text-brand-400 border-l-2 border-brand-500 pl-[6px]"
                            : "text-zinc-500 border-l-2 border-transparent"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

function DocsAreaSwitch({ activeArea }: { activeArea: DocsArea }) {
  const options: Array<{ area: DocsArea; label: string; href: string }> = [
    { area: "backend", label: "Backend", href: "/docs" },
    { area: "frontend", label: "Frontend", href: "/docs/frontend" },
  ];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
      <div className="grid grid-cols-2 gap-1">
        {options.map((option) => (
          <Link
            key={option.area}
            href={option.href}
            className={clsx(
              "rounded-lg px-3 py-2 text-center text-xs font-mono uppercase tracking-[0.12em] transition-colors",
              activeArea === option.area
                ? "bg-brand-500/10 text-brand-400"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
            )}
            aria-current={activeArea === option.area ? "page" : undefined}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
