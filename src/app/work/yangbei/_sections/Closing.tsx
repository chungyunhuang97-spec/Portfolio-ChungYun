"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

/**
 * Diamond-outline texture tiled across the Closing section's blue background.
 * Reuses the same pattern as nest-stay's Closing section — consistent theming
 * across all case studies per Joe's explicit design brief.
 */
const DIAMOND_TILE = { width: 90, height: 90 };
const DIAMOND_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Crect x='31' y='31' width='28' height='28' fill='none' stroke='%23ffffff' stroke-opacity='0.16' stroke-width='2' transform='rotate(45 45 45)'/%3E%3C/svg%3E";

function GeometricBackdrop() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const run = inView && !reduceMotion;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute"
        style={{
          top: -DIAMOND_TILE.height,
          left: -DIAMOND_TILE.width,
          right: -DIAMOND_TILE.width,
          bottom: -DIAMOND_TILE.height,
          backgroundImage: `url("${DIAMOND_SVG}")`,
          backgroundRepeat: "repeat",
        }}
        animate={
          run
            ? { x: [0, -DIAMOND_TILE.width], y: [0, -DIAMOND_TILE.height] }
            : { x: 0, y: 0 }
        }
        transition={{
          duration: 34,
          repeat: run ? Infinity : 0,
          repeatType: "loop",
          ease: "linear",
        }}
      />
    </div>
  );
}

/**
 * 結論 (Closing) — reuses nest-stay's exact bg-secondary-blue quote-mark treatment
 * for consistent cross-case-study theming. Content from `reflection.closingQuote`
 * and `reflection.closingBody`.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const subtitle = reflection.closingSubtitle as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote || !body) return null;

  return (
    <section id="closing" className="relative overflow-hidden bg-secondary-blue">
      <GeometricBackdrop />

      {/* Mobile */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 md:hidden">
        <div className="relative flex w-full max-w-[326px] flex-col items-center gap-3 pt-12 pb-12 text-center text-proj-white">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white"
          >
            「
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white"
          >
            」
          </span>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full font-nunito text-[16px] font-bold leading-[24px]"
          >
            {quote}
          </motion.p>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="w-full font-nunito text-[13px] font-semibold leading-[20px] opacity-90"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            className="w-full font-nunito text-[13px] font-normal leading-[20px] opacity-80"
          >
            {body}
          </motion.p>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex md:h-[500px]">
        <span
          aria-hidden
          className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white"
        >
          「
        </span>
        <span
          aria-hidden
          className="absolute bottom-[200px] right-[240px] translate-x-full translate-y-full font-nunito text-[120px] font-bold leading-[120px] text-proj-white"
        >
          」
        </span>
        <div className="flex w-[800px] flex-col items-center gap-5 text-center text-proj-white">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full font-nunito text-[30px] font-bold leading-[40px]"
          >
            {quote}
          </motion.p>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="w-[680px] font-nunito text-[18px] font-semibold leading-[28px] opacity-90"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            className="w-[680px] font-nunito text-[18px] font-normal leading-[28px] opacity-80"
          >
            {body}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
