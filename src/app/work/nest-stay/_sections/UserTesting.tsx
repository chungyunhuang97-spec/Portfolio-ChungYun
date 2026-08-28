"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, animate, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface FocusPoint {
  title: string;
  desc: string;
}

interface Score {
  label: string;
  value: number;
}

interface Insight {
  title: string;
  desc: string;
}

const EASE_SPEC: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * One score row — grows from 0 to its target once 50% visible, per spec.
 * The bar's WIDTH is the score expressed as a percentage (value × 10, e.g.
 * 8.5 → 85%) while the number displayed alongside it is the raw /10 score
 * — both driven off the same tween so they land in sync. `stagger` (0.12s
 * per bar, applied via `delay`) and the small 1→1.03→1 completion bounce
 * are both spec'd explicitly; the bounce plays on the bar's fill once the
 * width tween finishes.
 */
function ScoreBar({ score, stagger }: { score: Score; stagger: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      const controls = animate(0, score.value, {
        duration: 1.4,
        ease: EASE_SPEC,
        onUpdate: (v) => setDisplay(v),
        onComplete: () => {
          setBounce(true);
          setTimeout(() => setBounce(false), 320);
        },
      });
      return () => controls.stop();
    }, stagger * 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-nunito text-[13px] font-semibold text-grey-700 md:text-[14px]">{score.label}</span>
        <span className="font-fredoka text-[16px] text-primary-orange">{display.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-grey-100">
        <motion.div
          className="h-full rounded-full bg-primary-orange"
          style={{ width: `${(display / 10) * 100}%` }}
          animate={{ scaleY: bounce ? [1, 1.6, 1] : 1 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/** Average score CountUp — same 0→target tween technique as ScoreBar/metro's CountUpValue, reused for the single big "8.1" headline number. */
function AverageCountUp({ target }: { target: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const numeric = parseFloat(target);
  const [text, setText] = useState("0.0");

  useEffect(() => {
    if (!inView || Number.isNaN(numeric)) return;
    const controls = animate(0, numeric, {
      duration: 1.4,
      ease: EASE_SPEC,
      onUpdate: (v) => setText(v.toFixed(1)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className="font-fredoka text-[56px] leading-[56px] text-primary-orange md:text-[72px] md:leading-[72px]">
      {text}
    </span>
  );
}

const insightContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } } as const;
const insightItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const focusContainer = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const focusItem = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.35 } } };

/**
 * 使用者測試與洞察 (User Testing), Figma desktop node 275:87's testing block /
 * mobile node 404:147 (identical structure both breakpoints). Content
 * model: reuses `process` — `userTestingIntro`, `userTestingFocusPoints`
 * (2 items, paired with the ONE image Joe supplied for this exact section
 * — `userTestingFocusMediaUrl`, shipped as a static /public asset copied in
 * for him rather than a blank admin upload slot, since the file already
 * exists), `userTestingScores` (5× {label, value}), `userTestingAverage`,
 * `userTestingInsights` (3 items).
 *
 * Motion: focus points fade in staggered 0.12s (`focusContainer`/`focusItem`
 * variants); score bars + the average CountUp both trigger at 50%
 * visibility per spec (`ScoreBar`/`AverageCountUp`); insight cards fade+rise
 * staggered 0.1s (`insightContainer`/`insightItem`). No persistent glow or
 * sparkle effects on the insight cards, per spec's explicit "no persistent
 * glow/sparkle" note — plain bordered cards only.
 */
export function UserTesting({ process }: { process: Record<string, unknown> }) {
  const intro = process.userTestingIntro as string | undefined;
  const focusPoints = Array.isArray(process.userTestingFocusPoints)
    ? (process.userTestingFocusPoints as FocusPoint[])
    : [];
  const focusMedia = process.userTestingFocusMediaUrl as string | undefined;
  const scores = Array.isArray(process.userTestingScores) ? (process.userTestingScores as Score[]) : [];
  const average = process.userTestingAverage as string | undefined;
  const insights = Array.isArray(process.userTestingInsights) ? (process.userTestingInsights as Insight[]) : [];

  if (scores.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-10 md:gap-14">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[2px] text-primary-orange uppercase">
              User Testing &amp; Insights
            </span>
            <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[36px] md:leading-[48px]">
              使用者測試與洞察
            </h3>
            {intro && (
              <p className="font-nunito max-w-[680px] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
                {intro}
              </p>
            )}
          </div>
        </SlideIn>

        {focusPoints.length > 0 && (
          <motion.div
            className="flex flex-col items-center gap-6 rounded-2xl border border-[#e5e0db] bg-grey-50 p-6 md:flex-row md:gap-10 md:p-10"
            variants={focusContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {focusMedia && (
              <motion.span variants={focusItem} className="relative size-[128px] shrink-0 overflow-hidden rounded-2xl">
                <Image src={focusMedia} alt="" fill sizes="128px" className="object-cover" />
              </motion.span>
            )}
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-6">
              {focusPoints.map((f) => (
                <motion.div key={f.title} variants={focusItem} className="flex-1">
                  <p className="font-nunito text-[15px] font-bold text-secondary-blue">{f.title}</p>
                  <p className="font-nunito mt-1 text-[13px] leading-[20px] font-normal text-grey-600">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-12">
          <SlideIn delay={0.15} className="flex flex-col items-center justify-center gap-2 md:w-[220px] md:shrink-0">
            <AverageCountUp target={average ?? "0"} />
            <span className="font-nunito text-[12px] font-bold tracking-[1px] text-grey-500 uppercase">
              Average Score / 10
            </span>
          </SlideIn>

          <SlideIn delay={0.2} className="flex-1">
            <div className="flex flex-col gap-4 rounded-2xl border border-[#e5e0db] bg-proj-white p-6">
              {scores.map((s, i) => (
                <ScoreBar key={s.label} score={s} stagger={0.12 * i} />
              ))}
            </div>
          </SlideIn>
        </div>

        {insights.length > 0 && (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
            variants={insightContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {insights.map((insight) => (
              <motion.div
                key={insight.title}
                variants={insightItem}
                className="flex flex-col gap-2 rounded-2xl border border-[#e5e0db] bg-grey-50 p-6"
              >
                <p className="font-nunito text-[14px] font-bold text-primary-orange">{insight.title}</p>
                <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-700">{insight.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
