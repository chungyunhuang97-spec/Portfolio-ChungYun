"use client";

import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * 過渡卡 — a one-line narrative bridge between two video sections (e.g.
 * frontend → instructor dashboard). Deliberately minimal: a full-width band
 * in the page's muted background with centered text, no card chrome, so it
 * reads as a beat in the story rather than another content section.
 */
export function YangbeiTransitionCard({ text }: { text: string }) {
  return (
    <section className="flex items-center justify-center bg-grey-50 px-6 py-14 md:px-[120px] md:py-20">
      <SlideIn delay={0.05}>
        <p className="font-nunito max-w-[640px] text-center text-[18px] leading-[28px] font-bold text-primary-black md:text-[26px] md:leading-[38px]">
          {text}
        </p>
      </SlideIn>
    </section>
  );
}
