"use client";

import { useCallback, useRef, useState } from "react";
import { CloudArrowUp, Info, Trash, X } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  HARD_MAX_IMAGE_BYTES,
  HARD_MAX_VIDEO_BYTES,
  type MediaGuide,
} from "@/lib/admin-field-guide";

const BUCKET = "project-media";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(url) || url.includes("img.youtube.com");
}

/**
 * Uploads directly to the Supabase Storage REST endpoint via XHR instead of
 * the SDK's `storage.upload()` (which wraps `fetch` and exposes no progress
 * events) -- this is the only way to show a real, byte-accurate progress
 * bar instead of an indeterminate spinner. Auth is identical to what the
 * SDK sends under the hood: the signed-in user's access token as Bearer,
 * plus the public anon key.
 */
function uploadWithProgress({
  path,
  file,
  accessToken,
  onProgress,
}: {
  path: string;
  file: File;
  accessToken: string;
  onProgress: (pct: number) => void;
}): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`上傳失敗（${xhr.status}）：${xhr.responseText || "未知錯誤"}`));
      }
    };
    xhr.onerror = () => reject(new Error("上傳失敗：網路錯誤"));
    xhr.send(file);
  });
}

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
}

function acceptFromGuide(guide: MediaGuide): string {
  return guide.kinds.map((k) => (k === "image" ? "image/*" : "video/*")).join(",");
}

function kindLabel(guide: MediaGuide): string {
  const both = guide.kinds.includes("image") && guide.kinds.includes("video");
  return both ? "圖片／GIF／影片" : guide.kinds.includes("video") ? "影片" : "圖片";
}

/** Reads a local file's pixel size without uploading it. Resolves null when
 * the browser can't decode it (or takes > 4s) -- callers just skip the
 * dimension checks in that case. */
function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const done = (v: { width: number; height: number } | null) => {
      URL.revokeObjectURL(objectUrl);
      resolve(v);
    };
    const timer = setTimeout(() => done(null), 4000);
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        clearTimeout(timer);
        done(video.videoWidth ? { width: video.videoWidth, height: video.videoHeight } : null);
      };
      video.onerror = () => {
        clearTimeout(timer);
        done(null);
      };
      video.src = objectUrl;
    } else {
      const img = new Image();
      img.onload = () => {
        clearTimeout(timer);
        done({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        clearTimeout(timer);
        done(null);
      };
      img.src = objectUrl;
    }
  });
}

/** Blocking problem (returns a message) for a file the slot can never use. */
function blockingProblem(file: File, guide: MediaGuide | undefined): string | null {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (guide) {
    const allowed = (isImage && guide.kinds.includes("image")) || (isVideo && guide.kinds.includes("video"));
    if (!allowed) {
      return `這個欄位只接受${kindLabel(guide)}，但你選的是「${file.name}」（${file.type || "未知格式"}）`;
    }
  }
  if (isImage && file.size > HARD_MAX_IMAGE_BYTES) {
    return `圖片 ${formatBytes(file.size)} 太大，請先壓縮到 ${formatBytes(HARD_MAX_IMAGE_BYTES)} 以內`;
  }
  if (isVideo && file.size > HARD_MAX_VIDEO_BYTES) {
    return `影片 ${formatBytes(file.size)} 太大，請先壓縮到 ${formatBytes(HARD_MAX_VIDEO_BYTES)} 以內`;
  }
  return null;
}

/** Non-blocking advice about a file against the slot's guide. */
async function softWarnings(file: File, guide: MediaGuide | undefined, warnIfOverBytes?: number): Promise<string[]> {
  const out: string[] = [];
  const isVideo = file.type.startsWith("video/");
  const limit = warnIfOverBytes ?? (guide ? (isVideo ? guide.maxVideoBytes : guide.maxImageBytes) : undefined);
  if (limit && file.size > limit) {
    out.push(`檔案 ${formatBytes(file.size)}，建議壓縮到 ${formatBytes(limit)} 以內，否則前台會載入較慢`);
  }
  if (guide && (guide.ratioValue || guide.minWidth)) {
    const dims = await readDimensions(file);
    if (dims) {
      const { width, height } = dims;
      if (guide.ratioValue) {
        const actual = width / height;
        const diff = Math.abs(actual - guide.ratioValue) / guide.ratioValue;
        if (diff > 0.15) {
          out.push(
            guide.fit === "contain"
              ? `比例是 ${width}×${height}，與建議的 ${guide.ratio} 不同，前台會出現留白`
              : `比例是 ${width}×${height}，與建議的 ${guide.ratio} 差異較大，前台會被裁切`
          );
        }
      }
      if (guide.minWidth && Math.min(width, height * (guide.ratioValue ?? 1)) < guide.minWidth * 0.8) {
        out.push(`解析度 ${width}×${height} 偏低，在高解析螢幕上可能模糊（${guide.size}）`);
      }
    }
  }
  return out;
}

/** Uploads one file to the `project-media` bucket and returns its public
 * URL. Shared by the dropzone and by callers that generate files
 * themselves (e.g. a poster frame captured from an mp4). */
export async function uploadMediaFile(
  file: File,
  mediaPathPrefix: string | undefined,
  onProgress: (pct: number) => void = () => {}
): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("尚未登入或登入已過期，請重新整理頁面");

  const ext = file.name.split(".").pop() ?? "bin";
  const safePrefix = (mediaPathPrefix ?? "misc").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const path = `${safePrefix}/${Date.now()}.${ext}`;

  await uploadWithProgress({ path, file, accessToken: session.access_token, onProgress });
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function AdminMediaDropzone({
  value,
  onChange,
  mediaPathPrefix,
  compact = false,
  warnIfOverBytes,
  accept,
  guide,
}: {
  value: string;
  onChange: (value: string) => void;
  mediaPathPrefix?: string;
  compact?: boolean;
  /** `<input accept>`; defaults to images + videos. */
  accept?: string;
  /** What this slot is for on the public page (name, location, ratio,
   * recommended size, accepted kinds). Drives the on-screen guidance and
   * the pre-upload checks. */
  guide?: MediaGuide;
  /** Shows a non-blocking warning under the dropzone when the selected
   * file exceeds this size -- doesn't stop the upload (e.g.
   * hover_preview_video's "keep it under 3MB" guidance). */
  warnIfOverBytes?: number;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = value ?? "";
  const uploading = progress !== null;
  const acceptAttr = accept ?? (guide ? acceptFromGuide(guide) : "image/*,video/*");

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setWarnings([]);
      const blocked = blockingProblem(file, guide);
      if (blocked) {
        setError(blocked);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      const advice = await softWarnings(file, guide, warnIfOverBytes);
      if (advice.length > 0) setWarnings(advice);
      setProgress(0);
      try {
        onChange(await uploadMediaFile(file, mediaPathPrefix, setProgress));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [mediaPathPrefix, onChange, warnIfOverBytes, guide]
  );

  return (
    <div className="space-y-2.5">
      {guide && <MediaGuideCard guide={guide} />}
      {url ? (
        <div className="flex items-center gap-3">
          <div
            className={`overflow-hidden rounded-lg border border-admin-border bg-admin-surface ${compact ? "h-16 w-16" : "h-20 w-32"}`}
          >
            {isVideoUrl(url) ? (
              <video src={url} className="h-full w-full object-cover" muted />
            ) : isImageUrl(url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase text-admin-text-faint">
                {url.split("?")[0].split(".").pop()}
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate font-mono text-[11px] text-admin-text-faint">{url.split("/").pop()}</p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex w-fit items-center gap-1 text-xs text-admin-danger transition-colors hover:underline"
            >
              <Trash size={12} weight="bold" />
              移除
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 text-center transition-colors focus-within:border-admin-accent ${
            compact ? "py-4" : "py-6"
          } ${
            uploading
              ? "cursor-not-allowed border-admin-border bg-admin-surface-hover"
              : dragOver
                ? "border-admin-accent bg-admin-accent-soft"
                : "border-admin-border-strong bg-admin-surface hover:border-admin-accent/60 hover:bg-admin-surface-hover"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="sr-only"
          />
          {uploading ? (
            <div className="w-full max-w-[180px] space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-admin-border">
                <div
                  className="h-full rounded-full bg-admin-accent transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-admin-text-muted">上傳中… {progress}%</p>
            </div>
          ) : (
            <>
              <CloudArrowUp size={20} weight="light" className="text-admin-text-faint" />
              <p className="text-xs text-admin-text-muted">
                拖曳{guide ? kindLabel(guide) : "檔案"}到這裡，或<span className="text-admin-accent">點擊選擇</span>
              </p>
              {guide && <p className="text-[10px] text-admin-text-faint">{guide.ratio ? `${guide.ratio} · ` : ""}{guide.size}</p>}
            </>
          )}
        </label>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-admin-danger">
          <X size={12} weight="bold" />
          {error}
        </p>
      )}

      {warnings.map((w) => (
        <p key={w} className="flex items-start gap-1 text-xs text-admin-warning">
          <Info size={12} weight="bold" className="mt-0.5 shrink-0" />
          {w}
        </p>
      ))}

      <input
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="或直接貼上圖片／影片網址"
        className="w-full rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 font-mono text-[11px] text-admin-text outline-none transition-colors focus:border-admin-accent"
      />
    </div>
  );
}

/** Compact "what goes here" card shown above every guided upload slot. */
function MediaGuideCard({ guide }: { guide: MediaGuide }) {
  return (
    <div className="rounded-md border border-admin-border bg-admin-accent-soft/40 px-3 py-2">
      <p className="text-xs font-medium text-admin-text">{guide.title}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-admin-text-muted">📍 {guide.where}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-admin-text-faint">
        {guide.ratio ? `${guide.ratio} · ` : ""}
        {guide.size} · {kindLabel(guide)}
        {guide.note ? ` · ${guide.note}` : ""}
      </p>
    </div>
  );
}
