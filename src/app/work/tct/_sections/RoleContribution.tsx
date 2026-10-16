"use client";

import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

const ROLE_CARDS: { key: string; label: string; icon: string }[] = [
  { key: "position", label: "我的定位", icon: "◆" },
  { key: "decision_ownership", label: "關鍵決策", icon: "●" },
];

/**
 * Section 3 -- Role & Contribution. Content model: `role` row's two fixed
 * fields (`position` / `decision_ownership`), same pair the generic
 * SectionBlock renderer already shows for every project -- here given the
 * same card treatment as Context's challenge cards instead of plain text,
 * so a solo-designer project's ownership reads as confidently as a
 * team project's multi-field breakdown.
 */
export function RoleContribution({ role }: { role: Record<string, unknown> }) {
  const entries = ROLE_CARDS.map((card) => ({
    ...card,
    text: role[card.key] as string | undefined,
  })).filter((card) => Boolean(card.text));

  if (entries.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[960px] flex-col gap-10 md:gap-12">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <SectionKicker color="blue" icon={null}>ROLE &amp; CONTRIBUTION</SectionKicker>
          <h2 className="font-nunito text-[20px] font-bold text-grey-800 md:text-[36px]">我的角色與貢獻</h2>
        </SlideIn>

        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          {entries.map((card, i) => (
            <SlideIn key={card.key} direction={i === 0 ? "left" : "right"} delay={0.1 + i * 0.08} className="flex flex-1">
              <div className="flex flex-1 flex-col gap-3 rounded-[20px] bg-grey-50 p-6 md:p-8">
                <span className="font-nunito text-[18px] text-secondary-blue" aria-hidden>
                  {card.icon}
                </span>
                <h4 className="font-nunito text-[13px] font-extrabold uppercase tracking-[0.12em] text-secondary-blue">
                  {card.label}
                </h4>
                <p className="font-nunito text-[15px] leading-[24px] font-normal text-grey-700 md:text-[16px]">
                  {card.text}
                </p>
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
