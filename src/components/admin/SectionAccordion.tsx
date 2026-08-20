"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { DeleteSectionButton } from "@/components/admin/DeleteSectionButton";
import { CompletionBadge } from "@/components/admin/StatusBadge";
import type { ProjectSection } from "@/lib/types";

function computeCompletion(content: Record<string, unknown>) {
  const entries = Object.entries(content);
  const total = entries.length;
  const filled = entries.filter(([, value]) => {
    if (value == null) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as object).length > 0;
    return true;
  }).length;
  return { filled, total };
}

export function SectionAccordion({
  section,
  onSave,
  onDelete,
  mediaPathPrefix,
  defaultOpen = false,
}: {
  section: ProjectSection;
  onSave: (content: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  onDelete: (sectionId: string) => Promise<{ success: boolean; error?: string }>;
  mediaPathPrefix: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { filled, total } = computeCompletion(section.content);

  return (
    <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-admin-surface-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-admin-accent"
      >
        <span className="flex min-w-0 items-center gap-3">
          <CaretDown
            size={14}
            weight="bold"
            className={`shrink-0 text-admin-text-faint transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
          <span className="truncate text-sm font-medium text-admin-text">
            {section.section_type.toUpperCase()}
          </span>
        </span>
        <CompletionBadge filled={filled} total={total} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="overflow-hidden border-t border-admin-border"
          >
            <div className="px-4 py-5">
              <ContentEditor
                initialContent={section.content}
                onSave={onSave}
                mediaPathPrefix={mediaPathPrefix}
                trackingId={`section-${section.id}`}
                trackingLabel={section.section_type.toUpperCase()}
              />
              <div className="mt-6 border-t border-admin-border pt-4">
                <DeleteSectionButton sectionId={section.id} onDelete={onDelete} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
