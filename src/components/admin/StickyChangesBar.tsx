"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useChangesContext } from "@/components/admin/ChangesContext";

export function StickyChangesBar() {
  const ctx = useChangesContext();
  if (!ctx) return null;

  const { dirtyEntries, saveAll, savingAll } = ctx;
  const count = dirtyEntries.length;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="sticky top-14 z-20 -mx-4 mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-admin-warning/30 bg-admin-warning-soft px-4 py-3 md:-mx-10 md:px-10"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-admin-warning" />
            <p className="truncate text-sm text-admin-text">
              <span className="font-medium">{count} 個區塊尚未儲存</span>
              <span className="ml-2 hidden text-admin-text-muted sm:inline">
                {dirtyEntries.map((e) => e.label).join("、")}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={saveAll}
            disabled={savingAll}
            className="shrink-0 rounded-md bg-admin-accent px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingAll ? "儲存中…" : `全部儲存（${count}）`}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
