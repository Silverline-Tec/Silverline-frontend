"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import type { TocItem } from "@/lib/docs-mdx";

interface TocProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0% -70% 0%",
        threshold: 0,
      }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <aside
      className="flex flex-col w-full"
      aria-label="Table of contents"
    >
      <div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-zinc-600 mb-3 px-3">
          On this page
        </p>
        <nav>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={clsx(
                    "toc-link flex px-3 py-1 text-xs rounded transition-colors border-l-2",
                    item.level === 3 && "pl-5",
                    activeId === item.id
                      ? "toc-link-active border-brand-500 text-brand-400"
                      : "border-transparent text-zinc-600 hover:text-zinc-300 hover:border-zinc-700"
                  )}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
