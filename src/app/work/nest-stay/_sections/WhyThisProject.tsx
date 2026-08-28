"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface WhyStep {
  title: string;
  desc: string;
}

/**
 * Hook returning whether the viewport is at/above the site's single
 * "desktop" breakpoint (md: / 768px) -- matches the two-breakpoint
 * convention used everywhere else in this codebase (mobile vs. `md:`),
 * needed here because the spec's "no scale on mobile" rule has to be
 * applied to a framer-motion animate VALUE, not just a Tailwind class.
 * Defaults to false (mobile-first) to avoid an SSR/client flash.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

/**
 * One step in the "四步驟漸進聚焦" (four-step progressive focus) sequence.
 * Scroll-linked per the interaction spec: each step becomes "in focus"
 * (opacity 1 / scale 1 / orange accent) once it crosses 55% of the
 * viewport, and fades back to the inactive state (opacity 0.4 / scale
 * 0.98) once it's no longer the current one -- `useInView`'s `amount: 0.55`
 * with `once: false` gives exactly that live toggle as the user scrolls.
 * The LAST step additionally locks every step to the settled "opacity 1,
 * no scale, no color" end-state once it's been seen ("完成後所有 4 個步驟都
 * 回復 opacity 1" — the settle is owned by the parent via `isLast` +
 * `onSettle`, see WhyThisProject below). Mobile drops the scale transform
 * entirely (opacity/color only), per spec.
 */
function WhyStepItem({
  step,
  index,
  settled,
  onSettle,
  isLast,
}: {
  step: WhyStep;
  index: number;
  settled: boolean;
  onSettle: () => void;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (isLast && inView) onSettle();
  }, [isLast, inView, onSettle]);

  const active = settled || inView;

  return (
    <motion.div
      ref={ref}
      animate={{
        opacity: active ? 1 : 0.4,
        scale: !isDesktop || settled ? 1 : active ? 1 : 0.98,
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex w-full flex-col gap-2 rounded-2xl border border-grey-100 bg-proj-white p-6 md:p-8"
    >
      <p
        className={`font-fredoka text-[32px] leading-[32px] transition-colors duration-300 md:text-[44px] md:leading-[44px] ${
          active && !settled ? "text-primary-orange" : "text-grey-300"
        }`}
      >
        {step.title.split(" / ")[0]}
      </p>
      <p className="font-nunito text-[18px] font-bold text-primary-black md:text-[22px]">
        {step.title.split(" / ")[1] ?? step.title}
      </p>
      <p className="font-nunito text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
        {step.desc}
      </p>
      <span className="font-nunito text-[11px] font-bold tracking-[2px] text-grey-300">
        STEP {String(index + 1).padStart(2, "0")}
      </span>
    </motion.div>
  );
}

/**
 * 為什麼做這個專案 (Why This Project), Figma desktop node 275:87's process
 * block / mobile 404:147 (identical copy on both breakpoints per Figma —
 * confirmed via get_screenshot on both, no split needed). Content model:
 * reuses the `process` row (same row every subsequent section piles onto,
 * matching this project's own `process`-row convention) -- `whyIntro` (the
 * opening quote line) and `whySteps` (the 4-item 觀察/假設/驗證/架構推導
 * sequence, `{title, desc}` each, title formatted "01 / 觀察").
 *
 * Motion: implements the interaction spec's "四步驟漸進聚焦" as a scroll-linked
 * spotlight (see WhyStepItem doc comment) rather than the spec's alternative
 * auto-timer option -- scroll-linked matches this site's existing motion
 * language (every other section is scroll-triggered, nothing here is
 * pinned/auto-playing), and reads naturally as the user scrolls down a
 * vertically-stacked list of 4 cards.
 */
export function WhyThisProject({ process }: { process: Record<string, unknown> }) {
  const intro = process.whyIntro as string | undefined;
  const steps = Array.isArray(process.whySteps) ? (process.whySteps as WhyStep[]) : [];
  const [settled, setSettled] = useState(false);

  if (!intro || steps.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3 text-center">
            <span className="font-nunito mx-auto text-[13px] font-extrabold tracking-[2px] text-primary-orange uppercase">
              Why This Project
            </span>
            <p className="font-nunito mx-auto max-w-[720px] text-[18px] leading-[28px] font-bold text-primary-black md:text-[24px] md:leading-[36px]">
              「{intro}」
            </p>
          </div>
        </SlideIn>

        <div className="flex flex-col gap-4 md:gap-6">
          {steps.map((step, i) => (
            <WhyStepItem
              key={step.title}
              step={step}
              index={i}
              settled={settled}
              isLast={i === steps.length - 1}
              onSettle={() => setSettled(true)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
