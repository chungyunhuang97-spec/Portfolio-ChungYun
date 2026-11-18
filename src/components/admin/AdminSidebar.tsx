"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import type { Project, SiteContent } from "@/lib/types";
import { LEGACY_SITE_CONTENT } from "@/lib/about-video";
import { SITE_CONTENT_INFO, siteContentLabel } from "@/lib/admin-field-guide";

interface SidebarContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>;
}

/** Hamburger toggle rendered in the top bar -- only visible below md. */
export function AdminMenuButton() {
  const ctx = useContext(SidebarContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className="rounded-md p-2 text-admin-text-muted transition-colors hover:bg-admin-surface-hover md:hidden"
      aria-label={ctx.open ? "Close navigation" : "Open navigation"}
    >
      {ctx.open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
    </button>
  );
}

function NavLink({ href, isActive, onNavigate, children }: { href: string; isActive: boolean; onNavigate: () => void; children: ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block truncate rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-admin-accent-soft font-medium text-admin-accent"
          : "text-admin-text-muted hover:bg-admin-surface-hover hover:text-admin-text"
      }`}
    >
      {children}
    </Link>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <p className="px-2.5 text-[10px] font-semibold tracking-[0.15em] text-admin-text-faint">{children}</p>;
}

function ProjectLink({ project, isActive, onNavigate }: { project: Project; isActive: boolean; onNavigate: () => void }) {
  return (
    <NavLink href={`/admin/projects/${project.slug}`} isActive={isActive} onNavigate={onNavigate}>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate">{project.title}</span>
        {project.status !== "published" && (
          <span className="shrink-0 rounded-full bg-admin-border px-1.5 py-0.5 text-[9px] tracking-wider text-admin-text-faint">
            {project.status === "draft" ? "草稿" : "封存"}
          </span>
        )}
      </span>
    </NavLink>
  );
}

export function AdminSidebar({ projects, siteContent }: { projects: Project[]; siteContent: SiteContent[] }) {
  const ctx = useContext(SidebarContext);
  const pathname = usePathname();
  const open = ctx?.open ?? false;
  const close = () => ctx?.setOpen(false);

  const caseStudies = projects.filter((p) => p.project_type === "case_study");
  const sideProjects = projects.filter((p) => p.project_type === "side_project");

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  const homepageContent = siteContent.filter((item) => SITE_CONTENT_INFO[item.key]);
  const otherContent = siteContent.filter((item) => !SITE_CONTENT_INFO[item.key] && !LEGACY_SITE_CONTENT[item.key]);

  const content = (
    <nav className="flex h-full flex-col gap-7 overflow-y-auto px-4 py-6">
      <Link href="/admin" onClick={close} className="px-2.5 text-xs font-semibold tracking-[0.2em] text-admin-text">
        ADMIN
      </Link>

      <div className="flex flex-col gap-0.5">
        <NavLink href="/admin" isActive={pathname === "/admin"} onNavigate={close}>
          總覽
        </NavLink>
      </div>

      <div>
        <Heading>首頁內容</Heading>
        <div className="mt-2 flex flex-col gap-0.5">
          <NavLink href="/admin/about" isActive={isActive("/admin/about")} onNavigate={close}>
            關於我
          </NavLink>
          <NavLink href="/admin/videos" isActive={isActive("/admin/videos")} onNavigate={close}>
            影片作品
          </NavLink>
          {homepageContent.map((item) => (
            <NavLink
              key={item.key}
              href={`/admin/site-content/${item.key}`}
              isActive={isActive(`/admin/site-content/${item.key}`)}
              onNavigate={close}
            >
              {siteContentLabel(item.key)}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        <NavLink href="/admin/media" isActive={isActive("/admin/media")} onNavigate={close}>
          媒體庫
        </NavLink>
      </div>

      <div>
        <Heading>作品集 · 案例研究</Heading>
        <div className="mt-2 flex flex-col gap-0.5">
          {caseStudies.length === 0 && <p className="px-2.5 text-xs text-admin-text-faint">尚無案例</p>}
          {caseStudies.map((project) => (
            <ProjectLink key={project.id} project={project} isActive={isActive(`/admin/projects/${project.slug}`)} onNavigate={close} />
          ))}
        </div>
        <p className="mt-2 px-2.5 text-[10px] leading-relaxed text-admin-text-faint">
          排序與卡片大小請到「總覽」拖曳調整
        </p>
      </div>

      {sideProjects.length > 0 && (
        <div>
          <Heading>作品集 · 個人專案</Heading>
          <div className="mt-2 flex flex-col gap-0.5">
            {sideProjects.map((project) => (
              <ProjectLink key={project.id} project={project} isActive={isActive(`/admin/projects/${project.slug}`)} onNavigate={close} />
            ))}
          </div>
        </div>
      )}

      {otherContent.length > 0 && (
        <div>
          <Heading>其他設定</Heading>
          <div className="mt-2 flex flex-col gap-0.5">
            {otherContent.map((item) => (
              <NavLink
                key={item.key}
                href={`/admin/site-content/${item.key}`}
                isActive={isActive(`/admin/site-content/${item.key}`)}
                onNavigate={close}
              >
                {item.key}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop: fixed persistent sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-admin-border bg-admin-surface md:block">
        {content}
      </aside>

      {/* Mobile: off-canvas drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-black/30"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="absolute inset-y-0 left-0 w-64 border-r border-admin-border bg-admin-surface shadow-xl"
            >
              {content}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
