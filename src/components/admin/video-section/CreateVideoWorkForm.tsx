"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VideoWorkType } from "@/lib/types";

export function CreateVideoWorkForm({
  type,
  onCreate,
}: {
  type: VideoWorkType;
  onCreate: (title: string) => Promise<{ success: boolean; error?: string; id?: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    const result = await onCreate(title.trim());
    if (result.success && result.id) {
      router.push(`/admin/video-section/${result.id}`);
    } else {
      setError(result.error ?? "建立失敗");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-3 rounded-lg border border-admin-border bg-admin-surface p-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">TITLE</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "featured" ? "例：婚禮開場影片" : "例：英語教學品牌 Reels"}
          className="w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
      </div>
      {error && <p className="text-xs text-admin-danger">{error}</p>}
      <button
        type="button"
        onClick={handleCreate}
        disabled={loading || !title.trim()}
        className="rounded-md bg-admin-accent px-4 py-2 text-xs font-medium tracking-wide text-white transition-colors hover:bg-admin-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "建立中…" : "建立並繼續編輯"}
      </button>
    </div>
  );
}
