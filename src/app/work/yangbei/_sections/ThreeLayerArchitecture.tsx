"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { YangbeiPlatform as Platform } from "../types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Decorative character illustration per platform, keyed by `platform.id`
 * (same ids Hero.tsx and DESKTOP_PLATFORM_IDS already rely on: "frontend",
 * "instructor", "admin"). Purely visual — a platform with an id outside this
 * map (or none at all) just renders without one, so this never blocks new
 * CMS content from showing up.
 */
const ILLUSTRATIONS: Record<string, string> = {
  frontend: "/case-studies/yangbei/illustration-frontend.png",
  instructor: "/case-studies/yangbei/illustration-instructor.png",
  admin: "/case-studies/yangbei/illustration-admin.png",
};

/**
 * Small continuous bob + tilt on each platform's illustration so the row
 * doesn't read as three static stickers pasted onto the cards. Kept subtle
 * (6px, 11s) since it sits right next to body copy people are meant to
 * actually read. Disabled under prefers-reduced-motion.
 */
function FloatingIllustration({ src, flip }: { src: string; flip: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="pointer-events-none absolute -top-8 right-3 z-10 size-16 select-none sm:-top-10 sm:size-20 md:-top-12 md:-right-6 md:size-28"
      style={{ scaleX: flip ? -1 : 1 }}
      animate={reduceMotion ? {} : { y: [0, -8, 0], rotate: flip ? [2, -2, 2] : [-2, 2, -2] }}
      transition={reduceMotion ? undefined : { duration: 11, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      {/* unoptimized: these are small (~70KB), already-compressed flat-color
          stickers -- running them through Next's resize+re-encode pipeline
          for a 112px slot softened edges and flattened color noticeably
          (visible on closer inspection). Serving the original PNG directly
          and letting the browser downscale it reads crisper for art like
          this, and the bandwidth cost of skipping optimization is trivial
          at this file size. */}
      <Image src={src} alt="" fill sizes="112px" unoptimized className="object-contain drop-shadow-sm" />
    </motion.div>
  );
}

/** One drawn-in connector line, shared by the mobile stem and the desktop
 * measured diagonals — a single `pathLength` tween triggered the moment
 * this particular line scrolls into view, so each connection "runs out" to
 * the next card as you scroll rather than just appearing. */
function DrawnLine({ x1, y1, x2, y2 }: { x1: number | string; y1: number | string; x2: number | string; y2: number | string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      vectorEffect="non-scaling-stroke"
      stroke="var(--color-primary-orange)"
      strokeOpacity={0.4}
      strokeWidth={1.5}
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, margin: "-25% 0px -25% 0px" }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
    />
  );
}

/**
 * Pure vertical gap between two stacked cards on mobile, where there's no
 * left/right offset for a diagonal to bridge. The desktop diagonal lives in
 * `ConnectorOverlay` instead (see its comment for why) — this element is
 * purely a spacer there, hidden.
 */
function GapSpacer() {
  return (
    <div className="flex h-16 items-stretch justify-center md:h-28 lg:h-32">
      <svg className="h-full w-px overflow-visible md:hidden" viewBox="0 0 2 100" preserveAspectRatio="none" fill="none" aria-hidden>
        <DrawnLine x1="1" y1="0" x2="1" y2="100" />
      </svg>
    </div>
  );
}

interface LinePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Desktop connector lines, measured from the cards' *actual* rendered
 * positions rather than guessed at with a fixed-size box. Card width here
 * is intentionally fluid (a percentage, capped by a max-width) so it hugs
 * its content across viewport sizes instead of stretching full-width — but
 * that means the pixel gap between a left-aligned and a right-aligned card
 * varies continuously with viewport width, which a hand-tuned "diagonal in
 * a 140px box" (the previous approach) can't track: it either undershoots
 * or overshoots once the real gap changes.
 *
 * Measured via `getBoundingClientRect()` relative to `containerRef`, NOT
 * `offsetLeft/offsetTop` — each card sits inside SlideIn's `motion.div`,
 * which keeps a CSS `transform` set even at rest (that's how the entrance
 * slide is driven). Any ancestor with an active `transform` becomes the
 * browser's `offsetParent` for everything inside it, so `offsetLeft/Top`
 * read on the card ended up relative to that per-card wrapper instead of
 * the shared container — every card reporting position near (0, 0) and
 * the "diagonal" collapsing into the X of two crossed, wrongly-anchored
 * lines that was reported. `getBoundingClientRect()` isn't fooled by an
 * intervening transform.
 *
 * `settleSignal` bumps once per card, the moment its own SlideIn entrance
 * (which moves it via `transform`, not a size change ResizeObserver would
 * catch) finishes — an earlier version instead re-measured on every
 * animation frame for 1.5s to track that same settle, but updating each
 * line's endpoints ~90 times/sec fought its OWN `pathLength` draw-in tween
 * (recomputed on every endpoint change), which is why the line stopped
 * visibly animating in and just appeared already-drawn. A measurement per
 * settle event is precise instead of a blind poll, and only ever a small,
 * fixed number of corrections.
 */
function ConnectorOverlay({
  containerRef,
  cardRefs,
  count,
  settleSignal,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  count: number;
  settleSignal: number;
}) {
  const [lines, setLines] = useState<LinePoints[]>([]);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const cards = cardRefs.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: LinePoints[] = [];
      for (let i = 0; i < count - 1; i++) {
        const a = cards[i]?.getBoundingClientRect();
        const b = cards[i + 1]?.getBoundingClientRect();
        if (!a || !b) continue;
        const aAlignLeft = i % 2 === 0;
        next.push({
          x1: (aAlignLeft ? a.right : a.left) - containerRect.left,
          y1: a.bottom - containerRect.top,
          x2: (aAlignLeft ? b.left : b.right) - containerRect.left,
          y2: b.top - containerRect.top,
        });
      }
      setLines(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    cardRefs.current.forEach((el) => el && ro.observe(el));
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, cardRefs, count, settleSignal]);

  if (lines.length === 0) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" fill="none" aria-hidden>
      {lines.map((l, i) => (
        <DrawnLine key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
      ))}
    </svg>
  );
}

function PlatformCard({
  platform,
  align,
  cardRef,
  onSettled,
}: {
  platform: Platform;
  align: "left" | "right";
  cardRef: (el: HTMLDivElement | null) => void;
  onSettled?: () => void;
}) {
  const illustration = ILLUSTRATIONS[platform.id];

  return (
    <SlideIn
      direction={align === "left" ? "left" : "right"}
      viewportMargin="-100px"
      onAnimationComplete={onSettled}
    >
      {/* Fluid, content-hugging width (a share of the row, capped) on
          desktop so the card reads as its own object in open space rather
          than a bar stretched edge to edge — not a fixed pixel value,
          since ConnectorOverlay measures the real rendered box instead of
          assuming one. Full-width on mobile, where there's no room to
          offset left/right. */}
      <div
        ref={cardRef}
        className={`relative w-full md:w-[48%] md:max-w-[420px] ${align === "left" ? "md:mr-auto" : "md:ml-auto"}`}
      >
        {illustration && <FloatingIllustration src={illustration} flip={align === "right"} />}

        <div
          className="flex flex-col gap-4 rounded-2xl border border-grey-100 bg-grey-50 p-6 md:p-7"
          style={{ borderTopColor: platform.color, borderTopWidth: 3 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="font-nunito text-[20px] font-bold leading-none"
              style={{ color: platform.color }}
            >
              {platform.name}
            </span>
            <span className="font-nunito rounded-full border border-grey-300 px-2.5 py-0.5 text-[11px] text-grey-600">
              {platform.label}
            </span>
          </div>

          {/* Auth badge */}
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="6" stroke="#b3b3b3" strokeWidth="1.2" />
              <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="#808080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-nunito text-[12px] text-grey-500">
              {platform.auth}
            </span>
          </div>

          {/* Desc */}
          <p className="font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px] md:leading-[22px]">
            {platform.desc}
          </p>

          {/* Features */}
          <ul className="flex flex-col gap-2 border-t border-grey-100 pt-4">
            {platform.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2">
                <span
                  className="size-[5px] shrink-0 rounded-full"
                  style={{ backgroundColor: platform.color }}
                  aria-hidden
                />
                <span className="font-nunito text-[12px] text-grey-600 md:text-[13px]">
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideIn>
  );
}

/**
 * 一套系統，三種角色 — architecture overview.
 * Shows the 3-layer platform (前台/中台/後台) as a scroll-triggered,
 * zig-zagging stack of content-hugging cards. Each card reveals on its own
 * as it scrolls into view, and a line visibly draws itself in from the
 * bottom corner of one card to the top corner of the next as that gap
 * scrolls into view — on desktop it's measured from the cards' real
 * positions so it always actually reaches both cards (see
 * `ConnectorOverlay`); on mobile, where cards don't offset, it's a plain
 * vertical stem. Each card is topped with its own floating illustration.
 * Content from `process.architectureTitle`, `process.architectureSubtitle`, `process.platforms`.
 */
export function ThreeLayerArchitecture({ process }: { process: Record<string, unknown> }) {
  const title = (process.architectureTitle as string) || "一套系統，三種角色";
  const subtitle = (process.architectureSubtitle as string) || "";
  const platforms = Array.isArray(process.platforms)
    ? (process.platforms as Platform[])
    : [];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Bumped once per card as its own entrance settles -- see ConnectorOverlay's
  // comment for why this replaced a continuous remeasure loop.
  const [settleSignal, setSettleSignal] = useState(0);

  if (platforms.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            System Architecture
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      {/* Zig-zag stack: each card offset to alternating sides on desktop
          (前台 left, 中台 right, 後台 left…), full-width stacked on mobile.
          `relative` so ConnectorOverlay's absolute SVG lines up with the
          cards it measures. */}
      <div ref={containerRef} className="relative flex flex-col">
        {platforms.map((platform, i) => (
          <div key={platform.id} className="contents">
            {i > 0 && <GapSpacer />}
            <PlatformCard
              platform={platform}
              align={i % 2 === 0 ? "left" : "right"}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
              onSettled={() => setSettleSignal((s) => s + 1)}
            />
          </div>
        ))}
        <ConnectorOverlay
          containerRef={containerRef}
          cardRefs={cardRefs}
          count={platforms.length}
          settleSignal={settleSignal}
        />
      </div>
    </section>
  );
}
