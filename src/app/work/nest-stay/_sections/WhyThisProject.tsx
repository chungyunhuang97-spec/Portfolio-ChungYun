"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { TextRoll } from "@/components/design-system/TextRoll";

interface WhyStep {
  title: string;
  desc: string;
}

/**
 * Figma's decorative quote glyphs framing the intro card — big translucent
 * text characters on desktop; small corner icons on mobile (`"`/`"` SVGs in
 * Figma — approximated here with a small text glyph rather than fetching the
 * un-downloadable localhost asset).
 */
function QuoteGlyph({ close }: { close?: boolean }) {
  return (
    <span
      aria-hidden
      className={`font-nunito pointer-events-none absolute text-[16px] leading-none font-bold text-primary-orange md:static md:block md:text-[64px] md:leading-[0.5] ${
        close ? "top-2 right-2 md:self-end" : "top-2 left-2 md:top-auto md:left-auto"
      }`}
    >
      {close ? "”" : "“"}
    </span>
  );
}

/**
 * One item in the right-hand list. Interaction spec 1 ("四步驟漸進聚焦") —
 * once the list scrolls into view, steps 01→04 auto-play through an
 * "active" state one at a time (1.2s each), then settle back to full
 * opacity so nothing reads as permanently dimmed. Active: full opacity +
 * (desktop only) scale 1 + orange text. Inactive: opacity 0.4 + (desktop
 * only) scale 0.98. Mobile drops the scale per spec ("僅使用 opacity 與色彩切換
 * ，不做縮放").
 */
function WhyStepItem({ step, active, settled }: { step: WhyStep; active: boolean; settled: boolean }) {
  const [label, desc] = [step.title, step.desc];
  const highlighted = active || settled;
  return (
    <div
      className={`flex w-full origin-left items-start gap-3.5 transition-[opacity,transform] duration-300 ease-out md:duration-[350ms] ${
        highlighted ? "opacity-100 md:scale-100" : "opacity-40 md:scale-[0.98]"
      }`}
    >
      <div className={`h-11 w-[3px] shrink-0 rounded-[2px] transition-colors duration-300 ${highlighted ? "bg-primary-orange" : "bg-white/15"}`} aria-hidden />
      <div className="flex flex-1 flex-col gap-1">
        <p className={`font-nunito text-[14px] leading-[20px] font-bold transition-colors duration-300 ${highlighted ? "text-primary-orange" : "text-white"}`}>
          {label}
        </p>
        <p className={`font-nunito text-[13px] leading-[20px] font-normal md:text-[14px] md:leading-[22px] transition-colors duration-300 ${
          highlighted ? "text-[#d9d9d9]" : "text-grey-500"
        }`}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/**
 * 為什麼做這個專案 (Why This Project / Figma "Problem Story"), node 359:135
 * desktop / mobile 404:181. Static two-column layout (quote card left,
 * 4-item list right); mobile stacks the quote card above the list.
 *
 * Content model: reuses the `process` row — `whyIntro` (quote) and `whySteps`
 * (4× `{title, desc}`, title formatted "01 / 觀察").
 */
export function WhyThisProject({ process }: { process: Record<string, unknown> }) {
  const intro = process.whyIntro as string | undefined;
  const steps = Array.isArray(process.whySteps) ? (process.whySteps as WhyStep[]) : [];

  const listRef = useRef<HTMLDivElement>(null);
  // Margin-based trigger (not a % of the list itself) — on mobile the 4-item
  // list can be taller than the viewport, so an `amount` threshold could
  // never be satisfied and the sequential-focus animation would never start.
  const inView = useInView(listRef, { once: true, margin: "0px 0px -15% 0px" });
  const titleRef = useRef<HTMLHeadingElement>(null);
  // TextRoll has no idle/whileInView state of its own (a letter mid-flip
  // has nothing stable to revert to), so it only mounts once the title is
  // actually in view — before that an invisible twin reserves the same
  // layout space to avoid a layout jump when it swaps in.
  const titleInView = useInView(titleRef, { once: true, margin: "0px 0px -10% 0px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView || settled) return;
    if (activeIndex >= steps.length - 1) {
      const finish = setTimeout(() => setSettled(true), 1200);
      return () => clearTimeout(finish);
    }
    const timer = setTimeout(() => setActiveIndex((i) => i + 1), 1200);
    return () => clearTimeout(timer);
  }, [inView, activeIndex, steps.length, settled]);

  if (!intro || steps.length === 0) return null;

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-primary-black px-6 py-8 md:min-h-0 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-5 md:gap-10">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-white uppercase md:tracking-[1.04px]">
              Why This Project
            </span>
            <h3
              ref={titleRef}
              className="font-nunito text-[24px] leading-[34px] font-bold text-primary-orange md:text-[44px] md:leading-[56px]"
            >
              {titleInView ? (
                <TextRoll duration={0.45} getEnterDelay={(i) => i * 0.04} getExitDelay={(i) => i * 0.04 + 0.18}>
                  為什麼做這個專案？
                </TextRoll>
              ) : (
                <span className="invisible">為什麼做這個專案？</span>
              )}
            </h3>
            <div className="w-full border-t border-dashed border-white/15 md:hidden" />
          </div>
        </SlideIn>

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-12">
          <SlideIn direction="left" delay={0.15} className="w-full md:w-[458px] md:shrink-0">
            <div className="relative flex w-full flex-col gap-4 rounded-lg py-5 md:rounded-none md:py-0">
              <QuoteGlyph />
              <p className="font-nunito px-2 text-center text-[14px] leading-[21px] font-normal text-white md:px-5 md:text-[20px] md:leading-[32px] md:font-bold">
                {intro}
              </p>
              <QuoteGlyph close />
            </div>
          </SlideIn>

          <SlideIn direction="right" delay={0.2} className="flex w-full flex-1 flex-col gap-4 md:gap-5">
            <div ref={listRef} className="flex w-full flex-col gap-4 md:gap-5">
              {steps.map((step, i) => (
                <WhyStepItem key={step.title} step={step} active={inView && !settled && i === activeIndex} settled={settled} />
              ))}
            </div>
            <div className="flex w-full justify-center pt-1" aria-hidden>
              <span className="size-[5px] rounded-full bg-white/30" />
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
