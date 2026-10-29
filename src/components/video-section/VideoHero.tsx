"use client";

import { useRef, type MouseEvent } from "react";
import {
  animate,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Play } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const textContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const riseIn = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const headlineIn = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 140, damping: 18 },
  },
};

/**
 * Full-bleed cinematic opener for the dedicated /video page — the real
 * thumbnail of the first featured work stands in as the hero image (this
 * is actual footage of hers, not a stock photo). A slow, continuous
 * Ken Burns drift keeps it from reading as a static poster (an idle
 * "standby frame" before playback), a page-long progress rail doubles as
 * a nod to an editing timeline, and the whole hero pulls back and fades
 * as the visitor scrolls past it into the work itself.
 */
export function VideoHero({
  imageUrl,
  imageAlt,
  headline,
  subhead,
}: {
  imageUrl: string | null;
  imageAlt: string;
  headline: string;
  subhead: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0.35]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.94]);

  function handleWatchClick(e: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("featured");
    if (!target) return;
    e.preventDefault();
    if (reducedMotion) {
      target.scrollIntoView();
      return;
    }
    const destinationY = target.getBoundingClientRect().top + window.scrollY;
    animate(window.scrollY, destinationY, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => window.scrollTo(0, v),
    });
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[92svh] items-end overflow-hidden bg-ink"
    >
      {/* Page-long progress rail -- a thin "timeline" accent that advances
          with the whole document's scroll, not just this section's. */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
        style={{ scaleX: reducedMotion ? 0 : pageProgress }}
        aria-hidden
      />

      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? undefined : { opacity: exitOpacity, scale: exitScale }}
      >
        {imageUrl ? (
          <div className="absolute inset-0 overflow-hidden">
            <motion.img
              src={imageUrl}
              alt={imageAlt}
              className="h-full w-full object-cover"
              initial={{ scale: 1.02 }}
              animate={
                reducedMotion
                  ? undefined
                  : { scale: [1.02, 1.1, 1.02], x: [0, -14, 0], y: [0, 10, 0] }
              }
              transition={
                reducedMotion
                  ? undefined
                  : { duration: 26, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </div>
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(17,17,16,0.15) 0%, rgba(17,17,16,0.35) 55%, rgba(17,17,16,0.88) 100%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] items-end px-6 pb-16 md:px-10 md:pb-24">
          <motion.div variants={textContainer} initial="hidden" animate="show">
            <motion.h1
              variants={headlineIn}
              className="max-w-[18ch] text-4xl leading-[1.05] tracking-tight text-bg md:text-6xl"
            >
              {headline}
            </motion.h1>
            <motion.p
              variants={riseIn}
              className="mt-6 max-w-[52ch] text-base leading-relaxed text-bg/80 md:text-lg"
            >
              {subhead}
            </motion.p>
            <motion.a
              variants={riseIn}
              href="#featured"
              onClick={handleWatchClick}
              className="group mt-9 inline-flex items-center gap-3"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg/90 text-ink transition-transform duration-200 group-hover:scale-110">
                <Play size={18} weight="fill" className="ml-0.5" />
              </span>
              <span className="text-sm tracking-wide text-bg">觀看作品</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
