"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Replaces the old three-layer parallax HeroLayeredPhoto with the new
 * crosswalk choreography Joe asked for from the Figma hero redesign: the
 * couple (the "cutout" layer) walk themselves off screen to the left as
 * the visitor scrolls, as if finishing crossing the street -- then, once
 * they're gone, the photo card itself scales up from its resting inset
 * size to full-bleed and its corners square off, "extending" toward the
 * next section. Desktop overlays the Hero's own title/tagline/stats/
 * badges directly on the photo (`overlay` prop); mobile gets the same
 * walk-off + scale-up sequence (Joe's own ask -- it isn't desktop-only),
 * just with no overlay, since mobile's title/tagline live in normal flow
 * above the photo instead (see Hero.tsx, which keeps genuinely separate
 * desktop/mobile trees rather than forcing one shared tree through
 * breakpoints -- same precedent DesignThread.tsx's table/cards split
 * already set on this page).
 *
 * Mechanism: a single scroll-through pass across the photo's own wrapper
 * (`offset: ["start start", "end start"]` -- progress 0 once the photo has
 * "arrived" at the top of the viewport, progress 1 once it's fully
 * scrolled past), carrying three sub-ranges of that one progress value:
 *   0.00–0.40  cutout translateX 0% -> -130% (the walk-off)
 *   0.15–0.38  overlay text fades out (so it doesn't float oddly over a
 *              scaling-up photo)
 *   0.45–0.95  the card's own `scale` relaxes rest -> 1 (the "放大"/
 *              enlarge Joe described) while its corner radius relaxes to
 *              0 -- scaling the whole card from its own center is what
 *              keeps it visually centered as it grows, rather than
 *              animating width/margin (which would distort the image's
 *              aspect ratio mid-transition).
 * Before progress 0 (while still scrolling toward the hero) nothing
 * animates -- the photo is simply the static, fully-composed crosswalk
 * shot, same as any other hero image, and only starts its sequence once
 * the visitor keeps scrolling past it.
 */

const CUTOUT_RANGE: [number, number] = [0, 0.4];
const OVERLAY_FADE_RANGE: [number, number] = [0.15, 0.38];
const BREAKOUT_RANGE: [number, number] = [0.45, 0.95];

interface Metrics {
  /** The card's scale at rest, before the breakout (1 = already full-bleed). */
  restScale: number;
  /** Corner radius of the card at rest, in px (animates to 0 on breakout). */
  radiusPx: number;
}

// Desktop's rest card matches the Figma hero's inset photo card (1082px
// wide inside a 1512px canvas); mobile gets a smaller, subtler inset --
// Joe's ask was for mobile to carry the same walk-off + enlarge beat, not
// to replicate the desktop card's exact proportions.
const DESKTOP_METRICS: Metrics = { restScale: 1082 / 1512, radiusPx: 20 };
const MOBILE_METRICS: Metrics = { restScale: 0.92, radiusPx: 14 };

interface HeroCrosswalkPhotoProps {
  backgroundSrc: string;
  cutoutSrc: string;
  alt: string;
  /** Desktop-only text overlaid on the photo -- see component doc comment. */
  overlay?: ReactNode;
  /** Aspect ratio of the photo at its full-bleed (post-breakout) size. */
  aspectRatio?: string;
}

export function HeroCrosswalkPhoto({
  backgroundSrc,
  cutoutSrc,
  alt,
  overlay,
  aspectRatio = "1082 / 559",
}: HeroCrosswalkPhotoProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const metrics = isDesktop ? DESKTOP_METRICS : MOBILE_METRICS;

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });

  const cutoutX = useTransform(scrollYProgress, CUTOUT_RANGE, ["0%", "-130%"]);
  const overlayOpacity = useTransform(scrollYProgress, OVERLAY_FADE_RANGE, [1, 0]);
  const overlayY = useTransform(scrollYProgress, OVERLAY_FADE_RANGE, [0, -24]);
  const cardScale = useTransform(scrollYProgress, BREAKOUT_RANGE, [metrics.restScale, 1]);
  const radius = useTransform(scrollYProgress, BREAKOUT_RANGE, [metrics.radiusPx, 0]);

  if (reduceMotion) {
    return (
      <div className="relative w-full" style={{ aspectRatio }}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ transform: `scale(${metrics.restScale})`, borderRadius: metrics.radiusPx }}
        >
          <img src={backgroundSrc} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <img src={cutoutSrc} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        {overlay && <div className="absolute inset-0 flex flex-col items-center justify-center">{overlay}</div>}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative w-full" style={{ aspectRatio }}>
      {/* The photo card itself -- scale/radius animate here. `overlay`
          deliberately lives OUTSIDE this div (see below) rather than
          nested inside it: Figma has the Hero's text as an independent
          layer centered over the whole hero frame, not clipped to or
          scaled with the narrower photo card, and nesting it in here
          would let this div's `overflow-hidden` clip a wide title/badge
          row at the card's (narrower, at-rest) edges. In practice the
          overlay has already faded to opacity 0 (see OVERLAY_FADE_RANGE)
          well before this card starts scaling, so the two never visibly
          interact -- this split just keeps that true structurally too. */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ scale: cardScale, borderRadius: radius }}
      >
        <motion.img
          src={backgroundSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.img
          src={cutoutSrc}
          alt={alt}
          style={{ x: cutoutX }}
          className="absolute inset-0 h-full w-full object-cover drop-shadow-[0_24px_40px_rgba(0,0,0,0.18)]"
        />
      </motion.div>
      {overlay && (
        <motion.div
          style={{ opacity: overlayOpacity, y: overlayY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <div className="pointer-events-auto flex flex-col items-center">{overlay}</div>
        </motion.div>
      )}
    </div>
  );
}
