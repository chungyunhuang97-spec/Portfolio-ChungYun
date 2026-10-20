"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { YangbeiPlatform as Platform } from "../types";

/**
 * Decorative character illustration per platform, keyed by `platform.id`
 * (same ids Hero.tsx and DESKTOP_PLATFORM_IDS already rely on: "frontend",
 * "instructor", "admin"). Purely visual — a platform with an id outside this
 * map (or none at all) just renders without one, so this never blocks new
 * CMS content from showing up.
 */
const ILLUSTRATIONS: Record<string, string> = {
  frontend: "/case-studies/yangbei/illustration-frontend.png",
  instructor: "/case-studies/yangbei/illustration-instructor.png",
  admin: "/case-studies/yangbei/illustration-admin.png",
};

/**
 * Small continuous bob + tilt on each platform's illustration so the row
 * doesn't read as three static stickers pasted onto the cards. Kept subtle
 * (6px, 11s) since it sits right next to body copy people are meant to
 * actually read. Disabled under prefers-reduced-motion.
 */
function FloatingIllustration({ src, flip }: { src: string; flip: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="pointer-events-none absolute -top-9 right-2 z-10 size-20 select-none md:-top-12 md:-right-6 md:size-28"
      style={{ scaleX: flip ? -1 : 1 }}
      animate={reduceMotion ? {} : { y: [0, -8, 0], rotate: flip ? [2, -2, 2] : [-2, 2, -2] }}
      transition={reduceMotion ? undefined : { duration: 11, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <Image src={src} alt="" fill sizes="112px" className="object-contain drop-shadow-sm" />
    </motion.div>
  );
}

/**
 * Connecting stem between two stacked cards — a short diagonal line that
 * leans toward whichever side the next card is offset to, so the zigzag
 * reads as one continuous path (前台→中台→後台) rather than three unrelated
 * cards. Vertical (no lean) on mobile, where cards stack full-width.
 */
function StepConnector({ leanRight }: { leanRight: boolean }) {
  return (
    <div className={`flex h-12 md:h-16 ${leanRight ? "justify-start md:pl-16" : "justify-end md:pr-16"} px-6`}>
      <div
        className="h-full w-px origin-top bg-gradient-to-b from-primary-orange/35 to-primary-orange/5 md:origin-top"
        style={{ transform: `rotate(${leanRight ? 14 : -14}deg)` }}
      />
    </div>
  );
}

function PlatformCard({ platform, align }: { platform: Platform; align: "left" | "right" }) {
  const illustration = ILLUSTRATIONS[platform.id];

  return (
    <SlideIn direction={align === "left" ? "left" : "right"} viewportMargin="-100px">
      <div className={`relative md:w-[78%] ${align === "left" ? "md:mr-auto" : "md:ml-auto"}`}>
        {illustration && <FloatingIllustration src={illustration} flip={align === "right"} />}

        <div
          className="flex flex-col gap-4 rounded-2xl border border-grey-100 bg-grey-50 p-6 md:p-7"
          style={{ borderTopColor: platform.color, borderTopWidth: 3 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="font-nunito text-[20px] font-bold leading-none"
              style={{ color: platform.color }}
            >
              {platform.name}
            </span>
            <span className="font-nunito rounded-full border border-grey-300 px-2.5 py-0.5 text-[11px] text-grey-600">
              {platform.label}
            </span>
          </div>

          {/* Auth badge */}
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="6" stroke="#b3b3b3" strokeWidth="1.2" />
              <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="#808080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-nunito text-[12px] text-grey-500">
              {platform.auth}
            </span>
          </div>

          {/* Desc */}
          <p className="font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px] md:leading-[22px]">
            {platform.desc}
          </p>

          {/* Features */}
          <ul className="flex flex-col gap-2 border-t border-grey-100 pt-4">
            {platform.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2">
                <span
                  className="size-[5px] shrink-0 rounded-full"
                  style={{ backgroundColor: platform.color }}
                  aria-hidden
                />
                <span className="font-nunito text-[12px] text-grey-600 md:text-[13px]">
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideIn>
  );
}

/**
 * 一套系統，三種角色 — architecture overview.
 * Shows the 3-layer platform (前台/中台/後台) as a scroll-triggered,
 * zig-zagging stack of cards — each platform reveals on its own as it
 * scrolls into view (rather than the whole row animating in together),
 * connected by a diagonal "step" line and topped with its own floating
 * character illustration.
 * Content from `process.architectureTitle`, `process.architectureSubtitle`, `process.platforms`.
 */
export function ThreeLayerArchitecture({ process }: { process: Record<string, unknown> }) {
  const title = (process.architectureTitle as string) || "一套系統，三種角色";
  const subtitle = (process.architectureSubtitle as string) || "";
  const platforms = Array.isArray(process.platforms)
    ? (process.platforms as Platform[])
    : [];

  if (platforms.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            System Architecture
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      {/* Zig-zag stack: each card offset to alternating sides on desktop
          (前台 left, 中台 right, 後台 left…), full-width stacked on mobile. */}
      <div className="flex flex-col">
        {platforms.map((platform, i) => (
          <div key={platform.id} className="contents">
            {i > 0 && <StepConnector leanRight={i % 2 === 1} />}
            <PlatformCard platform={platform} align={i % 2 === 0 ? "left" : "right"} />
          </div>
        ))}
      </div>
    </section>
  );
}
