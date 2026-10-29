"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";

export function DeleteVideoWorkButton({
  onDelete,
}: {
  onDelete: () => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-faint transition-colors hover:text-admin-danger"
      >
        <Trash size={14} weight="light" />
        刪除這個作品
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-admin-danger/30 bg-admin-danger-soft px-3 py-2">
      <span className="text-xs text-admin-text">確定要刪除這個作品嗎？（會一併刪除關聯的 Reel 連結）</span>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onDelete();
          router.push("/admin/video-section");
          router.refresh();
        }}
        className="text-xs font-medium text-admin-danger hover:underline disabled:opacity-50"
      >
        {loading ? "刪除中…" : "確認刪除"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-admin-text-muted hover:underline"
      >
        取消
      </button>
    </div>
  );
}
