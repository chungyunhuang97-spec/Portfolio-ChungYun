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
        className="inline-flex items-center gap-1.5 text-xs tracking-wide text-ink-faint transition-colors hover:text-red-700"
      >
        <Trash size={14} weight="light" />
        REMOVE SECTION
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-faint">Remove this section?</span>
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onDelete(sectionId);
          router.refresh();
        }}
        className="text-xs tracking-wide text-red-700 hover:underline"
      >
        {loading ? "Removing…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs tracking-wide text-ink-faint hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
