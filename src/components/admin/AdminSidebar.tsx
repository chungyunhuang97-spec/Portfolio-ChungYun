"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  FilmSlate,
  House,
  Images,
  List,
  SquaresFour,
  TextAa,
  UserCircle,
  X,
  type Icon,
} from "@phosphor-icons/react";
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
      className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
      aria-label={ctx.open ? "Close navigation" : "Open navigation"}
    >
      {ctx.open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
    </button>
  );
}

const STATUS_DOT: Record<string, string> = {
  published: "bg-admin-success",
  draft: "bg-admin-warning",
  archived: "bg-admin-text-faint",
};

function NavItem({
  href,
  active,
  onNavigate,
  layoutPrefix,
  icon: IconComponent,
  dot,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: (href: string) => void;
  layoutPrefix: string;
  icon?: Icon;
  dot?: string;
  children: ReactNode;
}) {
  // Light up the pill the moment the link is pressed, before the next page
  // has finished loading (useLinkStatus flips to pending right away).
  return (
    <Link
      href={href}
      onClick={() => onNavigate(href)}
      className={`admin-press relative flex items-center gap-2.5 rounded-full px-3 py-2 text-sm transition-colors ${
        active ? "font-medium text-admin-ink" : "text-admin-text-muted hover:bg-black/[0.04] hover:text-admin-text"
      }`}
    >
      {active && (
        <motion.span
          layoutId={`${layoutPrefix}-active-pill`}
          className="absolute inset-0 rounded-full bg-admin-lime"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        {IconComponent ? (
          <IconComponent size={17} weight={active ? "fill" : "regular"} />
        ) : (
          <span className={`size-1.5 rounded-full ${dot ?? "bg-admin-text-faint"}`} />
        )}
      </span>
      <span className="relative min-w-0 flex-1 truncate">{children}</span>
    </Link>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-admin-text-faint">{children}</p>;
}

function SidebarNav({
  projects,
  siteContent,
  pathname,
  close,
  layoutPrefix,
}: {
  projects: Project[];
  siteContent: SiteContent[];
  pathname: string | null;
  close: () => void;
  layoutPrefix: string;
}) {
  const caseStudies = projects.filter((p) => p.project_type === "case_study");
  const sideProjects = projects.filter((p) => p.project_type === "side_project");
  const homepageContent = siteContent.filter((item) => SITE_CONTENT_INFO[item.key]);
  const otherContent = siteContent.filter((item) => !SITE_CONTENT_INFO[item.key] && !LEGACY_SITE_CONTENT[item.key]);

  // Optimistic highlight: the pressed item turns active immediately; the
  // marker is ignored once the route actually changes.
  const [pending, setPending] = useState<{ href: string; from: string | null } | null>(null);
  const pendingHref = pending && pending.from === pathname ? pending.href : null;
  const isActive = (href: string) =>
    pendingHref ? pendingHref === href : pathname === href || Boolean(pathname?.startsWith(`${href}/`));
  const go = (href: string) => {
    setPending({ href, from: pathname });
    close();
  };
  const item = { onNavigate: go, layoutPrefix };

  return (
    <LayoutGroup id={layoutPrefix}>
      <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
        <Link href="/admin" onClick={close} className="admin-press flex items-center gap-2.5 px-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-admin-ink">
            <span className="size-2.5 rounded-full bg-admin-lime" />
          </span>
          <span className="text-sm font-semibold tracking-[0.2em] text-admin-text">ADMIN</span>
        </Link>

        <div className="flex flex-col gap-0.5">
          <NavItem href="/admin" active={pendingHref ? pendingHref === "/admin" : pathname === "/admin"} icon={House} {...item}>
            總覽
          </NavItem>
          <NavItem href="/admin/media" active={isActive("/admin/media")} icon={Images} {...item}>
            媒體庫
          </NavItem>
        </div>

        <div className="flex flex-col gap-1">
          <Heading>首頁內容</Heading>
          <NavItem href="/admin/about" active={isActive("/admin/about")} icon={UserCircle} {...item}>
            關於我
          </NavItem>
          <NavItem href="/admin/videos" active={isActive("/admin/videos")} icon={FilmSlate} {...item}>
            影片作品
          </NavItem>
          {homepageContent.map((c) => (
            <NavItem
              key={c.key}
              href={`/admin/site-content/${c.key}`}
              active={isActive(`/admin/site-content/${c.key}`)}
              icon={c.key === "hero_tagline" ? TextAa : SquaresFour}
              {...item}
            >
              {siteContentLabel(c.key)}
            </NavItem>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <Heading>案例研究</Heading>
          {caseStudies.length === 0 && <p className="px-3 text-xs text-admin-text-faint">尚無案例</p>}
          {caseStudies.map((p) => (
            <NavItem
              key={p.id}
              href={`/admin/projects/${p.slug}`}
              active={isActive(`/admin/projects/${p.slug}`)}
              dot={STATUS_DOT[p.status]}
              {...item}
            >
              {p.title}
            </NavItem>
          ))}
        </div>

        {sideProjects.length > 0 && (
          <div className="flex flex-col gap-1">
            <Heading>個人專案</Heading>
            {sideProjects.map((p) => (
              <NavItem
                key={p.id}
                href={`/admin/projects/${p.slug}`}
                active={isActive(`/admin/projects/${p.slug}`)}
                dot={STATUS_DOT[p.status]}
                {...item}
              >
                {p.title}
              </NavItem>
            ))}
          </div>
        )}

        {otherContent.length > 0 && (
          <div className="flex flex-col gap-1">
            <Heading>其他設定</Heading>
            {otherContent.map((c) => (
              <NavItem key={c.key} href={`/admin/site-content/${c.key}`} active={isActive(`/admin/site-content/${c.key}`)} {...item}>
                {c.key}
              </NavItem>
            ))}
          </div>
        )}

        <p className="mt-auto flex items-center gap-3 px-3 pt-2 text-[10px] text-admin-text-faint">
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-admin-success" />已發佈</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-admin-warning" />草稿</span>
          <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-admin-text-faint" />封存</span>
        </p>
      </nav>
    </LayoutGroup>
  );
}

export function AdminSidebar({ projects, siteContent }: { projects: Project[]; siteContent: SiteContent[] }) {
  const ctx = useContext(SidebarContext);
  const pathname = usePathname();
  const open = ctx?.open ?? false;
  const close = () => ctx?.setOpen(false);

  return (
    <>
      {/* Desktop: floating rounded panel */}
      <aside className="fixed bottom-4 left-4 top-4 z-30 hidden w-60 overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_20px_50px_-30px_rgba(12,12,14,0.35)] md:block">
        <SidebarNav projects={projects} siteContent={siteContent} pathname={pathname} close={close} layoutPrefix="desk" />
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-110%" }}
              animate={{ x: 0 }}
              exit={{ x: "-110%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="absolute bottom-3 left-3 top-3 w-64 overflow-hidden rounded-[28px] bg-white shadow-2xl"
            >
              <SidebarNav projects={projects} siteContent={siteContent} pathname={pathname} close={close} layoutPrefix="mob" />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
