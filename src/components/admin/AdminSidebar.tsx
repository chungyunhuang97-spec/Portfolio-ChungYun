"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import type { Project, SiteContent } from "@/lib/types";

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

  const content = (
    <nav className="flex h-full flex-col gap-7 overflow-y-auto px-4 py-6">
      <Link href="/admin" onClick={close} className="px-2.5 text-xs font-semibold tracking-[0.2em] text-admin-text">
        ADMIN
      </Link>

      <div>
        <p className="px-2.5 text-[10px] font-semibold tracking-[0.15em] text-admin-text-faint">SITE CONTENT</p>
        <div className="mt-2 flex flex-col gap-0.5">
          {siteContent.length === 0 && <p className="px-2.5 text-xs text-admin-text-faint">尚無內容</p>}
          {siteContent.map((item) => (
            <NavLink key={item.key} href={`/admin/site-content/${item.key}`} isActive={isActive(`/admin/site-content/${item.key}`)} onNavigate={close}>
              {item.key}
            </NavLink>
          ))}
        </div>
      </div>

      <div>
        <p className="px-2.5 text-[10px] font-semibold tracking-[0.15em] text-admin-text-faint">CASE STUDIES</p>
        <div className="mt-2 flex flex-col gap-0.5">
          {caseStudies.map((project) => (
            <NavLink key={project.id} href={`/admin/projects/${project.slug}`} isActive={isActive(`/admin/projects/${project.slug}`)} onNavigate={close}>
              {project.title}
            </NavLink>
          ))}
        </div>
      </div>

      {sideProjects.length > 0 && (
        <div>
          <p className="px-2.5 text-[10px] font-semibold tracking-[0.15em] text-admin-text-faint">SIDE PROJECTS</p>
          <div className="mt-2 flex flex-col gap-0.5">
            {sideProjects.map((project) => (
              <NavLink key={project.id} href={`/admin/projects/${project.slug}`} isActive={isActive(`/admin/projects/${project.slug}`)} onNavigate={close}>
                {project.title}
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
