"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { CaretDown, Check, FilmSlate, Pause, Play } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Minimum scroll distance (px) past the moment the intro screen scrolls
// into view before it hands off to the real content — the user nudging
// the page is what advances it, not a timer. A floor on top of that so a
// visitor who stops scrolling entirely (trackpad momentum settled, or
// just reading) isn't stuck on the intro forever.
const INTRO_SCROLL_THRESHOLD_PX = 28;
const INTRO_FALLBACK_MS = 6000;
// How long the intro is guaranteed to stay visible before ANY scroll can
// dismiss it. Without this, a single continuous scroll gesture that
// carries the visitor down into this section's intro (the normal way
// they'd arrive at 02/03 after reading 01) still has momentum in flight
// the instant `introInView` flips true — that leftover momentum alone
// easily covers the threshold before the person has even registered the
// intro is on screen, so it reveals the content immediately and the intro
// never visibly appears at all. Scroll deltas are ignored until this grace
// window has passed, and the baseline position used to measure "did they
// scroll more" is reset once it has, so it's the next scroll input that
// counts, not whatever was already carrying them here.
const INTRO_GRACE_MS = 550;

const introVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.35, ease: EASE } },
};

const introNumberVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
};

const introTextVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 180, damping: 20, delay: 0.15 },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Eyebrow → big title → description, staggered so the title gets its own
 * beat (a spring "pop") instead of arriving flattened into the same fade as
 * everything around it — the one piece of text this section most wants the
 * eye to land on first. */
const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const eyebrowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

const titleVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 170, damping: 15 },
  },
};

const descVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/**
 * Recognizes a YouTube or Vimeo link and returns its embeddable iframe URL.
 * Anything else (an uploaded mp4/webm/mov, including a Supabase Storage URL
 * from AdminMediaDropzone) is treated as a direct, self-hosted video file.
 */
function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/**
 * Self-hosted video with a custom play/pause button instead of the native
 * `controls` attribute — the browser's built-in control bar paints a heavy
 * dark gradient scrim across the bottom third of the video on every
 * platform, which read as far too visually loud for a short product demo
 * clip. This swaps it for one small, lightly-tinted circular button (just
 * enough contrast to read the icon, no bar) that toggles play/pause; no
 * scrub bar, volume or fullscreen, since these are short looping demos the
 * visitor only ever needs to start or stop.
 */
function SelfHostedVideo({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
    } else {
      el.pause();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative block h-full w-full cursor-pointer"
      aria-label={playing ? "暫停影片" : "播放影片"}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted
        playsInline
        className="h-full w-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <span
        className={`absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-opacity md:size-10 ${
          playing ? "opacity-0 group-hover:opacity-100" : "opacity-90"
        }`}
        aria-hidden
      >
        {playing ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" className="ml-0.5" />}
      </span>
    </button>
  );
}

function VideoFrame({ videoUrl, label, color }: { videoUrl?: string; label: string; color: string }) {
  // A thin, fully-saturated border in the section's own color (not a
  // tinted/translucent version of it) instead of a drop shadow — matches
  // the Figma spec exactly (border border-[#ff520d] etc.) rather than a
  // softened approximation, and keeps the same color language across the
  // placeholder and the loaded-video states.
  const borderStyle = { borderColor: color };

  if (!videoUrl) {
    return (
      <div
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border"
        style={{
          background: `linear-gradient(160deg, ${color}26 0%, ${color}0D 100%)`,
          ...borderStyle,
        }}
      >
        <FilmSlate size={32} weight="light" style={{ color: `${color}99` }} />
        <span className="font-nunito text-[13px] font-medium" style={{ color: `${color}99` }}>
          影片上傳中
        </span>
      </div>
    );
  }

  const embed = toEmbedUrl(videoUrl);

  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-black" style={borderStyle}>
        <iframe
          src={embed}
          title={label}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border bg-black" style={borderStyle}>
      <SelfHostedVideo videoUrl={videoUrl} />
    </div>
  );
}

interface Props {
  index: "01" | "02" | "03";
  label: string;
  description: string;
  videoUrl?: string;
  highlights: string[];
  color: string;
  /** Mirrors the layout: video on the right, copy on the left. Used for
   * 中台 so the three sections alternate (左-右-左) down the page instead of
   * repeating the same side three times in a row. Mobile always stacks
   * video-then-copy regardless, per the RWD spec (影片寬度 100% on top). */
  reverse?: boolean;
  /** A one-line narrative bridge from whatever came before, shown alone
   * in this same section (same background, same color identity) when it
   * first scrolls into view, then swapped out for the real video/copy
   * after a beat — instead of either a separate grey interstitial section,
   * or sitting permanently stacked above the content it introduces, which
   * read as a second, redundant heading competing with the title below
   * it. */
  transitionText?: string;
}

/**
 * One reusable "視角" walkthrough: a 16:9 video (or upload placeholder) on
 * one side, its label/description/highlights on the other — alternating
 * sides across the three instances (see `reverse`). Each side slides in
 * from its own edge on scroll (SlideIn is whileInView-triggered), so the
 * video and the copy arrive from opposite directions instead of together.
 * Reused three times from page.tsx for 前台/中台/後台, each passed its own
 * copy, video URL and highlights so this component carries no
 * platform-specific content itself.
 */
export function YangbeiVideoSection({
  index,
  label,
  description,
  videoUrl,
  highlights,
  color,
  reverse = false,
  transitionText,
}: Props) {
  const introRef = useRef<HTMLDivElement>(null);
  const introInView = useInView(introRef, { once: true, margin: "0px 0px -10% 0px" });
  const [showContent, setShowContent] = useState(!transitionText);

  // Advances past the intro once the visitor actually scrolls (mouse wheel,
  // trackpad, or a touch drag — all fire the same window "scroll" event, so
  // this needs no separate touch handling for mobile), measured from
  // wherever the page happened to be when the intro first came into view.
  // The timed fallback only covers someone who stops scrolling entirely
  // (momentum settled mid-read) so the section can't get stuck open.
  useEffect(() => {
    if (!transitionText || showContent || !introInView) return;
    let armed = false;
    let baselineY = window.scrollY;

    function reveal() {
      setShowContent(true);
      window.removeEventListener("scroll", onScroll);
    }
    function onScroll() {
      if (armed && Math.abs(window.scrollY - baselineY) > INTRO_SCROLL_THRESHOLD_PX) reveal();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    const armTimer = setTimeout(() => {
      armed = true;
      baselineY = window.scrollY;
    }, INTRO_GRACE_MS);
    const fallback = setTimeout(reveal, INTRO_FALLBACK_MS);
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(armTimer);
      clearTimeout(fallback);
    };
  }, [transitionText, showContent, introInView]);

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 py-16 md:px-[120px] md:py-[80px]"
      style={{ backgroundColor: `${color}0D` }}
    >
      <AnimatePresence mode="wait">
        {transitionText && !showContent ? (
          <motion.div
            key="intro"
            ref={introRef}
            variants={introVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative flex w-full flex-1 flex-col items-center justify-center"
          >
            {/* Giant, barely-there chapter numeral as a background watermark —
                stays on the same tinted ground as the content below instead
                of a separate saturated curtain, so nothing jumps when it
                hands off. */}
            <motion.span
              variants={introNumberVariants}
              aria-hidden
              className="font-display pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] text-[200px] leading-none font-bold select-none md:text-[340px]"
              style={{ color: `${color}14` }}
            >
              {index}
            </motion.span>

            <motion.div
              variants={introTextVariants}
              className="relative z-10 flex flex-col items-center gap-4 px-6 text-center"
            >
              <p
                className="font-nunito max-w-[560px] text-[20px] leading-[30px] font-extrabold md:text-[28px] md:leading-[40px]"
                style={{ color }}
              >
                {transitionText}
              </p>
              <CaretDown size={20} weight="bold" style={{ color: `${color}80` }} aria-hidden />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={contentVariants}
            initial="hidden"
            animate="show"
            className={`mx-auto flex w-full max-w-[1200px] flex-col gap-8 md:items-center md:gap-14 ${
              reverse ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <SlideIn
              direction={reverse ? "right" : "left"}
              viewportMargin="0px"
              className="w-full md:w-[56%] md:shrink-0"
            >
              <VideoFrame videoUrl={videoUrl} label={label} color={color} />
            </SlideIn>

            <SlideIn
              direction={reverse ? "left" : "right"}
              delay={0.1}
              viewportMargin="0px"
              className="w-full md:flex-1"
            >
              <div className="flex flex-col gap-5 md:gap-6">
                <motion.div
                  variants={headerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  className="flex flex-col gap-2.5 md:gap-3"
                >
                  <motion.span
                    variants={eyebrowVariants}
                    className="font-nunito text-[13px] font-extrabold tracking-[1.5px] uppercase"
                    style={{ color }}
                  >
                    {`SECTION ${index}`}
                  </motion.span>
                  <motion.h2
                    variants={titleVariants}
                    className="font-display text-[30px] leading-[40px] font-bold md:text-[40px] md:leading-[50px]"
                    style={{ color }}
                  >
                    {label}
                  </motion.h2>
                  <motion.p
                    variants={descVariants}
                    className="font-nunito text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]"
                  >
                    {description}
                  </motion.p>
                </motion.div>

                {highlights.length > 0 && (
                  <motion.ul
                    className="flex flex-col gap-2.5 pt-1"
                    variants={listVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  >
                    {highlights.map((feat) => (
                      <motion.li
                        key={feat}
                        variants={itemVariants}
                        className="flex items-center gap-3 rounded-xl border border-grey-100 bg-proj-white px-4 py-3 shadow-[0px_4px_5px_rgba(64,50,42,0.05),0px_1px_1px_rgba(64,50,42,0.04)]"
                      >
                        <span
                          className="flex size-6 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${color}1A`, color }}
                          aria-hidden
                        >
                          <Check size={13} weight="bold" />
                        </span>
                        <span className="font-nunito text-[13px] font-medium text-primary-black md:text-[14px]">
                          {feat}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </SlideIn>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
