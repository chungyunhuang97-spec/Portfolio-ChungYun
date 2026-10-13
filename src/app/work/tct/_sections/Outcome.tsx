"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

/** CountUp hook -- per docs/case-study-design-conventions.md's "數字類
 * 統計一律用 CountUp" rule (0 → target, ~1.3s, easeOut). Metro/Nest Stay
 * each wrote their own version of this same logic rather than sharing one;
 * this follows that existing precedent rather than introducing a new
 * shared hook unilaterally. */
function useCountUp(target: number, start: boolean, duration = 1300) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const startTime = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

/** The exhibition's real run dates (2025.11.15–12.07, inclusive), fixed
 * historical fact rather than something parsed out of the free-text
 * `project.timeframe` label -- same "hardcode the specific known number"
 * precedent other project pages use for their own one-off facts. */
const EXHIBITION_DAYS = 23;

function DaysStat({ timeframe }: { timeframe: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const days = useCountUp(EXHIBITION_DAYS, inView);

  return (
    <div ref={ref} className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[20px] bg-grey-50 p-8 text-center md:p-10">
      <p className="font-fredoka text-[56px] leading-none text-accent-pink md:text-[72px]">{days}</p>
      <p className="font-nunito text-[13px] font-extrabold uppercase tracking-[0.1em] text-grey-500">
        展覽開放天數
      </p>
      <p className="font-nunito text-[13px] font-semibold text-grey-400">{timeframe}</p>
    </div>
  );
}

function QuoteCard({ text }: { text: string }) {
  return (
    <div className="relative flex-[1.4] rounded-[20px] border border-accent-pink/20 bg-proj-white p-8 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:p-10">
      <span aria-hidden className="font-nunito absolute left-6 top-4 text-[40px] font-bold leading-none text-accent-pink/20 md:left-8 md:top-6 md:text-[56px]">
        “
      </span>
      <p className="font-nunito relative text-[15px] leading-[26px] font-semibold text-grey-800 md:text-[17px] md:leading-[28px]">
        {text}
      </p>
    </div>
  );
}

/**
 * Section 5 -- Outcome (`outcome` row's `items`: a run-summary sentence
 * and the grandma anecdote). White background, continuing the alternation.
 */
export function Outcome({ outcome, project }: { outcome: Record<string, unknown>; project: Project }) {
  const items = Array.isArray(outcome.items) ? (outcome.items as string[]) : [];
  if (items.length === 0) return null;

  const [summary, anecdote] = items;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[960px] flex-col gap-10 md:gap-12">
        <SlideIn className="text-center">
          <span className="font-nunito text-[14px] font-extrabold text-accent-pink">OUTCOME</span>
          {summary && (
            <p className="font-nunito mx-auto mt-4 max-w-[65ch] text-[15px] leading-[24px] font-normal text-grey-600 md:text-[18px] md:leading-[28px]">
              {summary}
            </p>
          )}
        </SlideIn>

        <div className="flex flex-col gap-6 md:flex-row">
          <SlideIn direction="left" delay={0.1} className="flex flex-1">
            <DaysStat timeframe={project.timeframe ?? ""} />
          </SlideIn>
          {anecdote && (
            <SlideIn direction="right" delay={0.16} className="flex flex-[1.4]">
              <QuoteCard text={anecdote} />
            </SlideIn>
          )}
        </div>
      </div>
    </section>
  );
}
