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
 * person cutout -- composited back together with independent scroll
 * parallax (every device) plus a subtle pointer-tilt "diorama" effect on
 * desktop (progressive enhancement, on top of the scroll baseline).
 *
 * Depth order (back to front) = render order = parallax magnitude: the
 * background drifts least and sits still under pointer tilt, the star
 * layer drifts more, the cutout drifts most and gets a soft drop-shadow so
 * it visually lifts off the backdrop. All three also share one "zoom out"
 * scale (1.15 -> 1) as the section scrolls into view, carrying over
 * HeroPhotoReveal's established reveal choreography so the composite still
 * reads as one photo settling into place, not three unrelated images.
 *
 * Falls back cleanly: reduced motion freezes every transform (static
 * stack, no scroll or pointer movement); touch/coarse pointers just never
 * get the hover tilt (scroll parallax still applies).
 */

const SCROLL_DEPTH = { background: 18, stars: 55, cutout: 110 };
const POINTER_DEPTH = { background: 4, stars: 12, cutout: 24 };

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
  const bgScrollY = useTransform(scrollYProgress, [0, 1], [SCROLL_DEPTH.background, 0]);
  const starsScrollY = useTransform(scrollYProgress, [0, 1], [SCROLL_DEPTH.stars, 0]);
  const cutoutScrollY = useTransform(scrollYProgress, [0, 1], [SCROLL_DEPTH.cutout, 0]);

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
      <Layer
        src={backgroundSrc}
        alt=""
        sharedScale={sharedScale}
        scrollY={bgScrollY}
        pointerX={springX}
        pointerY={springY}
        pointerDepth={POINTER_DEPTH.background}
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
        scrollY={cutoutScrollY}
        pointerX={springX}
        pointerY={springY}
        pointerDepth={POINTER_DEPTH.cutout}
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
