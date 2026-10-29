"use client";

import { useRef, useState, type MouseEvent } from "react";
import {
  animate,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Play } from "@phosphor-icons/react/dist/ssr";
import { MouseTilt } from "@/components/design-system/MouseTilt";

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

const cardIn = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 20, delay: 0.3 },
  },
};

/**
 * Opener for the dedicated /video page. Deliberately does NOT depend on a
 * single photo filling the whole screen (a 404'd YouTube thumbnail used to
 * leave the entire hero solid black) -- the ground is a flat, brand-derived
 * dark field, and the real footage lives in a framed "monitor" card instead:
 * if its image fails, only the small card shows a placeholder, not the
 * whole hero. The card tilts gently toward the cursor (desktop only), the
 * page-long progress rail doubles as a nod to an editing timeline, and the
 * whole composition eases up and fades as the visitor scrolls past it.
 */
export function VideoHero({
  imageUrl,
  imageFallbackUrl,
  imageAlt,
  headline,
  subhead,
}: {
  imageUrl: string | null;
  imageFallbackUrl?: string | null;
  imageAlt: string;
  headline: string;
  subhead: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [usedFallback, setUsedFallback] = useState(false);

  function handleImageError() {
    if (!usedFallback && imageFallbackUrl && imageFallbackUrl !== currentImageUrl) {
      setUsedFallback(true);
      setCurrentImageUrl(imageFallbackUrl);
    }
  }

  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0.3]);
  const exitY = useTransform(exitProgress, [0, 1], [0, -48]);

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
      className="relative flex min-h-dvh items-center overflow-hidden"
      style={{
        background: "color-mix(in srgb, var(--color-accent) 32%, var(--color-ink) 68%)",
      }}
    >
      {/* Page-long progress rail -- a thin "timeline" accent that advances
          with the whole document's scroll, not just this section's. */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
        style={{ scaleX: reducedMotion ? 0 : pageProgress }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-14 px-6 py-28 md:flex-row md:items-center md:gap-16 md:px-10"
        style={reducedMotion ? undefined : { opacity: exitOpacity, y: exitY }}
      >
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="md:w-[52%]"
        >
          <motion.h1
            variants={headlineIn}
            className="max-w-[18ch] text-4xl leading-[1.05] tracking-tight text-bg md:text-6xl"
          >
            {headline}
          </motion.h1>
          <motion.p
            variants={riseIn}
            className="mt-6 max-w-[48ch] text-base leading-relaxed text-bg/75 md:text-lg"
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

        <motion.div
          variants={cardIn}
          initial="hidden"
          animate="show"
          className="w-full md:w-[42%] md:shrink-0"
        >
          <MouseTilt maxTiltDeg={6}>
            <a
              href="#featured"
              onClick={handleWatchClick}
              className="group block"
              aria-label="觀看作品"
            >
              <div className="rounded-[4px] border border-bg/15 bg-bg/5 p-2.5 md:p-3">
                <div className="relative aspect-video w-full overflow-hidden bg-ink">
                  {currentImageUrl ? (
                    <motion.img
                      src={currentImageUrl}
                      alt={imageAlt}
                      onError={handleImageError}
                      className="h-full w-full object-cover"
                      initial={{ scale: 1.02 }}
                      animate={
                        reducedMotion ? undefined : { scale: [1.02, 1.12, 1.02] }
                      }
                      transition={
                        reducedMotion
                          ? undefined
                          : { duration: 22, repeat: Infinity, ease: "easeInOut" }
                      }
                    />
                  ) : (
                    <div className="h-full w-full bg-bg/10" aria-hidden />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/20">
                    <span className="flex size-14 items-center justify-center rounded-full bg-bg/90 text-ink opacity-90 transition-transform duration-200 group-hover:scale-110">
                      <Play size={22} weight="fill" className="ml-0.5" />
                    </span>
                  </span>
                </div>
              </div>
            </a>
          </MouseTilt>
        </motion.div>
      </motion.div>
    </section>
  );
}
