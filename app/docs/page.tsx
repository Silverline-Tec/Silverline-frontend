import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/DocPage";
import { getDocBySlug } from "@/lib/docs-mdx";

export const metadata: Metadata = {
  title: "Sentinel Docs",
  description: "Backend and frontend documentation for the Sentinel platform.",
};

export default function DocsIndexPage() {
  const doc = getDocBySlug("");

  if (!doc) {
    notFound();
  }

  return <DocPage doc={doc} slug="" />;
}
