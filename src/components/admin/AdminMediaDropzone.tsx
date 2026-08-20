"use client";

import { useCallback, useRef, useState } from "react";
import { CloudArrowUp, Trash, X } from "@phosphor-icons/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const BUCKET = "project-media";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
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

export function AdminMediaDropzone({
  value,
  onChange,
  mediaPathPrefix,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  mediaPathPrefix?: string;
  compact?: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = value ?? "";
  const uploading = progress !== null;

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setProgress(0);
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("尚未登入或登入已過期，請重新整理頁面");

        const ext = file.name.split(".").pop() ?? "bin";
        const safePrefix = (mediaPathPrefix ?? "misc").replace(/[^a-zA-Z0-9/_-]/g, "-");
        const path = `${safePrefix}/${Date.now()}.${ext}`;

        await uploadWithProgress({
          path,
          file,
          accessToken: session.access_token,
          onProgress: setProgress,
        });

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        onChange(data.publicUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setProgress(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [mediaPathPrefix, onChange]
  );

  return (
    <div className="space-y-2.5">
      {url ? (
        <div className="flex items-center gap-3">
          <div
            className={`overflow-hidden rounded-lg border border-admin-border bg-admin-surface ${compact ? "h-16 w-16" : "h-20 w-32"}`}
          >
            {isVideoUrl(url) ? (
              <video src={url} className="h-full w-full object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
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
            accept="image/*,video/*"
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
                拖曳檔案到這裡，或<span className="text-admin-accent">點擊選擇</span>
              </p>
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

      <input
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="或直接貼上圖片／影片網址"
        className="w-full rounded-md border border-admin-border bg-admin-surface px-3 py-1.5 font-mono text-[11px] text-admin-text outline-none transition-colors focus:border-admin-accent"
      />
    </div>
  );
}
