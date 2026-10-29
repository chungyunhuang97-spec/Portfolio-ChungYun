"use client";

import { useState, useTransition } from "react";
import type { VideoSectionSettings } from "@/lib/types";

/**
 * Master on/off switch for the whole homepage "影片製作" section -- mirrors
 * `video_section_settings.is_visible`. Flips immediately on click (no
 * separate Save step) since there's only this one field to persist.
 */
export function VideoSectionVisibilityToggle({
  settings,
  onSave,
}: {
  settings: VideoSectionSettings;
  onSave: (
    settingsId: string,
    isVisible: boolean
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const [isVisible, setIsVisible] = useState(settings.is_visible);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !isVisible;
    setError(null);
    startTransition(async () => {
      const result = await onSave(settings.id, next);
      if (result.success) {
        setIsVisible(next);
      } else {
        setError(result.error ?? "儲存失敗");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-admin-border bg-admin-surface p-5">
      <button
        type="button"
        role="switch"
        aria-checked={isVisible}
        onClick={toggle}
        disabled={isPending}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          isVisible ? "bg-admin-success" : "bg-admin-border-strong"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            isVisible ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-admin-text">
          {isVisible ? "首頁影片製作 section 顯示中" : "首頁影片製作 section 已隱藏"}
        </p>
        <p className="mt-0.5 text-xs text-admin-text-faint">
          {isPending ? "儲存中…" : "切換後立即套用到首頁"}
        </p>
        {error && <p className="mt-1 text-xs text-admin-danger">{error}</p>}
      </div>
    </div>
  );
}
