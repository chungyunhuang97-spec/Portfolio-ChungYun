"use client";

import { useState } from "react";
import { ClockCounterClockwise, X } from "@phosphor-icons/react";
import { listContentVersions, type ContentVersion, type VersionEntity } from "@/lib/content-versions";
import { resolveFieldLabel } from "@/lib/admin-field-guide";
import { useAdminFeedback } from "@/components/admin/AdminFeedback";

type SaveResult = { success: boolean; error?: string };

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Top-level keys whose value differs between the snapshot and what's saved now. */
function changedKeys(version: Record<string, unknown>, current: Record<string, unknown>): string[] {
  const keys = new Set([...Object.keys(version), ...Object.keys(current)]);
  return [...keys].filter((k) => JSON.stringify(version[k]) !== JSON.stringify(current[k]));
}

/**
 * "版本紀錄" button + modal. Lists the snapshots the server took before each
 * overwrite and restores one by saving it through the same `onSave` the
 * editor uses (so restoring is itself snapshotted and can be undone).
 */
export function VersionHistory({
  entity,
  entityKey,
  pathPrefix,
  currentContent,
  onSave,
  onRestored,
}: {
  entity: VersionEntity;
  entityKey: string;
  /** Used only to turn field keys into Chinese labels. */
  pathPrefix?: string;
  /** The content as last saved -- diffs are computed against this. */
  currentContent: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => Promise<SaveResult>;
  onRestored: (content: Record<string, unknown>) => void;
}) {
  const { confirm, toast } = useAdminFeedback();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  async function openModal() {
    setOpen(true);
    setLoading(true);
    const result = await listContentVersions(entity, entityKey);
    setAvailable(result.available);
    setVersions(result.versions);
    setLoading(false);
  }

  async function restore(version: ContentVersion) {
    const ok = await confirm({
      title: "還原到這個版本？",
      message: `會用 ${formatTime(version.created_at)} 的內容覆蓋目前已儲存的內容。目前的內容會先存成一筆新紀錄，之後仍可還原回來。`,
      confirmLabel: "還原",
    });
    if (!ok) return;
    setRestoringId(version.id);
    const result = await onSave(version.content);
    setRestoringId(null);
    if (!result.success) {
      toast(`還原失敗：${result.error ?? "未知錯誤"}`, "error");
      return;
    }
    toast("已還原到所選版本", "success");
    onRestored(version.content);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-faint transition-colors hover:text-admin-text"
      >
        <ClockCounterClockwise size={14} weight="bold" />
        版本紀錄
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-lg border border-admin-border bg-admin-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
              <h2 className="text-sm font-semibold text-admin-text">版本紀錄</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="關閉" className="text-admin-text-faint hover:text-admin-text">
                <X size={14} weight="bold" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <p className="py-6 text-center text-sm text-admin-text-faint">載入中…</p>
              ) : !available ? (
                <p className="py-6 text-center text-sm leading-relaxed text-admin-text-muted">
                  尚未啟用版本紀錄。
                  <br />
                  需要先在資料庫套用 <code className="font-mono text-xs">content_versions</code> 資料表。
                </p>
              ) : versions.length === 0 ? (
                <p className="py-6 text-center text-sm leading-relaxed text-admin-text-muted">
                  還沒有歷史版本。
                  <br />
                  每次儲存前，系統會自動保留上一版內容。
                </p>
              ) : (
                <ul className="divide-y divide-admin-border">
                  {versions.map((v) => {
                    const diff = changedKeys(v.content, currentContent);
                    return (
                      <li key={v.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="text-sm text-admin-text">{formatTime(v.created_at)}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-admin-text-faint">
                            {diff.length === 0
                              ? "與目前內容相同"
                              : `與目前不同：${diff
                                  .slice(0, 6)
                                  .map((k) => resolveFieldLabel(pathPrefix, k)?.label ?? k)
                                  .join("、")}${diff.length > 6 ? ` 等 ${diff.length} 項` : ""}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={restoringId !== null || diff.length === 0}
                          onClick={() => restore(v)}
                          className="shrink-0 rounded-md border border-admin-border px-2.5 py-1 text-xs font-medium text-admin-text-muted transition-colors hover:border-admin-accent hover:text-admin-accent disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {restoringId === v.id ? "還原中…" : "還原"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
