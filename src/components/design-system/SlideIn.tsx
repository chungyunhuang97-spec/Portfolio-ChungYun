"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll-triggered directional slide-in, used across project pages
 * wherever the spec calls for "scroll-triggered slide-in" (left/right/up).
 * Complements FadeIn (vertical fade+lift) with horizontal motion.
 */
export function SlideIn({
  children,
  direction = "up",
  delay = 0,
  className,
  viewportMargin = "-80px",
}: {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
  /**
   * Overrides the default "-80px" whileInView root-margin (shrinks the
   * trigger area so entrance plays a beat after the element is already on
   * screen). For an element that can end up pinned at the very bottom of
   * the page (nothing scrollable below it), a -80px bottom margin can
   * never be satisfied -- the browser hits max scroll before the element
   * crosses the shrunk boundary, so it stays stuck at its `initial` state
   * (invisible) forever despite being present and even clickable in the
   * DOM. Pass "0px" (or similar) for any element that may be page-bottom
   * content.
   */
  viewportMargin?: string;
}) {
  const offset =
    direction === "left"
      ? { x: -32, y: 0 }
      : direction === "right"
      ? { x: 32, y: 0 }
      : { x: 0, y: 24 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: viewportMargin }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}
