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
}: {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
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
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 90, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}
