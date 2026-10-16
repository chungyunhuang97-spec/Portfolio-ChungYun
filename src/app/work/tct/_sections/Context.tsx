"use client";

import type { SVGProps } from "react";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

interface ChallengeItem {
  title: string;
  desc: string;
}

/** Hand-drawn torn-paper mark -- stands in for "資料不完整" (incomplete
 * historical material). Thin stroked doodle, matching the hand-drawn
 * aesthetic of components/design-system/doodles.tsx without duplicating
 * any shape already defined there. */
function DoodleTornPaper(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 6h20l8 9-3 7 4 6-5 6 2 8H12l-4-7 3-6-5-6 4-8z" />
      <path d="M18 18l3 4-2 4 3 5" strokeDasharray="1 4" />
    </svg>
  );
}

/** Enlarged-target mark -- stands in for "放大點擊熱區" (oversized touch
 * targets for elder visitors). A dashed outer ring around a solid inner
 * dot, read as "the tappable zone is bigger than it looks". */
function DoodleEnlargedTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <circle cx="24" cy="24" r="18" strokeDasharray="3 5" />
      <circle cx="24" cy="24" r="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

// DATA stays orange and UX stays blue even now that the page's own
// dominant accent is blue -- same two-tone split Piiluu's own Context
// cards use (card 1 orange, card 2 blue), kept here so the two challenge
// cards still read as visually distinct from each other rather than both
// collapsing into the same color now that "blue" is this page's dominant.
const CHALLENGE_THEME = [
  { icon: DoodleTornPaper, label: "DATA", accent: "text-primary-orange", iconBg: "bg-primary-orange/10" },
  { icon: DoodleEnlargedTarget, label: "UX", accent: "text-secondary-blue", iconBg: "bg-secondary-blue/10" },
];

function ChallengeCard({ item, theme, index }: { item: ChallengeItem; theme: (typeof CHALLENGE_THEME)[number]; index: number }) {
  const Icon = theme.icon;
  return (
    <SlideIn direction={index === 0 ? "left" : "right"} delay={0.1 + index * 0.08} className="flex flex-1">
      <div className="flex flex-1 flex-col gap-4 rounded-[20px] border border-grey-100 bg-proj-white p-6 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] transition-transform hover:-translate-y-1 md:p-8">
        <div className={`flex size-11 items-center justify-center rounded-[14px] ${theme.iconBg} ${theme.accent}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className={`font-nunito text-[11px] font-extrabold uppercase tracking-[0.1em] ${theme.accent}`}>
            {theme.label}
          </p>
          <h4 className="font-nunito mt-1 text-[18px] font-bold leading-6 text-grey-800 md:text-[20px]">
            {item.title}
          </h4>
        </div>
        <p className="font-nunito text-[14px] leading-[22px] font-normal text-grey-600 md:text-[15px]">
          {item.desc}
        </p>
      </div>
    </SlideIn>
  );
}

/**
 * Section 2 -- Context. Merges the `overview` row's narrative paragraph
 * with the `challenge` row's constraint statement + two challenge cards
 * (資料完整性 / 觸控體驗與閱讀性). Section bg is grey-50, matching the
 * grey/white alternation every other project page's non-Hero sections use.
 */
export function Context({
  overview,
  challenge,
}: {
  overview: Record<string, unknown>;
  challenge: Record<string, unknown>;
}) {
  const intro = overview.text as string | undefined;
  const note = challenge.note as string | undefined;
  const items = Array.isArray(challenge.items) ? (challenge.items as ChallengeItem[]) : [];

  if (!intro && items.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[960px] flex-col items-center gap-10 md:gap-14">
        <SlideIn className="flex w-full flex-col items-center gap-4 text-center">
          <SectionKicker color="blue">CONTEXT</SectionKicker>
          <h2 className="font-display text-[24px] font-bold text-grey-800 md:text-[32px]">專案背景與挑戰</h2>
          {intro && (
            <p className="font-nunito max-w-[70ch] text-[16px] leading-[26px] font-normal text-grey-700 md:text-[20px] md:leading-[32px]">
              {intro}
            </p>
          )}
          {note && (
            <div className="mt-2 w-full rounded-[14px] border border-secondary-blue/30 bg-secondary-blue/5 px-5 py-4 md:px-6">
              <p className="font-nunito text-[14px] font-bold leading-[22px] text-grey-800 md:text-[15px]">
                {note}
              </p>
            </div>
          )}
        </SlideIn>

        {items.length > 0 && (
          <div className="flex w-full flex-col gap-5 md:flex-row md:gap-6">
            {items.map((item, i) => (
              <ChallengeCard key={item.title} item={item} theme={CHALLENGE_THEME[i] ?? CHALLENGE_THEME[0]} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
