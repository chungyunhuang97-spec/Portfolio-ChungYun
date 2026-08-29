"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

/**
 * Diamond-outline texture tiled across the Closing section's blue
 * background, per Figma — thin white rhombus outlines on a regular grid
 * (not filled/blurred circles, and no separate circle/square frame shapes —
 * corrected per Joe's direct comparison against the design file). The whole
 * tile layer drifts slowly up-and-left as one continuous, never-reversing
 * pan ("感覺在無限移動"), not a ping-pong sway — the translate distance exactly
 * matches one tile (`DIAMOND_PATTERN_TILE`), so the loop's reset back to
 * (0,0) lands on a pixel-identical frame and reads as an unbroken drift
 * instead of a visible jump. Disabled under `prefers-reduced-motion`.
 */
const DIAMOND_PATTERN_TILE = { width: 90, height: 90 };
const DIAMOND_PATTERN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Crect x='31' y='31' width='28' height='28' fill='none' stroke='%23ffffff' stroke-opacity='0.16' stroke-width='2' transform='rotate(45 45 45)'/%3E%3C/svg%3E";

function GeometricBackdrop() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Not `once` — per spec, these loops should pause once the section leaves
  // the viewport again, not just wait to start once.
  const inView = useInView(ref, { amount: 0.1 });
  const run = inView && !reduceMotion;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute"
        style={{
          top: -DIAMOND_PATTERN_TILE.height,
          left: -DIAMOND_PATTERN_TILE.width,
          right: -DIAMOND_PATTERN_TILE.width,
          bottom: -DIAMOND_PATTERN_TILE.height,
          backgroundImage: `url("${DIAMOND_PATTERN_URL}")`,
          backgroundRepeat: "repeat",
        }}
        animate={run ? { x: [0, -DIAMOND_PATTERN_TILE.width], y: [0, -DIAMOND_PATTERN_TILE.height] } : { x: 0, y: 0 }}
        transition={{ duration: 34, repeat: run ? Infinity : 0, repeatType: "loop", ease: "linear" }}
      />
    </div>
  );
}

/**
 * 結論 (Closing), Figma desktop node 275:87's finale block / mobile
 * node 404:147 — both use the same `bg-secondary-blue` field as metro's
 * own Closing section (127:692 / 151:578), so this reuses that section's
 * exact quote-mark + background treatment, per Joe's explicit request to
 * reuse metro's components/specs wherever the designs overlap so every
 * project reads as one consistent theme. Content model: uses the
 * `reflection` row (`closingQuote` / `closingBody`), same convention metro
 * established for this section.
 *
 * Motion difference from metro's Closing: this round's interaction spec is
 * explicit that the title fades in FIRST and the body follows 0.15s later
 * (translateY 12px, no typewriter effect) — implemented as two separately
 * delayed motion.div's instead of metro's single SlideIn wrapping both
 * lines together. The ambient background geometry (GeometricBackdrop
 * above) also follows this round's own amplitude/rotation/duration spec
 * rather than metro's DotDrift/MetallicSheen/OrbitRings treatment.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote || !body) return null;

  return (
    <section id="closing" className="relative overflow-hidden bg-secondary-blue">
      <GeometricBackdrop />

      {/* Mobile layout */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 md:hidden">
        <div className="relative flex w-full max-w-[326px] flex-col items-center gap-3 pt-12 pb-12 text-center text-proj-white">
          <span aria-hidden className="pointer-events-none absolute left-0 top-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white">
            「
          </span>
          <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white">
            」
          </span>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full font-nunito text-[16px] font-bold leading-[24px]"
          >
            {quote}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="w-full font-nunito text-[13px] font-normal leading-[20px] opacity-80"
          >
            {body}
          </motion.p>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex">
        {/* Figma has a static "回到頂部" instance inside this section (390:481, desktop only), but
            since it's functionally identical to the global floating <BackToTop /> that's already
            present on every page, Joe asked to keep just the one (the floating component) rather
            than duplicate it here. */}
        <span aria-hidden className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          「
        </span>
        <span aria-hidden className="absolute bottom-[200px] right-[240px] translate-x-full translate-y-full font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          」
        </span>
        <div className="flex w-[800px] flex-col items-center gap-5 text-center text-proj-white">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full font-nunito text-[30px] font-bold leading-[40px]"
          >
            {quote}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="w-[680px] font-nunito text-[18px] font-normal leading-[28px] opacity-80"
          >
            {body}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
