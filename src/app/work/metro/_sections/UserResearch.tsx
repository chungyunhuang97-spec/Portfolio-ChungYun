"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, animate, useInView } from "framer-motion";
import { Users, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface UserResearchStat {
  /** Desktop-only colored pill label, e.g. "分類不清". Mobile drops this pill entirely (Figma 151:491 has no equivalent badge -- genuine per-breakpoint omission, not a missing-content gap). */
  label: string;
  /** The big percentage, e.g. "91.7%". Animated via CountUpValue below. */
  value: string;
  /** Desktop description. */
  desc: string;
  /** Mobile description -- falls back to `desc` when unset. Only stat #4 actually differs (shortened) in Figma; the other three are identical, so a plain fallback covers all cases without forcing duplicate copy. */
  mobileDesc?: string;
}

interface UserResearchInsight {
  title: string;
  desc: string;
  mobileDesc?: string;
}

/**
 * Fixed per-index presentational data -- not admin-editable, same convention
 * as IaRestructuring's `POINT_ICONS` (fixed illustration assignment by
 * index, not something Joe reorders via CMS).
 */
const STAT_COLORS = ["orange", "orange", "blue", "blue"] as const;

/**
 * The four "核心洞察" illustrations are Joe's own hand-picked sticker set
 * (uploaded this same turn as Rectangle_216/2161/2162/2163.png, matching
 * Figma's imgRectangle216-219 1:1 by content -- maze/confused figure,
 * handshake+heart stairs, split orange/blue repair figure, gift-toss
 * figure, in that exact order). Shipped as /public assets per the
 * established "one-time illustration set, not a CMS media field" rule.
 */
const INSIGHT_ILLUSTRATIONS = [
  "/work/metro/ur-icon-maze.png",
  "/work/metro/ur-icon-handshake.png",
  "/work/metro/ur-icon-toolguy.png",
  "/work/metro/ur-icon-gift.png",
];

/**
 * Desktop accent-border/title color per insight card (Figma 127:597):
 * 01 blue, 02 pink, 03 blue, 04 pink.
 *
 * Mobile (Figma 147:287) is NOT the same sequence -- card 01 is pink and
 * 02 is blue there, 03/04 match desktop. Confirmed by reading both nodes'
 * raw hex values directly, not assumed -- this reads as an inconsistency
 * in the source file rather than intentional, but the design-to-code rule
 * is to reproduce each breakpoint exactly as specced rather than silently
 * "fixing" it to look consistent, so both arrays are kept as literally
 * read off their respective nodes.
 */
const INSIGHT_DESKTOP_COLORS = ["blue", "pink", "blue", "pink"] as const;
const INSIGHT_MOBILE_COLORS = ["pink", "blue", "blue", "pink"] as const;

/**
 * Joe's exact "icon/toggle" star vector (Figma component instance
 * 151:519 / 151:523), pasted verbatim as an inline SVG path this turn --
 * used instead of a Phosphor lookalike because Joe handed over the precise
 * source markup, so reproducing it exactly beats approximating with a
 * generic star glyph. `fill="currentColor"` so size/color are controlled
 * the normal Tailwind way at each call site (24px desktop, 16px mobile).
 */
function StarIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 19) / 20}
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Counts up from 0 to the stat's target value once it scrolls into view --
 * this section is the first one whose Figma spec is basically "four big
 * numbers", so a data-reveal count-up reads as the fitting "科技感動態"
 * (tech-feel motion) for THIS section specifically, distinct from every
 * other section's signature motion (ScanReveal/PingDot/TechGlowBorder
 * etc.) rather than reusing one of those verbatim on content that isn't a
 * diagram or table.
 */
function CountUpValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const match = value.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = match ? match[2] : "";
  const [text, setText] = useState(match ? `0${suffix}` : value);

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setText(`${v.toFixed(decimals)}${suffix}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/**
 * One-time CRT-style scanline sweep on viewport entry -- same technique as
 * every other section's ScanReveal, duplicated here per the per-section-file
 * convention. Applied over the whole "核心洞察" panel so it reads as the
 * panel "powering on" once scrolled into view.
 */
function ScanReveal({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-proj-white/70 to-transparent"
      initial={{ y: "-100%", opacity: 1 }}
      whileInView={{ y: "120%", opacity: [1, 1, 0] }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay, ease: "easeIn" }}
    />
  );
}

/**
 * Looping left-to-right pulse on the connecting arrow between the first two
 * stat cards -- Figma places a plain static arrow-right there implying
 * "分類不清 causes 多層操作"; animating it as a gentle traveling pulse makes
 * that causal read explicit instead of decorative-only.
 */
function PulseArrow({ size }: { size: number }) {
  return (
    <motion.span
      aria-hidden
      className="inline-flex items-center justify-center text-primary-orange"
      animate={{ x: [0, 6, 0], opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <ArrowRight size={size} weight="bold" />
    </motion.span>
  );
}

function SectionEyebrow() {
  return (
    <div className="flex items-center gap-2">
      <Users size={18} weight="bold" className="text-primary-orange" />
      <span className="font-nunito text-[13px] font-extrabold text-primary-orange">User Research</span>
    </div>
  );
}

function MobileInsightCard({ insight, index }: { insight: UserResearchInsight; index: number }) {
  const colorClass = INSIGHT_MOBILE_COLORS[index] === "blue" ? "text-secondary-blue" : "text-accent-pink";
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-1 flex-col gap-1.5 rounded-xl border border-grey-50 bg-proj-white p-3 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]"
    >
      <span className={`font-nunito text-[14px] font-extrabold ${colorClass}`}>{String(index + 1).padStart(2, "0")}</span>
      <span className="font-nunito text-[14px] leading-[21px] font-bold text-primary-black">{insight.title}</span>
      <span className="font-nunito text-[13px] leading-[20px] font-normal text-grey-600">
        {insight.mobileDesc ?? insight.desc}
      </span>
    </motion.div>
  );
}

/**
 * 使用者研究與易用性測試 (User Research & Usability Testing), Figma desktop
 * node 127:597 / mobile node 147:287 -- both confirmed by name via
 * get_metadata before implementing (frame name "UserResearch" on both).
 *
 * Content model: reuses the `process` row (checked against every existing
 * top-level key first -- `userResearch*` prefix is clean, no collisions).
 * Fields: `userResearchIntro` (desktop intro paragraph), `userResearchMobileIntro`
 * (optional, falls back to `userResearchIntro` -- mobile's Figma copy is a
 * slightly trimmed version of the same sentence, not a different one),
 * `userResearchStats` (the 4 stat cards, each with `label`/`value`/`desc`/
 * optional `mobileDesc`), `userResearchInsights` (the 4 "核心洞察" cards,
 * each with `title`/`desc`/optional `mobileDesc`). Illustration images,
 * accent colors, and the causal arrow are fixed presentational structure
 * (see constants above), not admin-editable CMS fields, matching
 * IaRestructuring's precedent for "fixed by index, not reorderable" assets.
 *
 * Layout: Joe asked that both breakpoints read as a full 100vh "slide"
 * rather than natural content height (a first for this project's sections
 * so far -- prior sections only applied 100vh tuning to mobile). Implemented
 * as `min-h-screen` + vertical centering rather than a hard `h-screen` --
 * `min-h-screen` guarantees the section never reads shorter than one
 * viewport while still never clipping content on narrower/zoomed viewports
 * where the real content is taller than 100vh (a hard `h-screen` would crop
 * silently in that case, which is worse than occasionally being slightly
 * taller than one screen).
 *
 * Tech-feel motion (Joe's recurring "科技感動態" request, repeated this turn):
 * `CountUpValue` counts each stat up from 0 on scroll-in (this section's own
 * signature -- see its doc comment for why a shared ScanReveal/TechGlowBorder
 * wouldn't fit "four big numbers" as well), `ScanReveal` sweeps once across
 * the "核心洞察" panel, `PulseArrow` gives the causal connector a looping
 * traveling pulse, and every insight card lifts slightly on hover.
 */
export function UserResearch({ process }: { process: Record<string, unknown> }) {
  const intro = typeof process.userResearchIntro === "string" ? process.userResearchIntro : "";
  const mobileIntro =
    typeof process.userResearchMobileIntro === "string" ? process.userResearchMobileIntro : intro;
  const stats = Array.isArray(process.userResearchStats)
    ? (process.userResearchStats as UserResearchStat[])
    : [];
  const insights = Array.isArray(process.userResearchInsights)
    ? (process.userResearchInsights as UserResearchInsight[])
    : [];

  if (stats.length < 4 || insights.length < 4) return null;

  return (
    <section className="relative bg-grey-50">
      {/* Mobile layout */}
      <div className="flex min-h-screen w-full flex-col justify-center gap-8 px-6 py-12 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              使用者研究與易用性測試
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <p className="font-nunito text-[16px] leading-[1.5] font-bold text-grey-500">{mobileIntro}</p>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="relative grid grid-cols-2 gap-2">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 rounded-2xl border border-[#ededed] bg-proj-white p-3"
              >
                <CountUpValue
                  value={stat.value}
                  className={`font-nunito text-[20px] font-extrabold ${
                    STAT_COLORS[i] === "orange" ? "text-primary-orange" : "text-secondary-blue"
                  }`}
                />
                <p className="font-nunito text-[14px] leading-[21px] font-normal text-grey-600">
                  {stat.mobileDesc ?? stat.desc}
                </p>
              </div>
            ))}
            <div className="pointer-events-none absolute left-1/2 top-[46px] -translate-x-1/2 -translate-y-1/2">
              <PulseArrow size={20} />
            </div>
          </div>
        </SlideIn>

        <SlideIn delay={0.25} viewportMargin="0px">
          <div className="relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#e6e6e6] p-4">
            <ScanReveal />
            <div className="flex items-center justify-center gap-1">
              <StarIcon size={16} className="text-secondary-blue" />
              <span className="font-nunito text-[15px] font-bold leading-[23px] text-primary-black">
                核心洞察
              </span>
            </div>
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full gap-2">
                <MobileInsightCard insight={insights[0]} index={0} />
                <MobileInsightCard insight={insights[1]} index={1} />
              </div>
              <div className="flex w-full gap-2">
                <MobileInsightCard insight={insights[2]} index={2} />
                <MobileInsightCard insight={insights[3]} index={3} />
              </div>
            </div>
          </div>
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="hidden min-h-screen w-full flex-col justify-center gap-10 border-t border-b border-[#ededed] px-[120px] py-[64px] md:flex">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[48px] leading-[72px] font-bold text-primary-black">
              使用者研究與易用性測試
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <p className="font-nunito text-[28px] leading-[1.5] font-bold text-grey-500">{intro}</p>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="relative flex w-full items-stretch gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-1 flex-col gap-3 rounded-2xl border border-[#ededed] bg-proj-white p-6"
              >
                <span
                  className={`inline-flex w-fit items-start rounded-full px-[10px] py-1 font-nunito text-[13px] font-extrabold text-proj-white ${
                    STAT_COLORS[i] === "orange" ? "bg-primary-orange" : "bg-secondary-blue"
                  }`}
                >
                  {stat.label}
                </span>
                <CountUpValue
                  value={stat.value}
                  className="font-nunito text-[32px] leading-[40px] font-extrabold text-primary-black"
                />
                <p className="font-nunito text-[14px] leading-[21px] font-normal text-grey-600">{stat.desc}</p>
              </div>
            ))}
            <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <PulseArrow size={40} />
            </div>
          </div>
        </SlideIn>

        <SlideIn delay={0.25} viewportMargin="0px">
          <div className="relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[24px] bg-proj-white px-16 py-6 shadow-[0px_8px_24px_-4px_rgba(64,50,42,0.06),0px_2px_4px_0px_rgba(64,50,42,0.04)]">
            <ScanReveal />
            <div className="flex items-center gap-1">
              <StarIcon size={24} className="text-secondary-blue" />
              <span className="font-nunito text-[32px] leading-[48px] font-bold text-grey-800">核心洞察</span>
            </div>
            <div className="flex w-full items-stretch gap-8">
              {insights.map((insight, i) => {
                const isBlue = INSIGHT_DESKTOP_COLORS[i] === "blue";
                const textColor = isBlue ? "text-secondary-blue" : "text-accent-pink";
                const barColor = isBlue ? "bg-secondary-blue" : "bg-accent-pink";
                const numberColor = isBlue ? "#0d21ff" : "#ff5bc0";
                return (
                  <motion.div
                    key={insight.title}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-[#f7f5f3] p-5"
                  >
                    <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${barColor}`} />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-4 -top-6 -scale-x-100 select-none font-fredoka text-[120px] leading-none opacity-10"
                      style={{ color: numberColor }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative size-[150px] shrink-0">
                      <Image src={INSIGHT_ILLUSTRATIONS[i]} alt="" fill sizes="150px" className="object-cover" />
                    </div>
                    <div className="flex w-full flex-col gap-1.5">
                      <p className={`font-nunito text-[24px] leading-[36px] font-bold ${textColor}`}>{insight.title}</p>
                      <p className="font-nunito text-[16px] leading-[24px] font-normal text-grey-800">{insight.desc}</p>
                    </div>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.03)]"
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
