"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Project, ProjectStatus, SiteContent } from "@/lib/types";

const STATUS_FILTERS: (ProjectStatus | "all")[] = ["all", "published", "draft", "archived"];

function ListRow({ href, title, status }: { href: string; title: string; status?: ProjectStatus }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-admin-surface-hover"
    >
      <span className="truncate text-sm text-admin-text">{title}</span>
      <div className="flex shrink-0 items-center gap-3">
        {status && <StatusBadge status={status} />}
        <span className="text-xs text-admin-text-faint">Edit →</span>
      </div>
    </Link>
  );
}

export function AdminDashboardOverview({
  projects,
  siteContent,
}: {
  projects: Project[];
  siteContent: SiteContent[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const q = query.trim().toLowerCase();

  const filteredSiteContent = useMemo(
    () => siteContent.filter((item) => item.key.toLowerCase().includes(q)),
    [siteContent, q]
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (!q) return true;
        return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      }),
    [projects, q, statusFilter]
  );

  const caseStudies = filteredProjects.filter((p) => p.project_type === "case_study");
  const sideProjects = filteredProjects.filter((p) => p.project_type === "side_project");
  const showingAllStatuses = statusFilter === "all" && q === "";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass
            size={14}
            weight="bold"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋專案或內容…"
            className="w-full rounded-md border border-admin-border bg-admin-surface py-2 pl-8 pr-3 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                statusFilter === s
                  ? "bg-admin-text text-white"
                  : "border border-admin-border bg-admin-surface text-admin-text-muted hover:border-admin-accent hover:text-admin-accent"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {!showingAllStatuses && (
        <p className="mt-3 text-xs text-admin-text-faint">
          {filteredProjects.length} 個專案符合條件
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">SITE CONTENT</h2>
        <div className="mt-3 divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
          {filteredSiteContent.length === 0 && (
            <p className="px-4 py-6 text-sm text-admin-text-faint">沒有符合的內容</p>
          )}
          {filteredSiteContent.map((item) => (
            <ListRow key={item.key} href={`/admin/site-content/${item.key}`} title={item.key} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">CASE STUDIES</h2>
        <div className="mt-3 divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
          {caseStudies.length === 0 && <p className="px-4 py-6 text-sm text-admin-text-faint">沒有符合的專案</p>}
          {caseStudies.map((project) => (
            <ListRow
              key={project.id}
              href={`/admin/projects/${project.slug}`}
              title={project.title}
              status={project.status}
            />
          ))}
        </div>
      </section>

      {(sideProjects.length > 0 || (q === "" && statusFilter === "all")) && (
        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-admin-text-faint">SIDE PROJECTS</h2>
          <div className="mt-3 divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
            {sideProjects.length === 0 && <p className="px-4 py-6 text-sm text-admin-text-faint">沒有符合的專案</p>}
            {sideProjects.map((project) => (
              <ListRow
                key={project.id}
                href={`/admin/projects/${project.slug}`}
                title={project.title}
                status={project.status}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
