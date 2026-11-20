"use client";

import { useEffect, useState, type PointerEvent, type RefObject } from "react";
import { Pause, Play } from "@phosphor-icons/react";

/**
 * Lets a visitor stop an auto-playing mockup video and scrub through it.
 *
 * - Mouse: hovering the frame pauses the video and shows a control bar
 *   (play/pause + a draggable timeline). Leaving the frame hides the bar and
 *   resumes autoplay from wherever it was left.
 * - Touch / pen (no hover): tap the frame to pause and show the bar; tap the
 *   frame again to resume.
 *
 * Videos still autoplay and loop as before. The hook works on whichever
 * <video> is currently inside `containerRef`, so swapping the source (tab
 * changes) needs no extra wiring.
 */
export function useHoverPause(containerRef: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const video = () => containerRef.current?.querySelector("video") ?? null;

  // While the bar is open, mirror the video's position/state into React
  // state every frame so the timeline moves smoothly and stays accurate.
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const tick = () => {
      const v = containerRef.current?.querySelector("video");
      if (v) {
        setTime((prev) => (Math.abs(prev - v.currentTime) > 0.01 ? v.currentTime : prev));
        setDuration((prev) => (Number.isFinite(v.duration) && v.duration !== prev ? v.duration : prev));
        setPlaying(!v.paused);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, containerRef]);

  function openAndPause() {
    const v = video();
    if (!v) return;
    v.pause();
    setOpen(true);
  }

  function closeAndResume() {
    const v = video();
    if (v) void v.play().catch(() => {});
    setOpen(false);
  }

  const handlers = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType === "mouse") openAndPause();
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === "mouse") closeAndResume();
    },
    onPointerUp: (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const v = video();
      if (!v) return;
      if (open) closeAndResume();
      else openAndPause();
    },
  };

  const controls: VideoControlsProps = {
    open,
    time,
    duration,
    playing,
    onSeek: (t: number) => {
      const v = video();
      if (!v) return;
      v.currentTime = t;
      setTime(t);
    },
    onToggle: () => {
      const v = video();
      if (!v) return;
      if (v.paused) void v.play().catch(() => {});
      else v.pause();
    },
  };

  return { controls, handlers };
}

interface VideoControlsProps {
  open: boolean;
  time: number;
  duration: number;
  playing: boolean;
  onSeek: (t: number) => void;
  onToggle: () => void;
}

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Control bar shown over a frame while its video is held: play/pause plus a
 * draggable timeline. Touches on the bar itself never toggle the frame's
 * tap-to-pause.
 */
export function VideoControls({ open, time, duration, playing, onSeek, onToggle }: VideoControlsProps) {
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div
      className={`absolute inset-x-3 bottom-4 z-20 transition-all duration-200 ${
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <div className="font-nunito flex items-center gap-2.5 rounded-full bg-primary-black/85 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? "暫停" : "播放"}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
        >
          {playing ? <Pause size={13} weight="fill" /> : <Play size={13} weight="fill" />}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(time, duration || 0)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="影片進度"
          disabled={!duration}
          className="video-scrubber h-5 min-w-0 flex-1 cursor-pointer"
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
        />
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-white/70">
          {fmt(time)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
