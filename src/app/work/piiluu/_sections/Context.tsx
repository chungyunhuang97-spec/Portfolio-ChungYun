"use client";

import { useState } from "react";
import Image from "next/image";
import { SlideIn } from "@/components/design-system/SlideIn";

interface ContextCard {
  eyebrowLabel: string;
  title: string;
  /** Colored pill subheading, e.g. "從 Photoshop 到 Figma 的轉型陣痛期". */
  subheading: string;
  painLabel: string;
  pain: string;
  actionLabel: string;
  action: string;
}

/** Card 1 (內部協作挑戰) is orange-themed, card 2 (市場與體驗挑戰) is
 * blue-themed -- an intentional per-card split in Figma (not a uniform
 * "one dominant color" rule), matched exactly rather than simplified. */
const CARD_THEME = [
  { eyebrowText: "text-primary-orange", pillBg: "bg-primary-orange", actionBorder: "border-primary-orange", actionLabel: "text-primary-orange", icon: "/work/piiluu/context/icon-collab.svg", actionIcon: "/work/piiluu/context/icon-action-orange.svg" },
  { eyebrowText: "text-[#666]", pillBg: "bg-secondary-blue", actionBorder: "border-secondary-blue", actionLabel: "text-secondary-blue", icon: "/work/piiluu/context/icon-market.svg", actionIcon: "/work/piiluu/context/icon-action-blue.svg" },
];
const PAIN_ICONS = ["/work/piiluu/context/icon-pain.svg", "/work/piiluu/context/icon-background.svg"];

function CardEyebrow({ icon, label, colorClass }: { icon: string; label: string; colorClass: string }) {
  return (
    <div className="flex items-center gap-1 rounded-[6px] bg-grey-50 px-2 py-1">
      <Image src={icon} alt="" width={10} height={10} className="size-[10px]" />
      <span className={`font-nunito text-[12px] font-extrabold uppercase ${colorClass}`}>{label}</span>
    </div>
  );
}

/** Desktop shows both the pain and action boxes at once, side by side in
 * one column. Mobile shows only one at a time, switched by the card's own
 * pagination dots (see MobileCard below) -- matches Figma's two distinct
 * layouts exactly rather than reusing one responsive tree. */
function DesktopCard({ card, theme, painIcon }: { card: ContextCard; theme: (typeof CARD_THEME)[number]; painIcon: string }) {
  return (
    <div className="flex flex-1 flex-col gap-3.5 rounded-[17px] border border-[#eaeaea] bg-white p-5 drop-shadow-[0px_7px_11px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col items-center gap-1 text-center">
        <CardEyebrow icon={theme.icon} label={card.eyebrowLabel} colorClass={theme.eyebrowText} />
        <h4 className="font-nunito pt-1.5 text-[22px] font-bold leading-[31px] text-[#1a1a1a]">{card.title}</h4>
      </div>
      <div className={`flex w-full items-center justify-center rounded-[20px] px-4 py-1 ${theme.pillBg}`}>
        <span className="font-nunito text-[13px] font-bold text-white">{card.subheading}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-1 flex-col justify-center gap-1 rounded-[11px] border border-[#f0f0f0] bg-grey-50 p-3">
          <div className="flex items-center gap-1">
            <Image src={painIcon} alt="" width={10} height={10} className="size-[10px]" />
            <span className="font-nunito text-[12px] font-extrabold text-[#1a1a1a]">{card.painLabel}</span>
          </div>
          <p className="font-nunito text-[13px] leading-[20px] font-normal text-[#666]">{card.pain}</p>
        </div>
        <div className={`flex flex-1 flex-col justify-center gap-1 rounded-[11px] border bg-white p-3 ${theme.actionBorder}`}>
          <div className="flex items-center gap-1">
            <Image src={theme.actionIcon} alt="" width={10} height={10} className="size-[10px]" />
            <span className={`font-nunito text-[12px] font-extrabold ${theme.actionLabel}`}>{card.actionLabel}</span>
          </div>
          <p className="font-nunito text-[13px] leading-[18px] font-bold text-[#1a1a1a]">{card.action}</p>
        </div>
      </div>
    </div>
  );
}

function MobileCard({ card, theme, painIcon }: { card: ContextCard; theme: (typeof CARD_THEME)[number]; painIcon: string }) {
  const [active, setActive] = useState(0);
  const showPain = active === 0;
  return (
    <div className="flex h-[273px] w-full flex-col items-center justify-center gap-3 rounded-[17px] border border-[#eaeaea] bg-white p-5 drop-shadow-[0px_7px_11px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col items-center gap-1">
        <CardEyebrow icon={theme.icon} label={card.eyebrowLabel} colorClass={theme.eyebrowText} />
        <h4 className="font-nunito text-[16px] font-semibold leading-6 text-[#1a1a1a]">{card.title}</h4>
      </div>
      <div className={`flex w-full items-center justify-center rounded-[20px] px-4 py-1 ${theme.pillBg}`}>
        <span className="font-nunito text-[13px] font-bold text-white">{card.subheading}</span>
      </div>
      {showPain ? (
        <div className="flex h-[86px] w-full flex-col items-center justify-center gap-1 rounded-[11px] border border-[#f0f0f0] bg-grey-50 px-3 py-2">
          <div className="flex items-center gap-1">
            <Image src={painIcon} alt="" width={10} height={10} className="size-[10px]" />
            <span className="font-nunito text-[12px] font-extrabold text-[#1a1a1a]">{card.painLabel}</span>
          </div>
          <p className="font-nunito text-center text-[13px] leading-[20px] font-normal text-[#666]">{card.pain}</p>
        </div>
      ) : (
        <div className="flex h-[86px] w-full flex-col items-center justify-center gap-1 rounded-[11px] bg-grey-50 px-3 py-2">
          <div className="flex items-center gap-1">
            <Image src={theme.actionIcon} alt="" width={10} height={10} className="size-[10px]" />
            <span className={`font-nunito text-[12px] font-extrabold ${theme.actionLabel}`}>{card.actionLabel}</span>
          </div>
          <p className="font-nunito text-center text-[13px] leading-[20px] font-normal text-[#1a1a1a]">{card.action}</p>
        </div>
      )}
      <div className="flex items-center gap-2 px-3 py-2" role="tablist" aria-label={`切換${card.title}內容`}>
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={`h-[10px] rounded-[5px] transition-all duration-300 ${
              active === i ? "w-7 bg-primary-orange" : "w-[10px] bg-[#b3b3b3]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Context section ("從落地到迭代" / "打造易於維護與優化的金融產品"), Figma fileKey
 * 8qGUSDUJqOgJaSERffGXVc, desktop node 515:424 / mobile node 542:236.
 * Section bg is grey-50 (#F5F5F5) at both breakpoints -- not white.
 *
 * Desktop: plain intro paragraph under the heading, both cards' pain+action
 * boxes shown at once, side by side. Mobile: intro wrapped in a bordered
 * quote-mark card instead, and each card shows only ONE of pain/action at a
 * time, switched by that card's own pagination dots -- two genuinely
 * different layouts per Figma, not one responsive tree.
 *
 * Content model: `process.contextHeadingLine1` (small, black), `.
 * contextHeadingLine2` (large, blue), `contextIntro`, `contextCards` (2x
 * {eyebrowLabel, title, subheading, painLabel, pain, actionLabel, action}).
 */
export function Context({ process }: { process: Record<string, unknown> }) {
  const headingLine1 = process.contextHeadingLine1 as string | undefined;
  const headingLine2 = process.contextHeadingLine2 as string | undefined;
  const intro = process.contextIntro as string | undefined;
  const cards = Array.isArray(process.contextCards) ? (process.contextCards as ContextCard[]) : [];

  if (cards.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-12 md:px-[200px] md:py-[72px]">
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <SlideIn delay={0.1} className="w-full">
          <div className="flex flex-col items-center gap-3 text-center md:gap-4">
            <span className="font-nunito text-[14px] font-extrabold text-primary-orange">CONTEXT</span>
            <div className="flex flex-col items-center gap-2 md:gap-2">
              {headingLine1 && (
                <p className="font-nunito text-[16px] font-semibold leading-6 text-black md:text-[32px] md:font-bold md:leading-[48px]">
                  {headingLine1}
                </p>
              )}
              {headingLine2 && (
                <p className="font-nunito text-[24px] font-bold leading-9 text-secondary-blue md:text-[48px] md:leading-[72px]">
                  {headingLine2}
                </p>
              )}
            </div>

            {/* Desktop -- plain intro paragraph, then a divider line */}
            {intro && (
              <p className="hidden font-nunito text-[18px] leading-[25px] font-normal text-[#666] md:block">
                {intro}
              </p>
            )}
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        {/* Mobile -- intro in a bordered quote card, below the divider */}
        {intro && (
          <SlideIn delay={0.12} className="w-full md:hidden">
            <div className="relative flex w-full items-center rounded-[8px] border border-[#e6e6e6] bg-white px-5 py-3">
              <Image src="/work/piiluu/context/quote-open.svg" alt="" width={12} height={9} className="absolute left-[5px] top-[11px]" />
              <p className="w-full text-center font-nunito text-[16px] leading-6 font-normal text-[#666]">{intro}</p>
              <Image src="/work/piiluu/context/quote-close.svg" alt="" width={12} height={9} className="absolute right-[5px] top-[11px]" />
            </div>
          </SlideIn>
        )}

        {/* Mobile -- both cards stacked, each with its own pain/action toggle */}
        <div className="flex w-full flex-col gap-6 md:hidden">
          {cards.map((card, i) => (
            <SlideIn key={card.title} delay={0.15 + i * 0.08}>
              <MobileCard card={card} theme={CARD_THEME[i] ?? CARD_THEME[0]} painIcon={PAIN_ICONS[i] ?? PAIN_ICONS[0]} />
            </SlideIn>
          ))}
        </div>

        {/* Desktop -- side by side, both pain+action boxes visible */}
        <div className="hidden w-full gap-6 md:flex">
          {cards.map((card, i) => (
            <SlideIn key={card.title} direction={i === 0 ? "left" : "right"} delay={0.15 + i * 0.08} className="flex flex-1">
              <DesktopCard card={card} theme={CARD_THEME[i] ?? CARD_THEME[0]} painIcon={PAIN_ICONS[i] ?? PAIN_ICONS[0]} />
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
