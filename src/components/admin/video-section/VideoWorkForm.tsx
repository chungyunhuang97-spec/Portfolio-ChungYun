"use client";

import { useMemo, useState } from "react";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import type { VideoEmbedType, VideoWork } from "@/lib/types";
import type { VideoWorkFields } from "@/lib/admin-actions";

function inputClass() {
  return "w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";
}

function labelClass() {
  return "text-[11px] font-medium tracking-[0.1em] text-admin-text-faint";
}

export function VideoWorkForm({
  work,
  onSave,
}: {
  work: VideoWork;
  onSave: (
    workId: string,
    fields: VideoWorkFields
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const initial: VideoWorkFields = {
    title: work.title,
    subtitle: work.subtitle,
    description: work.description,
    role_items: work.role_items,
    tags: work.tags,
    thumbnail_url: work.thumbnail_url,
    video_url: work.video_url,
    embed_type: work.embed_type,
    brief_image_url: work.brief_image_url,
    level_label: work.level_label,
    sort_order: work.sort_order,
    is_active: work.is_active,
  };

  const [fields, setFields] = useState(initial);
  const [tagsText, setTagsText] = useState(work.tags.join(", "));
  const [roleItemsText, setRoleItemsText] = useState((work.role_items ?? []).join("\n"));
  const [baseline, setBaseline] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function set<K extends keyof VideoWorkFields>(key: K, value: VideoWorkFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const currentFields = useMemo<VideoWorkFields>(() => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const roleItems = roleItemsText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    return { ...fields, tags, role_items: roleItems.length > 0 ? roleItems : null };
  }, [fields, tagsText, roleItemsText]);

  const isDirty = JSON.stringify(currentFields) !== JSON.stringify(baseline);

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);
    const result = await onSave(work.id, currentFields);
    if (result.success) {
      setBaseline(currentFields);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Unknown error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>TITLE</label>
        <input value={fields.title} onChange={(e) => set("title", e.target.value)} className={inputClass()} />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>SUBTITLE</label>
        <input
          value={fields.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value || null)}
          placeholder="例：企劃 + 導演 + 剪輯"
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>DESCRIPTION</label>
        <textarea
          rows={3}
          value={fields.description ?? ""}
          onChange={(e) => set("description", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>我負責的部分（每行一項，留空則不顯示）</label>
        <textarea
          rows={3}
          value={roleItemsText}
          onChange={(e) => setRoleItemsText(e.target.value)}
          placeholder={"撰寫拍攝企劃文件\n現場引導與導演\n後製剪輯"}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>TAGS (comma separated)</label>
        <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass()} />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>LEVEL 標籤（自訂文案，例：基礎剪輯 / 進階剪輯，留空則不顯示）</label>
        <input
          value={fields.level_label ?? ""}
          onChange={(e) => set("level_label", e.target.value || null)}
          placeholder="基礎剪輯"
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>VIDEO / LINK URL</label>
        <input
          value={fields.video_url ?? ""}
          onChange={(e) => set("video_url", e.target.value || null)}
          placeholder="YouTube 連結或 Instagram 連結"
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>EMBED TYPE</label>
        <select
          value={fields.embed_type ?? ""}
          onChange={(e) => set("embed_type", (e.target.value || null) as VideoEmbedType | null)}
          className={inputClass()}
        >
          <option value="">（未設定）</option>
          <option value="youtube">youtube — 站內展開播放</option>
          <option value="link">link — 開新分頁連結</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>THUMBNAIL（留空則 YouTube 影片自動抓縮圖）</label>
        <AdminMediaDropzone
          value={fields.thumbnail_url ?? ""}
          onChange={(v) => set("thumbnail_url", v || null)}
          mediaPathPrefix={`video-works/${work.id}/thumbnail`}
          compact
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>BRIEF 截圖（僅精選作品使用，點擊可放大）</label>
        <AdminMediaDropzone
          value={fields.brief_image_url ?? ""}
          onChange={(v) => set("brief_image_url", v || null)}
          mediaPathPrefix={`video-works/${work.id}/brief`}
          compact
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>SORT ORDER</label>
        <input
          type="number"
          value={fields.sort_order}
          onChange={(e) => set("sort_order", Number(e.target.value))}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>IS ACTIVE</label>
        <button
          type="button"
          role="switch"
          aria-checked={fields.is_active}
          onClick={() => set("is_active", !fields.is_active)}
          className={`relative h-7 w-12 shrink-0 self-start rounded-full transition-colors ${
            fields.is_active ? "bg-admin-success" : "bg-admin-border-strong"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              fields.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-4 md:col-span-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || status === "saving"}
          className="rounded-md bg-admin-accent px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "saving" ? "儲存中…" : "儲存"}
        </button>
        {isDirty && status !== "saving" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-warning" />
            未儲存
          </span>
        )}
        {status === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-success">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-success" />
            已儲存
          </span>
        )}
        {status === "error" && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-danger">
            <span className="h-1.5 w-1.5 rounded-full bg-admin-danger" />
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
}
