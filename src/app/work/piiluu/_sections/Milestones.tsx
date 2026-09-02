"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";

interface Milestone {
  /** "01".."04" -- rendered as "INSTALLMENT 0X • TYPE". */
  number: string;
  /** "MILESTONE" | "LEARNING" */
  type: string;
  title: string;
  desc: string;
}

/**
 * Desktop card -- Figma node 526:2398, alternating left/right of a center
 * timeline. `achieved` (driven by scroll progress) swaps the border color
 * and reveals the rotated "ACHIEVED" stamp badge; dims to opacity-45 (and
 * a plain white/[0.05] border) while not yet reached, matching the exact
 * unachieved treatment Figma shows for its 4th/last card.
 */
function DesktopCard({ milestone, achieved, side }: { milestone: Milestone; achieved: boolean; side: "left" | "right" }) {
  return (
    <div className={`flex w-full ${side === "left" ? "justify-end pr-[43px]" : "justify-start pl-[43px]"}`}>
      <motion.div
        animate={{ opacity: achieved ? 1 : 0.45 }}
        transition={{ duration: 0.4 }}
        className={`relative w-[314px] max-w-[314px] rounded-[14px] border bg-white/[0.06] p-[23px] shadow-[0px_7px_21px_0px_rgba(0,0,0,0.04)] ${
          achieved ? "border-[#eaeaea]" : "border-white/[0.05]"
        }`}
      >
        <div className="flex h-7 items-center gap-2 pt-0.5">
          <span className="font-nunito text-[11px] font-extrabold text-[#999]">
            INSTALLMENT {milestone.number} • {milestone.type}
          </span>
        </div>
        <h4 className="pt-3 font-nunito text-[20px] font-bold text-primary-orange">{milestone.title}</h4>
        <p className="pt-2 font-nunito text-[14px] leading-[21px] font-normal text-white">{milestone.desc}</p>

        {achieved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            className="absolute right-4 top-3 -rotate-[10deg] rounded-[6px] border-[1.4px] border-primary-orange bg-[#fff1e8] px-[9px] py-[3px]"
          >
            <span className="font-nunito text-[10px] font-black tracking-[0.7px] text-primary-orange">ACHIEVED</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/** Timeline dot at each desktop card's vertical center -- white ring,
 * orange core once achieved, grey core while pending. */
function DesktopDot({ achieved }: { achieved: boolean }) {
  return (
    <motion.div
      animate={{ borderColor: achieved ? "#ff520d" : "rgba(255,255,255,0.2)" }}
      transition={{ duration: 0.4 }}
      className="absolute left-1/2 top-1/2 flex size-[17px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] bg-[#1a1a1a]"
    >
      <motion.span
        animate={{ backgroundColor: achieved ? "#ff520d" : "rgba(255,255,255,0.3)" }}
        transition={{ duration: 0.4 }}
        className="size-[6px] rounded-full"
      />
    </motion.div>
  );
}

function DesktopTimeline({ milestones, achievedCount, lineFill }: { milestones: Milestone[]; achievedCount: number; lineFill: ReturnType<typeof useTransform<number, number>> }) {
  return (
    <div className="relative mx-auto w-[714px] max-w-full">
      <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-[#333]" aria-hidden />
      <motion.div
        style={{ scaleY: lineFill }}
        className="absolute left-1/2 top-0 h-full w-[3px] origin-top -translate-x-1/2 rounded-full bg-primary-orange"
        aria-hidden
      />
      <div className="relative flex flex-col">
        {milestones.map((m, i) => {
          const achieved = i < achievedCount;
          return (
            <div key={m.number} className="relative flex min-h-[212px] items-center py-8">
              <DesktopCard milestone={m} achieved={achieved} side={i % 2 === 0 ? "left" : "right"} />
              <DesktopDot achieved={achieved} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Mobile card -- Figma node 552:4091. Solid-orange "ACHIEVED" pill (not
 * the rotated stamp desktop uses), white title, grey-400 body. */
function MobileCard({ milestone, achieved }: { milestone: Milestone; achieved: boolean }) {
  return (
    <motion.div
      animate={{ opacity: achieved ? 1 : 0.45 }}
      transition={{ duration: 0.4 }}
      className={`flex min-h-[150px] w-full flex-col gap-1.5 rounded-xl border bg-white/[0.04] p-3 ${
        achieved ? "border-primary-orange/[0.15]" : "border-white/[0.05]"
      }`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="max-w-[180px] truncate font-nunito text-[10px] font-extrabold text-[#666]">
          INSTALLMENT {milestone.number} • {milestone.type}
        </span>
        {achieved && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            className="shrink-0 rounded bg-primary-orange px-2 py-[3px] font-nunito text-[9px] font-extrabold text-white"
          >
            ACHIEVED
          </motion.span>
        )}
      </div>
      <p className="font-nunito text-[16px] leading-6 font-bold text-white">{milestone.title}</p>
      <p className="font-nunito text-[12px] leading-[17px] font-normal text-[#999]">{milestone.desc}</p>
    </motion.div>
  );
}

function MobileTimelineDot({ achieved }: { achieved: boolean }) {
  return (
    <Image
      src={achieved ? "/work/piiluu/milestones/dot-filled.svg" : "/work/piiluu/milestones/dot-outline.svg"}
      alt=""
      width={12}
      height={12}
      className="size-3 shrink-0"
    />
  );
}

function MobileTimeline({ milestones, achievedCount }: { milestones: Milestone[]; achievedCount: number }) {
  return (
    <div className="flex w-full gap-3 px-4 py-2">
      <div className="flex shrink-0 flex-col items-center">
        {milestones.map((m, i) => {
          const achieved = i < achievedCount;
          const nextAchieved = i + 1 < achievedCount;
          return (
            <div key={m.number} className="flex flex-1 flex-col items-center">
              <div className={`w-[2px] flex-1 ${i === 0 ? "invisible" : achieved ? "bg-primary-orange" : "bg-[#333]"}`} />
              <MobileTimelineDot achieved={achieved} />
              <div className={`w-[2px] flex-1 ${i === milestones.length - 1 ? "invisible" : nextAchieved ? "bg-primary-orange" : "bg-[#333]"}`} />
            </div>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {milestones.map((m, i) => (
          <MobileCard key={m.number} milestone={m} achieved={i < achievedCount} />
        ))}
      </div>
    </div>
  );
}

/**
 * Scroll-linked progress: as the user scrolls through the timeline
 * container, the connecting line fills (`scaleY`) and each milestone
 * flips to its "achieved" state in turn -- Joe's explicit ask ("每一個目標被
 * achieved 的 tag 標記，中間的 bar 也會慢慢增加"). `achievedCount` is derived from
 * scroll progress via even thresholds (1/N, 2/N, ...), not a fixed timer.
 */
function ScrollTimeline({ milestones }: { milestones: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.4"] });
  const lineFill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [achievedCount, setAchievedCount] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setAchievedCount(Math.min(milestones.length, Math.round(v * milestones.length)));
  });

  return (
    <div ref={ref}>
      <div className="hidden md:block">
        <DesktopTimeline milestones={milestones} achievedCount={achievedCount} lineFill={lineFill} />
      </div>
      <div className="md:hidden">
        <MobileTimeline milestones={milestones} achievedCount={achievedCount} />
      </div>
    </div>
  );
}

/** `prefers-reduced-motion` fallback -- every milestone renders already
 * achieved, no scroll-linked reveal. */
function StaticTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <>
      <div className="hidden md:block">
        <div className="relative mx-auto w-[714px] max-w-full">
          <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-primary-orange" aria-hidden />
          <div className="relative flex flex-col">
            {milestones.map((m, i) => (
              <div key={m.number} className="relative flex min-h-[212px] items-center py-8">
                <DesktopCard milestone={m} achieved side={i % 2 === 0 ? "left" : "right"} />
                <DesktopDot achieved />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="md:hidden">
        <MobileTimeline milestones={milestones} achievedCount={milestones.length} />
      </div>
    </>
  );
}

/**
 * Milestones section ("里程碑與學習"), Figma fileKey 8qGUSDUJqOgJaSERffGXVc,
 * desktop node 526:2386 / mobile node 552:4018. Section bg is `#1A1A1A`
 * (dark) at both breakpoints -- not light. All accents are primary-orange,
 * not piiluu's usual dominant blue (matched exactly per Figma, not
 * simplified). Desktop: alternating left/right cards flanking a center
 * timeline, orange card titles. Mobile: dark cards in a single column with
 * an SVG-dot timeline on the left, white card titles.
 *
 * Content model: `process.milestonesHeading`, `.milestonesIntro`
 * (labelled "產品旅程與反思"), `.milestonesSubIntro`, `process.milestones` (4x
 * {number, type, title, desc}).
 */
export function Milestones({ process }: { process: Record<string, unknown> }) {
  const heading = (process.milestonesHeading as string) || "里程碑與學習";
  const introTitle = (process.milestonesIntro as string) || "產品旅程與反思";
  const introBody = process.milestonesSubIntro as string | undefined;
  const milestones = Array.isArray(process.milestones) ? (process.milestones as Milestone[]) : [];
  const reduceMotion = useReducedMotion();

  if (milestones.length === 0) return null;

  return (
    <section className="bg-[#1a1a1a] px-6 py-12 md:px-[200px] md:py-20">
      <div className="flex flex-col items-center gap-6 md:gap-9">
        <div className="flex flex-col items-center gap-2 text-center md:gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary-orange" aria-hidden />
            <span className="font-nunito text-[14px] font-extrabold text-primary-orange">MILESTONES &amp; LEARNINGS</span>
          </div>
          <h3 className="font-nunito text-[24px] leading-9 font-bold text-white md:text-[40px] md:leading-[56px]">{heading}</h3>
        </div>

        {/* Mobile -- bordered quote-mark card */}
        {introBody && (
          <div className="relative flex w-full items-center rounded-[8px] border border-[#e6e6e6] bg-white/[0.06] px-5 py-3 md:hidden">
            <Image src="/work/piiluu/milestones/quote-open.svg" alt="" width={12} height={9} className="absolute left-[5px] top-[11px]" />
            <p className="w-full text-center font-nunito text-[14px] leading-[21px] font-normal text-white">{introBody}</p>
            <Image src="/work/piiluu/milestones/quote-close.svg" alt="" width={12} height={9} className="absolute right-[5px] top-[11px]" />
          </div>
        )}

        {/* Desktop -- plain bordered panel, no quote glyphs */}
        {introBody && (
          <div className="hidden w-full flex-col items-center gap-3 rounded-2xl border border-[#f5f5f5]/20 bg-white/[0.06] py-4 text-center shadow-[0px_2px_12px_0px_rgba(0,0,0,0.13)] md:flex">
            <p className="font-nunito text-[28px] leading-[39px] font-bold text-primary-orange">{introTitle}</p>
            <p className="max-w-[660px] font-nunito text-[18px] leading-[25px] font-normal text-white">{introBody}</p>
          </div>
        )}

        {reduceMotion ? <StaticTimeline milestones={milestones} /> : <ScrollTimeline milestones={milestones} />}
      </div>
    </section>
  );
}
