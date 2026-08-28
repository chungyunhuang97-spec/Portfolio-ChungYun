"use client";

import { SlideIn } from "@/components/design-system/SlideIn";

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
      className={`font-nunito pointer-events-none absolute text-[16px] leading-none font-bold text-white/40 md:static md:block md:text-[64px] md:leading-[0.5] md:text-white/20 ${
        close ? "right-2 bottom-2 md:self-end" : "top-2 left-2 md:top-auto md:left-auto"
      }`}
    >
      {close ? "”" : "“"}
    </span>
  );
}

/**
 * One item in the right-hand list. Figma keeps this static (no scroll
 * spotlight) — items 01–03 sit neutral (white/15% accent bar, white title,
 * grey-500 desc) while the LAST item (04 / 架構推導, the one that bridges
 * into Information Architecture) is permanently highlighted in orange, since
 * it's the transition beat into the next section.
 */
function WhyStepItem({ step, highlighted }: { step: WhyStep; highlighted: boolean }) {
  const [label, desc] = [step.title, step.desc];
  return (
    <div className="flex w-full items-start gap-3.5">
      <div className={`h-11 w-[3px] shrink-0 rounded-[2px] ${highlighted ? "bg-primary-orange" : "bg-white/15"}`} aria-hidden />
      <div className="flex flex-1 flex-col gap-1">
        <p className={`font-nunito text-[14px] leading-[20px] font-bold ${highlighted ? "text-primary-orange" : "text-white"}`}>
          {label}
        </p>
        <p className={`font-nunito text-[13px] leading-[20px] font-normal md:text-[14px] md:leading-[22px] ${highlighted ? "text-[#d9d9d9]" : "text-grey-500"}`}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/**
 * 為什麼做這個專案 (Why This Project / Figma "Problem Story"), node 359:135
 * desktop / mobile 404:181. Rebuilt against the real page-level Figma frame
 * — the actual design is a STATIC two-column layout (quote card left, 4-item
 * list right), not the scroll-linked spotlight grid the first build used.
 * Mobile stacks the quote card above the list, both full width.
 *
 * Content model: reuses the `process` row — `whyIntro` (quote) and `whySteps`
 * (4× `{title, desc}`, title formatted "01 / 觀察" — the last item is always
 * rendered as the highlighted orange one, matching Figma's fixed treatment).
 */
export function WhyThisProject({ process }: { process: Record<string, unknown> }) {
  const intro = process.whyIntro as string | undefined;
  const steps = Array.isArray(process.whySteps) ? (process.whySteps as WhyStep[]) : [];

  if (!intro || steps.length === 0) return null;

  return (
    <section className="bg-primary-black px-6 py-8 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-5 md:gap-10">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-white uppercase md:tracking-[1.04px]">
              Why This Project
            </span>
            <h3 className="font-nunito text-[24px] leading-[34px] font-bold text-primary-orange md:text-[44px] md:leading-[56px]">
              為什麼做這個專案？
            </h3>
            <div className="h-px w-full bg-white/15 md:hidden" />
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
            {steps.map((step, i) => (
              <WhyStepItem key={step.title} step={step} highlighted={i === steps.length - 1} />
            ))}
            <div className="flex w-full justify-center pt-1" aria-hidden>
              <span className="size-[5px] rounded-full bg-white/30" />
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
