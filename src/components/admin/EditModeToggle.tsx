"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setEditMode } from "@/lib/edit-mode-actions";

/**
 * Floating toggle rendered ONLY when the server has already confirmed a
 * real admin session (see the isAdmin check in work/[slug]/page.tsx and
 * the homepage) -- an anonymous visitor's server-rendered HTML never
 * contains this component at all, so there's nothing to hide with CSS and
 * nothing for a visitor to find in devtools.
 */
export function EditModeToggle({ editModeOn }: { editModeOn: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setEditMode(!editModeOn);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={`fixed bottom-6 right-6 z-[100] rounded-full px-5 py-3 text-xs tracking-[0.15em] shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50 ${
        editModeOn ? "bg-accent text-white" : "bg-ink text-white"
      }`}
    >
      {editModeOn ? "完成編輯" : "編輯"}
    </button>
  );
}
