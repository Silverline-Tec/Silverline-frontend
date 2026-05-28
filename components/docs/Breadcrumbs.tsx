"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  section: string;
  title: string;
}

export function Breadcrumbs({ section, title }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-600 mb-6">
      <Link href="/docs" className="hover:text-zinc-400 transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
        <span className="font-mono">Docs</span>
      </Link>
      <ChevronRight className="w-3 h-3 opacity-40" />
      <span className="font-mono text-zinc-500">{section}</span>
      <ChevronRight className="w-3 h-3 opacity-40" />
      <span className="font-mono text-zinc-400 truncate max-w-[180px]">{title}</span>
    </nav>
  );
}
