"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

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

/** The three headline facts from the original site's "成果與反思" stat
 * row -- fixed, already-established project facts (NTSO's 80th
 * anniversary, the 1-month build the `challenge` row already describes,
 * the 3 zones `ExhibitionZones` renders), hardcoded the same way
 * `EXHIBITION_DAYS` was in the previous version of this file rather than
 * re-derived from other rows' free text. */
const STATS: { target: number; unit: string; label: string }[] = [
  { target: 80, unit: "Years", label: "交響樂團歷史軌跡" },
  { target: 1, unit: "Mon.", label: "極限開發與設計" },
  { target: 3, unit: "Zones", label: "獨立沈浸式展區" },
];

function StatTile({ target, unit, label, delay }: { target: number; unit: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const value = useCountUp(target, inView);

  return (
    <SlideIn delay={delay} className="flex flex-1">
      <div ref={ref} className="flex flex-1 flex-col items-center gap-1 rounded-[20px] bg-grey-50 px-6 py-8 text-center">
        <p className="font-fredoka text-[40px] leading-none text-secondary-blue md:text-[64px]">
          {value}
          <span className="font-nunito ml-1.5 text-[16px] font-bold text-grey-700 md:text-[18px]">{unit}</span>
        </p>
        <p className="font-nunito mt-2 text-[13px] font-semibold text-grey-500">{label}</p>
      </div>
    </SlideIn>
  );
}

/** The closing insight, taken from the `reflection` row's single `text`
 * field (also used in full by `Closing.tsx`'s big quote) -- split here
 * into a lightbulb "insight" card (everything up to the final sentence)
 * and a short highlighted pull-quote (the final "這個專案讓我學會" line),
 * matching the original site's own two-part treatment of this same
 * paragraph. Splitting a known, fixed string rather than storing the
 * pieces as separate DB fields, consistent with this page's existing
 * precedent for project-specific constants (e.g. `STATS` above). */
function splitReflection(text: string): { body: string; pullQuote: string } {
  const marker = "這個專案讓我學會";
  const idx = text.indexOf(marker);
  if (idx === -1) return { body: text, pullQuote: "" };
  return { body: text.slice(0, idx).trim(), pullQuote: text.slice(idx).trim() };
}

function InsightCard({ text }: { text: string }) {
  const { body, pullQuote } = splitReflection(text);
  const [heading, ...rest] = body.split("。").filter(Boolean);
  const restBody = rest.join("。").trim();

  return (
    <SlideIn delay={0.3} className="w-full">
      <div className="rounded-[24px] bg-secondary-blue/5 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <span className="text-[16px] text-secondary-blue" aria-hidden>
            ◆
          </span>
          <span className="h-px w-10 bg-grey-300" aria-hidden />
        </div>
        <h5 className="font-nunito mt-4 text-[20px] font-bold leading-7 text-grey-800 md:text-[24px]">
          {heading}
          {heading && "。"}
        </h5>
        {restBody && (
          <p className="font-nunito mt-3 max-w-[70ch] text-[14px] leading-[23px] font-normal text-grey-700 md:text-[15px]">
            {restBody}
          </p>
        )}
        {pullQuote && (
          <blockquote className="font-nunito mt-6 border-l-[3px] border-secondary-blue pl-4 text-[14px] font-bold leading-[22px] text-grey-800 md:text-[15px]">
            {pullQuote}
          </blockquote>
        )}
      </div>
    </SlideIn>
  );
}

/**
 * Section 6 -- Final Thoughts (成果與反思). Content model: `outcome`
 * row's `items[1]` (the grandma anecdote) as this section's plain intro
 * paragraph -- `items[0]` now lives in `OnSite.tsx` instead, matching the
 * original site's own split between the two sections -- plus `reflection`
 * row's `text` for the insight card below the stat row.
 */
export function Outcome({
  outcome,
  reflection,
}: {
  outcome: Record<string, unknown>;
  reflection: Record<string, unknown>;
}) {
  const items = Array.isArray(outcome.items) ? (outcome.items as string[]) : [];
  const anecdote = items[1];
  const reflectionText = reflection.text as string | undefined;

  if (!anecdote && !reflectionText) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[800px] flex-col gap-10 md:gap-12">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <SectionKicker color="blue">FINAL THOUGHTS</SectionKicker>
          <h2 className="font-display text-[24px] font-bold text-grey-800 md:text-[40px]">成果與反思</h2>
          {anecdote && (
            <p className="font-nunito mx-auto mt-4 max-w-[65ch] text-[14px] leading-[23px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
              {anecdote}
            </p>
          )}
        </SlideIn>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {STATS.map((stat, i) => (
            <StatTile key={stat.label} {...stat} delay={0.1 + i * 0.08} />
          ))}
        </div>

        {reflectionText && <InsightCard text={reflectionText} />}
      </div>
    </section>
  );
}
