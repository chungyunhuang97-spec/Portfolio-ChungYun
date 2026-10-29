"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "@phosphor-icons/react/dist/ssr";
import type { VideoWork } from "@/lib/types";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  resolveFallbackThumbnailUrl,
  resolveThumbnailUrl,
} from "@/lib/video";
import { ThumbnailImage } from "@/components/video-section/ThumbnailImage";
import { BriefLightbox } from "@/components/video-section/BriefLightbox";
import { FadeIn } from "@/components/FadeIn";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRING = { type: "spring" as const, stiffness: 170, damping: 22 };

function PlayOverlay() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
      <span className="flex size-14 items-center justify-center rounded-full bg-bg/0 text-bg opacity-0 transition-all duration-200 group-hover:scale-110 group-hover:bg-bg/90 group-hover:text-ink group-hover:opacity-100">
        <Play size={22} weight="fill" className="ml-0.5" />
      </span>
    </span>
  );
}

/**
 * The active work's stage. Two independent layers of motion:
 * - the OUTER wrapper tumbles the whole frame out/in (rotate + diagonal
 *   translate) whenever `work` itself changes -- the visible "rotation"
 *   switching between works.
 * - the INNER frame carries `layoutId`, shared with the expanded overlay
 *   below. Clicking it toggles `expanded`, which unmounts it from here
 *   and mounts the overlay's frame with the same layoutId -- Motion
 *   animates the shared element between the two positions/sizes
 *   automatically, which is the "zoom in on click" behavior.
 */
function HelixStage({
  work,
  expanded,
  onOpen,
  onClose,
}: {
  work: VideoWork;
  expanded: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail_url, work.video_url);
  const thumbnailFallbackUrl = resolveFallbackThumbnailUrl(work.thumbnail_url, work.video_url);
  const videoId = work.video_url ? extractYouTubeId(work.video_url) : null;
  const canEmbed = work.embed_type === "youtube" && videoId;
  const layoutId = `video-stage-${work.id}`;

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
      <div className="relative aspect-[4/3] w-full md:aspect-[16/10]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={work.id}
            className="absolute inset-0"
            initial={{ opacity: 0, rotate: -12, x: 70, y: -50, scale: 0.92 }}
            animate={{ opacity: 1, rotate: 0, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 10, x: -70, y: 60, scale: 0.92 }}
            transition={SPRING}
          >
            {!expanded && (
              <motion.button
                type="button"
                layoutId={layoutId}
                onClick={onOpen}
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
            {expanded && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={work.title}
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
                  {canEmbed ? (
                    <iframe
                      src={getYouTubeEmbedUrl(videoId!)}
                      title={work.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
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
                      {work.video_url && (
                        <a
                          href={work.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-ink/20 text-sm tracking-wide text-bg transition-colors hover:bg-ink/40"
                        >
                          前往觀看 ↗
                        </a>
                      )}
                    </>
                  )}
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
 * Homepage "影片製作" gallery for the featured works — a numbered list
 * that switches which work is on stage (a visible rotating tumble, see
 * HelixStage), and a detail readout alongside. Clicking the stage image
 * zooms it into a full-size overlay via a shared layoutId transition.
 * Lower-tier "more works" stay in the separate MoreWorksSection grid
 * below this.
 */
export function VideoGallery({ works }: { works: VideoWork[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const active = works[activeIndex];

  function selectIndex(i: number) {
    if (i === activeIndex) return;
    setActiveIndex(i);
    setExpanded(false);
  }

  function handleOpen() {
    if (!active) return;
    if (active.embed_type === "youtube" && active.video_url && extractYouTubeId(active.video_url)) {
      setExpanded(true);
    } else if (active.video_url) {
      window.open(active.video_url, "_blank", "noopener,noreferrer");
    }
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
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr_300px] lg:gap-12">
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
              expanded={expanded}
              onOpen={handleOpen}
              onClose={() => setExpanded(false)}
            />

            <div>
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
                  <h3 className="mt-3 text-2xl">{active.title}</h3>
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

                  <button
                    type="button"
                    onClick={handleOpen}
                    className="group mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide transition-colors hover:border-accent hover:text-accent"
                  >
                    <Play size={14} weight="fill" />
                    觀看影片
                  </button>
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
