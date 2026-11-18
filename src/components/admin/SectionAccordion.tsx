"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { DeleteSectionButton } from "@/components/admin/DeleteSectionButton";
import { CompletionBadge } from "@/components/admin/StatusBadge";
import { useChangesContext } from "@/components/admin/ChangesContext";
import { VersionHistory } from "@/components/admin/VersionHistory";
import type { ProjectSection } from "@/lib/types";
import { resolveFieldLabel, sectionLabel, SECTION_INFO } from "@/lib/admin-field-guide";

function isFilled(value: unknown) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function computeCompletion(content: Record<string, unknown>, prefix: string) {
  const entries = Object.entries(content);
  const missing = entries
    .filter(([, value]) => !isFilled(value))
    .map(([key]) => resolveFieldLabel(prefix, key)?.label ?? key);
  return { filled: entries.length - missing.length, total: entries.length, missing };
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
  // Remounts the editor with restored content after a version restore.
  const [editorState, setEditorState] = useState({ content: section.content, nonce: 0 });
  // Keeps `editorState.content` equal to "what is saved", so the version
  // diff and the missing-field list follow every successful save.
  async function saveAndTrack(content: Record<string, unknown>) {
    const result = await onSave(content);
    if (result.success) setEditorState((prev) => ({ ...prev, content }));
    return result;
  }
  const { filled, total, missing } = computeCompletion(editorState.content, mediaPathPrefix);
  const changes = useChangesContext();
  const isDirty = changes?.dirtyEntries.some((e) => e.id === `section-${section.id}`) ?? false;

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
            {sectionLabel(section.section_type)}
            <span className="ml-2 font-mono text-[10px] font-normal uppercase text-admin-text-faint">
              {section.section_type}
            </span>
          </span>
          {isDirty && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-admin-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-admin-warning" />
              未儲存
            </span>
          )}
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
              {SECTION_INFO[section.section_type] && (
                <p className="mb-4 text-xs text-admin-text-muted">{SECTION_INFO[section.section_type].description}</p>
              )}
              {missing.length > 0 && (
                <div className="mb-5 rounded-md border border-admin-warning/30 bg-admin-warning-soft px-3 py-2.5">
                  <p className="text-xs font-medium text-admin-text">尚未填寫（{missing.length}）</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {missing.map((name) => (
                      <span
                        key={name}
                        className="rounded-full border border-admin-border bg-admin-surface px-2 py-0.5 text-[11px] text-admin-text-muted"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <ContentEditor
                key={editorState.nonce}
                initialContent={editorState.content}
                onSave={saveAndTrack}
                mediaPathPrefix={mediaPathPrefix}
                trackingId={`section-${section.id}`}
                trackingLabel={sectionLabel(section.section_type)}
              />
              <div className="mt-6 border-t border-admin-border pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <VersionHistory
                    entity="project_section"
                    entityKey={section.id}
                    pathPrefix={mediaPathPrefix}
                    currentContent={editorState.content}
                    onSave={saveAndTrack}
                    onRestored={(content) => setEditorState((prev) => ({ content, nonce: prev.nonce + 1 }))}
                  />
                  <DeleteSectionButton sectionId={section.id} sectionName={sectionLabel(section.section_type)} onDelete={onDelete} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
