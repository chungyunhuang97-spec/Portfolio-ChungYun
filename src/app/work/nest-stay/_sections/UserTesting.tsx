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
 * One score card in the "SCORE BY FLOW" row. The orange "highlighted"
 * treatment (`bg-[#fff7f2] border-2 border-primary-orange`) rotates between
 * cards — see `ScoreGrid` — rather than staying fixed on one, so every
 * color/text change here is transitioned instead of snapping. The thin
 * track along the bottom animates its fill 0 → score once 50% visible,
 * independent of which card is currently highlighted.
 */
function ScoreCard({ score, highlighted, stagger }: { score: Score; highlighted: boolean; stagger: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      const controls = animate(0, score.value, {
        duration: 1.4,
        ease: EASE_SPEC,
        onUpdate: setDisplay,
        onComplete: () => setSettled(true),
      });
      return () => controls.stop();
    }, stagger * 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      animate={settled ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.2 }}
      className={`flex h-full w-[108px] shrink-0 flex-col justify-center gap-1 rounded-xl border-2 p-2.5 transition-colors duration-500 sm:w-auto sm:flex-1 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-5 ${
        highlighted ? "border-primary-orange bg-[#fff7f2]" : "border-transparent bg-[#f7f7f7]"
      }`}
    >
      <p className={`font-nunito text-[12px] leading-[17px] font-semibold transition-colors duration-500 sm:text-[13px] sm:leading-[18px] ${highlighted ? "text-primary-orange" : "text-[#6b6b6b]"}`}>
        {score.label}
      </p>
      <div className="flex items-baseline gap-0.5 sm:gap-1">
        <span className={`font-sans text-[18px] leading-none transition-colors duration-500 sm:font-fredoka sm:text-[40px] ${highlighted ? "text-primary-orange" : "text-primary-black"}`}>
          {display.toFixed(1)}
        </span>
        <span className="font-nunito text-[10px] font-normal text-[#9e9e9e] sm:text-[14px]">/ 10</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-[2px] bg-[#f0f0f0] sm:h-[6px] sm:rounded-[3px]">
        <div
          className={`h-full rounded-[2px] transition-colors duration-500 sm:rounded-[3px] ${highlighted ? "bg-primary-orange" : "bg-grey-300"}`}
          style={{ width: `${(display / 10) * 100}%` }}
        />
      </div>
    </motion.div>
  );
}

/**
 * The 5 score cards, with the "highlighted" orange treatment rotating
 * through them one at a time (2.5s each) rather than staying fixed on the
 * first card — per Joe's report that "Score by Flow" should read as taking
 * turns. Pauses while off-screen; each card's own count-up/settle-bounce
 * (in `ScoreCard`) is unaffected and still only plays once.
 */
function ScoreGrid({ scores }: { scores: Score[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!inView || scores.length === 0) return;
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % scores.length), 2500);
    return () => clearInterval(timer);
  }, [inView, scores.length]);

  return (
    <div ref={ref} className="flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-2 sm:gap-3 md:grid-cols-5 md:gap-4">
      {scores.map((s, i) => (
        <ScoreCard key={s.label} score={s} highlighted={i === activeIndex} stagger={0.12 * i} />
      ))}
    </div>
  );
}

/** The orange "整體平均分數" hero metric — CountUp 0 → average, per spec, same 1.4s/easing as the score bars. */
function AverageScore({ average }: { average: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);
  const target = parseFloat(average) || 0;

  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE_SPEC,
      onUpdate: setDisplay,
      onComplete: () => setSettled(true),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      animate={settled ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.25 }}
      className="flex items-baseline justify-center gap-1"
    >
      <span className="font-fredoka text-[48px] leading-none sm:text-[72px] sm:leading-[80px] md:text-[96px] md:leading-[104px]">
        {display.toFixed(1)}
      </span>
      <span className="font-nunito text-[12px] font-semibold opacity-70 sm:pb-2 sm:text-[18px]">/ 10</span>
    </motion.div>
  );
}

const insightContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } } as const;
const insightItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const focusContainer = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const focusItem = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.35 } } };
/** The illustration gets a springier pop-in than the plain cards, since it's the "personality" element in this row. */
const focusIllustration = {
  hidden: { opacity: 0, scale: 0.7, rotate: -8 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 140, damping: 14 } },
} as const;
/** Numbered badge chips pop with a small spring, inheriting the "show" label from the parent focusItem card. */
const badgePop = {
  hidden: { scale: 0 },
  show: { scale: 1, transition: { type: "spring", stiffness: 320, damping: 16, delay: 0.1 } },
} as const;

/** Insight card accent per Figma — 2 orange-bordered cards (one neutral bg, one tinted) + 1 blue. */
const INSIGHT_STYLES = [
  { border: "border-primary-orange", bg: "bg-[#fbfbfb]" },
  { border: "border-primary-orange", bg: "bg-[#fff7f2]" },
  { border: "border-secondary-blue", bg: "bg-[#f4f4ff]" },
] as const;

/**
 * 使用者測試與洞察 (User Testing), Figma desktop node 300:127 / mobile
 * 404:345. Rebuilt against the real page-level Figma frame — the header
 * label is secondary-blue (not orange), the score section is 5 individual
 * stat cards with thin progress tracks inside an orange "Hero Metric" block
 * (not a list of horizontal bars next to a floating number), and insight
 * cards use a left accent border + tinted background rather than a plain
 * bordered box.
 *
 * Content model unchanged: `process` — `userTestingIntro`,
 * `userTestingFocusPoints` (2×, paired with `userTestingFocusMediaUrl`),
 * `userTestingScores` (5×), `userTestingAverage`, `userTestingInsights` (3×).
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
    <section className="bg-proj-white px-6 py-8 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-4 md:gap-10">
        <SlideIn delay={0.1}>
          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-secondary-blue uppercase">
              User Testing
            </span>
            <h3 className="font-nunito text-[24px] leading-[36px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
              使用者測試與洞察
            </h3>
            {intro && (
              <p className="font-nunito max-w-[680px] text-[13px] leading-normal font-normal text-[#666] md:max-w-none md:text-[15px] md:leading-[24px]">
                {intro}
              </p>
            )}
          </div>
        </SlideIn>

        {focusPoints.length > 0 && (
          <motion.div
            className="hidden gap-4 rounded-xl bg-grey-50 p-4 md:flex md:flex-row"
            variants={focusContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {focusMedia && (
              <motion.span variants={focusIllustration} className="relative size-[128px] shrink-0 overflow-hidden">
                <Image src={focusMedia} alt="" fill sizes="128px" className="object-cover" />
              </motion.span>
            )}
            <div className="flex flex-1 flex-col gap-3">
              <p className="font-nunito text-[14px] font-bold text-primary-orange">測試重點</p>
              <div className="flex flex-col gap-3 md:flex-row">
                {focusPoints.map((f, i) => (
                  <motion.div key={f.title} variants={focusItem} className="flex-1 rounded-2xl bg-proj-white p-5">
                    <div className="flex items-center gap-2.5">
                      <motion.span
                        variants={badgePop}
                        className="font-nunito flex size-7 shrink-0 items-center justify-center rounded-2xl bg-primary-orange text-[12px] font-bold text-proj-white"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </motion.span>
                      <p className="font-nunito text-[14px] font-bold text-primary-black">{f.title}</p>
                    </div>
                    <p className="font-nunito mt-2 text-[13px] leading-[21px] font-normal text-[#737373]">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="h-px w-full bg-[#ebebeb]" aria-hidden />

        <div className="flex flex-col items-stretch gap-5 md:flex-row md:gap-5">
          <SlideIn delay={0.15} className="md:w-[320px] md:shrink-0">
            <div className="flex w-full flex-row items-center justify-center gap-4 rounded-[20px] border-[1.5px] border-primary-orange bg-primary-orange p-4 text-proj-white md:flex-col md:gap-1 md:rounded-[28px] md:border-0 md:px-10 md:py-8">
              <p className="font-nunito text-[14px] font-bold opacity-85">整體平均分數</p>
              {average ? <AverageScore average={average} /> : <span className="font-fredoka text-[48px] leading-none">—</span>}
            </div>
          </SlideIn>

          <div className="flex flex-1 flex-col gap-2">
            <span className="font-nunito text-[12px] font-extrabold tracking-[1.44px] text-[#9e9e9e] uppercase">
              Score by Flow
            </span>
            <ScoreGrid scores={scores} />
          </div>
        </div>

        <div className="h-px w-full bg-[#ebebeb]" aria-hidden />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <motion.svg
              width="20"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="text-secondary-blue"
              initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
            >
              <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" strokeLinejoin="round" />
            </motion.svg>
            <p className="font-nunito text-[16px] font-bold text-secondary-blue">Insight Summary</p>
          </div>
          {insights.length > 0 && (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
              variants={insightContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {insights.map((insight, i) => {
                const style = INSIGHT_STYLES[i] ?? INSIGHT_STYLES[0];
                return (
                  <motion.div
                    key={insight.title}
                    variants={insightItem}
                    className={`flex flex-col gap-0.5 rounded-xl border-l-[3px] ${style.border} ${style.bg} p-3 md:gap-2 md:rounded-2xl md:px-6 md:py-[18px]`}
                  >
                    <p className="font-nunito text-[13px] font-bold text-primary-black md:text-[16px]">{insight.title}</p>
                    <p className="font-nunito text-[12px] leading-[17px] font-normal text-[#666] md:text-[13px] md:leading-[21px]">{insight.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
