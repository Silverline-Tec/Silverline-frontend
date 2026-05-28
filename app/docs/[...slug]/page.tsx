import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/DocPage";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs-mdx";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams() {
  const slugs = getAllDocSlugs().filter((slug) => slug !== "");
  return slugs.map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug?.join("/") ?? "";
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {};
  }

  return {
    title: `${doc.frontmatter.title} | Sentinel Docs`,
    description: doc.frontmatter.description,
    openGraph: {
      title: `${doc.frontmatter.title} | Sentinel Docs`,
      description: doc.frontmatter.description,
    },
  };
}

export default async function DocSlugPage({ params }: Props) {
  const slug = (await params).slug?.join("/") ?? "";
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return <DocPage doc={doc} slug={slug} />;
}
