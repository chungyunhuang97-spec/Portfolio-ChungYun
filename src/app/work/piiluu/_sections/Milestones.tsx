"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Milestone {
  number: string;
  type: "MILESTONE" | "LEARNING";
  title: string;
  desc: string;
}

/** Card thresholds along the section's 0-1 scroll progress -- 4 cards evenly
 * spaced, per Joe's own suggested numbers ("0.125/0.375/0.625/0.875"). Both
 * the mobile vertical line-fill and the desktop snake-path line-fill use
 * these same thresholds so the two layouts feel scroll-synced identically
 * even though their line geometry differs. */
const THRESHOLDS = [0.125, 0.375, 0.625, 0.875];

function AchievedBadge({ achieved }: { achieved: boolean }) {
  return (
    <motion.span
      initial={false}
      animate={achieved ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.7, y: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary-blue px-2.5 py-1 font-nunito text-[10px] font-extrabold tracking-[0.5px] text-proj-white"
    >
      ACHIEVED
    </motion.span>
  );
}

function MilestoneCard({ milestone, achieved }: { milestone: Milestone; achieved: boolean }) {
  const isLearning = milestone.type === "LEARNING";
  return (
    <motion.div
      animate={{ opacity: achieved ? 1 : 0.55 }}
      transition={{ duration: 0.4 }}
      className="flex w-full flex-col gap-2 rounded-2xl border border-grey-100 bg-proj-white p-5 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`font-nunito text-[11px] font-extrabold tracking-[0.6px] uppercase ${isLearning ? "text-accent-pink" : "text-secondary-blue"}`}>
          {milestone.number} · {milestone.type}
        </span>
        <AchievedBadge achieved={achieved} />
      </div>
      <h4 className="font-nunito text-[16px] font-bold text-primary-black md:text-[18px]">{milestone.title}</h4>
      <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-600 md:text-[14px] md:leading-[22px]">
        {milestone.desc}
      </p>
    </motion.div>
  );
}

/** Dot marker -- neutral grey until its threshold, then pops to
 * secondary-blue via spring (not a linear color transition, per Joe's "動態
 * 不要太呆板" note). */
function TimelineDot({ achieved }: { achieved: boolean }) {
  return (
    <motion.span
      animate={{
        scale: achieved ? 1 : 0.7,
        backgroundColor: achieved ? "#0d21ff" : "#b3b3b3",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="relative z-10 block size-4 shrink-0 rounded-full ring-4 ring-proj-white"
    />
  );
}

/** Mobile: single vertical column, dot+line on the left, cards on the
 * right -- matches Figma's "progress-bar-column" + "cards-column"
 * structure. Line fill is `scaleY` off the shared scroll progress. */
function MobileTimeline({ milestones, progress, achieved }: { milestones: Milestone[]; progress: MotionValue<number>; achieved: boolean[] }) {
  const lineScale = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="flex w-full gap-4">
      <div className="relative flex w-4 flex-col items-center pt-1">
        <div className="absolute left-1/2 top-2 bottom-2 w-[3px] -translate-x-1/2 rounded-full bg-grey-100" aria-hidden />
        <motion.div
          style={{ scaleY: lineScale }}
          className="absolute left-1/2 top-2 bottom-2 w-[3px] origin-top -translate-x-1/2 rounded-full bg-secondary-blue"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between py-1">
          {milestones.map((m, i) => (
            <TimelineDot key={m.number} achieved={achieved[i]} />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-6">
        {milestones.map((m, i) => (
          <MilestoneCard key={m.number} milestone={m} achieved={achieved[i]} />
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop: 2x2 grid arranged as a continuous "snake" path so a single
 * connecting line can visit cards 1->2->3->4 in numeric order --
 * top row left-to-right (1,2), then down the right edge (2->3), then
 * bottom row right-to-left (3->4, achieved via `flex-row-reverse` on the
 * DOM order so card 3 renders visually on the right, under card 2). This is
 * a judgment call reading Figma's 714x849 2-column auto-layout node into a
 * coherent, literally-connectable timeline shape rather than a pixel-exact
 * port of its internal spacing math.
 */
function DesktopTimeline({ milestones, progress, achieved }: { milestones: Milestone[]; progress: MotionValue<number>; achieved: boolean[] }) {
  const seg1 = useTransform(progress, [0, 0.33], [0, 1]); // top: 1 -> 2
  const seg2 = useTransform(progress, [0.33, 0.66], [0, 1]); // right: 2 -> 3
  const seg3 = useTransform(progress, [0.66, 1], [0, 1]); // bottom: 3 -> 4

  return (
    <div className="relative grid grid-cols-2 gap-x-10 gap-y-16">
      {/* connecting path -- 3 absolutely positioned segments */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* top segment: card1 right edge -> card2 left edge */}
        <div className="absolute left-[calc(50%-1px)] right-[8%] top-[38px] h-[3px] -translate-x-full rounded-full bg-grey-100" />
        <motion.div
          style={{ scaleX: seg1 }}
          className="absolute left-[calc(50%-1px)] right-[8%] top-[38px] h-[3px] origin-left -translate-x-full rounded-full bg-secondary-blue"
        />
        {/* right segment: card2 bottom -> card3 top (right column) */}
        <div className="absolute right-[8%] top-[38px] bottom-[calc(50%+38px)] w-[3px] translate-x-1/2 rounded-full bg-grey-100" />
        <motion.div
          style={{ scaleY: seg2 }}
          className="absolute right-[8%] top-[38px] bottom-[calc(50%+38px)] w-[3px] origin-top translate-x-1/2 rounded-full bg-secondary-blue"
        />
        {/* bottom segment: card3 (right) -> card4 (left) */}
        <div className="absolute left-[8%] right-[calc(50%-1px)] bottom-[38px] h-[3px] translate-x-full rounded-full bg-grey-100" />
        <motion.div
          style={{ scaleX: seg3 }}
          className="absolute left-[8%] right-[calc(50%-1px)] bottom-[38px] h-[3px] origin-right translate-x-full rounded-full bg-secondary-blue"
        />
      </div>

      <div className="relative z-10 flex items-start gap-3">
        <TimelineDot achieved={achieved[0]} />
        <MilestoneCard milestone={milestones[0]} achieved={achieved[0]} />
      </div>
      <div className="relative z-10 flex items-start gap-3">
        <TimelineDot achieved={achieved[1]} />
        <MilestoneCard milestone={milestones[1]} achieved={achieved[1]} />
      </div>
      {/* row 2 rendered in reverse visual order (card 4 left, card 3 right)
          so the DOM/scroll-order 3 -> 4 still reads as a continuous path
          into the right column above. */}
      <div className="relative z-10 flex flex-row-reverse items-start gap-3">
        <TimelineDot achieved={achieved[3]} />
        <MilestoneCard milestone={milestones[3]} achieved={achieved[3]} />
      </div>
      <div className="relative z-10 flex flex-row-reverse items-start gap-3">
        <TimelineDot achieved={achieved[2]} />
        <MilestoneCard milestone={milestones[2]} achieved={achieved[2]} />
      </div>
    </div>
  );
}

/**
 * 里程碑與學習 (Milestones), Figma fileKey 8qGUSDUJqOgJaSERffGXVc. Per Joe's
 * explicit new instruction: as the user scrolls this section, each
 * milestone's "ACHIEVED" badge pops in and the connecting progress bar
 * fills, both driven by actual scroll position (`useScroll` scoped to this
 * section's container), not a fixed timer or per-card `whileInView`.
 *
 * A single `useScroll({ target: containerRef, offset: ["start center", "end
 * center"] })` produces one 0-1 progress value shared by both the mobile
 * (true vertical column) and desktop (2x2 snake-path) layouts -- each just
 * visualizes it differently. `achieved[i]` flips to true once progress
 * crosses `THRESHOLDS[i]` (tracked via `useMotionValueEvent`, since the
 * badge pop/dot-color-change needs a discrete React boolean, not a
 * continuously-interpolated style).
 *
 * Content model: `process.milestonesHeading`, `milestonesIntro`,
 * `milestonesSubIntro`, `process.milestones` (4x {number, type, title,
 * desc}).
 */
export function Milestones({ process }: { process: Record<string, unknown> }) {
  const heading = (process.milestonesHeading as string) || "里程碑與學習";
  const intro = process.milestonesIntro as string | undefined;
  const subIntro = process.milestonesSubIntro as string | undefined;
  const milestones = Array.isArray(process.milestones) ? (process.milestones as Milestone[]) : [];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const [achieved, setAchieved] = useState<boolean[]>(() => THRESHOLDS.map(() => false));

  useMotionValueEvent(progress, "change", (v) => {
    setAchieved((prev) => {
      const next = THRESHOLDS.map((t) => v >= t);
      return prev.some((val, i) => val !== next[i]) ? next : prev;
    });
  });

  // Initialize once mounted (covers the case where the section is already
  // in its scrolled range on load, e.g. a deep-link / reload mid-page).
  useEffect(() => {
    setAchieved(THRESHOLDS.map((t) => progress.get() >= t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (milestones.length === 0) return null;

  return (
    <section ref={containerRef} className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-10 md:gap-16">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-secondary-blue uppercase">
              {heading}
            </span>
            {intro && (
              <h3 className="font-nunito text-[24px] leading-[32px] font-bold text-primary-black md:text-[40px] md:leading-[52px]">
                {intro}
              </h3>
            )}
            {subIntro && (
              <p className="font-nunito max-w-[720px] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[25px]">
                {subIntro}
              </p>
            )}
          </div>
        </SlideIn>

        <div className="md:hidden">
          <MobileTimeline milestones={milestones} progress={progress} achieved={achieved} />
        </div>
        <div className="hidden md:block">
          <DesktopTimeline milestones={milestones} progress={progress} achieved={achieved} />
        </div>
      </div>
    </section>
  );
}
