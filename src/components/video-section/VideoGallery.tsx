"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "@phosphor-icons/react/dist/ssr";
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

/**
 * Three stacked "echo" layers behind the sharp front image, offset and
 * rotated by increasing amounts further back. Switching the active work
 * animates all three out along their own diagonal and the next work's
 * three in from an exaggerated version of the same offset, staggered —
 * reads as a short cascading spiral rather than a flat crossfade.
 */
const LAYERS = [
  { rotate: -16, x: -46, y: -10, scale: 0.88, opacity: 0.1, blur: 10 },
  { rotate: -8, x: -24, y: -5, scale: 0.94, opacity: 0.2, blur: 5 },
  { rotate: 0, x: 0, y: 0, scale: 1, opacity: 1, blur: 0 },
] as const;
const FRONT_LAYER_INDEX = LAYERS.length - 1;

function HelixStage({
  work,
  expanded,
  onOpen,
}: {
  work: VideoWork;
  expanded: boolean;
  onOpen: () => void;
}) {
  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail_url, work.video_url);
  const thumbnailFallbackUrl = resolveFallbackThumbnailUrl(work.thumbnail_url, work.video_url);
  const videoId = work.video_url ? extractYouTubeId(work.video_url) : null;
  const canEmbed = work.embed_type === "youtube" && videoId;

  return (
    <div className="relative aspect-[4/3] w-full [perspective:1400px] md:aspect-[16/10]">
      <AnimatePresence initial={false}>
        {expanded && canEmbed ? (
          <motion.div
            key="embed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 overflow-hidden bg-ink"
          >
            <iframe
              src={getYouTubeEmbedUrl(videoId!)}
              title={work.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        ) : (
          LAYERS.map((layer, i) => {
            const isFront = i === FRONT_LAYER_INDEX;
            return (
              <motion.div
                key={`${work.id}-${i}`}
                className={`absolute inset-0 overflow-hidden ${isFront ? "" : "pointer-events-none"}`}
                style={{ zIndex: i, filter: layer.blur ? `blur(${layer.blur}px)` : undefined }}
                initial={{
                  opacity: 0,
                  rotate: layer.rotate * 1.6,
                  x: layer.x * 1.8,
                  y: layer.y * 1.8 - 26,
                  scale: layer.scale * 0.9,
                }}
                animate={{
                  opacity: layer.opacity,
                  rotate: layer.rotate,
                  x: layer.x,
                  y: layer.y,
                  scale: layer.scale,
                }}
                exit={{
                  opacity: 0,
                  rotate: layer.rotate * 1.6,
                  x: layer.x * 1.8 + 64,
                  y: layer.y * 1.8 + 44,
                  scale: layer.scale * 0.9,
                }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 22,
                  delay: (LAYERS.length - 1 - i) * 0.05,
                }}
              >
                {isFront ? (
                  <button
                    type="button"
                    onClick={onOpen}
                    className="group block h-full w-full cursor-pointer"
                    aria-label={`播放${work.title}`}
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
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/25">
                      <span className="flex size-14 items-center justify-center rounded-full bg-bg/0 text-bg opacity-0 transition-all duration-200 group-hover:scale-110 group-hover:bg-bg/90 group-hover:text-ink group-hover:opacity-100">
                        <Play size={22} weight="fill" className="ml-0.5" />
                      </span>
                    </span>
                  </button>
                ) : thumbnailUrl ? (
                  <ThumbnailImage
                    src={thumbnailUrl}
                    fallbackSrc={thumbnailFallbackUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-ink-faint/10" aria-hidden />
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Homepage "影片製作" gallery for the featured works — a numbered list
 * that switches which work is on stage, the stage itself cascading
 * between works through a short stacked-layer spiral (see HelixStage),
 * and a detail readout alongside. Lower-tier "more works" stay in the
 * separate MoreWorksSection grid below this.
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

            <HelixStage work={active} expanded={expanded} onOpen={handleOpen} />

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
