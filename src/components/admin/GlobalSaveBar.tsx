"use client";

import { FloppyDisk } from "@phosphor-icons/react";
import { useChangesContext } from "@/components/admin/ChangesContext";

/**
 * The single, persistent save action for a project/site-content edit page.
 * Always visible (a floating pill under the top bar) so saving is a
 * predictable, findable spot. It turns lime while there is something
 * unsaved, so the state reads at a glance.
 */
export function GlobalSaveBar() {
  const ctx = useChangesContext();
  if (!ctx) return null;

  const { dirtyEntries, saveAll, savingAll } = ctx;
  const count = dirtyEntries.length;
  const hasChanges = count > 0;

  return (
    <div
      className={`sticky top-[4.9rem] z-20 mb-8 flex flex-wrap items-center justify-between gap-3 rounded-full border py-2 pl-5 pr-2 shadow-[0_10px_30px_-18px_rgba(12,12,14,0.35)] backdrop-blur transition-colors duration-300 md:top-[5.4rem] ${
        hasChanges ? "border-admin-lime bg-admin-lime" : "border-white/70 bg-white/85"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex size-2.5 shrink-0">
          {hasChanges && <span className="absolute inline-flex size-full animate-ping rounded-full bg-admin-ink opacity-40" />}
          <span className={`relative inline-flex size-2.5 rounded-full ${hasChanges ? "bg-admin-ink" : "bg-admin-success"}`} />
        </span>
        {hasChanges ? (
          <p className="truncate text-sm text-admin-ink">
            <span className="font-semibold">{count} 個區塊尚未儲存</span>
            <span className="ml-2 hidden text-admin-ink/60 sm:inline">{dirtyEntries.map((e) => e.label).join("、")}</span>
          </p>
        ) : (
          <p className="text-sm text-admin-text-muted">已全部儲存</p>
        )}
      </div>
      <button
        type="button"
        onClick={saveAll}
        disabled={!hasChanges || savingAll}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-admin-ink px-5 py-2.5 text-xs font-medium tracking-wide text-white hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-admin-text-faint"
      >
        <FloppyDisk size={14} weight="bold" />
        {savingAll ? "儲存中…" : hasChanges ? `儲存全部（${count}）` : "儲存"}
        {hasChanges && !savingAll && <span className="hidden text-white/50 md:inline">⌘S</span>}
      </button>
    </div>
  );
}
