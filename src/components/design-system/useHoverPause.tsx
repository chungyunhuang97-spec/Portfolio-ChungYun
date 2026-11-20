"use client";

import { useState, type PointerEvent, type RefObject } from "react";
import { Pause } from "@phosphor-icons/react";

/**
 * Lets a visitor stop an auto-playing mockup video to read it.
 *
 * - Mouse: the video pauses while the pointer is over the frame and resumes
 *   when it leaves.
 * - Touch / pen: tap the frame to pause, tap again to resume (there is no
 *   hover on those devices).
 *
 * Videos still autoplay and loop as before; this only adds the pause. Works
 * on whichever <video> is currently inside `containerRef`, so swapping the
 * source (tab changes) needs no extra wiring.
 */
export function useHoverPause(containerRef: RefObject<HTMLElement | null>) {
  const [paused, setPaused] = useState(false);

  const video = () => containerRef.current?.querySelector("video") ?? null;

  function pause() {
    const v = video();
    if (!v) return;
    v.pause();
    setPaused(true);
  }

  function resume() {
    const v = video();
    if (v) void v.play().catch(() => {});
    setPaused(false);
  }

  const handlers = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") pause();
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === "mouse") resume();
    },
    onPointerUp: (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const v = video();
      if (!v) return;
      if (v.paused) resume();
      else pause();
    },
  };

  return { paused, handlers };
}

/** Small "paused" chip shown over a frame while its video is held. */
export function PausedBadge({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="font-nunito inline-flex items-center gap-1.5 rounded-full bg-primary-black/80 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
        <Pause size={11} weight="fill" />
        已暫停
      </span>
    </div>
  );
}
