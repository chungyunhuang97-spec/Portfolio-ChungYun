"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { AdminMediaDropzone, uploadMediaFile } from "@/components/admin/AdminMediaDropzone";
import {
  PREVIEW_CLIP_MAX_BYTES,
  VIDEO_ASPECT_RATIOS,
  VIDEO_SOURCE_TYPES,
  cssAspectRatio,
  detectSourceType,
  validateVideo,
  youTubePosterFor,
  type VideoFields,
} from "@/lib/about-video";
import { deleteVideo, updateVideo } from "@/lib/about-video-actions";
import type { Video, VideoAspectRatio, VideoCategory, VideoSourceType } from "@/lib/types";
import { Field, Messages, SaveButton, Toggle, inputClass, type SaveStatus } from "./ui";

/** Grabs the frame at `seconds` from an uploaded video as a JPEG file. */
async function captureFrame(src: string, seconds: number): Promise<File> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.preload = "auto";
  video.src = src;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("無法讀取影片檔"));
  });
  video.currentTime = Math.min(Math.max(0, seconds), Math.max(0, video.duration - 0.1));
  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve();
  });
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")!.drawImage(video, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("擷取畫面失敗（影片網域可能不允許跨來源讀取）");
  return new File([blob], "poster.jpg", { type: "image/jpeg" });
}

function fieldsFromVideo(v: Video): VideoFields {
  return {
    title: v.title,
    source_type: v.source_type,
    source_url: v.source_url,
    video_file: v.video_file,
    poster_image: v.poster_image,
    poster_alt: v.poster_alt,
    poster_time: v.poster_time,
    preview_clip: v.preview_clip,
    aspect_ratio: v.aspect_ratio,
    duration: v.duration,
    roles: v.roles,
    client: v.client,
    year: v.year,
    captions_url: v.captions_url,
    is_featured: v.is_featured,
    sort_order: v.sort_order,
    is_visible: v.is_visible,
  };
}

export function VideoEditor({ video, category }: { video: Video; category: VideoCategory }) {
  const router = useRouter();
  const [fields, setFields] = useState<VideoFields>(() => fieldsFromVideo(video));
  const [rolesText, setRolesText] = useState(video.roles.join(", "));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  function set<K extends keyof VideoFields>(key: K, value: VideoFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const current: VideoFields = {
    ...fields,
    roles: rolesText.split(",").map((r) => r.trim()).filter(Boolean),
  };
  const { errors, warnings } = validateVideo(current);

  /** Pasting a URL: detect the platform; YouTube also fills the poster. */
  function handleSourceUrl(url: string) {
    setFields((prev) => {
      const next = { ...prev, source_url: url || null };
      const detected = detectSourceType(url);
      if (detected && detected !== "mp4") next.source_type = detected;
      if (next.source_type === "youtube" && !prev.poster_image) {
        const poster = youTubePosterFor(url);
        if (poster) {
          next.poster_image = poster;
          next.poster_alt = prev.poster_alt || prev.title;
          next.aspect_ratio = /shorts\//i.test(url) ? "9:16" : "16:9";
        }
      }
      return next;
    });
  }

  async function grabPoster(src: string | null, seconds: number | null) {
    if (!src) return;
    setCapturing(true);
    setCaptureError(null);
    try {
      const file = await captureFrame(src, seconds ?? 1);
      const url = await uploadMediaFile(file, `videos/${video.id}/poster`);
      setFields((prev) => ({ ...prev, poster_image: url, poster_alt: prev.poster_alt || prev.title }));
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : "擷取失敗");
    } finally {
      setCapturing(false);
    }
  }

  function handleVideoFile(url: string) {
    set("video_file", url || null);
    // Auto-grab a poster from the freshly uploaded file when there isn't one.
    if (url && !fields.poster_image) void grabPoster(url, fields.poster_time);
  }

  async function handleSave() {
    if (errors.length > 0) return;
    setStatus("saving");
    setSaveError(null);
    const result = await updateVideo(video.id, category.id, current);
    if (!result.success) {
      setStatus("error");
      setSaveError(result.error);
      return;
    }
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2000);
  }

  async function handleDelete() {
    if (!window.confirm(`確定要刪除「${video.title}」？`)) return;
    const result = await deleteVideo(video.id, category.id);
    if (!result.success) return setSaveError(result.error);
    router.push(`/admin/videos/categories/${category.id}`);
  }

  const instagramNeedsPoster = fields.source_type === "instagram" && !fields.poster_image;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="TITLE 標題" wide>
          <input value={fields.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </Field>

        <Field label="SOURCE TYPE 來源">
          <select
            value={fields.source_type}
            onChange={(e) => set("source_type", e.target.value as VideoSourceType)}
            className={inputClass}
          >
            {VIDEO_SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="ASPECT RATIO 比例" hint="婚禮等橫式影片請選 16:9">
          <select
            value={fields.aspect_ratio}
            onChange={(e) => set("aspect_ratio", e.target.value as VideoAspectRatio)}
            className={inputClass}
          >
            {VIDEO_ASPECT_RATIOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        {fields.source_type === "mp4" ? (
          <>
            <Field label="VIDEO FILE 影片檔" hint="上傳後若沒有縮圖，會自動擷取 POSTER TIME 那一秒的畫面" wide>
              <AdminMediaDropzone
                value={fields.video_file ?? ""}
                onChange={handleVideoFile}
                mediaPathPrefix={`videos/${video.id}/file`}
                accept="video/*"
              />
            </Field>
            <Field label="POSTER TIME 擷取秒數">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={fields.poster_time ?? ""}
                  onChange={(e) => set("poster_time", e.target.value === "" ? null : Number(e.target.value))}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => grabPoster(fields.video_file, fields.poster_time)}
                  disabled={!fields.video_file || capturing}
                  className="shrink-0 rounded-md border border-admin-border px-3 text-xs text-admin-accent hover:border-admin-accent disabled:opacity-50"
                >
                  {capturing ? "擷取中…" : "擷取為縮圖"}
                </button>
              </div>
              {captureError && <p className="text-xs text-admin-danger">{captureError}</p>}
            </Field>
          </>
        ) : (
          <Field
            label="SOURCE URL 影片網址"
            hint={
              fields.source_type === "youtube"
                ? "貼上 YouTube 網址會自動帶入縮圖"
                : fields.source_type === "instagram"
                  ? "Instagram 無法自動抓縮圖，請在下方上傳"
                  : undefined
            }
            wide
          >
            <input
              value={fields.source_url ?? ""}
              onChange={(e) => handleSourceUrl(e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
        )}
      </div>

      {/* --- Poster + crop preview --- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-5">
          {instagramNeedsPoster && (
            <p className="rounded-md border border-admin-danger bg-admin-danger-soft px-3 py-2 text-xs text-admin-danger">
              Instagram 影片請上傳縮圖（建議 1080px 寬）。沒有縮圖時，首頁會顯示海報卡，而且不能設為可見。
            </p>
          )}
          <Field label="POSTER IMAGE 縮圖" hint="建議 1080px 寬">
            <AdminMediaDropzone
              value={fields.poster_image ?? ""}
              onChange={(v) => set("poster_image", v || null)}
              mediaPathPrefix={`videos/${video.id}/poster`}
              accept="image/*"
            />
          </Field>
          <Field
            label="POSTER ALT 縮圖替代文字"
            error={fields.poster_image && !fields.poster_alt?.trim() ? "有縮圖時為必填" : null}
          >
            <input
              value={fields.poster_alt ?? ""}
              onChange={(e) => set("poster_alt", e.target.value || null)}
              className={inputClass}
            />
          </Field>
        </div>
        <div>
          <p className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">裁切預覽（{fields.aspect_ratio}）</p>
          <div
            style={{ aspectRatio: cssAspectRatio(fields.aspect_ratio) }}
            className={`mt-1.5 w-full overflow-hidden rounded-lg border ${
              fields.poster_image ? "border-admin-border" : "border-dashed border-admin-danger bg-admin-danger-soft"
            }`}
          >
            {fields.poster_image ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin crop preview of an uploaded URL
              <img src={fields.poster_image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-admin-danger">缺縮圖</span>
            )}
          </div>
        </div>
      </div>

      {/* --- Details --- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="PREVIEW CLIP 預覽片段" hint="選取卡片時靜音循環播放；mp4/webm，3–6 秒，2MB 以內" wide>
          <AdminMediaDropzone
            value={fields.preview_clip ?? ""}
            onChange={(v) => set("preview_clip", v || null)}
            mediaPathPrefix={`videos/${video.id}/preview`}
            accept="video/mp4,video/webm"
            warnIfOverBytes={PREVIEW_CLIP_MAX_BYTES}
            compact
          />
        </Field>
        <Field label="DURATION 時長（選填）">
          <input
            value={fields.duration ?? ""}
            onChange={(e) => set("duration", e.target.value || null)}
            placeholder="0:45"
            className={inputClass}
          />
        </Field>
        <Field label="ROLES 角色（逗號分隔）">
          <input
            value={rolesText}
            onChange={(e) => setRolesText(e.target.value)}
            placeholder="企劃, 導演, 剪輯"
            className={inputClass}
          />
        </Field>
        <Field label="CLIENT 客戶">
          <input value={fields.client ?? ""} onChange={(e) => set("client", e.target.value || null)} className={inputClass} />
        </Field>
        <Field label="YEAR 年份">
          <input
            type="number"
            value={fields.year ?? ""}
            onChange={(e) => set("year", e.target.value === "" ? null : parseInt(e.target.value, 10))}
            className={inputClass}
          />
        </Field>
        <Field label="CAPTIONS 字幕檔（.vtt）" wide>
          <AdminMediaDropzone
            value={fields.captions_url ?? ""}
            onChange={(v) => set("captions_url", v || null)}
            mediaPathPrefix={`videos/${video.id}/captions`}
            accept=".vtt,text/vtt"
            compact
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <Toggle
          checked={fields.is_featured}
          onChange={(v) => set("is_featured", v)}
          label="設為這個分類的預設選取影片（會取消同分類其他影片的預設）"
        />
        <Toggle
          checked={fields.is_visible}
          onChange={(v) => set("is_visible", v)}
          label="在首頁顯示"
          disabled={instagramNeedsPoster && !fields.is_visible}
        />
      </div>

      <div className="sticky bottom-0 space-y-3 border-t border-admin-border bg-admin-bg py-4">
        <Messages errors={errors} warnings={warnings} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SaveButton status={status} disabled={errors.length > 0} onClick={handleSave} error={saveError} />
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs text-admin-danger hover:underline"
          >
            <Trash size={12} weight="bold" />
            刪除影片
          </button>
        </div>
      </div>
    </div>
  );
}
