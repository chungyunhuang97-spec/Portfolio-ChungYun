"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight, Play } from "@phosphor-icons/react/dist/ssr";
import { displayNumber, playerEmbedUrl, resolvePoster } from "@/lib/about-video";
import type { Video } from "@/lib/types";

/** Solid "poster card" themes (fallback step 4), picked per category. No
 * dark theme: the section itself goes dark (--color-ink) in Phase 3. */
export const POSTER_THEMES = [
  "bg-secondary-blue text-cream",
  "bg-primary-orange text-primary-black",
  "bg-cream text-grey-900",
] as const;

export type CardState = "idle" | "selected" | "playing";

function PosterLayer({ video, index, theme }: { video: Video; index: number; theme: string }) {
  const poster = resolvePoster(video);
  if (poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Supabase / YouTube URLs of unknown size
      <img
        src={poster}
        alt={video.poster_alt ?? ""}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  // Fallback 3: self-hosted mp4 -- the browser paints the frame at #t.
  if (video.source_type === "mp4" && video.video_file) {
    return (
      <video
        src={`${video.video_file}#t=${video.poster_time ?? 1}`}
        muted
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  // Fallback 4: never a blank grey card -- theme color + big number (the
  // title comes from the shared bottom caption).
  return (
    <div aria-hidden className={`absolute inset-0 p-4 ${theme}`}>
      <span className="font-fredoka text-[clamp(48px,30cqw,120px)] leading-none">{displayNumber(index)}</span>
    </div>
  );
}

/**
 * One card in the Video Works carousel. Three states:
 * - idle: poster + bottom gradient + title. No play icon, no player.
 * - selected: adds the centered play button, duration, and (fine-pointer
 *   devices only) a muted looping preview_clip.
 * - playing: the player itself -- only ever mounted for the one selected
 *   card, so at most one embed/video exists on the page. Instagram never
 *   plays inline (its embed chrome needs more room); the section opens it
 *   in a lightbox instead.
 */
export function VideoCard({
  video,
  index,
  state,
  theme,
  showPreview,
  style,
  onSelect,
  onPlay,
}: {
  video: Video;
  index: number;
  state: CardState;
  theme: string;
  showPreview: boolean;
  style: CSSProperties;
  onSelect: () => void;
  onPlay: () => void;
}) {
  const playing = state === "playing" && video.source_type !== "instagram";
  const embed = playing && video.source_type !== "mp4" ? playerEmbedUrl(video) : null;

  return (
    <div
      style={style}
      className="absolute left-1/2 top-0 [container-type:inline-size] overflow-hidden rounded-[var(--radius-card)] bg-grey-900 shadow-[0_24px_48px_-24px_rgba(23,23,22,0.5)] transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:rounded-[var(--radius-card-lg)]"
    >
      {playing ? (
        video.source_type === "mp4" && video.video_file ? (
          <video
            src={video.video_file}
            poster={resolvePoster(video) ?? undefined}
            controls
            autoPlay
            muted
            playsInline
            className="h-full w-full bg-black object-contain"
          >
            {video.captions_url && <track kind="captions" src={video.captions_url} srcLang="zh" label="字幕" default />}
          </video>
        ) : embed ? (
          <iframe
            src={embed}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <a
            href={video.source_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full w-full items-center justify-center gap-1.5 text-sm text-cream"
          >
            在新分頁觀看 <ArrowUpRight size={14} weight="bold" />
          </a>
        )
      ) : (
        <>
          <PosterLayer video={video} index={index} theme={theme} />
          {state !== "idle" && showPreview && video.preview_clip && (
            <video
              src={video.preview_clip}
              muted
              loop
              autoPlay
              playsInline
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-12">
            <p className="font-nunito text-sm font-bold leading-snug text-white line-clamp-2">{video.title}</p>
          </div>
          {state === "idle" ? (
            <button
              type="button"
              onClick={onSelect}
              aria-label={`選取：${video.title}`}
              className="absolute inset-0 cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-cream"
            />
          ) : (
            <>
              {video.duration && (
                <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 font-nunito text-[11px] font-bold text-white">
                  {video.duration}
                </span>
              )}
              <button
                type="button"
                onClick={onPlay}
                aria-label={`播放：${video.title}`}
                className="absolute inset-0 flex items-center justify-center focus-visible:outline-none [&:focus-visible>span]:ring-3 [&:focus-visible>span]:ring-cream"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-cream text-grey-900 shadow-lg transition-transform duration-200 hover:scale-110">
                  <Play size={22} weight="fill" className="ml-0.5" />
                </span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
