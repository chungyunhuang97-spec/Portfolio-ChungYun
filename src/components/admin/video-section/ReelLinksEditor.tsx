"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "@phosphor-icons/react";
import type { ReelLink } from "@/lib/types";
import type { ReelLinkFields } from "@/lib/admin-actions";

function inputClass() {
  return "w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";
}

type SaveFn = (fields: ReelLinkFields) => Promise<{ success: boolean; error?: string }>;
type DeleteFn = () => Promise<{ success: boolean; error?: string }>;

function ReelLinkRow({
  link,
  onSave,
  onDelete,
}: {
  link: ReelLink;
  onSave: SaveFn;
  onDelete: DeleteFn;
}) {
  const router = useRouter();
  const initial: ReelLinkFields = {
    label: link.label,
    url: link.url,
    sort_order: link.sort_order,
    is_active: link.is_active,
  };
  const [fields, setFields] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function set<K extends keyof ReelLinkFields>(key: K, value: ReelLinkFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const isDirty = JSON.stringify(fields) !== JSON.stringify(baseline);

  async function handleSave() {
    setStatus("saving");
    const result = await onSave(fields);
    if (result.success) {
      setBaseline(fields);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border border-admin-border p-3 md:grid-cols-[1fr_1fr_80px_auto_auto]">
      <input
        value={fields.label}
        onChange={(e) => set("label", e.target.value)}
        placeholder="顯示名稱，例：英文文法 Reel #1"
        className={inputClass()}
      />
      <input
        value={fields.url}
        onChange={(e) => set("url", e.target.value)}
        placeholder="IG Reel 連結"
        className={inputClass()}
      />
      <input
        type="number"
        value={fields.sort_order}
        onChange={(e) => set("sort_order", Number(e.target.value))}
        className={inputClass()}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty || status === "saving"}
        className="rounded-md bg-admin-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "saving" ? "…" : status === "saved" ? "已儲存" : "儲存"}
      </button>
      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await onDelete();
              router.refresh();
            }}
            className="text-xs font-medium text-admin-danger hover:underline"
          >
            確認刪除
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="text-xs text-admin-text-muted hover:underline"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="inline-flex items-center justify-center rounded-md border border-admin-border px-3 py-2 text-admin-text-faint transition-colors hover:border-admin-danger hover:text-admin-danger"
          aria-label="刪除此連結"
        >
          <Trash size={14} weight="bold" />
        </button>
      )}
    </div>
  );
}

export function ReelLinksEditor({
  reelLinks,
  onAdd,
  onSaveLink,
  onDeleteLink,
}: {
  reelLinks: ReelLink[];
  onAdd: (fields: ReelLinkFields) => Promise<{ success: boolean; error?: string }>;
  onSaveLink: (linkId: string, fields: ReelLinkFields) => Promise<{ success: boolean; error?: string }>;
  onDeleteLink: (linkId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setAdding(true);
    await onAdd({
      label: newLabel.trim(),
      url: newUrl.trim(),
      sort_order: reelLinks.length,
      is_active: true,
    });
    setNewLabel("");
    setNewUrl("");
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {reelLinks.length === 0 && (
        <p className="text-sm text-admin-text-faint">尚無 Reel 連結，新增一筆後會顯示在卡片的連結列表中。</p>
      )}
      {reelLinks.map((link) => (
        <ReelLinkRow
          key={link.id}
          link={link}
          onSave={(fields) => onSaveLink(link.id, fields)}
          onDelete={() => onDeleteLink(link.id)}
        />
      ))}

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-dashed border-admin-border-strong p-3">
        <div className="flex-1 min-w-[160px]">
          <label className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">LABEL</label>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="顯示名稱"
            className={`mt-1 ${inputClass()}`}
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">URL</label>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="IG Reel 連結"
            className={`mt-1 ${inputClass()}`}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !newLabel.trim() || !newUrl.trim()}
          className="inline-flex items-center gap-1.5 rounded-md border border-admin-border px-3 py-2 text-xs font-medium text-admin-text-muted transition-colors hover:border-admin-accent hover:text-admin-accent disabled:opacity-50"
        >
          <Plus size={14} weight="bold" />
          {adding ? "新增中…" : "新增連結"}
        </button>
      </div>
    </div>
  );
}
