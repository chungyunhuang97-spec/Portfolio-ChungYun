"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { playerEmbedUrl } from "@/lib/about-video";
import type { Video } from "@/lib/types";

/**
 * Plays an Instagram video in a modal: Instagram's embed carries its own
 * header/footer chrome that can't be styled away (cross-origin iframe), so
 * it gets a rounded, roomier frame here instead of being squeezed into the
 * card, capped at 85svh.
 * Unmounting the modal unmounts the iframe, so closing it stops playback.
 */
export function InstagramLightbox({ video, onClose }: { video: Video; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const embed = playerEmbedUrl(video);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-full w-full max-w-[420px] flex-col items-center gap-3">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="flex size-11 items-center justify-center self-end rounded-full bg-cream text-grey-900"
        >
          <X size={18} weight="bold" />
        </button>
        {embed && (
          <div className="w-full overflow-hidden rounded-[var(--radius-card)] bg-white">
            <iframe
              src={embed}
              title={video.title}
              scrolling="no"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="block h-[min(85svh,calc(100svh-140px),760px)] w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
