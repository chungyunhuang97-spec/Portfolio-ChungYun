"use client";

import { useChangesContext } from "@/components/admin/ChangesContext";

/**
 * The single, persistent save action for a project/site-content edit page.
 * Replaces the old per-section and per-form "Save" buttons -- every editor
 * on the page still tracks its own dirty state locally, but this is the
 * only button that actually writes anything. Always visible (not a toast
 * that appears/disappears) so it's a predictable, findable spot rather
 * than something that pops in and out as fields change.
 */
export function GlobalSaveBar() {
  const ctx = useChangesContext();
  if (!ctx) return null;

  const { dirtyEntries, saveAll, savingAll } = ctx;
  const count = dirtyEntries.length;
  const hasChanges = count > 0;

  return (
    <div
      className={`sticky top-14 z-20 -mx-4 mb-8 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 transition-colors md:-mx-10 md:px-10 ${
        hasChanges ? "border-admin-warning/30 bg-admin-warning-soft" : "border-admin-border bg-admin-surface"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${hasChanges ? "bg-admin-warning" : "bg-admin-success"}`} />
        {hasChanges ? (
          <p className="truncate text-sm text-admin-text">
            <span className="font-medium">{count} 個區塊尚未儲存</span>
            <span className="ml-2 hidden text-admin-text-muted sm:inline">
              {dirtyEntries.map((e) => e.label).join("、")}
            </span>
          </p>
        ) : (
          <p className="text-sm text-admin-text-muted">已全部儲存</p>
        )}
      </div>
      <button
        type="button"
        onClick={saveAll}
        disabled={!hasChanges || savingAll}
        className="shrink-0 rounded-md bg-admin-accent px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {savingAll ? "儲存中…" : hasChanges ? `儲存全部（${count}）` : "儲存"}
      </button>
    </div>
  );
}
