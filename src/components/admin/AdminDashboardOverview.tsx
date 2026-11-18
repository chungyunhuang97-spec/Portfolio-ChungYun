"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight, FilmSlate, Images, MagnifyingGlass, SquaresFour, TextAa, UserCircle } from "@phosphor-icons/react";
import { ProjectCard, ProjectReorderList } from "@/components/admin/ProjectReorderList";
import type { Project, ProjectStatus, SiteContent, VideoSectionSettings } from "@/lib/types";
import { LEGACY_SITE_CONTENT } from "@/lib/about-video";
import { siteContentLabel } from "@/lib/admin-field-guide";

const STATUS_FILTERS: { id: ProjectStatus | "all"; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "published", label: "已發佈" },
  { id: "draft", label: "草稿" },
  { id: "archived", label: "封存" },
];

function Stat({ value, label, tone }: { value: number; label: string; tone?: "lime" | "warn" }) {
  return (
    <div className="flex items-end gap-2">
      <span className="font-[family-name:var(--font-outfit)] text-5xl font-medium leading-none tracking-tight md:text-6xl">{value}</span>
      <span
        className={`mb-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
          tone === "lime" ? "bg-admin-lime text-admin-ink" : tone === "warn" ? "bg-admin-warning-soft text-admin-warning" : "bg-black/[0.06] text-admin-text-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function QuickLink({
  href,
  icon: IconComponent,
  title,
  meta,
}: {
  href: string;
  icon: typeof Images;
  title: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="admin-card flex items-center gap-3 rounded-[22px] bg-white/10 p-3.5 text-white hover:bg-white/15"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
        <IconComponent size={18} weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {meta && <span className="block truncate text-xs text-white/50">{meta}</span>}
      </span>
      <span className="admin-arrow flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        <ArrowUpRight size={14} weight="bold" />
      </span>
    </Link>
  );
}

export function AdminDashboardOverview({
  projects,
  siteContent,
  videoSectionSettings,
  videoWorkCount,
}: {
  projects: Project[];
  siteContent: SiteContent[];
  videoSectionSettings?: VideoSectionSettings | null;
  videoWorkCount?: number;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const q = query.trim().toLowerCase();

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
  const showingAll = statusFilter === "all" && q === "";

  // Drag-reordering only makes sense against the complete, unfiltered group.
  const allCaseStudies = projects.filter((p) => p.project_type === "case_study");
  const allSideProjects = projects.filter((p) => p.project_type === "side_project");

  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;
  const missingCover = projects.filter((p) => !p.cover_image_url && p.status !== "archived").length;
  const homepageContent = siteContent.filter((i) => !LEGACY_SITE_CONTENT[i.key]);

  return (
    <div className="space-y-10">
      {/* Header + stats */}
      <section className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-admin-text-faint">WORKSPACE</p>
          <h1 className="mt-1 text-4xl font-semibold md:text-5xl">總覽</h1>
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <Stat value={published} label="已發佈" tone="lime" />
          <Stat value={drafts} label="草稿" tone={drafts > 0 ? "warn" : undefined} />
          <Stat value={missingCover} label="缺封面" tone={missingCover > 0 ? "warn" : undefined} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          {/* Search + filter pills */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <MagnifyingGlass
                size={15}
                weight="bold"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-admin-text-faint"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜尋專案…"
                className="w-full rounded-full border border-white/70 bg-white py-2.5 pl-10 pr-4 text-sm text-admin-text outline-none"
              />
            </div>
            <LayoutGroup id="status-filter">
              <div className="flex flex-wrap gap-1.5 rounded-full bg-white/60 p-1">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`relative rounded-full px-4 py-1.5 text-xs font-medium ${
                      statusFilter === f.id ? "text-white" : "text-admin-text-muted hover:text-admin-text"
                    }`}
                  >
                    {statusFilter === f.id && (
                      <motion.span
                        layoutId="status-pill"
                        className="absolute inset-0 rounded-full bg-admin-ink"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>

          {!showingAll && <p className="-mt-6 text-xs text-admin-text-faint">{filteredProjects.length} 個專案符合條件</p>}

          {/* Case studies */}
          <section>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold">案例研究</h2>
              {showingAll && <p className="text-xs text-admin-text-faint">拖曳右下角 ⠿ 調整順序（同時是首頁卡片順序）</p>}
            </div>
            {showingAll ? (
              <ProjectReorderList projects={allCaseStudies} />
            ) : caseStudies.length === 0 ? (
              <p className="py-6 text-sm text-admin-text-faint">沒有符合的專案</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {caseStudies.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </section>

          {(sideProjects.length > 0 || showingAll) && allSideProjects.length + sideProjects.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">個人專案</h2>
              {showingAll ? (
                <ProjectReorderList projects={allSideProjects} />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {sideProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Dark quick-access panel (like the reference's Summary panel) */}
        <aside className="xl:sticky xl:top-[5.5rem] xl:self-start">
          <div className="rounded-[28px] bg-admin-ink p-5 text-white shadow-[0_24px_50px_-28px_rgba(12,12,14,0.7)]">
            <h2 className="text-base font-semibold">快速前往</h2>
            <p className="mt-0.5 text-xs text-white/50">常用的編輯入口</p>
            <div className="mt-4 flex flex-col gap-2.5">
              <QuickLink href="/admin/about" icon={UserCircle} title="關於我" meta="介紹、照片、履歷" />
              <QuickLink
                href="/admin/videos"
                icon={FilmSlate}
                title="影片作品"
                meta={`${videoWorkCount ?? 0} 支影片 · ${videoSectionSettings?.is_visible ? "顯示中" : "已隱藏"}`}
              />
              <QuickLink href="/admin/media" icon={Images} title="媒體庫" meta="檢視並清理未使用的檔案" />
              {homepageContent.map((c) => (
                <QuickLink key={c.key} href={`/admin/site-content/${c.key}`} icon={c.key === "hero_tagline" ? TextAa : SquaresFour} title={siteContentLabel(c.key)} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
