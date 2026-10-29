"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowUpRight, CaretLeft, CaretRight, Star } from "@phosphor-icons/react/dist/ssr";
import { aspectValue, displayNumber } from "@/lib/about-video";
import type { VideoWorksCategory } from "@/lib/data";
import { BriefLightbox } from "@/components/video-section/BriefLightbox";
import { InstagramLightbox } from "./InstagramLightbox";
import { POSTER_THEMES, VideoCard } from "./VideoCard";

/** Neighbour cards per side that stay visible, and their scale steps. */
const VISIBLE_PER_SIDE = 2;
const SCALES = [1, 0.82, 0.68];
/** How much of a neighbour hides behind the card in front of it. */
const OVERLAP = 0.45;
const MAX_CARD_HEIGHT = 460;
const SWIPE_PX = 40;
/** preview_clip only autoplays for a mouse/trackpad user who allows motion. */
const PREVIEW_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

function featuredIndex(category: VideoWorksCategory): number {
  const i = category.videos.findIndex((v) => v.is_featured);
  return i === -1 ? 0 : i;
}

/** Horizontal center offset (px) for every card, selected card at 0. */
function layoutOffsets(widths: number[], selected: number): number[] {
  const x = new Array<number>(widths.length).fill(0);
  for (const dir of [-1, 1]) {
    let edge = (widths[selected] * SCALES[0]) / 2;
    for (let d = 1; selected + dir * d >= 0 && selected + dir * d < widths.length; d++) {
      const i = selected + dir * d;
      const w = widths[i] * SCALES[Math.min(d, SCALES.length - 1)];
      x[i] = dir * (edge + w / 2 - w * OVERLAP);
      edge = Math.abs(x[i]) + w / 2;
    }
  }
  return x;
}

/**
 * Homepage "03 / VIDEO WORKS" (Phase 2 = behaviour; the dark-background
 * redesign and motion are Phases 3-4). Categories and videos come from
 * video_categories / videos; every number (01 / 04, 01 / 06) is derived
 * from sort order.
 */
export function VideoWorksSection({ categories }: { categories: VideoWorksCategory[] }) {
  const [catIndex, setCatIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(() => featuredIndex(categories[0]));
  const [playing, setPlaying] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const canPreview = useMediaQuery(PREVIEW_QUERY);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<number | null>(null);

  const category = categories[catIndex];
  const videos = category.videos;
  const video = videos[videoIndex];
  const multi = videos.length > 1;
  const theme = POSTER_THEMES[catIndex % POSTER_THEMES.length];

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function selectCategory(i: number) {
    if (i === catIndex) return;
    setPlaying(false);
    setCatIndex(i);
    setVideoIndex(featuredIndex(categories[i]));
  }

  function selectVideo(i: number) {
    const next = (i + videos.length) % videos.length;
    if (next === videoIndex) return;
    setPlaying(false); // unmounts the previous player
    setVideoIndex(next);
  }

  // Same card height across the category; widths follow each aspect ratio.
  const ratios = videos.map((v) => aspectValue(v.aspect_ratio));
  const maxRatio = Math.max(...ratios);
  const widthShare = maxRatio > 1 ? 0.86 : 0.62;
  const cardHeight = stageWidth ? Math.min(MAX_CARD_HEIGHT, (stageWidth * widthShare) / maxRatio) : 0;
  const widths = ratios.map((r) => cardHeight * r);
  const offsets = layoutOffsets(widths, videoIndex);

  function handleStageKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!multi) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectVideo(videoIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      selectVideo(videoIndex + 1);
    }
  }

  function handleTabKey(e: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (catIndex + keys[e.key] + categories.length) % categories.length;
    selectCategory(next);
    document.getElementById(`video-tab-${categories[next].id}`)?.focus();
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    pointerStart.current = e.pointerType === "mouse" ? null : e.clientX;
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (pointerStart.current === null || !multi) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) > SWIPE_PX) selectVideo(videoIndex + (dx < 0 ? 1 : -1));
  }

  const meta = [video.roles.join(" / "), video.client, video.year].filter(Boolean);

  return (
    <section id="video" aria-labelledby="video-works-heading" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-nunito text-[11px] font-extrabold tracking-[0.25em] text-secondary-blue md:text-[13px]">
              03 / VIDEO WORKS
            </p>
            <h2 id="video-works-heading" className="mt-2 text-2xl md:text-3xl">
              影片製作
            </h2>
            <p className="mt-1 text-sm tracking-[0.1em] text-ink-faint">企劃 · 導演 · 剪輯</p>
          </div>
          <p className="font-nunito text-sm font-bold tracking-[0.15em] text-ink-muted" aria-label={`第 ${catIndex + 1} 個分類，共 ${categories.length} 個`}>
            {displayNumber(catIndex)} / {String(categories.length).padStart(2, "0")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Categories */}
          <div
            role="tablist"
            aria-label="影片分類"
            aria-orientation="vertical"
            onKeyDown={handleTabKey}
            className="flex gap-2 overflow-x-auto pb-2 lg:col-span-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
          >
            {categories.map((c, i) => {
              const active = i === catIndex;
              return (
                <button
                  key={c.id}
                  id={`video-tab-${c.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="video-works-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectCategory(i)}
                  className={`group flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap border-b border-line px-1 py-3 text-left transition-colors lg:whitespace-normal ${
                    active ? "text-ink" : "text-ink-faint hover:text-ink-muted"
                  }`}
                >
                  <span className="flex w-3 shrink-0 justify-center text-secondary-blue">
                    {active && <Star size={12} weight="fill" aria-hidden />}
                  </span>
                  <span className="font-mono text-xs transition-transform group-hover:translate-x-2">{displayNumber(i)}</span>
                  <span className="text-sm">{c.title}</span>
                  <span className="text-xs text-ink-faint">({c.videos.length})</span>
                </button>
              );
            })}
          </div>

          {/* Cards */}
          <div id="video-works-panel" role="tabpanel" aria-labelledby={`video-tab-${category.id}`} className="min-w-0 lg:col-span-6">
            <div
              ref={stageRef}
              role="group"
              aria-roledescription="carousel"
              aria-label={`${category.title} 影片`}
              tabIndex={0}
              onKeyDown={handleStageKey}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              className="relative touch-pan-y overflow-hidden outline-offset-4 focus-visible:outline-2 focus-visible:outline-secondary-blue"
              style={{ height: cardHeight || MAX_CARD_HEIGHT }}
            >
              {cardHeight > 0 &&
                videos.map((v, i) => {
                  const d = Math.abs(i - videoIndex);
                  if (d > VISIBLE_PER_SIDE) return null;
                  const scale = SCALES[Math.min(d, SCALES.length - 1)];
                  return (
                    <VideoCard
                      key={v.id}
                      video={v}
                      index={i}
                      state={i === videoIndex ? (playing ? "playing" : "selected") : "idle"}
                      theme={theme}
                      showPreview={canPreview}
                      onSelect={() => selectVideo(i)}
                      onPlay={() => setPlaying(true)}
                      style={{
                        width: widths[i],
                        height: cardHeight,
                        zIndex: 10 - d,
                        transform: `translateX(calc(-50% + ${offsets[i]}px)) scale(${scale})`,
                        // Dim, never fade: a translucent poster reads as "not loaded".
                        filter: d === 0 ? "none" : "brightness(0.7)",
                      }}
                    />
                  );
                })}
            </div>

            <p className="sr-only" aria-live="polite">
              {category.title}：第 {videoIndex + 1} 支，共 {videos.length} 支，{video.title}
            </p>

            {multi && (
              <div className="mt-5 flex items-center justify-center gap-5">
                <button
                  type="button"
                  onClick={() => selectVideo(videoIndex - 1)}
                  aria-label="上一支"
                  className="flex size-11 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-ink"
                >
                  <CaretLeft size={18} weight="bold" />
                </button>
                <span className="font-nunito text-xs font-bold tracking-[0.15em] text-ink-muted">
                  {displayNumber(videoIndex)} / {String(videos.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => selectVideo(videoIndex + 1)}
                  aria-label="下一支"
                  className="flex size-11 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-ink"
                >
                  <CaretRight size={18} weight="bold" />
                </button>
              </div>
            )}

            {video.source_type === "instagram" && video.source_url && (
              <p className="mt-3 text-center">
                <a
                  href={video.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  在 Instagram 上觀看 <ArrowUpRight size={14} weight="bold" />
                </a>
              </p>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-2xl">{category.title}</h3>
              {category.level_label && (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] tracking-[0.1em] text-accent">
                  {category.level_label}
                </span>
              )}
            </div>
            {category.subtitle && <p className="mt-1 text-sm text-ink-faint">{category.subtitle}</p>}
            {category.description && (
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{category.description}</p>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm text-ink">{video.title}</p>
              {meta.length > 0 && <p className="mt-1 text-xs text-ink-faint">{meta.join(" · ")}</p>}
            </div>

            {multi && (
              <ol className="mt-4 space-y-1">
                {videos.map((v, i) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => selectVideo(i)}
                      aria-current={i === videoIndex}
                      className={`flex min-h-9 w-full items-center gap-2 text-left text-sm transition-colors ${
                        i === videoIndex ? "text-ink" : "text-ink-faint hover:text-ink-muted"
                      }`}
                    >
                      <span className="flex w-3 shrink-0 justify-center text-secondary-blue">
                        {i === videoIndex && <Star size={10} weight="fill" aria-hidden />}
                      </span>
                      <span className="font-mono text-[11px]">{displayNumber(i)}</span>
                      <span className="truncate">{v.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {category.brief_image_url && (
              <button
                type="button"
                onClick={() => setBriefOpen(true)}
                className="mt-5 block cursor-zoom-in text-left"
                aria-label={`放大查看${category.title}的企劃截圖`}
              >
                <span className="text-[11px] tracking-[0.15em] text-ink-faint">企劃截圖</span>
                {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL */}
                <img src={category.brief_image_url} alt="" className="mt-1.5 w-24 object-cover transition-opacity hover:opacity-80" />
              </button>
            )}

            {category.profile_url && (
              <a
                href={category.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm text-ink transition-colors hover:text-accent"
              >
                查看完整帳號 <ArrowUpRight size={14} weight="bold" />
              </a>
            )}

            {category.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
                {category.tags.map((tag) => (
                  <span key={tag} className="text-[11px] tracking-[0.15em] text-ink-faint">
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {playing && video.source_type === "instagram" && (
        <InstagramLightbox video={video} onClose={() => setPlaying(false)} />
      )}
      {briefOpen && category.brief_image_url && (
        <BriefLightbox
          imageUrl={category.brief_image_url}
          alt={`${category.title} 企劃截圖`}
          onClose={() => setBriefOpen(false)}
        />
      )}
    </section>
  );
}
