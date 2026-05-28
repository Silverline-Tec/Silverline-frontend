import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { extractToc } from "@/lib/docs-mdx";
import { getPrevNext } from "@/lib/docs-nav";
import { TableOfContents } from "./TableOfContents";
import { Breadcrumbs } from "./Breadcrumbs";
import { PrevNext } from "./PrevNext";
import { Callout, Steps, Step, Tabs, CodeBlock } from "./MDXComponents";
import { Feedback } from "./Feedback";
import type { DocContent } from "@/lib/docs-mdx";
import { rehypePrettyCode } from "rehype-pretty-code";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

interface DocPageProps {
  doc: DocContent;
  slug: string;
}

const mdxComponents: NonNullable<MDXRemoteProps["components"]> = {
  Callout,
  Steps,
  Step,
  Tabs,
  CodeBlock,
};

const rehypeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
};

export function DocPage({ doc, slug }: DocPageProps) {
  const toc = extractToc(doc.content);
  const { prev, next } = getPrevNext(slug);

  return (
    <div className="flex gap-0 min-h-[calc(100vh-56px)]">
      {/* Main content */}
      <article className="flex-1 min-w-0 px-6 py-8 md:px-10 lg:px-14 xl:px-16 max-w-4xl animate-fade-in">
        <Breadcrumbs
          section={doc.frontmatter.section}
          title={doc.frontmatter.title}
        />

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-zinc-600 px-2 py-0.5 rounded-full border border-white/[0.07] bg-white/[0.02]">
              {doc.frontmatter.section}
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white leading-tight tracking-tight mb-3">
            {doc.frontmatter.title}
          </h1>
          {doc.frontmatter.description && (
            <p className="text-zinc-400 text-base leading-relaxed max-w-2xl">
              {doc.frontmatter.description}
            </p>
          )}
          <div className="mt-4 h-px bg-gradient-to-r from-brand-500/20 via-brand-500/5 to-transparent" />
        </header>

        {/* MDX Content */}
        <div className="prose prose-zinc prose-invert max-w-none">
          <MDXRemote
            source={doc.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    {
                      behavior: "wrap",
                      properties: {
                        className: ["anchor"],
                        ariaHidden: true,
                        tabIndex: -1,
                      },
                    },
                  ],
                  [rehypePrettyCode, rehypeOptions],
                ],
              },
            }}
          />
        </div>

        {/* Feedback */}
        <Feedback slug={slug} />

        {/* Prev/Next */}
        <PrevNext prev={prev} next={next} />
      </article>

      {/* TOC */}
      <div className="hidden xl:block w-64 shrink-0 self-start sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto px-6 py-8">
        <TableOfContents items={toc} />
      </div>
    </div>
  );
}
