"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Search, X, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import { getNavArea, NAV_ITEMS, type DocsArea } from "@/lib/docs-nav";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

interface SearchResult {
  title: string;
  slug: string;
  section: string;
  area: DocsArea;
  description?: string;
  excerpt?: string;
}

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsListId = useId();
  const normalizedQuery = query.trim().toLowerCase();
  const results: SearchResult[] = normalizedQuery
    ? NAV_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description?.toLowerCase().includes(normalizedQuery) ||
          item.section.toLowerCase().includes(normalizedQuery)
      ).map((item) => ({
        title: item.title,
        slug: item.slug,
        section: item.section,
        area: getNavArea(item),
        description: item.description,
      }))
    : [];
  const activeResult = results[activeIdx];

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }

  // Keyboard shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setActiveIdx(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setActiveIdx(0);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!results.length) return;
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeResult) {
      e.preventDefault();
      closeSearch();
      router.push(activeResult.slug === "" ? "/docs" : `/docs/${activeResult.slug}`);
    }
  }

  return (
    <>
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setActiveIdx(0);
        }}
        className="w-full flex items-center gap-2 px-3 h-8 rounded-md bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.06] transition-colors text-zinc-500 text-sm group"
        aria-label="Search documentation"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search docs...</span>
        <span className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono opacity-60">
          <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">⌘</kbd>
          <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">K</kbd>
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeSearch}
          />
          <div
            ref={containerRef}
            className="relative w-full max-w-lg bg-[#151a1e] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Search"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                aria-label="Search query"
                aria-controls={resultsListId}
                aria-activedescendant={
                  activeResult
                    ? `${resultsListId}-${activeResult.slug || "overview"}`
                    : undefined
                }
                aria-expanded={results.length > 0}
                role="combobox"
                aria-autocomplete="list"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveIdx(0);
                    inputRef.current?.focus();
                  }}
                  className="text-zinc-600 hover:text-zinc-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul
                id={resultsListId}
                className="py-2 max-h-80 overflow-y-auto"
                role="listbox"
              >
                {results.map((r, i) => {
                  const href = r.slug === "" ? "/docs" : `/docs/${r.slug}`;
                  const optionId = `${resultsListId}-${r.slug || "overview"}`;
                  return (
                    <li
                      key={r.slug}
                      id={optionId}
                      role="option"
                      aria-selected={i === activeIdx}
                    >
                      <Link
                        href={href}
                        onClick={closeSearch}
                        className={clsx(
                          "flex items-start gap-3 px-4 py-2.5 transition-colors",
                          i === activeIdx
                            ? "bg-brand-500/10 text-brand-400"
                            : "text-zinc-300 hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                              {r.area} / {r.section}
                            </span>
                          </div>
                          <div className="text-sm font-medium truncate">{r.title}</div>
                          {r.description && (
                            <div className="text-xs text-zinc-500 mt-0.5 truncate">
                              {r.description}
                            </div>
                          )}
                        </div>
                        <CornerDownLeft className="w-3 h-3 mt-1 opacity-40 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-600">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {!query && (
              <div className="px-4 py-3">
                <p className="text-xs text-zinc-600 mb-2">Quick navigation</p>
                <div className="flex flex-wrap gap-1.5">
                  {["architecture", "ingestion-api", "frontend", "frontend-dashboard"].map((s) => {
                    const item = NAV_ITEMS.find((n) => n.slug === s);
                    if (!item) return null;
                    return (
                      <Link
                        key={s}
                        href={`/docs/${s}`}
                        onClick={closeSearch}
                        className="text-xs px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] transition-colors"
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/[0.07] flex items-center gap-4 text-[10px] text-zinc-700">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                select
              </span>
              <span>esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
