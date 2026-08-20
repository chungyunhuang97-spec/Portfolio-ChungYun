"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";

export function DeleteSectionButton({
  sectionId,
  onDelete,
}: {
  sectionId: string;
  onDelete: (sectionId: string) => Promise<{ success: boolean; error?: string }>;
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
        REMOVE SECTION
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-admin-danger/30 bg-admin-danger-soft px-3 py-2">
      <span className="text-xs text-admin-text">Remove this section?</span>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onDelete(sectionId);
          router.refresh();
        }}
        className="text-xs font-medium text-admin-danger hover:underline disabled:opacity-50"
      >
        {loading ? "Removing…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-admin-text-muted hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
