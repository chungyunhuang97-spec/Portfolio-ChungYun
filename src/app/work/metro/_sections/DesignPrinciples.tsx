"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface DesignPrinciple {
  /** Same on both breakpoints in Figma -- no split needed. */
  title: string;
  /** Desktop description. */
  desc: string;
  /**
   * Mobile description -- genuinely different (shorter, sometimes a
   * different stat) copy on ALL four cards in Figma, not a trim of the
   * desktop sentence (e.g. principle 03 desktop cites "83% 潛在協助意願",
   * mobile cites "93% 調查顯示...五大顧慮" -- a different finding
   * entirely). Falls back to `desc` only as a safety net if admin content
   * is incomplete, never as the expected path.
   */
  mobileDesc?: string;
}

/**
 * Desktop accent color per card (Figma 127:740, read literally off each
 * node): 01 solid blue, 02 solid pink, 03 blue at 70% opacity (Figma's own
 * `rgba(13,33,255,0.7)` on the "03" glyph specifically -- every other glyph
 * and every accent bar is full opacity), 04 solid pink. Kept as inline
 * color values (not Tailwind color tokens) so the one translucent case is
 * representable without a one-off utility class.
 */
const DESKTOP_NUMBER_COLORS = ["#0d21ff", "#ff5bc0", "rgba(13,33,255,0.7)", "#ff5bc0"];
const DESKTOP_BAR_CLASSES = ["bg-secondary-blue", "bg-accent-pink", "bg-secondary-blue", "bg-accent-pink"];

/**
 * Mobile accent color per card (Figma 147:316, read literally off each
 * node): 01 pink, 02 blue, 03 blue, 04 pink -- NOT the same sequence as
 * desktop (same cross-breakpoint-inconsistency pattern already documented
 * on UserResearch's insight cards; reproduced as specced per breakpoint
 * rather than "corrected" to match). Mobile cards carry no accent bar at
 * all in Figma (147:324/328/151:552/151:556 each have only number/title/
 * body, no divider rectangle), so there's no mobile bar array.
 */
const MOBILE_NUMBER_CLASSES = ["text-accent-pink", "text-secondary-blue", "text-secondary-blue", "text-accent-pink"];

function SectionEyebrow() {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="size-2 rounded-[4px] bg-primary-orange md:size-[18px]" />
      <span className="font-nunito text-[12px] font-extrabold uppercase tracking-[1px] text-primary-orange md:text-[13px] md:tracking-[1px]">
        Design Principles
      </span>
    </div>
  );
}

/**
 * A small mark framing the mobile-only quote box (Figma's own decorative
 * curly-quote vectors, 151:566/567). No source SVG was available to port
 * byte-exact, so this reuses Phosphor's `Quotes` glyph -- close enough in
 * spirit to the source mark -- and deliberately mirrors a SECOND copy of
 * the SAME icon horizontally to stand in for the closing quote, since
 * Phosphor ships one quote glyph, not a matched open/close pair. This is a
 * different situation from the UserResearch mirroring bug (an accidental
 * `-scale-x-100` blindly copied from Figma's export onto content that was
 * never meant to be mirrored) -- here the mirror is a deliberate, correct
 * technique for turning one glyph into a symmetric pair.
 */
function QuoteMark({ flip = false }: { flip?: boolean }) {
  return (
    <Quotes
      size={14}
      weight="fill"
      className={`shrink-0 text-grey-500 ${flip ? "-scale-x-100" : ""}`}
      aria-hidden
    />
  );
}

/**
 * Scroll-triggered "converging" entrance -- cards travel inward from
 * alternating left/right offsets (even index from the left, odd from the
 * right) and settle at full scale, staggered by index. This is this
 * section's own take on Joe's recurring "科技感動態" request: the visual
 * of four findings converging toward center reads as a literal echo of the
 * section's own subject matter ("研究洞察收斂" -- converging research
 * insights into principles), distinct from every other section's signature
 * motion (CountUpValue/ScanReveal/PulseArrow/TechGlowBorder/PingDot/
 * ConclusionBanner). Hover lift uses its own faster spring nested in
 * `whileHover` so it doesn't inherit the slower entrance stagger delay.
 */
function ConvergeCard({
  index,
  children,
  className,
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const fromLeft = index % 2 === 0;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: fromLeft ? -28 : 28, scale: 0.94 }}
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 120, damping: 16, delay: 0.1 + index * 0.08 },
      }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The desktop accent bar grows in from zero width after its card has
 * mostly landed -- reads as each principle "registering" once it arrives,
 * completing the converge-then-lock-in motion. Desktop only; mobile cards
 * have no accent bar per Figma (see MOBILE_NUMBER_CLASSES doc comment).
 */
function BarGrow({ delay, colorClass }: { delay: number; colorClass: string }) {
  return (
    <motion.span
      aria-hidden
      className={`h-[3px] w-8 origin-left rounded-full ${colorClass}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    />
  );
}

/**
 * 研究洞察收斂與設計原則 (Design Principles), Figma desktop node 127:740 /
 * mobile node 147:316 -- both confirmed by frame name via get_metadata
 * before implementing (name "DesignPrinciples" on both), slotted in
 * immediately after UserResearch, continuing Figma's page order.
 *
 * Content model: reuses the `process` row (checked against every existing
 * top-level key first -- `designPrinciples*` prefix is clean, no
 * collisions). Fields: `designPrinciplesIntro` (desktop's full intro
 * sentence), `designPrinciplesMobileIntro` (optional, falls back to
 * `designPrinciplesIntro` -- mobile's Figma copy is genuinely just the
 * back half of the same sentence, rendered inside a quote-styled box
 * rather than a plain paragraph), `designPrinciplesItems` (the 4 principle
 * cards, each with `title`/`desc`/optional `mobileDesc`). Accent colors
 * and the accent-bar presence/absence are fixed presentational structure
 * (see constants above), not admin-editable CMS fields, matching every
 * prior section's "fixed by index" precedent. No media fields, no static
 * illustration assets -- like CompetitiveAnalysis, this is a plain
 * data-driven card grid.
 *
 * Layout: both breakpoints are `min-h-screen` + vertical centering,
 * continuing the 100vh-per-slide treatment introduced with UserResearch
 * (not the pre-existing sections before it).
 *
 * Tech-feel motion: `ConvergeCard` (this section's signature -- alternating
 * left/right entrance converging to center, echoing "收斂" literally) plus
 * `BarGrow` (desktop accent bar animates its width in after the card
 * lands) and a per-card hover lift.
 */
export function DesignPrinciples({ process }: { process: Record<string, unknown> }) {
  const intro = typeof process.designPrinciplesIntro === "string" ? process.designPrinciplesIntro : "";
  const mobileIntro =
    typeof process.designPrinciplesMobileIntro === "string" ? process.designPrinciplesMobileIntro : intro;
  const items = Array.isArray(process.designPrinciplesItems)
    ? (process.designPrinciplesItems as DesignPrinciple[])
    : [];

  if (items.length < 4) return null;

  return (
    <section className="relative bg-proj-white">
      {/* Mobile layout */}
      <div className="flex min-h-screen w-full flex-col justify-center gap-8 px-6 py-12 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              研究洞察收斂與設計原則
            </h2>
            <div className="h-px w-full bg-[#e5e0db]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex w-full items-start gap-1 rounded-lg bg-grey-50 px-5 py-3">
            <QuoteMark />
            <p className="flex-1 text-center font-nunito text-[14px] leading-[21px] font-normal text-grey-800">
              {mobileIntro}
            </p>
            <QuoteMark flip />
          </div>
        </SlideIn>

        <div className="grid grid-cols-2 gap-4">
          {items.slice(0, 4).map((item, i) => (
            <ConvergeCard
              key={item.title}
              index={i}
              className="flex flex-col gap-3 rounded-2xl bg-grey-50 p-5"
            >
              <span
                className={`font-fredoka text-[24px] leading-none ${MOBILE_NUMBER_CLASSES[i]}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-nunito text-[16px] leading-[24px] font-bold text-primary-black">{item.title}</p>
              <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-800">
                {item.mobileDesc ?? item.desc}
              </p>
            </ConvergeCard>
          ))}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden min-h-screen w-full flex-col justify-center gap-10 px-[120px] py-[80px] md:flex">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[40px] leading-[52px] font-bold text-primary-black">
              研究洞察收斂與設計原則
            </h2>
            <p className="font-nunito text-[16px] leading-[26px] font-normal text-grey-600">{intro}</p>
          </div>
        </SlideIn>

        <div className="h-px w-full bg-[#e5e0db]" />

        <div className="flex w-full items-stretch gap-6">
          {items.slice(0, 4).map((item, i) => (
            <ConvergeCard
              key={item.title}
              index={i}
              className="flex min-w-[260px] flex-1 flex-col gap-4 rounded-2xl bg-[#f7f5f3] p-7 shadow-[0px_8px_24px_-4px_rgba(64,50,42,0.06),0px_1px_3px_0px_rgba(64,50,42,0.04)]"
            >
              <span
                className="font-fredoka text-[28px] leading-[28px]"
                style={{ color: DESKTOP_NUMBER_COLORS[i] }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <BarGrow delay={0.3 + i * 0.08} colorClass={DESKTOP_BAR_CLASSES[i]} />
              <p className="font-nunito text-[18px] leading-[24px] font-bold text-primary-black">{item.title}</p>
              <p className="flex-1 font-nunito text-[14px] leading-[22px] font-normal text-grey-700">
                {item.desc}
              </p>
            </ConvergeCard>
          ))}
        </div>
      </div>
    </section>
  );
}
