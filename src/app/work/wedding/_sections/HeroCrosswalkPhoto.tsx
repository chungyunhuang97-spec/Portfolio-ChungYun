"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Replaces the old three-layer parallax HeroLayeredPhoto with the new
 * crosswalk choreography Joe asked for from the Figma hero redesign: the
 * couple (the "cutout" layer) walk themselves off screen to the left as
 * the visitor scrolls, as if finishing crossing the street -- then, once
 * they're gone, the photo card's corners square off and it zooms in
 * slightly, "extending" toward the next section. Desktop overlays the
 * Hero's own title/tagline/stats/badges directly on the photo (`overlay`
 * prop); mobile gets the same walk-off + zoom sequence (Joe's own ask --
 * it isn't desktop-only), just with no overlay, since mobile's title/
 * tagline live in normal flow above the photo instead (see Hero.tsx,
 * which keeps genuinely separate desktop/mobile trees rather than forcing
 * one shared tree through breakpoints -- same precedent DesignThread.tsx's
 * table/cards split already set on this page).
 *
 * The card fills its own box (full width, viewport-height-fraction tall --
 * see DESKTOP_HEIGHT_SVH/MOBILE_HEIGHT_SVH below) from the very first
 * frame, at `scale: 1` -- an earlier version instead started the card
 * scaled DOWN to Figma's literal inset-card proportions (e.g. desktop's
 * 1082px-wide card inside a 1512px canvas, ~0.716 scale) and grew it to 1
 * only once the visitor scrolled into the breakout range. Once the box
 * itself was sized by viewport height (not the photo's own aspect ratio --
 * see that doc comment below), scaling THAT box down by ~0.72 just left
 * four visible margins around a narrow-looking photo at rest, which is
 * what Joe flagged from a screenshot -- there's no scale value that
 * reproduces Figma's literal inset-card proportions once the box itself
 * is a different shape than Figma's own 1082×559 canvas. Filling the box
 * at rest keeps the hero reading as "one full photo" immediately, with
 * the breakout's own modest extra zoom (1 -> ~1.06) still giving the
 * "放大"/enlarge sensation Joe described, now carried mainly by the
 * corner radius relaxing to 0 (square, full-bleed) rather than a large
 * scale jump.
 *
 * Mechanism: a single scroll-through pass across the photo's own wrapper
 * (`offset: ["start start", "end start"]` -- progress 0 once the photo has
 * "arrived" at the top of the viewport, progress 1 once it's fully
 * scrolled past), carrying three sub-ranges of that one progress value:
 *   0.00–0.40  cutout translateX 0% -> -130% (the walk-off)
 *   0.15–0.38  overlay text fades out (so it doesn't float oddly over a
 *              zooming-in photo)
 *   0.45–0.95  the card's corner radius relaxes to 0 while it zooms in
 *              slightly (scale 1 -> ~1.06) from its own center.
 * Before progress 0 (while still scrolling toward the hero) nothing
 * animates -- the photo is simply the static, fully-composed crosswalk
 * shot, same as any other hero image, and only starts its sequence once
 * the visitor keeps scrolling past it.
 */

const CUTOUT_RANGE: [number, number] = [0, 0.4];
const OVERLAY_FADE_RANGE: [number, number] = [0.15, 0.38];
const BREAKOUT_RANGE: [number, number] = [0.45, 0.95];

interface Metrics {
  /** The card's scale once the breakout completes (modest zoom-in, not a full-bleed-from-inset jump -- see component doc comment). */
  breakoutScale: number;
  /** Corner radius of the card at rest, in px (animates to 0 on breakout). */
  radiusPx: number;
}

const DESKTOP_METRICS: Metrics = { breakoutScale: 1.06, radiusPx: 20 };
const MOBILE_METRICS: Metrics = { breakoutScale: 1.06, radiusPx: 14 };

// Both Figma frames are literally named/sized as one full screen -- desktop
// "Hero / 100vh · 1024" (photo 559px inside a 1024px-tall frame) and mobile
// "mb-EVA 婚禮" (photo 403.164px inside an 844px-tall frame). An
// `aspectRatio`-derived height (this component's first version, desktop
// only) ties the photo's height to the viewport's WIDTH, which produced a
// noticeably-short-of-100vh hero on normal desktop windows (width/1.94 is
// nowhere near a typical viewport's height) and let the overlay's
// title/tagline/stats/badges overflow past the photo's own box since there
// wasn't enough room for them. Sizing both breakpoints by their own
// fraction of the viewport's HEIGHT instead -- same technique for both,
// just different fractions -- ties the photo to the dimension that
// actually determines whether the hero reads as "one screen" and gives the
// overlay the vertical room the Figma frame's own proportions intended.
const DESKTOP_HEIGHT_SVH = (559 / 1024) * 100;
const MOBILE_HEIGHT_SVH = (403.164 / 844) * 100;

// A full-bleed-width, fixed-vh-height box is inevitably WIDER than the
// photo's own ~1.94 natural aspect on typical desktop screens (e.g.
// 1920×1080 at 54.6svh tall works out to roughly a 3.25:1 box) -- there's
// no height formula that satisfies "100vh hero" and "no extra horizontal
// crop" at once once the viewport is wider than the photo is tall enough
// for, so `object-cover` is going to trim some width on most screens
// regardless. The couple sit right-of-center in the source composition
// (see the Figma reference), so the crop is biased the same way via
// `object-position` instead of centering it -- losing some empty asphalt
// off the left edge first, rather than risking the couple themselves
// clipping off the right edge on a wide crop.
const PHOTO_OBJECT_POSITION = "70% center";

interface HeroCrosswalkPhotoProps {
  backgroundSrc: string;
  cutoutSrc: string;
  alt: string;
  /** Desktop-only text overlaid on the photo -- see component doc comment. */
  overlay?: ReactNode;
}

export function HeroCrosswalkPhoto({ backgroundSrc, cutoutSrc, alt, overlay }: HeroCrosswalkPhotoProps) {
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
  const heightSvh = isDesktop ? DESKTOP_HEIGHT_SVH : MOBILE_HEIGHT_SVH;
  const wrapperStyle = { height: `${heightSvh}svh` };

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });

  const cutoutX = useTransform(scrollYProgress, CUTOUT_RANGE, ["0%", "-130%"]);
  const overlayOpacity = useTransform(scrollYProgress, OVERLAY_FADE_RANGE, [1, 0]);
  const overlayY = useTransform(scrollYProgress, OVERLAY_FADE_RANGE, [0, -24]);
  const cardScale = useTransform(scrollYProgress, BREAKOUT_RANGE, [1, metrics.breakoutScale]);
  const radius = useTransform(scrollYProgress, BREAKOUT_RANGE, [metrics.radiusPx, 0]);

  if (reduceMotion) {
    return (
      <div className="relative w-full" style={wrapperStyle}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: metrics.radiusPx }}
        >
          <img
            src={backgroundSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: PHOTO_OBJECT_POSITION }}
          />
          <img
            src={cutoutSrc}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: PHOTO_OBJECT_POSITION }}
          />
        </div>
        {overlay && <div className="absolute inset-0 flex flex-col items-center justify-center">{overlay}</div>}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative w-full" style={wrapperStyle}>
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
          style={{ objectPosition: PHOTO_OBJECT_POSITION }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.img
          src={cutoutSrc}
          alt={alt}
          style={{ x: cutoutX, objectPosition: PHOTO_OBJECT_POSITION }}
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
