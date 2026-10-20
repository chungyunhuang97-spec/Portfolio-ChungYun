"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * Dashed heart outline, tiled and drifting — this Closing's own signature
 * motif (every other project page's Closing has one: Metro's DotDrift/
 * MetallicSheen/OrbitRings, Nest Stay's diamond drift, Piiluu/TCT's
 * diamond-grid/archive-grain backdrop — see
 * docs/case-study-design-conventions.md's "招牌動效" rule). Reprises the
 * heart motif DesignThread.tsx's dashed heart-stitch already introduced
 * for "一條隱藏的脈絡", carried through to the page's own closing beat.
 * Same technique as piiluu's GeometricBackdrop: a CSS pattern (not a
 * photo) drifting diagonally, gated by useInView + useReducedMotion so it
 * pauses off-screen and respects reduced-motion preference.
 */
const HEART_PATTERN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Cpath d='M36 54C16 40 16 22 28 22c5 0 8 5 8 5s3-5 8-5c12 0 12 18-8 32Z' fill='none' stroke='%23ffffff' stroke-opacity='0.35' stroke-width='1.5'/%3E%3C/svg%3E";

function HeartDrift() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const run = inView && !reduceMotion;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-accent-pink">
      <motion.div
        className="absolute -inset-16"
        style={{ backgroundImage: `url("${HEART_PATTERN_URL}")`, backgroundRepeat: "repeat" }}
        animate={run ? { x: [0, -72], y: [0, 72] } : { x: 0, y: 0 }}
        transition={{ duration: 26, repeat: run ? Infinity : 0, repeatType: "loop", ease: "linear" }}
      />
    </div>
  );
}

/**
 * Section 8 — Closing (`reflection` row). bg-accent-pink -- this page's
 * own dominant color, reused directly here (unlike every other case
 * study's Closing, which is always bg-secondary-blue regardless of that
 * page's own dominant color -- see docs/case-study-design-conventions.md).
 * `id="closing"` is what <BackToTop /> watches to decide when to appear.
 *
 * Quote marks are pinned to the SECTION's own corners on desktop/large
 * screens (`lg:` and up — same breakpoint tct's Closing settled on after
 * hitting this exact bug at tablet widths), decoupled from the centered
 * text column entirely, so they can never collide with wrapped text
 * regardless of how many lines the quote runs to. Below `lg:`, the marks
 * stay nested in the text wrapper (piiluu's precedent) but with generous
 * pt/pb clearance — the earlier version reserved only 40px for a 96px
 * glyph, which is what caused the overlap.
 *
 * Content model: `reflection` row — `closingQuote` (the reflective
 * paragraphs) + `closingBody` (the short closing line), same two-field
 * shape piiluu's Closing.tsx uses.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote && !body) return null;
  const quoteParagraphs = quote ? quote.split("\n\n") : [];

  return (
    <section id="closing" className="relative overflow-hidden bg-accent-pink">
      <HeartDrift />

      {/* Compact (phone + tablet) */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 lg:hidden">
        <SlideIn delay={0.1}>
          <div className="relative flex w-full max-w-[326px] flex-col items-center gap-4 pt-16 pb-16 text-center text-proj-white md:max-w-[560px]">
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 font-nunito text-[32px] leading-[32px] font-bold text-proj-white md:text-[44px] md:leading-[44px]"
            >
              「
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 font-nunito text-[32px] leading-[32px] font-bold text-proj-white md:text-[44px] md:leading-[44px]"
            >
              」
            </span>
            {quoteParagraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 12)}
                className="w-full font-nunito text-[16px] leading-[26px] font-bold md:text-[18px] md:leading-[28px]"
              >
                {paragraph}
              </p>
            ))}
            {body && (
              <p className="mt-1 w-full font-nunito text-[13px] leading-[20px] font-bold opacity-85 md:text-[14px]">
                {body}
              </p>
            )}
          </div>
        </SlideIn>
      </div>

      {/* Desktop -- `lg:` and up only, see the doc comment above. */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] lg:flex lg:min-h-[420px]">
        <span
          aria-hidden
          className="absolute top-[80px] left-[120px] font-nunito text-[100px] leading-[100px] font-bold text-proj-white"
        >
          「
        </span>
        <span
          aria-hidden
          className="absolute right-[120px] bottom-[80px] font-nunito text-[100px] leading-[100px] font-bold text-proj-white"
        >
          」
        </span>
        <SlideIn delay={0.1}>
          <div className="flex w-[760px] flex-col items-center gap-6 text-center text-proj-white">
            {quoteParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 12)} className="w-full font-nunito text-[22px] leading-[34px] font-bold">
                {paragraph}
              </p>
            ))}
            {body && (
              <p className="mt-1 w-full font-nunito text-[15px] leading-[24px] font-bold opacity-85">{body}</p>
            )}
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
