"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";

/**
 * Page-load entrance animation: two panels slide apart like opening
 * metro doors, revealing the content underneath. Reference: the original
 * portfolio's hero used literal train-door artwork; this version keeps the
 * *gesture* (a door opening) but in the new design system's own palette
 * so it works as a generic "page intro" for any project page, not just Metro.
 *
 * Runs once per mount, respects prefers-reduced-motion.
 */
export function DoorReveal({ children }: { children: ReactNode }) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [done, setDone] = useState(false);

  return (
    <div className="relative">
      {children}
      {!reducedMotion && !done && (
        <div className="pointer-events-none fixed inset-0 z-[100] flex">
          <motion.div
            className="h-full w-1/2 bg-primary-black"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setDone(true)}
          />
          <motion.div
            className="h-full w-1/2 bg-primary-black"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold uppercase tracking-[0.3em] text-primary-orange"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            Loading
          </motion.div>
        </div>
      )}
    </div>
  );
}
