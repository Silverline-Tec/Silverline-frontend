// src/lib/nav.ts
export interface NavItem {
  title: string;
  slug: string;
  section: string;
  order: number;
  area?: DocsArea;
  description?: string;
}

export type DocsArea = "backend" | "frontend";

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    slug: "",
    section: "Introduction",
    order: 1,
    description: "Platform overview and document structure",
  },
  {
    title: "1. Why It Exists",
    slug: "why-it-exists",
    section: "Introduction",
    order: 2,
    description: "Goals, constraints, and design trade-offs",
  },
  {
    title: "2. System Architecture",
    slug: "architecture",
    section: "Architecture",
    order: 3,
    description: "Components, boundaries, technology stack",
  },
  {
    title: "3. Database Schema",
    slug: "database-schema",
    section: "Data Layer",
    order: 4,
    description: "PostgreSQL 15 — 8 tables, DDL, indexes",
  },
  {
    title: "4. Gateway Contract",
    slug: "gateway-contract",
    section: "Integration",
    order: 5,
    description: "Mesh packet transformation and signing",
  },
  {
    title: "5. Ingestion API",
    slug: "ingestion-api",
    section: "API",
    order: 6,
    description: "POST /ingest — validation and enqueue",
  },
  {
    title: "6. Deduplication",
    slug: "deduplication",
    section: "Core Logic",
    order: 7,
    description: "Anchor hierarchy and key builder",
  },
  {
    title: "7. Processing Worker",
    slug: "processing-worker",
    section: "Core Logic",
    order: 8,
    description: "RQ worker and transactional outbox",
  },
  {
    title: "8. Alerting & Outbox",
    slug: "alerting",
    section: "Core Logic",
    order: 9,
    description: "Rules engine, SMS, GSM fallback, webhooks",
  },
  {
    title: "9. Real-Time Layer",
    slug: "realtime",
    section: "Real-Time",
    order: 10,
    description: "Elixir/Phoenix WebSocket and backlog",
  },
  {
    title: "10. Dashboard API",
    slug: "dashboard-api",
    section: "API",
    order: 11,
    description: "REST endpoints and status transitions",
  },
  {
    title: "10A. Edge Device Runtime",
    slug: "edge-device-runtime",
    section: "Edge",
    order: 11.5,
    description: "SQLite edge profile, sentinel-agent, and uplink replay",
  },
  {
    title: "11. Deployment",
    slug: "deployment",
    section: "Operations",
    order: 12,
    description: "Docker Compose, TLS, env vars",
  },
  {
    title: "11A. Environment Reference",
    slug: "environment-reference",
    section: "Operations",
    order: 13,
    description: "All env vars, acquisition paths, and use cases",
  },
  {
    title: "12. Production Hardening",
    slug: "production-hardening",
    section: "Security",
    order: 14,
    description: "Threat model, key rotation, retention, IR",
  },
  {
    title: "13. Reference",
    slug: "reference",
    section: "Reference",
    order: 15,
    description: "Redis channels, HTTP codes, rollout plan",
  },
  {
    title: "14. Testing & Demo",
    slug: "testing",
    section: "Operations",
    order: 16,
    description: "Demo script and verification checklist",
  },
  {
    title: "Appendix A: Data Flow",
    slug: "appendix",
    section: "Reference",
    order: 17,
    description: "Complete end-to-end annotated trace",
  },
  {
    title: "Frontend Overview",
    slug: "frontend",
    section: "Frontend",
    order: 1,
    area: "frontend",
    description: "Silverline frontend scope, repositories, and runtime responsibilities",
  },
  {
    title: "Frontend Architecture",
    slug: "frontend-architecture",
    section: "Frontend",
    order: 2,
    area: "frontend",
    description: "Next.js app structure, API proxy, dashboard modules, and shared contracts",
  },
  {
    title: "Operations Dashboard",
    slug: "frontend-dashboard",
    section: "Dashboard",
    order: 3,
    area: "frontend",
    description: "Stats strip, live alert feed, device panel, incident history, and right drawer",
  },
  {
    title: "Realtime Integration",
    slug: "frontend-realtime",
    section: "Dashboard",
    order: 4,
    area: "frontend",
    description: "Phoenix socket connection, backlog load, and REST fallback behavior",
  },
  {
    title: "Frontend Environment",
    slug: "frontend-environment",
    section: "Operations",
    order: 5,
    area: "frontend",
    description: "Required env vars, local defaults, and production acquisition paths",
  },
  {
    title: "Frontend Development",
    slug: "frontend-development",
    section: "Operations",
    order: 6,
    area: "frontend",
    description: "pnpm workflow, local startup, verification, and change safety rules",
  },
];

export function getNavArea(item: NavItem): DocsArea {
  return item.area ?? "backend";
}

export function getNavAreaFromSlug(slug: string): DocsArea {
  const item = NAV_ITEMS.find((i) => i.slug === slug);
  return item ? getNavArea(item) : slug.startsWith("frontend") ? "frontend" : "backend";
}

export function getNavAreaFromPathname(pathname: string): DocsArea {
  const slug = pathname === "/docs" ? "" : pathname.replace(/^\/docs\/?/, "");
  return getNavAreaFromSlug(slug);
}

export function getNavSections(area: DocsArea = "backend") {
  const sections = new Map<string, NavItem[]>();
  for (const item of NAV_ITEMS.filter((navItem) => getNavArea(navItem) === area)) {
    if (!sections.has(item.section)) {
      sections.set(item.section, []);
    }
    sections.get(item.section)!.push(item);
  }
  return sections;
}

export function getPrevNext(currentSlug: string) {
  const area = getNavAreaFromSlug(currentSlug);
  const items = NAV_ITEMS.filter((item) => getNavArea(item) === area);
  const idx = items.findIndex((i) => i.slug === currentSlug);
  return {
    prev: idx > 0 ? items[idx - 1] : null,
    next: idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null,
  };
}
