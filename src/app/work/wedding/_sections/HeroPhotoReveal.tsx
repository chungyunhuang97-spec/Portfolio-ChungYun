"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Full-bleed hero photo that scroll-zooms OUT from a tight crop to its
 * full composition as the visitor scrolls past it -- Joe's ask: every
 * other hero element (title/tagline/tags/stats) stays inside the first
 * 100vh screen, and this photo's full picture only reveals itself through
 * scrolling, so the photo doesn't have to shrink to fit the first screen
 * at all.
 *
 * Mechanism: `overflow-hidden` wrapper + an `<img>` that's CSS-scaled up
 * past its own box. `transform: scale()` never affects normal-flow layout
 * size (only the unscaled size counts for the box model), so the wrapper
 * always sits at the height the full, unscaled photo would need -- at
 * scale 1 the whole photo is visible and fits exactly; above 1 the image
 * overflows its own box and gets clipped, reading as a tighter zoomed-in
 * crop. Animating that scale down to 1 as the section scrolls into view
 * is the "zoom out to reveal the full frame" effect, tied to
 * `useScroll`'s `scrollYProgress` the same way TCT's `OperaHouseModel`
 * drives its turntable off scroll position rather than a timer.
 *
 * Why zoom instead of cropping a smaller box (the alternative this
 * replaced): the photo is itself finished art direction (desaturated
 * street candid, color left only in the bouquet, hand-drawn stars/ring
 * doodles scattered across the full frame) -- any static crop permanently
 * loses some of those marks. This way nothing is ever actually cropped
 * out of the final state, only hidden until scroll reveals it.
 */
export function HeroPhotoReveal({ src, alt }: { src: string; alt: string }) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  // Tracks progress across the span from "photo's top edge enters the
  // bottom of the viewport" to "photo's top edge reaches 35% down the
  // viewport" -- the reveal finishes shortly after the photo starts
  // coming into view, not only once you've scrolled all the way past it.
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "start 35%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.35, 1]);

  return (
    <div ref={wrapRef} className="w-full overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        style={reduceMotion ? undefined : { scale }}
        className="h-auto w-full object-cover"
      />
    </div>
  );
}
