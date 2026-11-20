"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowClockwise, ArrowSquareOut, DeviceMobile, Desktop, Eye, X } from "@phosphor-icons/react";
import { useChangesContext } from "@/components/admin/ChangesContext";
import { InlineEditBridgeProvider } from "@/components/admin/InlineEditBridge";

type Device = "desktop" | "mobile";

const PreviewContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null);

/** Header button that toggles the preview pane (must sit inside the shell). */
export function PreviewToggleButton() {
  const ctx = useContext(PreviewContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-pressed={open}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
        open
          ? "border-admin-lime bg-admin-lime text-admin-ink"
          : "border-admin-border bg-white text-admin-text-muted hover:border-admin-ink hover:text-admin-ink"
      }`}
    >
      <Eye size={14} weight="bold" />
      {open ? "關閉預覽" : "預覽"}
    </button>
  );
}

/**
 * Wraps a project's edit page with a live preview of its public page.
 *
 * - xl screens: editor on the left, preview pinned on the right.
 * - smaller screens: preview opens as a full-screen overlay from the toggle.
 *
 * The preview is the real `/work/<slug>` page in an iframe (same origin, so
 * admins also see drafts). It reloads by itself whenever a save finishes, so
 * "edit -> save -> see it" needs no manual refresh.
 */
export function ProjectPreviewShell({ slug, children }: { slug: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const changes = useChangesContext();
  const dirtyCount = changes?.dirtyEntries.length ?? 0;
  const saving = changes?.savingAll ?? false;
  const prevDirty = useRef(dirtyCount);

  function reload() {
    try {
      iframeRef.current?.contentWindow?.location.reload();
    } catch {
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    }
  }

  // Reload once everything that was unsaved has been written.
  useEffect(() => {
    if (prevDirty.current > 0 && dirtyCount === 0 && !saving && open) {
      // Give revalidation a moment to land before re-fetching the page.
      const t = setTimeout(reload, 600);
      prevDirty.current = dirtyCount;
      return () => clearTimeout(t);
    }
    prevDirty.current = dirtyCount;
  }, [dirtyCount, saving, open]);

  const src = `/work/${slug}`;

  return (
    <PreviewContext.Provider value={{ open, setOpen }}>
    <InlineEditBridgeProvider iframeRef={iframeRef}>
    <div className={open ? "xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(400px,46%)] xl:items-start xl:gap-8" : ""}>
      <div className="min-w-0">
        {children}
      </div>

      {open && (
        <aside className="fixed inset-0 z-50 flex flex-col bg-admin-bg xl:sticky xl:inset-auto xl:top-[5.4rem] xl:z-10 xl:h-[calc(100dvh-7rem)] xl:overflow-hidden xl:rounded-[28px] xl:border xl:border-white/70 xl:shadow-[0_20px_50px_-30px_rgba(12,12,14,0.4)]">
          <div className="flex items-center justify-between gap-2 border-b border-admin-border bg-admin-surface px-3 py-2">
            <div className="flex items-center gap-1">
              {(
                [
                  ["desktop", Desktop, "桌機"],
                  ["mobile", DeviceMobile, "手機"],
                ] as const
              ).map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDevice(id)}
                  aria-pressed={device === id}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                    device === id ? "bg-admin-accent-soft text-admin-accent" : "text-admin-text-muted hover:bg-admin-surface-hover"
                  }`}
                >
                  <Icon size={14} weight="bold" />
                  {label}
                </button>
              ))}
            </div>
            <p className="hidden truncate text-[11px] text-admin-text-faint sm:block">
              {dirtyCount > 0 ? "有未儲存的變更，按儲存才會寫入" : "點預覽裡的文字可直接編輯"}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reload}
                className="rounded-md p-1.5 text-admin-text-muted transition-colors hover:bg-admin-surface-hover"
                aria-label="重新整理預覽"
                title="重新整理預覽"
              >
                <ArrowClockwise size={14} weight="bold" />
              </button>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-1.5 text-admin-text-muted transition-colors hover:bg-admin-surface-hover"
                aria-label="在新分頁開啟前台"
                title="在新分頁開啟前台"
              >
                <ArrowSquareOut size={14} weight="bold" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-admin-text-muted transition-colors hover:bg-admin-surface-hover"
                aria-label="關閉預覽"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-admin-surface-hover">
            <iframe
              ref={iframeRef}
              src={src}
              title={`${slug} 前台預覽`}
              className={`h-full border-0 bg-white ${device === "mobile" ? "w-[390px] max-w-full shadow-lg" : "w-full"}`}
            />
          </div>
        </aside>
      )}
    </div>
    </InlineEditBridgeProvider>
    </PreviewContext.Provider>
  );
}
