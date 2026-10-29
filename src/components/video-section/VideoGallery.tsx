"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play, X } from "@phosphor-icons/react/dist/ssr";
import type { ReelLink, VideoWork } from "@/lib/types";
import { resolveEmbedUrl, resolveFallbackThumbnailUrl, resolveThumbnailUrl } from "@/lib/video";
import { ThumbnailImage } from "@/components/video-section/ThumbnailImage";
import { BriefLightbox } from "@/components/video-section/BriefLightbox";
import { FadeIn } from "@/components/FadeIn";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRING_3D = { type: "spring" as const, stiffness: 150, damping: 20 };

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
 *   the active reel inline, in a vertical-shaped frame close to its real
 *   proportions; the right-side reel list swaps which one plays here.
 * Either way, switching the *work* itself still rotates the whole frame
 * around the Y axis (a real 3D turn) -- the "cards winding past each
 * other" feel.
 */
function HelixStage({
  work,
  reelLinks,
  activeReelIndex,
  embed,
  onOpenPrimary,
  onClose,
}: {
  work: VideoWork;
  reelLinks: ReelLink[];
  activeReelIndex: number;
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

  if (hasReelLinks) {
    const activeReel = reelLinks[activeReelIndex] ?? reelLinks[0];
    const embedSrc = resolveEmbedUrl(activeReel.url);

    return (
      <div className="flex justify-center md:justify-start">
        <div
          className="relative aspect-[9/16] w-full max-w-[340px] overflow-hidden bg-ink"
          style={{ perspective: "1800px" }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${work.id}-${activeReel.id}`}
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, rotateY: 75, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: -75, x: -60, scale: 0.9 }}
              transition={SPRING_3D}
            >
              {embedSrc ? (
                <iframe
                  src={embedSrc}
                  title={activeReel.label}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a
                  href={activeReel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full flex-col items-center justify-center gap-2 bg-ink-faint/20 px-4 text-center text-sm text-ink-muted"
                >
                  {activeReel.label}
                  <span className="inline-flex items-center gap-1 text-xs text-ink">
                    開新分頁觀看
                    <ArrowUpRight size={12} weight="light" />
                  </span>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative aspect-[4/3] w-full md:aspect-[16/10]"
        style={{ perspective: "1800px" }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={work.id}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, rotateY: 75, x: 90, scale: 0.86 }}
            animate={{ opacity: 1, rotateY: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -75, x: -90, scale: 0.86 }}
            transition={SPRING_3D}
          >
            {!expanded && (
              <motion.button
                type="button"
                layoutId={layoutId}
                onClick={onOpenPrimary}
                className="group block h-full w-full cursor-pointer overflow-hidden bg-ink"
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
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {typeof document !== "undefined" &&
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
                  className="relative aspect-video w-full max-w-5xl overflow-hidden bg-ink"
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
 * detail readout alongside. A multi-link work's reel_links render as a
 * switcher list of their own: clicking one swaps which reel plays inline
 * on the stage (see HelixStage above).
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

                  {activeReelLinks.length > 0 && (
                    <ul className="mt-5 space-y-2 border-t border-line pt-4">
                      {activeReelLinks.map((link, i) => (
                        <li key={link.id}>
                          <button
                            type="button"
                            onClick={() => setActiveReelIndex(i)}
                            aria-current={i === activeReelIndex}
                            className={`group inline-flex items-center gap-1.5 text-sm transition-colors hover:text-accent ${
                              i === activeReelIndex ? "text-accent" : "text-ink-muted"
                            }`}
                          >
                            <Play
                              size={11}
                              weight="fill"
                              className={`shrink-0 ${i === activeReelIndex ? "" : "opacity-50"}`}
                            />
                            {link.label}
                          </button>
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
