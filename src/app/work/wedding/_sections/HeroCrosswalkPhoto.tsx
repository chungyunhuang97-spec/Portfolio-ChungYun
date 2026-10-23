"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Replaces the old three-layer parallax HeroLayeredPhoto with the new
 * crosswalk choreography Joe asked for from the Figma hero redesign: the
 * couple (the "cutout" layer) walk themselves off screen to the left as
 * the visitor scrolls, as if finishing crossing the street -- then, once
 * they're gone, the photo card's corners square off and it zooms in,
 * visually reading as "breaking out" of its own inset proportions toward
 * full-bleed as it "extends" into the next section. Desktop overlays the
 * Hero's own title/tagline/stats/badges directly over the photo (`overlay`
 * prop); mobile gets the same walk-off + zoom sequence (Joe's own ask --
 * it isn't desktop-only), just with no overlay, since mobile's title/
 * tagline live in normal flow above the photo instead (see Hero.tsx).
 *
 * Sizing (this is the part that took a few rounds to get right -- see the
 * git history on this file for the wrong turns): desktop's card keeps
 * Figma's own inset proportions at rest -- 71.56% width (1082 of 1512px)
 * with its OWN `aspect-ratio: 1082/559` deciding the height, not a
 * fraction of the viewport's height. A fixed viewport-height fraction
 * (tried first) ties height to the wrong dimension and, combined with a
 * uniform `scale()` down from a differently-shaped outer box (tried
 * second), can't reproduce Figma's actual numbers -- a card's own WIDTH
 * ratio and HEIGHT ratio relative to the canvas only coincide when the
 * canvas itself happens to share the card's aspect ratio, which Figma's
 * 1512×1024 canvas doesn't (1.477 vs the card's own 1.936). Letting the
 * card's own `aspect-ratio` decide its height from that 71.56%-of-section
 * width reproduces Figma's numbers exactly, at any viewport size. Mobile
 * keeps its own fixed-viewport-height sizing (its Figma frame crops an
 * oversized photo by a fixed screen-height fraction instead, a genuinely
 * different mechanism -- see MOBILE_HEIGHT_SVH below).
 *
 * The *section* still needs to read as "one screen" even though the card
 * itself doesn't fill it -- that's Hero.tsx's job (`min-h-[100svh]`), not
 * this component's; this component's own root stretches to fill
 * whatever vertical space that leaves it (`md:flex-1`) so the overlay
 * (centered over this component's own full box, not just the card) and
 * the card (centered within that same box) both read against the full
 * section height the way Figma's "Hero Content" and "Cover Photo" layers
 * -- two independent siblings, both centered in the same 1512×1024 frame
 * -- actually relate to each other.
 *
 * Mechanism: a single scroll-through pass across this component's own
 * wrapper (`offset: ["start start", "end start"]` -- progress 0 once it's
 * "arrived" at the top of the viewport, progress 1 once it's fully
 * scrolled past), carrying three sub-ranges of that one progress value:
 *   0.00–0.40  cutout translateX 0% -> -130% (the walk-off)
 *   0.15–0.38  overlay text fades out (so it doesn't float oddly over a
 *              zooming-in photo)
 *   0.45–0.95  the card's corner radius relaxes to 0 while it scales up
 *              from its own center -- desktop scales enough to visually
 *              approach full width (1 -> 1512/1082), mobile (already
 *              full width) just gets a modest extra zoom (1 -> 1.06).
 * Before progress 0 (while still scrolling toward the hero) nothing
 * animates -- the photo is simply the static, fully-composed crosswalk
 * shot, same as any other hero image, and only starts its sequence once
 * the visitor keeps scrolling past it.
 */

const CUTOUT_RANGE: [number, number] = [0, 0.4];
const OVERLAY_FADE_RANGE: [number, number] = [0.15, 0.38];
const BREAKOUT_RANGE: [number, number] = [0.45, 0.95];

// Figma's desktop card: 1082px wide inside a 1512px-wide canvas (71.56%,
// baked directly into CARD_CLASS below), its own 1082/559 aspect ratio
// deciding the height -- see component doc comment for why this (not a
// viewport-height fraction) is what actually reproduces Figma's numbers.
const DESKTOP_RADIUS_PX = 20;
// Scales the card back up toward (1512/1082 ≈ 1.40) the full section
// width on breakout -- the inverse of its own rest-width ratio, so it
// visually approaches full-bleed via a transform rather than an actual
// width/layout animation.
const DESKTOP_BREAKOUT_SCALE = 1512 / 1082;

// Mobile's Figma frame ("mb-EVA 婚禮") sizes its Cover Photo by a fixed
// height (403.164px) inside an 844px-tall hero screen, with the photo
// itself wider than the viewport and cropped by the frame's own overflow
// -- a different mechanism than desktop's inset card, so mobile keeps its
// own height-fraction sizing (47.77%, baked directly into CARD_CLASS
// below) rather than sharing desktop's aspect-ratio approach.
// Full-bleed, square corners on mobile -- Joe's explicit ask ("手機版的
// 部分請不要有圓角，讓它90度滿版就好"), overriding Figma's own 14.42px
// mobile card radius.
const MOBILE_RADIUS_PX = 0;
const MOBILE_BREAKOUT_SCALE = 1.06;

// A full-bleed-width, fixed-vh-height box (mobile) is inevitably wider
// than the photo's own ~1.94 natural aspect on most phones in landscape,
// and on desktop the breakout phase deliberately scales past the card's
// own aspect-correct bounds -- `object-cover` crops some width in both
// cases. The couple sit right-of-center in the source composition (see
// the Figma reference), so the crop is biased the same way via
// `object-position` instead of centering it -- losing empty asphalt off
// the left edge first, rather than risking the couple clipping off the
// right edge.
const PHOTO_OBJECT_POSITION = "70% center";

// Static Tailwind classes (not a JS-computed inline style switched on an
// `isDesktop` media-query check) -- width/height/aspect-ratio are real CSS
// media queries here, resolved by the browser at first paint same as any
// other responsive layout, not dependent on a client-only `useEffect`
// running after hydration. An earlier version read `matchMedia` into
// state and applied the two shapes via inline `style`; since that state's
// initial render (both on the server, which has no `window`, and
// apparently in practice on some clients too) defaulted to the mobile
// shape, a direct page load could render -- and stay stuck showing --
// the mobile (full-bleed, height-only) sizing on a desktop viewport until
// something forced a resize/matchMedia re-evaluation (e.g. toggling
// devtools' device toolbar). `radiusPx`/`breakoutScale` below still come
// from that same `isDesktop` state, but only affect the scroll-driven
// breakout animation much further down the page, not what's on screen at
// first paint, so that part is safe to leave JS-driven.
const CARD_CLASS = "relative w-full overflow-hidden h-[47.7682svh] md:h-auto md:w-[71.5608%] md:aspect-[1082/559]";

interface HeroCrosswalkPhotoProps {
  backgroundSrc: string;
  cutoutSrc: string;
  alt: string;
  /** Desktop-only text overlaid over this component's own full box -- see component doc comment. */
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

  const radiusPx = isDesktop ? DESKTOP_RADIUS_PX : MOBILE_RADIUS_PX;
  const breakoutScale = isDesktop ? DESKTOP_BREAKOUT_SCALE : MOBILE_BREAKOUT_SCALE;

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });

  const cutoutX = useTransform(scrollYProgress, CUTOUT_RANGE, ["0%", "-130%"]);
  const overlayOpacity = useTransform(scrollYProgress, OVERLAY_FADE_RANGE, [1, 0]);
  const overlayY = useTransform(scrollYProgress, OVERLAY_FADE_RANGE, [0, -24]);
  const cardScale = useTransform(scrollYProgress, BREAKOUT_RANGE, [1, breakoutScale]);
  const radius = useTransform(scrollYProgress, BREAKOUT_RANGE, [radiusPx, 0]);

  if (reduceMotion) {
    return (
      <div ref={wrapRef} className="relative flex w-full items-center justify-center md:flex-1">
        <div className={CARD_CLASS} style={{ borderRadius: radiusPx }}>
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
        {overlay && (
          <div className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center md:flex">
            <div className="pointer-events-auto flex flex-col items-center">{overlay}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative flex w-full items-center justify-center md:flex-1">
      <motion.div className={CARD_CLASS} style={{ scale: cardScale, borderRadius: radius }}>
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
          className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-center md:flex"
        >
          <div className="pointer-events-auto flex flex-col items-center">{overlay}</div>
        </motion.div>
      )}
    </div>
  );
}
