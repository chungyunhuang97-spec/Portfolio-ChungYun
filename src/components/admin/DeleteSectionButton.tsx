"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { useAdminFeedback } from "@/components/admin/AdminFeedback";

export function DeleteSectionButton({
  sectionId,
  sectionName,
  onDelete,
}: {
  sectionId: string;
  sectionName?: string;
  onDelete: (sectionId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const { confirm, toast } = useAdminFeedback();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const ok = await confirm({
      title: `刪除${sectionName ? `「${sectionName}」` : "這個區塊"}？`,
      message: "區塊內容會一併刪除，前台對應位置也會消失。若已啟用版本紀錄，可從歷史中還原。",
      confirmLabel: "刪除",
      danger: true,
    });
    if (!ok) return;
    setLoading(true);
    const result = await onDelete(sectionId);
    if (!result.success) {
      setLoading(false);
      toast(`刪除失敗：${result.error ?? "未知錯誤"}`, "error");
      return;
    }
    toast("已刪除區塊", "success");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-faint transition-colors hover:text-admin-danger disabled:opacity-50"
    >
      <Trash size={14} weight="light" />
      {loading ? "刪除中…" : "刪除此區塊"}
    </button>
  );
}
