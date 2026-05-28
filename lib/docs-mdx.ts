// src/lib/mdx.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/docs");

export interface DocFrontmatter {
  title: string;
  description: string;
  section: string;
  order: number;
}

export interface DocContent {
  frontmatter: DocFrontmatter;
  content: string;
  slug: string;
}

export function getDocBySlug(slug: string): DocContent | null {
  const filename = slug === "" ? "index.mdx" : `${slug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug,
  };
}

export function getAllDocSlugs(): string[] {
  const files = fs.readdirSync(CONTENT_DIR);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => (f === "index.mdx" ? "" : f.replace(".mdx", "")));
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/\*\*/g, "").replace(/`/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    items.push({ id, text, level });
  }

  return items;
}
