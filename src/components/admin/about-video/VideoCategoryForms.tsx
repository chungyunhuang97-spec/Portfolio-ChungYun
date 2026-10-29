"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "@phosphor-icons/react";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import { VIDEO_SOURCE_TYPES, detectSourceType } from "@/lib/about-video";
import {
  createVideo,
  createVideoCategory,
  deleteVideoCategory,
  updateVideoCategory,
  type VideoCategoryFields,
} from "@/lib/about-video-actions";
import type { VideoCategory, VideoSourceType } from "@/lib/types";
import { Field, SaveButton, Toggle, inputClass, inputClassW, type SaveStatus } from "./ui";

export function NewCategoryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const result = await createVideoCategory(title);
    setBusy(false);
    if (!result.success) return setError(result.error);
    router.push(`/admin/videos/categories/${result.id}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="新分類名稱，例：教學性質短影片"
        className={inputClassW("w-full max-w-xs")}
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={busy || !title.trim()}
        className="inline-flex items-center gap-1.5 rounded-md border border-admin-border px-3 py-2 text-sm text-admin-accent hover:border-admin-accent disabled:opacity-50"
      >
        <Plus size={14} weight="bold" />
        新增分類
      </button>
      {error && <span className="text-xs text-admin-danger">{error}</span>}
    </div>
  );
}

export function VideoCategoryForm({ category }: { category: VideoCategory }) {
  const router = useRouter();
  const [fields, setFields] = useState<VideoCategoryFields>({
    title: category.title,
    subtitle: category.subtitle,
    description: category.description,
    is_visible: category.is_visible,
    level_label: category.level_label,
    brief_image_url: category.brief_image_url,
    tags: category.tags,
    profile_url: category.profile_url,
  });
  const [tagsText, setTagsText] = useState(category.tags.join(", "));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof VideoCategoryFields>(key: K, value: VideoCategoryFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setStatus("saving");
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await updateVideoCategory(category.id, { ...fields, tags });
    if (!result.success) {
      setStatus("error");
      setError(result.error);
      return;
    }
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2000);
  }

  async function handleDelete() {
    if (!window.confirm(`確定要刪除「${category.title}」？分類底下的所有影片也會一起刪除。`)) return;
    const result = await deleteVideoCategory(category.id);
    if (!result.success) return setError(result.error);
    router.push("/admin/videos");
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="TITLE 分類名稱" wide>
          <input value={fields.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </Field>
        <Field label="SUBTITLE 副標">
          <input
            value={fields.subtitle ?? ""}
            onChange={(e) => set("subtitle", e.target.value || null)}
            placeholder="例：社群短影音剪輯"
            className={inputClass}
          />
        </Field>
        <Field label="LEVEL LABEL 徽章" hint="顯示在分類名稱旁的小徽章">
          <input
            value={fields.level_label ?? ""}
            onChange={(e) => set("level_label", e.target.value || null)}
            placeholder="例：進階剪輯"
            className={inputClass}
          />
        </Field>
        <Field label="DESCRIPTION 分類描述" wide>
          <textarea
            rows={3}
            value={fields.description ?? ""}
            onChange={(e) => set("description", e.target.value || null)}
            className={inputClass}
          />
        </Field>
        <Field label="TAGS（逗號分隔）" hint="顯示在右側資訊欄最下方">
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass} />
        </Field>
        <Field label="PROFILE URL 帳號連結" hint="「查看完整帳號」連結，選填">
          <input
            value={fields.profile_url ?? ""}
            onChange={(e) => set("profile_url", e.target.value || null)}
            placeholder="https://www.instagram.com/..."
            className={inputClass}
          />
        </Field>
        <Field label="BRIEF IMAGE 企劃截圖" hint="右側資訊欄的小縮圖，點擊後在燈箱放大" wide>
          <AdminMediaDropzone
            value={fields.brief_image_url ?? ""}
            onChange={(v) => set("brief_image_url", v || null)}
            mediaPathPrefix={`videos/${category.id}/brief`}
            accept="image/*"
            compact
          />
        </Field>
      </div>
      <Toggle checked={fields.is_visible} onChange={(v) => set("is_visible", v)} label="在首頁顯示這個分類" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SaveButton status={status} onClick={handleSave} error={error} disabled={!fields.title.trim()} />
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs text-admin-danger hover:underline"
        >
          <Trash size={12} weight="bold" />
          刪除分類
        </button>
      </div>
    </div>
  );
}

export function NewVideoForm({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<VideoSourceType>("instagram");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleUrl(url: string) {
    setSource(url);
    const detected = detectSourceType(url);
    if (detected && detected !== "mp4") setSourceType(detected);
  }

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const result = await createVideo(categoryId, title, sourceType, source);
    setBusy(false);
    if (!result.success) return setError(result.error);
    router.push(`/admin/videos/${result.id}`);
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-admin-border-strong bg-admin-surface p-4">
      <p className="text-xs font-semibold tracking-[0.1em] text-admin-text-faint">新增影片</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_140px]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="影片標題" className={inputClass} />
        <select
          value={sourceType}
          onChange={(e) => {
            setSourceType(e.target.value as VideoSourceType);
            setSource("");
          }}
          className={inputClass}
          aria-label="來源"
        >
          {VIDEO_SOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      {sourceType === "mp4" ? (
        <AdminMediaDropzone value={source} onChange={setSource} mediaPathPrefix="videos/files" accept="video/*" compact />
      ) : (
        <input
          value={source}
          onChange={(e) => handleUrl(e.target.value)}
          placeholder="貼上 Instagram / YouTube / Vimeo 網址"
          className={inputClass}
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={busy || !title.trim() || !source.trim()}
          className="rounded-md bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent-hover disabled:opacity-50"
        >
          建立並編輯
        </button>
        <span className="text-xs text-admin-text-faint">新影片預設為隱藏，補齊縮圖後再設為可見。</span>
        {error && <span className="text-xs text-admin-danger">{error}</span>}
      </div>
    </div>
  );
}
