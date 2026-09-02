"use client";

import { useState } from "react";
import { Buildings, Users } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface ContextCard {
  eyebrowLabel: string;
  title: string;
  subheading: string;
  painLabel: string;
  pain: string;
  actionLabel: string;
  action: string;
}

const CARD_ICONS = [Buildings, Users];

/** Local eyebrow-with-icon label -- every section on this page hand-rolls
 * its own small kicker rather than reusing the unused `SectionKicker`
 * (neither Nest Stay nor Metro use it), matching the established
 * convention. */
function CardEyebrow({ icon: Icon, label }: { icon: typeof Buildings; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-secondary-blue/10">
        <Icon size={12} weight="bold" className="text-secondary-blue" />
      </span>
      <span className="font-nunito text-[11px] font-extrabold tracking-[0.66px] text-secondary-blue uppercase">
        {label}
      </span>
    </div>
  );
}

function ContextCardView({ card, index }: { card: ContextCard; index: number }) {
  const Icon = CARD_ICONS[index] ?? Buildings;
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-grey-100 bg-proj-white p-6 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:p-7">
      <CardEyebrow icon={Icon} label={card.eyebrowLabel} />
      <div className="flex flex-col gap-1">
        <h4 className="font-nunito text-[18px] font-bold text-primary-black md:text-[22px]">{card.title}</h4>
        <p className="font-nunito text-[13px] font-normal text-grey-600 md:text-[14px]">{card.subheading}</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-xl bg-grey-50 p-3.5">
          <span className="font-nunito text-[11px] font-extrabold tracking-[0.6px] text-grey-500 uppercase">
            {card.painLabel}
          </span>
          <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-700 md:text-[14px] md:leading-[22px]">
            {card.pain}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-secondary-blue/[0.06] p-3.5">
          <span className="font-nunito text-[11px] font-extrabold tracking-[0.6px] text-secondary-blue uppercase">
            {card.actionLabel}
          </span>
          <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-800 md:text-[14px] md:leading-[22px]">
            {card.action}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Mobile pagination dots, copied verbatim from Nest Stay's
 * `CarouselMediaPair` pattern (UIFlow.tsx) but recolored to
 * `bg-secondary-blue` for the active dot, since blue is piiluu's own
 * dominant accent rather than Nest Stay's orange. */
function PaginationDots({ count, active, onChange }: { count: number; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="切換挑戰卡片">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          onClick={() => onChange(i)}
          className={`h-[10px] rounded-full transition-all duration-300 ${
            i === active ? "w-7 bg-secondary-blue" : "w-[10px] bg-grey-300"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Context section ("從落地到迭代" / "打造易於維護與優化的金融產品"), Figma fileKey
 * 8qGUSDUJqOgJaSERffGXVc, desktop 473:185 / mobile 542:190. Content model:
 * `process` row -- `contextHeadingLine1`, `contextHeadingLine2`,
 * `contextIntro`, `contextCards` (2x {eyebrowLabel, title, subheading,
 * painLabel, pain, actionLabel, action}). Desktop: two cards side by side.
 * Mobile: stacked with pagination dots (per Figma) -- only the active card
 * mounts on mobile, matching the dot-controlled single-card-at-a-time
 * pattern established by Nest Stay's CarouselMediaPair.
 */
export function Context({ process }: { process: Record<string, unknown> }) {
  const headingLine1 = process.contextHeadingLine1 as string | undefined;
  const headingLine2 = process.contextHeadingLine2 as string | undefined;
  const intro = process.contextIntro as string | undefined;
  const cards = Array.isArray(process.contextCards) ? (process.contextCards as ContextCard[]) : [];
  const [active, setActive] = useState(0);

  if (cards.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-secondary-blue uppercase">
              Context
            </span>
            {(headingLine1 || headingLine2) && (
              <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
                {headingLine1}
                {headingLine1 && headingLine2 && <br />}
                {headingLine2}
              </h3>
            )}
            {intro && (
              <p className="font-nunito max-w-[680px] text-[14px] leading-[22px] font-normal text-grey-600 md:max-w-[720px] md:text-[18px] md:leading-[25px]">
                {intro}
              </p>
            )}
            <div className="w-full border-t border-dashed border-[#e0e0e0]" />
          </div>
        </SlideIn>

        {/* Mobile -- one card at a time, dot pagination */}
        <div className="flex flex-col gap-5 md:hidden">
          <SlideIn delay={0.15}>
            <ContextCardView card={cards[active]} index={active} />
          </SlideIn>
          {cards.length > 1 && <PaginationDots count={cards.length} active={active} onChange={setActive} />}
        </div>

        {/* Desktop -- side by side */}
        <div className="hidden gap-6 md:flex">
          {cards.map((card, i) => (
            <SlideIn key={card.title} direction={i === 0 ? "left" : "right"} delay={0.15 + i * 0.08} className="flex flex-1">
              <ContextCardView card={card} index={i} />
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
