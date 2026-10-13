"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

/**
 * Archive-flicker backdrop -- this project's own Closing motif (every
 * other project page's Closing has its own ambient treatment: Metro's
 * DotDrift/MetallicSheen/OrbitRings, Nest Stay's diamond drift, Piiluu's
 * trust-network field -- none of which are reused here). Two layers:
 * drifting horizontal scanlines (old film/CRT read) plus a slow opacity
 * flicker, together reading as "analog archive footage resolving into
 * something legible" -- this project's whole premise (80 years of
 * incomplete historical material turned into a working digital exhibit).
 * Pauses under `prefers-reduced-motion`.
 */
function ArchiveFlicker() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const run = inView && !reduceMotion;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 -top-1/2 h-[200%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 5px)",
        }}
        animate={run ? { y: ["0%", "50%"] } : { y: "0%" }}
        transition={{ duration: 6, repeat: run ? Infinity : 0, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 bg-accent-pink/10"
        animate={run ? { opacity: [0.15, 0.05, 0.2, 0.08, 0.15] } : { opacity: 0.12 }}
        transition={{ duration: 3.2, repeat: run ? Infinity : 0, ease: "easeInOut" }}
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
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const text = reflection.text as string | undefined;
  if (!text) return null;

  return (
    <section id="closing" className="relative overflow-hidden bg-secondary-blue">
      <ArchiveFlicker />

      {/* Mobile */}
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
            className="w-full font-nunito text-[16px] font-bold leading-[26px]"
          >
            {text}
          </motion.p>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex md:min-h-[420px]">
        <span aria-hidden className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          「
        </span>
        <span aria-hidden className="absolute bottom-[120px] right-[160px] translate-x-full translate-y-full font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          」
        </span>
        <div className="flex w-[760px] flex-col items-center gap-5 text-center text-proj-white">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full font-nunito text-[26px] font-bold leading-[40px]"
          >
            {text}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
