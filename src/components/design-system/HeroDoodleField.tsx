"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode, RefObject } from "react";
import {
  DoodleArrow,
  DoodleEye,
  DoodleFlower,
  DoodleGrid,
  DoodleScribble,
  DoodleSpiral,
  DoodleSplat,
  DoodleStar,
} from "./doodles";

/**
 * The scribble-collage doodle cluster behind the homepage hero name.
 *
 * Two things layer on top of each other, matching the brief ("整體 SVG
 * 滾動視差" + "背後的動態結合塗鴉感"):
 * - Scroll parallax: "far" pieces (grid, splat, spiral) drift less than
 *   "near" pieces (stars, flower, arrow, scribble) as the hero scrolls
 *   past, driven by this section's own scroll progress.
 * - Idle wobble: every piece also gets a slow, staggered rotate/float
 *   loop so the whole cluster feels hand-drawn and alive even at rest,
 *   not just reactive to scroll.
 *
 * Both are skipped under `prefers-reduced-motion` (the `reducedMotion`
 * prop) -- pieces render fully static in that case.
 */

function Piece({
  children,
  depth,
  scrollYProgress,
  reducedMotion,
  idleDuration,
  idleRotate = 6,
  idleY = 6,
  className,
}: {
  children: ReactNode;
  depth: number;
  scrollYProgress: MotionValue<number>;
  reducedMotion: boolean;
  idleDuration: number;
  idleRotate?: number;
  idleY?: number;
  className?: string;
}) {
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, depth]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} style={{ y: parallaxY }}>
      <motion.div
        animate={{
          rotate: [-idleRotate, idleRotate, -idleRotate],
          y: [0, -idleY, 0],
        }}
        transition={{
          duration: idleDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroDoodleField({
  sectionRef,
  reducedMotion,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-50 md:opacity-100"
    >
      {/* far layer -- larger, slower */}
      <Piece
        depth={70}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={9}
        idleRotate={3}
        idleY={4}
        className="absolute right-[6%] top-[6%] w-[46%] max-w-[420px] text-cream/25 md:right-[8%]"
      >
        <DoodleGrid className="h-auto w-full" strokeWidth={1.5} />
      </Piece>

      <Piece
        depth={110}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={7}
        idleRotate={4}
        idleY={8}
        className="absolute left-[46%] top-[38%] w-[30%] max-w-[300px] text-secondary-blue md:left-[42%]"
      >
        <DoodleSplat className="h-auto w-full drop-shadow-[0_8px_20px_rgba(13,33,255,0.25)]" />
      </Piece>

      <Piece
        depth={50}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={10}
        idleRotate={5}
        idleY={5}
        className="absolute right-[2%] bottom-[8%] w-[22%] max-w-[220px] text-cream/70"
      >
        <DoodleSpiral className="h-auto w-full" strokeWidth={2.5} />
      </Piece>

      {/* near layer -- smaller, faster, sits above the far layer */}
      <Piece
        depth={160}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={5}
        idleRotate={12}
        idleY={10}
        className="absolute left-[38%] top-[10%] w-[9%] max-w-[64px] text-secondary-blue"
      >
        <DoodleStar className="h-auto w-full" />
      </Piece>

      <Piece
        depth={190}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={6.5}
        idleRotate={10}
        idleY={12}
        className="absolute right-[28%] top-[2%] w-[7%] max-w-[52px] text-cream"
      >
        <DoodleFlower className="h-auto w-full" />
      </Piece>

      <Piece
        depth={140}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={6}
        idleRotate={8}
        idleY={9}
        className="absolute left-[58%] bottom-[26%] w-[16%] max-w-[130px] text-secondary-blue"
      >
        <DoodleScribble className="h-auto w-full" strokeWidth={3} />
      </Piece>

      <Piece
        depth={175}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={7.5}
        idleRotate={6}
        idleY={7}
        className="absolute right-[12%] bottom-[30%] w-[9%] max-w-[70px] text-cream"
      >
        <DoodleArrow className="h-auto w-full" />
      </Piece>

      <Piece
        depth={130}
        scrollYProgress={scrollYProgress}
        reducedMotion={reducedMotion}
        idleDuration={8}
        idleRotate={5}
        idleY={6}
        className="absolute left-[70%] top-[62%] w-[13%] max-w-[110px] text-cream/80"
      >
        <DoodleEye className="h-auto w-full" />
      </Piece>
    </div>
  );
}
