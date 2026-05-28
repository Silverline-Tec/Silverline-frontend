import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NavItem } from "@/lib/docs-nav";

interface PrevNextProps {
  prev: NavItem | null;
  next: NavItem | null;
}

export function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <div className="mt-12 pt-8 border-t border-white/[0.07] grid grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={prev.slug === "" ? "/docs" : `/docs/${prev.slug}`}
          className="group flex flex-col gap-1 p-4 rounded-lg border border-white/[0.07] hover:border-brand-500/30 hover:bg-brand-500/5 transition-all"
        >
          <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
            <ChevronLeft className="w-3 h-3" />
            Previous
          </span>
          <span className="text-sm text-zinc-300 group-hover:text-brand-400 transition-colors line-clamp-2">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.slug === "" ? "/docs" : `/docs/${next.slug}`}
          className="group flex flex-col gap-1 p-4 rounded-lg border border-white/[0.07] hover:border-brand-500/30 hover:bg-brand-500/5 transition-all text-right"
        >
          <span className="flex items-center justify-end gap-1 text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
            Next
            <ChevronRight className="w-3 h-3" />
          </span>
          <span className="text-sm text-zinc-300 group-hover:text-brand-400 transition-colors line-clamp-2">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
