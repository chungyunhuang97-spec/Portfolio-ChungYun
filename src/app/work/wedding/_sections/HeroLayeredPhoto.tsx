"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * Direction C from Joe's layered-hero-photo proposal: the flat photo split
 * into three stacked layers -- background plate, star/doodle overlay,
 * person cutout -- composited back together with scroll parallax (every
 * device) plus a subtle pointer-tilt "diorama" effect on desktop
 * (progressive enhancement, on top of the scroll baseline).
 *
 * Only two depth planes move independently, not three: background and
 * cutout always share the exact same transform. They're pixel-registered
 * halves of one source photo (same canvas, same couple-shaped cutout), so
 * giving them different parallax depths -- the first version of this
 * component did, background drifting least and cutout drifting most --
 * visibly tears the couple away from their own position on the crosswalk
 * except at the one instant both their offsets happen to be zero. That's
 * the "doesn't line up" Joe flagged from a mobile screenshot: it wasn't a
 * device issue, the two layers were just genuinely at different offsets
 * whenever scrollYProgress wasn't exactly 1 (e.g. still scrolling the
 * photo into view) or the pointer wasn't dead-centered. Only the star
 * overlay -- decorative, not tied to any specific pixel of the scene --
 * gets its own independent drift, further and faster than the photo
 * plane, so it still reads as a separate depth floating in front. The
 * cutout keeps a drop-shadow so it still visually lifts off the
 * background even while perfectly registered to it.
 *
 * All three also share one "zoom out" scale (1.15 -> 1) as the section
 * scrolls into view, carrying over HeroPhotoReveal's established reveal
 * choreography -- scaling from the same center keeps background and
 * cutout registered at every point of that animation too.
 *
 * Falls back cleanly: reduced motion freezes every transform (static
 * stack, no scroll or pointer movement); touch/coarse pointers just never
 * get the hover tilt (scroll parallax still applies).
 */

const SCROLL_DEPTH = { photo: 20, stars: 60 };
const POINTER_DEPTH = { photo: 5, stars: 16 };

interface HeroLayeredPhotoProps {
  backgroundSrc: string;
  starsSrc: string;
  cutoutSrc: string;
  alt: string;
  aspectRatio?: string;
}

export function HeroLayeredPhoto({
  backgroundSrc,
  starsSrc,
  cutoutSrc,
  alt,
  aspectRatio = "97 / 50",
}: HeroLayeredPhotoProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "start 35%"] });
  const sharedScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const photoScrollY = useTransform(scrollYProgress, [0, 1], [SCROLL_DEPTH.photo, 0]);
  const starsScrollY = useTransform(scrollYProgress, [0, 1], [SCROLL_DEPTH.stars, 0]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.4 });

  const [pointerEnabled, setPointerEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  useEffect(() => {
    if (reduceMotion) return;
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = () => setPointerEnabled(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [reduceMotion]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointerEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  if (reduceMotion) {
    return (
      <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
        <motion.img src={backgroundSrc} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <motion.img src={starsSrc} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <motion.img src={cutoutSrc} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio }}
    >
      {/* Background + cutout share photoScrollY/POINTER_DEPTH.photo exactly
          -- see the component doc comment above for why these two must
          never drift apart. */}
      <Layer
        src={backgroundSrc}
        alt=""
        sharedScale={sharedScale}
        scrollY={photoScrollY}
        pointerX={springX}
        pointerY={springY}
        pointerDepth={POINTER_DEPTH.photo}
      />
      <Layer
        src={starsSrc}
        alt=""
        sharedScale={sharedScale}
        scrollY={starsScrollY}
        pointerX={springX}
        pointerY={springY}
        pointerDepth={POINTER_DEPTH.stars}
      />
      <Layer
        src={cutoutSrc}
        alt={alt}
        sharedScale={sharedScale}
        scrollY={photoScrollY}
        pointerX={springX}
        pointerY={springY}
        pointerDepth={POINTER_DEPTH.photo}
        className="drop-shadow-[0_24px_40px_rgba(0,0,0,0.18)]"
      />
    </div>
  );
}

function Layer({
  src,
  alt,
  sharedScale,
  scrollY,
  pointerX,
  pointerY,
  pointerDepth,
  className = "",
}: {
  src: string;
  alt: string;
  sharedScale: MotionValue<number>;
  scrollY: MotionValue<number>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  pointerDepth: number;
  className?: string;
}) {
  const x = useTransform(pointerX, (v) => v * pointerDepth);
  const y = useTransform([scrollY, pointerY], ([sy, py]: number[]) => sy + py * pointerDepth);

  return (
    <motion.img
      src={src}
      alt={alt}
      aria-hidden={alt === "" || undefined}
      style={{ scale: sharedScale, x, y }}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
