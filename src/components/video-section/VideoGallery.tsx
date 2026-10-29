"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowUpRight, CaretLeft, CaretRight, Play, X } from "@phosphor-icons/react/dist/ssr";
import type { ReelLink, VideoWork } from "@/lib/types";
import { resolveEmbedUrl, resolveFallbackThumbnailUrl, resolveThumbnailUrl } from "@/lib/video";
import { ThumbnailImage } from "@/components/video-section/ThumbnailImage";
import { BriefLightbox } from "@/components/video-section/BriefLightbox";
import { FadeIn } from "@/components/FadeIn";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRING_3D = { type: "spring" as const, stiffness: 150, damping: 20 };

// Reel carousel geometry -- a shallow 3D fan (not a flat row), each card
// positioned purely by its numeric offset from the active index so Motion
// can tween smoothly between positions.
const REEL_CARD_SPACING = 150;
const REEL_CARD_ROTATION = 22;
const REEL_MAX_VISIBLE_OFFSET = 3;

function reelFloatTransition(delay: number) {
  return { duration: 4.5, repeat: Infinity, ease: "easeInOut" as const, delay };
}

/**
 * Offset from the active index along the *shortest* path around the ring,
 * so the carousel reads as a true cycle: at index 0 the last card sits
 * just to the left (offset -1) instead of the fan having a dead end.
 */
function circularOffset(index: number, activeIndex: number, length: number) {
  let diff = index - activeIndex;
  const half = length / 2;
  if (diff > half) diff -= length;
  if (diff < -half) diff += length;
  return diff;
}

/**
 * One card in the reel carousel. Only the active (offset 0) card mounts a
 * live embed; side cards are lightweight label placeholders used purely as
 * click targets -- that keeps a 6-reel work from loading six Instagram
 * iframes at once, and side cards are tilted/cropped too small to watch
 * anyway. Every card gets the same glass-card treatment: translucent
 * blurred surface, soft shadow, gentle perpetual float.
 */
function ReelCard({
  reel,
  offset,
  isActive,
  isDragging,
  dragOffsetPx,
  onSelect,
  floatDelay,
}: {
  reel: ReelLink;
  offset: number;
  isActive: boolean;
  isDragging: boolean;
  dragOffsetPx: number;
  onSelect: () => void;
  floatDelay: number;
}) {
  const embedSrc = isActive ? resolveEmbedUrl(reel.url) : null;
  const hidden = Math.abs(offset) > REEL_MAX_VISIBLE_OFFSET;

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: 100 - Math.abs(offset), pointerEvents: hidden ? "none" : undefined }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          x: offset * REEL_CARD_SPACING + dragOffsetPx,
          rotateY: Math.max(-65, Math.min(65, offset * -REEL_CARD_ROTATION)),
          scale: Math.max(0.42, 1 - Math.min(Math.abs(offset), 4) * 0.14),
          opacity: hidden ? 0 : 1 - Math.min(Math.abs(offset), 2) * 0.28,
        }}
        transition={isDragging ? { duration: 0 } : SPRING_3D}
      >
        <motion.button
          type="button"
          onClick={onSelect}
          disabled={isActive}
          aria-current={isActive}
          aria-label={reel.label}
          animate={{ y: [0, -7, 0] }}
          transition={reelFloatTransition(floatDelay)}
          className={`relative block aspect-[9/16] w-[200px] overflow-hidden rounded-2xl border border-ink/10 bg-bg/40 shadow-[0_25px_55px_-22px_rgba(23,23,22,0.45)] backdrop-blur-md md:w-[240px] ${
            isActive ? "cursor-default" : "cursor-pointer"
          }`}
        >
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={reel.label}
              scrolling="no"
              className="h-full w-full"
              style={{ overflow: "hidden" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
              <Play size={24} weight="fill" className="text-ink/60" />
              <span className="text-sm leading-snug text-ink-muted">{reel.label}</span>
            </span>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

/**
 * The reel switcher itself: a shallow 3D fan of cards (replaces the old
 * text link list), arranged as a true cycle (see circularOffset). Clicking
 * a side card, the arrow buttons, the left/right arrow keys, or dragging
 * horizontally all move the active index; every card repositions with a
 * spring, which reads as the whole fan turning. Dragging starts from a
 * card's own pointer events, so it's captured reliably everywhere except
 * directly over the active card's embed -- that's a cross-origin iframe,
 * a separate browsing context the page can't see pointer events inside of;
 * side cards, the empty frame area, and the arrow controls are unaffected.
 */
function ReelCarousel({
  reelLinks,
  activeReelIndex,
  onSelectReel,
}: {
  reelLinks: ReelLink[];
  activeReelIndex: number;
  onSelectReel: (i: number) => void;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const count = reelLinks.length;

  function goTo(i: number) {
    onSelectReel(((i % count) + count) % count);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(activeReelIndex - 1);
      if (e.key === "ArrowRight") goTo(activeReelIndex + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReelIndex, count]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const steps = Math.round(-info.offset.x / REEL_CARD_SPACING);
    if (steps !== 0) goTo(activeReelIndex + steps);
    setDragOffset(0);
    setIsDragging(false);
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative h-[400px] w-full cursor-grab touch-pan-y active:cursor-grabbing md:h-[460px]"
        style={{ perspective: "1800px" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => setDragOffset(info.offset.x)}
        onDragEnd={handleDragEnd}
      >
        {reelLinks.map((reel, i) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            offset={circularOffset(i, activeReelIndex, count)}
            isActive={i === activeReelIndex}
            isDragging={isDragging}
            dragOffsetPx={dragOffset}
            onSelect={() => goTo(i)}
            floatDelay={(i % 4) * 0.2}
          />
        ))}
      </motion.div>

      <div className="mt-5 flex items-center gap-5">
        <button
          type="button"
          onClick={() => goTo(activeReelIndex - 1)}
          aria-label="上一支"
          className="text-ink-faint transition-colors hover:text-ink"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <span className="text-xs tracking-[0.1em] text-ink-faint">
          {String(activeReelIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => goTo(activeReelIndex + 1)}
          aria-label="下一支"
          className="text-ink-faint transition-colors hover:text-ink"
        >
          <CaretRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}

interface ActiveEmbed {
  src: string;
  label: string;
}

function PlayOverlay() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
      <span className="flex size-14 items-center justify-center rounded-full bg-bg/90 text-ink opacity-90 transition-transform duration-200 group-hover:scale-110">
        <Play size={22} weight="fill" className="ml-0.5" />
      </span>
    </span>
  );
}

/**
 * The active work's stage. Two different content shapes, chosen by
 * whether the work has reel_links:
 * - A single-video work (one YouTube/IG url on the work itself) keeps the
 *   thumbnail + click-to-expand flow: clicking the frame zooms it into a
 *   fullscreen overlay via a shared `layoutId`, which works well because
 *   YouTube's 16:9 genuinely fits a wide fullscreen box.
 * - A multi-link work (教學性質短影片 / 生活記事 Vlog, reel_links children)
 *   never goes fullscreen. Instagram's own embed widget has a fixed,
 *   usually-vertical natural size that a wide fullscreen box can't match
 *   (it just leaves empty space on the sides), so instead the stage shows
 *   a 3D fan of reel cards (see ReelCarousel below) -- clicking a side
 *   card, the arrow buttons, or the arrow keys swap which one plays.
 * Either way, switching the *work* itself still rotates the whole frame
 * around the Y axis (a real 3D turn) -- the "cards winding past each
 * other" feel.
 */
function HelixStage({
  work,
  reelLinks,
  activeReelIndex,
  onSelectReel,
  embed,
  onOpenPrimary,
  onClose,
}: {
  work: VideoWork;
  reelLinks: ReelLink[];
  activeReelIndex: number;
  onSelectReel: (i: number) => void;
  embed: ActiveEmbed | null;
  onOpenPrimary: () => void;
  onClose: () => void;
}) {
  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail_url, work.video_url);
  const thumbnailFallbackUrl = resolveFallbackThumbnailUrl(work.thumbnail_url, work.video_url);
  const layoutId = `video-stage-${work.id}`;
  const expanded = embed !== null;
  const hasReelLinks = reelLinks.length > 0;

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, onClose]);

  return (
    <>
      <div className="relative w-full" style={{ perspective: "1800px" }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={work.id}
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, rotateY: 75, x: 90, scale: 0.86 }}
            animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -75, x: -90, scale: 0.86 }}
            transition={SPRING_3D}
          >
            {hasReelLinks ? (
              <ReelCarousel
                reelLinks={reelLinks}
                activeReelIndex={activeReelIndex}
                onSelectReel={onSelectReel}
              />
            ) : (
              <div className="relative aspect-[4/3] w-full md:aspect-[16/10]">
                {!expanded && (
                  <motion.div
                    className="h-full w-full"
                    animate={{ y: [0, -7, 0] }}
                    transition={reelFloatTransition(0)}
                  >
                    <motion.button
                      type="button"
                      layoutId={layoutId}
                      onClick={onOpenPrimary}
                      className="group block h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-ink/10 bg-ink shadow-[0_25px_55px_-22px_rgba(23,23,22,0.45)] backdrop-blur-md"
                      aria-label={`放大播放${work.title}`}
                    >
                      {thumbnailUrl ? (
                        <ThumbnailImage
                          src={thumbnailUrl}
                          fallbackSrc={thumbnailFallbackUrl}
                          alt={`${work.title} 縮圖`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-ink-faint/20" aria-hidden />
                      )}
                      <PlayOverlay />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!hasReelLinks &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {embed && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={embed.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[70] flex items-center justify-center p-6 md:p-16"
                style={{ backgroundColor: "rgba(17, 17, 16, 0.9)" }}
                onClick={onClose}
              >
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="關閉"
                  className="absolute top-5 right-5 text-bg transition-opacity hover:opacity-70"
                >
                  <X size={28} weight="light" />
                </button>
                <motion.div
                  layoutId={layoutId}
                  onClick={(e) => e.stopPropagation()}
                  className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-ink"
                >
                  <iframe
                    src={embed.src}
                    title={embed.label}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

/**
 * Homepage "影片製作" gallery — every video_work (single pieces and
 * multi-link columns like 教學性質短影片 / 生活記事 Vlog alike) in one
 * numbered list that switches the active work on the stage, with a
 * detail readout alongside. A multi-link work's reel_links render as the
 * ReelCarousel fan (see HelixStage above) instead of a text list.
 */
export function VideoGallery({
  works,
  reelLinksByWorkId,
}: {
  works: VideoWork[];
  reelLinksByWorkId: Record<string, ReelLink[]>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [embed, setEmbed] = useState<ActiveEmbed | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const active = works[activeIndex];
  const activeReelLinks = active ? (reelLinksByWorkId[active.id] ?? []) : [];

  function selectIndex(i: number) {
    if (i === activeIndex) return;
    setActiveIndex(i);
    setActiveReelIndex(0);
    setEmbed(null);
  }

  function openEmbed(url: string | null, label: string) {
    if (!url) return;
    const src = resolveEmbedUrl(url);
    if (src) {
      setEmbed({ src, label });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function handleOpenPrimary() {
    if (!active || activeReelLinks.length > 0) return;
    openEmbed(active.video_url, active.title);
  }

  if (!active) return null;

  return (
    <section id="video" aria-label="影片製作作品" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl">影片製作</h2>
          <p className="mt-2 text-sm tracking-[0.1em] text-ink-faint">企劃 · 導演 · 剪輯</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr_300px] lg:gap-12">
            <div
              role="tablist"
              aria-label="選擇作品"
              className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {works.map((work, i) => (
                <button
                  key={work.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  onClick={() => selectIndex(i)}
                  className={`group flex shrink-0 items-center gap-3 border-b border-line px-1 py-3 text-left transition-colors lg:shrink ${
                    i === activeIndex ? "text-ink" : "text-ink-faint hover:text-ink-muted"
                  }`}
                >
                  <span className={`font-mono text-xs ${i === activeIndex ? "text-accent" : ""}`}>
                    {String(i).padStart(2, "0")}
                  </span>
                  <span className="whitespace-nowrap text-sm lg:whitespace-normal">{work.title}</span>
                </button>
              ))}
            </div>

            <HelixStage
              work={active}
              reelLinks={activeReelLinks}
              activeReelIndex={activeReelIndex}
              onSelectReel={setActiveReelIndex}
              embed={embed}
              onOpenPrimary={handleOpenPrimary}
              onClose={() => setEmbed(null)}
            />

            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <p className="text-xs tracking-[0.2em] text-ink-faint">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <h3 className="text-2xl">{active.title}</h3>
                    {active.level_label && (
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] tracking-[0.1em] text-accent">
                        {active.level_label}
                      </span>
                    )}
                  </div>
                  {active.subtitle && (
                    <p className="mt-1 text-sm text-ink-faint">{active.subtitle}</p>
                  )}

                  {activeReelLinks.length > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent">
                      <Play size={10} weight="fill" />
                      {activeReelLinks[activeReelIndex]?.label}
                    </p>
                  )}

                  {active.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                      {active.tags.map((tag) => (
                        <span key={tag} className="text-[11px] tracking-[0.15em] text-ink-faint">
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {active.description && (
                    <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                      {active.description}
                    </p>
                  )}

                  {active.role_items && active.role_items.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {active.role_items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-muted">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {active.brief_image_url && (
                    <button
                      type="button"
                      onClick={() => setBriefOpen(true)}
                      className="mt-5 block w-24 cursor-zoom-in overflow-hidden transition-opacity hover:opacity-80"
                      aria-label={`放大查看${active.title}的拍攝企劃截圖`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not next/image-allowlisted here */}
                      <img
                        src={active.brief_image_url}
                        alt={`${active.title} Brief 截圖`}
                        className="h-auto w-full object-cover"
                      />
                    </button>
                  )}

                  {active.video_url && !resolveEmbedUrl(active.video_url) && (
                    <a
                      href={active.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-5 inline-flex items-center gap-1.5 text-sm text-ink transition-colors hover:text-accent"
                    >
                      查看完整帳號
                      <ArrowUpRight size={14} weight="light" className="transition-transform group-hover:translate-x-0.5" />
                    </a>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>
      </div>

      {briefOpen && active.brief_image_url && (
        <BriefLightbox
          imageUrl={active.brief_image_url}
          alt={`${active.title} Brief 截圖放大版`}
          onClose={() => setBriefOpen(false)}
        />
      )}
    </section>
  );
}
