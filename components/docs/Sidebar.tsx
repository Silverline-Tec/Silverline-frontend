"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getNavAreaFromPathname, getNavSections, type DocsArea } from "@/lib/docs-nav";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export function Sidebar() {
  const pathname = usePathname();
  const activeArea = getNavAreaFromPathname(pathname);
  const sections = getNavSections(activeArea);

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-72 border-r border-white/[0.07] bg-[#0f1215] overflow-y-auto z-40"
      aria-label="Documentation navigation"
    >
      <nav className="flex-1 px-4 py-6 space-y-6">
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
                        "sidebar-link flex items-center gap-2 px-2 py-1.5 rounded-md text-sm group",
                        isActive
                          ? "bg-brand-500/10 text-brand-400 border-l-2 border-brand-500 pl-[6px]"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border-l-2 border-transparent"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="flex-1 leading-snug">{item.title}</span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.07]">
        <div className="px-2 space-y-1">
          <p className="text-[11px] font-mono text-zinc-700">
            Silverline Tech
          </p>
          <p className="text-[11px] font-mono text-zinc-700">
            May 2026 · CONFIDENTIAL
          </p>
        </div>
      </div>
    </aside>
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
