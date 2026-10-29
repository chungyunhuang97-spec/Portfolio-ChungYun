"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play } from "@phosphor-icons/react/dist/ssr";
import type { VideoWork } from "@/lib/types";
import { extractYouTubeId, getYouTubeEmbedUrl, resolveThumbnailUrl } from "@/lib/video";
import { BriefLightbox } from "@/components/video-section/BriefLightbox";
import { FadeIn } from "@/components/FadeIn";

/**
 * One featured work as a full editorial row — media on one side, the
 * story on the other, alternating sides down the page (set by `reverse`)
 * instead of a repeated card grid. Carries the same inline-embed and
 * brief-lightbox behavior the homepage version had.
 */
export function FeaturedWorkRow({
  work,
  reverse = false,
  toneStep = false,
}: {
  work: VideoWork;
  reverse?: boolean;
  toneStep?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail_url, work.video_url);
  const videoId = work.video_url ? extractYouTubeId(work.video_url) : null;
  const canEmbed = work.embed_type === "youtube" && videoId;

  function openVideo() {
    if (canEmbed) {
      setExpanded(true);
    } else if (work.video_url) {
      window.open(work.video_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className={toneStep ? "bg-ink/[0.03]" : undefined}>
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-32">
        <div
          className={`flex flex-col gap-10 md:items-center md:gap-16 ${
            reverse ? "md:flex-row-reverse" : "md:flex-row"
          }`}
        >
          <FadeIn className="w-full md:w-[58%] md:shrink-0">
            <div className="relative aspect-video w-full overflow-hidden bg-ink">
              <AnimatePresence initial={false} mode="wait">
                {expanded && canEmbed ? (
                  <motion.div
                    key="embed"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "100%", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
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
                  <motion.button
                    key="thumbnail"
                    type="button"
                    onClick={openVideo}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group absolute inset-0 block h-full w-full cursor-pointer"
                    aria-label={`播放${work.title}`}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`${work.title} 縮圖`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-ink-faint/20" aria-hidden />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/20">
                      <span className="flex size-16 items-center justify-center rounded-full bg-bg/0 text-bg opacity-0 transition-all duration-200 group-hover:scale-110 group-hover:bg-bg/90 group-hover:text-ink group-hover:opacity-100">
                        <Play size={24} weight="fill" className="ml-0.5" />
                      </span>
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="w-full md:flex-1">
            <h2 className="text-3xl leading-tight tracking-tight md:text-4xl">{work.title}</h2>
            {work.subtitle && (
              <p className="mt-3 max-w-[40ch] text-lg leading-relaxed text-ink-muted">
                {work.subtitle}
              </p>
            )}

            {work.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
                {work.tags.map((tag) => (
                  <span key={tag} className="text-[11px] tracking-[0.15em] text-ink-faint">
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {work.description && (
              <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-ink-muted">
                {work.description}
              </p>
            )}

            {work.role_items && work.role_items.length > 0 && (
              <ul className="mt-6 space-y-2">
                {work.role_items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {work.brief_image_url && (
              <button
                type="button"
                onClick={() => setBriefOpen(true)}
                className="mt-6 block w-28 cursor-zoom-in overflow-hidden transition-opacity hover:opacity-80"
                aria-label={`放大查看${work.title}的拍攝企劃截圖`}
              >
                <img
                  src={work.brief_image_url}
                  alt={`${work.title} Brief 截圖`}
                  className="h-auto w-full object-cover"
                />
              </button>
            )}

            <button
              type="button"
              onClick={openVideo}
              className="group mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide transition-colors hover:border-accent hover:text-accent"
            >
              <Play size={14} weight="fill" />
              觀看影片
            </button>
          </FadeIn>
        </div>
      </div>

      {briefOpen && work.brief_image_url && (
        <BriefLightbox
          imageUrl={work.brief_image_url}
          alt={`${work.title} Brief 截圖放大版`}
          onClose={() => setBriefOpen(false)}
        />
      )}
    </div>
  );
}
