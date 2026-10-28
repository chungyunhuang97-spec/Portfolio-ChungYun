"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Outcome {
  number: string;
  unit: string;
  desc: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const numberPop = {
  hidden: { opacity: 0, scale: 0.6, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 250, damping: 18 },
  },
};

const cardInner = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadePart = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
} as const;

/**
 * 目前成果 — metric cards with animated number pop.
 * Content from `process.outcomesTitle` and `process.outcomes`.
 *
 * Uses the same spring-pop pattern as nest-stay's AchievementsRoadmap,
 * adapted for simpler 3-stat layout. Background is light off-white to
 * contrast with the preceding dark AIWorkflow section.
 */
export function Outcomes({ process }: { process: Record<string, unknown> }) {
  const title = (process.outcomesTitle as string) || "目前成果";
  const outcomes = Array.isArray(process.outcomes)
    ? (process.outcomes as Outcome[])
    : [];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  if (outcomes.length === 0) return null;

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            Outcomes
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            {title}
          </h2>
        </div>
      </SlideIn>

      <motion.div
        ref={ref}
        className="grid gap-4 md:grid-cols-3 md:gap-6"
        initial="hidden"
        animate={inView ? "show" : "hidden"}
      >
        {outcomes.map((outcome, i) => (
          <motion.div
            key={outcome.unit}
            variants={cardInner}
            custom={i}
            className="flex flex-col items-center gap-3 rounded-2xl border border-grey-100 bg-grey-50 p-6 text-center md:items-start md:p-7 md:text-left"
          >
            {/* Number + unit — stacked & centered on mobile, inline baseline on desktop */}
            <div className="flex flex-col items-center gap-1 md:flex-row md:items-baseline md:gap-2">
              <motion.span
                variants={numberPop}
                className="font-fredoka text-[40px] leading-none text-primary-orange md:text-[64px]"
              >
                {outcome.number}
              </motion.span>
              <motion.span
                variants={fadePart}
                className="font-nunito text-[14px] font-semibold text-grey-600 md:text-[16px]"
              >
                {outcome.unit}
              </motion.span>
            </div>

            {/* Orange divider line */}
            <motion.div
              variants={{ hidden: { width: 0 }, show: { width: 40, transition: { duration: 0.4, delay: 0.1, ease: "easeOut" } } }}
              className="h-[3px] rounded-full bg-primary-orange"
            />

            {/* Desc */}
            <motion.p
              variants={fadePart}
              className="font-nunito text-[13px] leading-[20px] text-grey-500 md:text-[14px] md:leading-[22px]"
            >
              {outcome.desc}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      {/* Iteration note */}
      <SlideIn delay={0.25}>
        <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-grey-100 bg-grey-50 p-4 text-center md:mt-10 md:flex-row md:items-start md:gap-3 md:text-left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 md:mt-0.5" aria-hidden>
            <circle cx="8" cy="8" r="7" stroke="#FF520D" strokeOpacity="0.5" strokeWidth="1.2" />
            <path d="M5.5 8l1.8 1.8L10.5 6" stroke="#FF520D" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-nunito text-[12px] leading-[18px] text-grey-500 md:text-[13px] md:leading-[20px]">
            <span className="font-bold text-primary-orange">這個專案仍在持續迭代中</span>
            ——呈現的是真實的「進行式」，而不是包裝完美的靜態成果。2026.09 正式開放後如有轉換率數據，會持續更新。
          </p>
        </div>
      </SlideIn>
    </section>
  );
}
