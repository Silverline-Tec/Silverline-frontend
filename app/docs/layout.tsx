import { Sidebar } from "@/components/docs/Sidebar";
import { TopNav } from "@/components/docs/TopNav";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0c0e] text-zinc-100">
      <TopNav
        homeHref="/"
        homeLabel="Silverline Sentinel home"
        sectionLabel="docs"
        rightContent={
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="/dashboard"
              className="rounded-md border border-white/[0.07] px-2.5 py-1.5 text-xs font-mono uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-brand-400"
            >
              Dashboard
            </a>
          </div>
        }
      />
      <div className="flex flex-1 pt-14">
        <Sidebar />
        <main
          id="main-content"
          className="min-w-0 flex-1 lg:ml-72"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
