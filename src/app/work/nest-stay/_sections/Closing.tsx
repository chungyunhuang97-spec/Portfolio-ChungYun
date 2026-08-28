"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Ambient background geometry drift, per spec: translateX/Y ±8-18px,
 * rotation ±3-6°, 6-12s cycles, ease-in-out, alternate/infinite — reduced
 * to ±6-10px on mobile. Three independent shapes with different
 * amplitude/duration combinations so they don't read as one synced loop.
 * Fully disabled under `prefers-reduced-motion` (spec: "disable loops/
 * scale/drift, keep short fade-ins") — `useReducedMotion()` gates every
 * `animate` prop below, leaving the shapes as static (but still visible,
 * low-opacity) decoration rather than unmounting them outright.
 */
function GeometricBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-10 -left-10 size-[180px] rounded-[40px] border border-white/10 md:size-[280px]"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 14, 0], y: [0, -10, 0], rotate: [0, 4, 0] }
        }
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-40px] top-1/3 size-[140px] rounded-full border border-white/10 md:size-[220px]"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -18, 0], y: [0, 12, 0], rotate: [0, -6, 0] }
        }
        transition={{ duration: 11, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-16 left-1/4 size-[120px] rounded-[32px] border border-white/10 md:size-[190px]"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 8, 0], y: [0, -16, 0], rotate: [0, 3, 0] }
        }
        transition={{ duration: 9.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
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
