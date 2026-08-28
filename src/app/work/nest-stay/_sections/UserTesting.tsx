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
 * One score card in the "SCORE BY FLOW" row. The first (highest-scoring)
 * flow is permanently highlighted in orange per Figma (`bg-[#fff7f2]
 * border-2 border-primary-orange`), the rest sit neutral on `#f7f7f7`. The
 * thin track along the bottom animates its fill 0 → score once 50% visible.
 */
function ScoreCard({ score, highlighted, stagger }: { score: Score; highlighted: boolean; stagger: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      const controls = animate(0, score.value, { duration: 1.2, ease: EASE_SPEC, onUpdate: setDisplay });
      return () => controls.stop();
    }, stagger * 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div
      ref={ref}
      className={`flex h-full flex-1 flex-col justify-center gap-3 rounded-2xl px-6 py-5 ${
        highlighted ? "border-2 border-primary-orange bg-[#fff7f2]" : "bg-[#f7f7f7]"
      }`}
    >
      <p className={`font-nunito text-[13px] leading-[18px] font-semibold ${highlighted ? "text-primary-orange" : "text-[#6b6b6b]"}`}>
        {score.label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className={`font-fredoka text-[40px] leading-none ${highlighted ? "text-primary-orange" : "text-primary-black"}`}>
          {display.toFixed(1)}
        </span>
        <span className="font-nunito text-[14px] font-normal text-[#9e9e9e]">/ 10</span>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[#f0f0f0]">
        <div
          className={`h-full rounded-[3px] ${highlighted ? "bg-primary-orange" : "bg-grey-300"}`}
          style={{ width: `${(display / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

const insightContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } } as const;
const insightItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

const focusContainer = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const focusItem = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.35 } } };

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
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-8 md:gap-10">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-secondary-blue uppercase">
              User Testing
            </span>
            <h3 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
              使用者測試與洞察
            </h3>
            {intro && (
              <p className="font-nunito max-w-[680px] text-[14px] leading-[22px] font-normal text-[#6b6b6b] md:max-w-none md:text-[15px] md:leading-[24px]">
                {intro}
              </p>
            )}
          </div>
        </SlideIn>

        {focusPoints.length > 0 && (
          <motion.div
            className="flex flex-col gap-4 rounded-xl bg-grey-50 p-4 md:flex-row md:gap-4 md:p-4"
            variants={focusContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {focusMedia && (
              <motion.span variants={focusItem} className="relative size-[128px] shrink-0 overflow-hidden">
                <Image src={focusMedia} alt="" fill sizes="128px" className="object-cover" />
              </motion.span>
            )}
            <div className="flex flex-1 flex-col gap-3">
              <p className="font-nunito text-[14px] font-bold text-primary-orange">測試重點</p>
              <div className="flex flex-col gap-3 md:flex-row">
                {focusPoints.map((f, i) => (
                  <motion.div key={f.title} variants={focusItem} className="flex-1 rounded-2xl bg-proj-white p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-nunito flex size-7 shrink-0 items-center justify-center rounded-2xl bg-primary-orange text-[12px] font-bold text-proj-white">
                        {String(i + 1).padStart(2, "0")}
                      </span>
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
            <div className="flex flex-col items-center justify-center gap-1 rounded-[28px] bg-primary-orange px-10 py-8 text-proj-white">
              <p className="font-nunito text-[14px] font-bold opacity-85">整體平均分數</p>
              <div className="flex items-end justify-center gap-1">
                <span className="font-fredoka text-[72px] leading-[80px] md:text-[96px] md:leading-[104px]">
                  {average ?? "—"}
                </span>
                <span className="font-nunito pb-2 text-[18px] font-semibold opacity-70">/ 10</span>
              </div>
            </div>
          </SlideIn>

          <div className="flex flex-1 flex-col gap-2">
            <span className="font-nunito text-[12px] font-extrabold tracking-[1.44px] text-[#9e9e9e] uppercase">
              Score by Flow
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 md:gap-4">
              {scores.map((s, i) => (
                <ScoreCard key={s.label} score={s} highlighted={i === 0} stagger={0.1 * i} />
              ))}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-[#ebebeb]" aria-hidden />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-secondary-blue">
              <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" strokeLinejoin="round" />
            </svg>
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
                    className={`flex flex-col gap-2 rounded-2xl border-l-[3px] ${style.border} ${style.bg} px-6 py-[18px]`}
                  >
                    <p className="font-nunito text-[16px] font-bold text-primary-black">{insight.title}</p>
                    <p className="font-nunito text-[13px] leading-[21px] font-normal text-[#666]">{insight.desc}</p>
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
