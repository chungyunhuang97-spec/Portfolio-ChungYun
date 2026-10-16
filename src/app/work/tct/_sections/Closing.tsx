"use client";

import { useRef } from "react";
import type { RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Film-grain texture reused verbatim from the visual comparison Joe
 * picked (artifact "結語動態提案") -- a `feTurbulence` noise tile rather
 * than a photo, so it stays a flat few KB and tiles seamlessly at any
 * section width. */
const GRAIN_DATA_URI =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

/**
 * Asymmetric wave outline for the section's top/bottom edges -- Joe's
 * "波浪形的外框，不對稱" call to replace the torn-paper jagged edge, which
 * read as angular facets instead of a wave because `clip-path: polygon()`
 * can only connect straight lines. `clipPathUnits="objectBoundingBox"`
 * keeps the same curve proportional whether this section is 380px tall on
 * mobile or 500px on desktop, and however wide the viewport is -- a fixed
 * pixel `clip-path: path()` would distort at every other width. Top and
 * bottom use different point spacing/amplitude on purpose (not a
 * repeating sine).
 */
function ClosingWaveEdge() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <clipPath id="closingWaveEdge" clipPathUnits="objectBoundingBox">
          <path
            d="
              M 0,0.015
              C 0.0467,0.015 0.0933,0.055 0.14,0.055
              C 0.1933,0.055 0.2467,0.005 0.30,0.005
              C 0.3567,0.005 0.4133,0.04 0.47,0.04
              C 0.5233,0.04 0.5767,0.0 0.63,0.0
              C 0.6867,0.0 0.7433,0.05 0.80,0.05
              C 0.84,0.05 0.88,0.02 0.92,0.02
              C 0.9467,0.02 0.9733,0.035 1,0.035
              L 1,0.97
              C 0.9533,0.97 0.9067,0.935 0.86,0.935
              C 0.8133,0.935 0.7667,0.99 0.72,0.99
              C 0.6733,0.99 0.6267,0.955 0.58,0.955
              C 0.5333,0.955 0.4867,0.995 0.44,0.995
              C 0.3933,0.995 0.3467,0.96 0.30,0.96
              C 0.2533,0.96 0.2067,0.985 0.16,0.985
              C 0.1067,0.985 0.0533,0.945 0,0.945
              Z"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Archive-grain backdrop -- this project's own Closing motif (every other
 * project page's Closing has its own ambient treatment: Metro's DotDrift/
 * MetallicSheen/OrbitRings, Nest Stay's diamond drift, Piiluu's
 * trust-network field -- none of which are reused here). Replaces the old
 * scanline-drift + fast brightness flicker (Joe's "動態太快，也不符合主題"
 * complaint) with a calm paper-grain texture that drifts with SCROLL
 * position instead of a timer -- "80 年歷史資料" reads as an aged archive
 * you're paging through, not a glitching signal. `useScroll`'s own
 * clamped-at-the-edges output already keeps this still before the section
 * enters/after it leaves, so no separate `useInView` gate is needed the
 * way the old flicker required one.
 */
function ArchiveGrain({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  // ±36px was tuned against the artifact comparison's floating-card mockup,
  // which had a full section height of scroll room either side of the card
  // to express it in. The real Closing section is short -- often under one
  // viewport tall -- so that same range barely moved before the section was
  // already gone; Joe's "好像只有波浪，没有动态" was that gap, not a missing
  // effect. ±130 is the amplitude that actually read as motion once checked
  // at the section's real (short) scroll length.
  const grainY = useTransform(scrollYProgress, [0, 1], [-130, 130]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-x-6 -inset-y-[150px]"
        style={{
          backgroundImage: `url("${GRAIN_DATA_URI}")`,
          backgroundSize: "140px 140px",
          mixBlendMode: "overlay",
          opacity: 0.2,
          y: reduceMotion ? 0 : grainY,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.14) 100%)" }}
      />
    </div>
  );
}

/**
 * Section 6 -- Closing (`reflection` row's single `text` field). Keeps the
 * `bg-secondary-blue` + big quote-mark treatment every other project page's
 * Closing shares regardless of that page's own dominant color (same
 * cross-project convention as Footer always being orange) -- only the
 * ambient backdrop above is this project's own.
 */
/** Splits the quote into its two beats ("設計是為了...版面規則。" and "這個
 * 專案讓我學會...依然好用。") -- the same marker `Outcome.tsx`'s
 * `splitReflection` already uses for its insight card. Desktop renders
 * these as two separate stacked blocks instead of one run-on paragraph,
 * matching Figma's desktop Closing exactly (two distinct text nodes with a
 * gap between); mobile keeps the original single block, also per Figma. */
function splitQuote(text: string): [string, string | null] {
  const marker = "這個專案讓我學會";
  const idx = text.indexOf(marker);
  if (idx === -1) return [text, null];
  return [text.slice(0, idx).trim(), text.slice(idx).trim()];
}

export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const text = reflection.text as string | undefined;
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  // Same scroll range `ArchiveGrain` reads, for the quote block's own
  // (smaller, opposite-leaning) parallax drift -- the text floats a little
  // less and a little the other way from the grain behind it, which is
  // what actually reads as depth rather than two layers moving in lockstep.
  // Same amplitude correction as `ArchiveGrain`'s `grainY` -- ±18px over
  // this section's real (short) scroll length read as static.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const quoteY = useTransform(scrollYProgress, [0, 1], [46, -46]);

  if (!text) return null;
  const [quoteBody, quoteLesson] = splitQuote(text);

  return (
    <section
      id="closing"
      ref={sectionRef}
      className="relative overflow-hidden bg-secondary-blue"
      style={{ clipPath: "url(#closingWaveEdge)" }}
    >
      <ClosingWaveEdge />
      <ArchiveGrain sectionRef={sectionRef} />

      {/* Mobile */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 md:hidden">
        <motion.div
          style={{ y: reduceMotion ? 0 : quoteY }}
          className="relative flex w-full max-w-[326px] flex-col items-center gap-3 pt-12 pb-12 text-center text-proj-white"
        >
          <span aria-hidden className="pointer-events-none absolute left-0 top-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white">
            「
          </span>
          <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white">
            」
          </span>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full font-nunito text-[16px] font-bold leading-[26px]"
          >
            {text}
          </motion.p>
        </motion.div>
      </div>

      {/* Desktop */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex md:min-h-[420px]">
        <span aria-hidden className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          「
        </span>
        <span aria-hidden className="absolute bottom-[80px] right-[120px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          」
        </span>
        <motion.div
          style={{ y: reduceMotion ? 0 : quoteY }}
          className="flex w-[760px] flex-col items-center gap-10 text-center text-proj-white"
        >
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full font-nunito text-[26px] font-bold leading-[40px]"
          >
            {quoteBody}
          </motion.p>
          {quoteLesson && (
            <motion.p
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="w-full font-nunito text-[26px] font-bold leading-[40px]"
            >
              {quoteLesson}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
