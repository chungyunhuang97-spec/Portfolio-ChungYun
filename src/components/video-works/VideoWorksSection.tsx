"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { ArrowUpRight, CaretDown, CaretLeft, CaretRight, Star } from "@phosphor-icons/react/dist/ssr";
import { DoodleEye } from "@/components/design-system/doodles";
import { aspectValue, displayNumber } from "@/lib/about-video";
import type { VideoWorksCategory } from "@/lib/data";
import { BriefLightbox } from "@/components/video-section/BriefLightbox";
import { InstagramLightbox } from "./InstagramLightbox";
import { POSTER_THEMES, VideoCard } from "./VideoCard";
import { useVideoChoreography } from "./useVideoChoreography";
import { videoMotion } from "@/lib/motion.config";

/** Neighbour cards per side that stay visible in the fan, and their scales. */
const VISIBLE_PER_SIDE = 2;
const SCALES = [1, 0.82, 0.68];
/** How much of a neighbour hides behind the card in front of it. */
const OVERLAP = 0.45;
const MAX_CARD_HEIGHT = 460;
const SWIPE_PX = 40;
/** Phone layout: selected card ~72vw wide (landscape ones a bit wider so
 * 16:9 stays watchable), never taller than 62svh. */
const PHONE_CARD_WIDTH = 0.72;
const PHONE_LANDSCAPE_WIDTH = 0.88;
/** Room for the selected card's outline (outline-offset 4px + 2px). */
const OUTLINE_GUTTER = 8;
const PHONE_MAX_HEIGHT_SVH = 0.62;

const PHONE_QUERY = "(max-width: 767px)";
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

/** Horizontal center offset (px) for every fan card, selected card at 0. */
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

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Homepage "03 / VIDEO WORKS": dark (--color-ink) section, cream type.
 * Desktop: categories 3 / cards 6 / info 3. Tablet: category tabs on top,
 * cards + info side by side. Phone: sticky horizontally-scrolling chip
 * tabs, a scroll-snap card row, and a collapsed info column.
 * Card behaviour (states, single player, poster fallback) lives in VideoCard.
 */
export function VideoWorksSection({
  categories,
  choreography,
}: {
  categories: VideoWorksCategory[];
  /** Site-wide enable_scroll_choreography switch. */
  choreography: boolean;
}) {
  const [catIndex, setCatIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(() => featuredIndex(categories[0]));
  const [playing, setPlaying] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [stageWidth, setStageWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  const isPhone = useMediaQuery(PHONE_QUERY);
  const canPreview = useMediaQuery(PREVIEW_QUERY);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<number | null>(null);
  const scrollingTo = useRef<number | null>(null);
  const videoIndexRef = useRef(videoIndex);

  const category = categories[catIndex];
  const videos = category.videos;
  const video = videos[videoIndex];
  const multi = videos.length > 1;
  const theme = POSTER_THEMES[catIndex % POSTER_THEMES.length];

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setStageWidth(entry.contentRect.width);
      setViewportHeight(window.innerHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function selectCategory(i: number) {
    if (i === catIndex) return;
    setPlaying(false);
    runCategorySwitch(() => {
      setInfoOpen(false);
      setCatIndex(i);
      setVideoIndex(featuredIndex(categories[i]));
    });
  }

  function selectVideo(i: number) {
    const next = (i + videos.length) % videos.length;
    if (next === videoIndex) return;
    setPlaying(false); // unmounts the previous player
    setVideoIndex(next);
  }

  // Card sizing: one height per category, widths follow aspect_ratio.
  const ratios = videos.map((v) => aspectValue(v.aspect_ratio));
  const maxRatio = Math.max(...ratios);
  let cardHeight = 0;
  if (stageWidth) {
    cardHeight = isPhone
      ? Math.min(
          (stageWidth * (maxRatio > 1 ? PHONE_LANDSCAPE_WIDTH : PHONE_CARD_WIDTH)) / maxRatio,
          viewportHeight * PHONE_MAX_HEIGHT_SVH
        )
      : Math.min(MAX_CARD_HEIGHT, (stageWidth * (maxRatio > 1 ? 0.86 : 0.62)) / maxRatio);
  }
  const widths = ratios.map((r) => cardHeight * r);
  const measured = cardHeight > 0;

  const { runCategorySwitch } = useVideoChoreography({
    sectionRef,
    stageRef,
    infoRef,
    overlayRef,
    enabled: choreography,
    isPhone,
    measured,
    catIndex,
    videoIndex,
  });
  const offsets = layoutOffsets(widths, videoIndex);

  useEffect(() => {
    videoIndexRef.current = videoIndex;
  }, [videoIndex]);

  // Phone: keep the snap row's scroll position in sync with the selection.
  useEffect(() => {
    const row = snapRef.current;
    if (!isPhone || !row) return;
    const card = row.querySelector<HTMLElement>(`[data-video-card="${videoIndex}"]`);
    if (!card) return;
    const maxScroll = row.scrollWidth - row.clientWidth;
    const target = Math.min(maxScroll, Math.max(0, card.offsetLeft + card.offsetWidth / 2 - row.clientWidth / 2));
    if (Math.abs(row.scrollLeft - target) < 4) return;
    scrollingTo.current = videoIndex;
    row.scrollTo({ left: target, behavior: "smooth" });
  }, [isPhone, videoIndex, catIndex, cardHeight]);

  // Phone: a finished swipe selects whichever card snapped to the center.
  useEffect(() => {
    const row = snapRef.current;
    if (!isPhone || !row) return;
    let timer: number | undefined;
    function settle() {
      const center = row!.scrollLeft + row!.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      row!.querySelectorAll<HTMLElement>("[data-video-card]").forEach((el) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = Number(el.dataset.videoCard);
        }
      });
      if (scrollingTo.current !== null) {
        if (best === scrollingTo.current) scrollingTo.current = null;
        return;
      }
      if (best !== videoIndexRef.current) {
        setPlaying(false);
        setVideoIndex(best);
      }
    }
    function onScroll() {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 120);
    }
    row.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      row.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
    // The row only mounts once the stage has been measured.
  }, [isPhone, catIndex, measured]);

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

  const hasMoreInfo =
    multi || Boolean(category.brief_image_url) || Boolean(category.profile_url) || category.tags.length > 0;

  const meta: [string, string][] = [];
  if (video.roles.length > 0) meta.push(["角色", video.roles.join(" / ")]);
  if (video.client) meta.push(["客戶", video.client]);
  if (video.year) meta.push(["年份", String(video.year)]);

  const cardProps = (i: number) => ({
    video: videos[i],
    index: i,
    state: (i === videoIndex ? (playing ? "playing" : "selected") : "idle") as "idle" | "selected" | "playing",
    theme,
    showPreview: canPreview,
    onSelect: () => selectVideo(i),
    onPlay: () => setPlaying(true),
  });

  return (
    <section
      ref={sectionRef}
      id="video"
      aria-labelledby="video-works-heading"
      className="relative bg-ink py-20 text-cream md:py-28"
      style={{
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
        // Clips the entrance wipe sideways without creating a scroll
        // container (which would break the sticky phone tabs).
        overflowX: "clip",
      }}
    >
      {/* Entrance wipe: About's blue slides off to the right, led by a
          film-strip edge. Hidden in the markup; only the choreography
          un-hides it, so no-JS / reduced motion never sees it. */}
      <div
        ref={overlayRef}
        hidden
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 bg-secondary-blue"
      >
        <div
          className="absolute inset-y-0 left-0 w-7 -translate-x-full bg-ink"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 10px, var(--color-cream) 10px 22px, transparent 22px 32px)",
            backgroundSize: "8px 100%",
            backgroundPosition: "center",
            backgroundRepeat: "repeat-y",
          }}
        />
      </div>
      <DoodleEye
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-8 hidden w-24 text-cream/20 lg:block"
      />

      <div className="relative mx-auto w-full max-w-[1400px] md:px-6 wide:max-w-[1600px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-nunito text-[11px] font-extrabold tracking-[0.25em] text-primary-orange md:text-[13px]">
              03 / VIDEO WORKS
            </p>
            <h2 id="video-works-heading" className="mt-3 text-[56px] leading-[0.95] md:text-[80px] desk:text-[88px]">
              <span className="font-fredoka">Video Works</span>
            </h2>
            <p className="mt-3 font-nunito text-sm font-bold tracking-[0.2em] text-cream/70">企劃 · 導演 · 剪輯</p>
          </div>
          <p
            className="shrink-0 font-fredoka text-2xl text-cream md:text-3xl"
            aria-label={`第 ${catIndex + 1} 個分類，共 ${categories.length} 個`}
          >
            <span data-counter-num className="inline-block">
              {displayNumber(catIndex)}
            </span>{" "}
            / {pad2(categories.length)}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-x-8 md:gap-y-10 lg:mt-14 lg:gap-10">
          {/* Categories: chips (phone, sticky) / tabs (tablet) / list (desktop) */}
          <div className="sticky top-0 z-20 -mx-4 bg-ink px-4 py-3 md:static md:col-span-12 md:mx-0 md:p-0 lg:col-span-3">
            <div
              role="tablist"
              aria-label="影片分類"
              aria-orientation={isPhone ? "horizontal" : undefined}
              onKeyDown={handleTabKey}
              className="flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible"
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
                    className={`group flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-left transition-colors lg:gap-3 lg:rounded-none lg:border-0 lg:border-b lg:border-cream/15 lg:px-0 lg:py-4 lg:whitespace-normal ${
                      active
                        ? "border-cream bg-cream text-ink lg:bg-transparent lg:text-cream"
                        : "border-cream/30 text-cream/70 hover:text-cream"
                    }`}
                  >
                    <span className="hidden w-4 shrink-0 justify-center text-primary-orange lg:flex">
                      {active && <Star size={14} weight="fill" aria-hidden />}
                    </span>
                    <span className="font-fredoka text-base transition-transform duration-200 group-hover:translate-x-2 lg:text-[28px] lg:leading-none">
                      {displayNumber(i)}
                    </span>
                    <span className="font-nunito text-sm font-bold lg:text-base">{c.title}</span>
                    <span className={`font-nunito text-xs ${active ? "opacity-70" : "text-cream/60"}`}>({c.videos.length})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards */}
          <div
            id="video-works-panel"
            role="tabpanel"
            aria-labelledby={`video-tab-${category.id}`}
            className="min-w-0 md:col-span-7 lg:col-span-6"
          >
            <div
              ref={stageRef}
              role="group"
              aria-roledescription="carousel"
              aria-label={`${category.title} 影片`}
              tabIndex={0}
              onKeyDown={handleStageKey}
              onPointerDown={isPhone ? undefined : onPointerDown}
              onPointerUp={isPhone ? undefined : onPointerUp}
              className="relative outline-offset-8 focus-visible:outline-2 focus-visible:outline-cream"
              style={{ height: (cardHeight || MAX_CARD_HEIGHT) + OUTLINE_GUTTER * 2 }}
            >
              {cardHeight > 0 && isPhone && (
                <div
                  ref={snapRef}
                  className="relative -mx-4 flex h-full snap-x snap-mandatory items-center gap-3 overflow-x-auto [scrollbar-width:none]"
                  // Lets the first and last card snap to the center too.
                  style={{
                    paddingLeft: `calc((100% - ${widths[0]}px) / 2 + 16px)`,
                    paddingRight: `calc((100% - ${widths[widths.length - 1]}px) / 2 + 16px)`,
                  }}
                >
                  {videos.map((v, i) => (
                    <VideoCard
                      key={v.id}
                      {...cardProps(i)}
                      className="relative shrink-0 snap-center"
                      style={{
                        width: widths[i],
                        height: cardHeight,
                        filter: i === videoIndex ? "none" : "brightness(0.7)",
                      }}
                    />
                  ))}
                </div>
              )}

              {cardHeight > 0 && !isPhone && (
                <div className="absolute inset-0 touch-pan-y overflow-hidden">
                  {videos.map((v, i) => {
                    const d = Math.abs(i - videoIndex);
                    if (d > VISIBLE_PER_SIDE) return null;
                    const scale = SCALES[Math.min(d, SCALES.length - 1)];
                    return (
                      <VideoCard
                        key={v.id}
                        {...cardProps(i)}
                        className="absolute left-1/2"
                        style={{
                          top: OUTLINE_GUTTER,
                          width: widths[i],
                          height: cardHeight,
                          zIndex: 10 - d,
                          // Fan arc: neighbours sink and tilt like a hand of cards.
                          transform: `translateX(calc(-50% + ${offsets[i]}px)) translateY(${
                            Math.min(d, 2) * videoMotion.arc.sinkPx
                          }px) rotate(${Math.sign(i - videoIndex) * (d === 0 ? 0 : d === 1 ? 1 : 1.5) * videoMotion.arc.rotationDeg}deg) scale(${scale})`,
                          // Dim, never fade: a translucent poster reads as "not loaded".
                          filter: d === 0 ? "none" : "brightness(0.7)",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <p className="sr-only" aria-live="polite">
              {category.title}：第 {videoIndex + 1} 支，共 {videos.length} 支，{video.title}
            </p>

            {multi && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => selectVideo(videoIndex - 1)}
                  aria-label="上一支"
                  className="flex size-11 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors hover:border-cream"
                >
                  <CaretLeft size={18} weight="bold" />
                </button>
                <span className="min-w-[4.5rem] text-center font-fredoka text-lg">
                  {displayNumber(videoIndex)} / {pad2(videos.length)}
                </span>
                <button
                  type="button"
                  onClick={() => selectVideo(videoIndex + 1)}
                  aria-label="下一支"
                  className="flex size-11 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors hover:border-cream"
                >
                  <CaretRight size={18} weight="bold" />
                </button>
              </div>
            )}

          </div>

          {/* Info */}
          <div ref={infoRef} className="min-w-0 md:col-span-5 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[30px] leading-tight lg:text-[34px]">
                <span className="sr-only">{category.title}</span>
                <span aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-bottom font-fredoka">
                  {Array.from(category.title).map((ch, i) =>
                    ch === " " ? (
                      " "
                    ) : (
                      <span key={i} data-title-char className="inline-block">
                        {ch}
                      </span>
                    )
                  )}
                </span>
              </h3>
              {category.level_label && (
                <span className="rounded-full border border-cream/40 px-2.5 py-0.5 font-nunito text-[11px] font-bold tracking-[0.1em] text-cream/90">
                  {category.level_label}
                </span>
              )}
            </div>
            {category.subtitle && <p className="mt-1 font-nunito text-sm text-cream/70">{category.subtitle}</p>}
            {category.description && (
              <p className="mt-4 font-nunito text-[15px] leading-relaxed text-cream/85">{category.description}</p>
            )}

            <div className="mt-5 border-t border-cream/15 pt-4">
              <p className="font-nunito text-[15px] font-bold">{video.title}</p>
              {meta.length > 0 && (
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-nunito text-sm">
                  {meta.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-cream/60">{k}</dt>
                      <dd className="text-cream/90">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Phone: everything below collapses behind one toggle -- shown
                only when there is something to expand. */}
            {hasMoreInfo && (
              <button
                type="button"
                onClick={() => setInfoOpen((o) => !o)}
                aria-expanded={infoOpen}
                aria-controls="video-info-more"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-nunito text-sm font-bold text-cream md:hidden"
              >
                {multi ? `查看全部 (${videos.length})` : "更多資訊"}
                <CaretDown size={14} weight="bold" className={`transition-transform ${infoOpen ? "rotate-180" : ""}`} />
              </button>
            )}

            <div id="video-info-more" className={infoOpen ? "block" : "hidden md:block"}>
              {multi && (
                <ol className="mt-4 space-y-0.5">
                  {videos.map((v, i) => (
                    <li key={v.id}>
                      <button
                        type="button"
                        onClick={() => selectVideo(i)}
                        aria-current={i === videoIndex}
                        className={`flex min-h-10 w-full items-center gap-2 text-left font-nunito text-sm transition-colors ${
                          i === videoIndex ? "text-cream" : "text-cream/60 hover:text-cream"
                        }`}
                      >
                        <span className="flex w-3 shrink-0 justify-center text-primary-orange">
                          {i === videoIndex && <Star size={11} weight="fill" aria-hidden />}
                        </span>
                        <span className="font-fredoka text-xs">{displayNumber(i)}</span>
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
                  <span className="font-nunito text-[11px] font-bold tracking-[0.15em] text-cream/60">企劃截圖</span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL */}
                  <img
                    src={category.brief_image_url}
                    alt=""
                    className="mt-1.5 w-24 rounded-md object-cover transition-opacity hover:opacity-80"
                  />
                </button>
              )}

              {category.profile_url && (
                <a
                  href={category.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-nunito text-sm font-bold text-cream underline-offset-4 hover:underline"
                >
                  查看完整帳號 <ArrowUpRight size={14} weight="bold" />
                </a>
              )}

              {category.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
                  {category.tags.map((tag) => (
                    <span key={tag} className="font-nunito text-[11px] tracking-[0.15em] text-cream/60">
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
