"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChartBar, ArrowRight, Users, DeviceMobile } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface MarketTrend {
  title: string;
  before: string;
  after: string;
}

interface MarketPersona {
  name: string;
  desc: string;
}

interface MarketMobileCard {
  number: string;
  title: string;
  desc: string;
}

/**
 * The four persona illustrations (行動不便者/高齡者/孕婦/視障者) and the iOS
 * accessibility-icon-row image are Joe-supplied reference artwork for this
 * exact section (Figma 127:530/535/540/545 + 127:554) -- same treatment as
 * IaRestructuring's POINT_ICONS / IA_DIAGRAMS: fixed /public assets, not
 * admin-configurable per persona (see that file's doc comment rationale).
 * Filenames are the original Figma export names Joe supplied (Rectangle_213
 * etc.) -- kept as-is rather than renamed on upload, mapped to persona
 * meaning by array order below (matches PERSONA order in `marketPersonas`:
 * 行動不便者/高齡者/孕婦/視障者).
 */
const PERSONA_ICONS = [
  "/work/metro/market-research/Rectangle_213.png", // 行動不便者
  "/work/metro/market-research/Rectangle_2131.png", // 高齡者
  "/work/metro/market-research/Rectangle_214.png", // 孕婦
  "/work/metro/market-research/Rectangle_2132.png", // 視障者
];
const OS_INSIGHT_IMAGE = "/work/metro/market-research/Image_os_Huang_Chung_Yun.png";

/** Alternating card background per persona row, per Figma (grey-50 / blue-tint). */
const PERSONA_BG = ["bg-grey-50", "bg-[#f2f5fe]", "bg-grey-50", "bg-[#f2f5fe]"];

/** Fixed accent color + icon per mobile numbered card, per Figma (147:251). */
const MOBILE_CARD_META = [
  { accent: "bg-primary-orange", text: "text-primary-orange", Icon: ArrowRight },
  { accent: "bg-secondary-blue", text: "text-secondary-blue", Icon: Users },
  { accent: "bg-accent-pink", text: "text-accent-pink", Icon: DeviceMobile },
];

/**
 * One-time CRT-style scanline sweep on viewport entry -- same technique
 * reused across every section (StrategyBeforeApp / IaRestructuring /
 * CompetitiveAnalysis), duplicated here per the per-section-file convention.
 */
function ScanReveal({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-proj-white/70 to-transparent"
      initial={{ y: "-100%", opacity: 1 }}
      whileInView={{ y: "120%", opacity: [1, 1, 0] }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay, ease: "easeIn" }}
    />
  );
}

/**
 * Small looping nudge on the before→after arrow -- this section's own
 * tech-feel signature (distinct from ScanReveal reused above), reads as
 * "trend in motion" which fits the 產業趨勢 subject matter well.
 */
function TrendArrow() {
  return (
    <motion.span
      className="flex shrink-0 items-center justify-center"
      animate={{ x: [0, 4, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <ArrowRight size={16} weight="bold" className="text-grey-500" />
    </motion.span>
  );
}

function SectionEyebrow() {
  return (
    <div className="flex items-center gap-2">
      <ChartBar size={18} weight="bold" className="text-primary-orange" />
      <span className="font-nunito text-[13px] font-extrabold text-primary-orange">Market Research</span>
    </div>
  );
}

function TrendCard({ trends }: { trends: MarketTrend[] }) {
  return (
    <SlideIn
      delay={0.15}
      className="relative flex min-h-[400px] flex-1 flex-col items-center gap-3 overflow-hidden rounded-2xl bg-proj-white p-4 shadow-[0_8px_12px_rgba(64,50,42,0.06),0_1px_1.5px_rgba(64,50,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_32px_rgba(64,50,42,0.14),0_2px_6px_rgba(64,50,42,0.06)]"
    >
      <ScanReveal delay={0.1} />
      <span className="h-1 w-full shrink-0 rounded-full bg-primary-orange" aria-hidden />
      <h3 className="font-nunito text-[24px] font-bold text-primary-orange">產業趨勢</h3>
      <div className="flex flex-1 flex-col justify-center">
        {trends.map((t, i) => (
          <div
            key={t.title}
            className={`flex flex-col items-center gap-3 py-4 ${i < trends.length - 1 ? "border-b border-grey-50" : ""}`}
          >
            <p className="font-nunito text-center text-[15px] font-bold text-grey-700">{t.title}</p>
            <div className="flex w-full items-center gap-3">
              <span className="flex-1 rounded-full bg-grey-50 px-3 py-1.5 text-center">
                <span className="font-nunito text-[13px] font-semibold text-grey-800">{t.before}</span>
              </span>
              <TrendArrow />
              <span className="flex-1 rounded-full bg-primary-orange px-3 py-1.5 text-center">
                <span className="font-nunito text-[13px] font-semibold text-proj-white">{t.after}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </SlideIn>
  );
}

function PersonaCard({ personas }: { personas: MarketPersona[] }) {
  return (
    <SlideIn
      delay={0.22}
      className="relative flex min-h-[400px] flex-1 flex-col items-center gap-3 overflow-hidden rounded-2xl bg-proj-white p-4 shadow-[0_8px_12px_rgba(64,50,42,0.06),0_1px_1.5px_rgba(64,50,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_32px_rgba(64,50,42,0.14),0_2px_6px_rgba(64,50,42,0.06)]"
    >
      <ScanReveal delay={0.16} />
      <span className="h-1 w-full shrink-0 rounded-full bg-secondary-blue" aria-hidden />
      <div className="flex flex-col items-center">
        <h3 className="font-nunito text-[24px] font-bold text-secondary-blue">使用者需求</h3>
        <p className="font-nunito text-[14px] font-normal text-grey-700">不同弱勢族群面臨的搭乘挑戰</p>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {personas.map((p, i) => (
          <div key={p.name} className={`flex flex-1 items-start gap-3 rounded-lg p-3 ${PERSONA_BG[i % PERSONA_BG.length]}`}>
            {/*
              No overflow-hidden/rounded-full here -- Figma's spec is a plain
              unrounded 45x45 image box; a circular crop clipped these
              portrait-oriented character illustrations (flagged by Joe as a
              desktop discrepancy vs. the Figma reference on 2026-08-18).
              object-contain (not object-cover) keeps the whole illustration
              visible within the box instead of cropping to fill it.
            */}
            <span className="relative size-[45px] shrink-0">
              <Image src={PERSONA_ICONS[i % PERSONA_ICONS.length]} alt="" fill sizes="45px" className="object-contain" />
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <p className="font-nunito text-[14px] font-bold text-primary-black">{p.name}</p>
              <p className="font-nunito text-[13px] leading-[18px] font-normal text-grey-700">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideIn>
  );
}

function SystemInsightCard({ insight }: { insight: string }) {
  return (
    <SlideIn
      delay={0.29}
      className="relative flex min-h-[400px] flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-proj-white p-4 shadow-[0_8px_12px_rgba(64,50,42,0.06),0_1px_1.5px_rgba(64,50,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_32px_rgba(64,50,42,0.14),0_2px_6px_rgba(64,50,42,0.06)]"
    >
      <ScanReveal delay={0.22} />
      <span className="h-1 w-full shrink-0 rounded-full bg-accent-pink" aria-hidden />
      <div className="flex flex-col items-center">
        <h3 className="font-nunito text-[24px] font-bold text-accent-pink">系統支援洞察</h3>
        <p className="font-nunito text-center text-[14px] leading-[21px] font-normal text-grey-700">{insight}</p>
      </div>
      {/* Slow continuous float on the static iOS screenshot -- keeps this card visually alive rather than a flat pinned image, echoing the motion added to the other two cards. */}
      <motion.span
        className="relative h-[254px] w-full shrink-0"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src={OS_INSIGHT_IMAGE} alt="iOS 無障礙功能支援" fill sizes="400px" className="object-contain" />
      </motion.span>
    </SlideIn>
  );
}

function MobileCard({ index, card }: { index: number; card: MarketMobileCard }) {
  const meta = MOBILE_CARD_META[index % MOBILE_CARD_META.length];
  const Icon = meta.Icon;
  return (
    <SlideIn
      delay={0.15 + index * 0.06}
      className="relative w-full overflow-hidden rounded-xl bg-proj-white p-4 shadow-[0_8px_12px_rgba(64,50,42,0.06),0_1px_1.5px_rgba(64,50,42,0.04)] transition-all duration-300 active:scale-[0.98]"
    >
      <ScanReveal delay={0.1 + index * 0.06} />
      <div className="flex flex-col gap-2">
        <span className={`h-1 w-full rounded-full ${meta.accent}`} aria-hidden />
        <div className="flex items-center gap-2">
          <Icon size={16} weight="bold" className={meta.text} />
          <p className={`font-nunito text-[14px] font-extrabold ${meta.text}`}>
            {card.number} / {card.title}
          </p>
        </div>
      </div>
      <p className="font-nunito mt-3 text-[13px] leading-[20px] font-normal text-grey-700">{card.desc}</p>
    </SlideIn>
  );
}

/**
 * 市場研究與演進趨勢 (Market Research), Figma desktop node 127:481 / mobile
 * node 147:251. Standalone section slotted in AFTER IaRestructuring and
 * BEFORE CompetitiveAnalysis, restoring Figma's original page order (this
 * section was originally skipped during a Figma-link mix-up where Joe's
 * intended CompetitiveAnalysis-mobile link actually resolved to THIS
 * section's mobile frame -- see CompetitiveAnalysis.tsx's doc comment for
 * the full story; both links are now correctly assigned).
 *
 * Content model: reuses the same `process` row, `market*` prefix (checked
 * 2026-08-18 for key collisions -- clean). `marketIntro` is genuinely
 * identical copy on both breakpoints per Figma (127:489 / 151:461), so it's
 * the one field shared with NO fallback split. `marketTrends` (3 rows) and
 * `marketPersonas` (4 rows) and `marketSystemInsight` back the desktop's
 * three-card grid; `marketMobileCards` (3 rows) is a SEPARATE, genuinely
 * rewritten condensed summary for mobile (each mobile card collapses an
 * entire desktop card into one sentence) -- same "no-fallback, deliberate
 * rewrite" pattern established by CompetitiveAnalysis's mobileDesc, not the
 * usual `mobileXxx || xxx` truncation pattern used elsewhere.
 *
 * The four persona illustrations and the iOS-accessibility-support image are
 * static /public assets (Joe-supplied artwork), not admin media fields --
 * same rationale as IaRestructuring's POINT_ICONS / IA_DIAGRAMS. Mobile
 * icons (arrow-right / users / device-mobile) are substituted with
 * @phosphor-icons equivalents rather than the raw Figma SVG export, per this
 * codebase's established icon-substitution convention.
 *
 * 2026-08-18 fix + polish pass (Joe flagged the desktop render didn't match
 * the Figma reference he re-pasted): (1) PersonaCard's persona images were
 * wrongly circle-cropped (`overflow-hidden rounded-full` + `object-cover`)
 * -- Figma's spec is a plain unrounded 45x45 box, and the crop was cutting
 * into the portrait-oriented illustrations. Removed the crop, switched to
 * `object-contain`. (2) The three desktop cards used a fixed `h-[400px]`
 * with `justify-between` rows -- when TrendCard's orange "after" pill text
 * wrapped to 2 lines the row stack overflowed the fixed height and clipped.
 * Switched all three cards to `min-h-[400px]` (content-driven, never
 * clips) with the parent row now `items-stretch` so they still match
 * height when content is short. Also added a hover lift + shadow-bloom on
 * all three desktop cards and the mobile cards, and a slow continuous
 * float on the iOS insight screenshot, per Joe's request for more "動態
 * 呈現" across this section.
 */
export function MarketResearch({ process }: { process: Record<string, unknown> }) {
  const intro = typeof process.marketIntro === "string" ? process.marketIntro : "";
  const trends = Array.isArray(process.marketTrends) ? (process.marketTrends as MarketTrend[]) : [];
  const personas = Array.isArray(process.marketPersonas) ? (process.marketPersonas as MarketPersona[]) : [];
  const systemInsight = typeof process.marketSystemInsight === "string" ? process.marketSystemInsight : "";
  const mobileCards = Array.isArray(process.marketMobileCards) ? (process.marketMobileCards as MarketMobileCard[]) : [];

  if (trends.length < 3 || personas.length < 4 || mobileCards.length < 3) return null;

  return (
    <section className="relative bg-[#f5f5f5]">
      {/* Mobile layout */}
      <div className="flex flex-col gap-6 px-6 py-12 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">市場研究與演進趨勢</h2>
            <div className="h-0 w-full border-t border-dashed border-grey-300" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <p className="font-nunito text-center text-[14px] leading-[22px] font-normal text-grey-700">{intro}</p>
        </SlideIn>

        <div className="flex flex-col gap-4">
          {mobileCards.map((card, i) => (
            <MobileCard key={card.number} index={i} card={card} />
          ))}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden flex-col gap-8 px-[120px] py-16 md:flex">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[48px] leading-[72px] font-bold text-primary-black">市場研究與演進趨勢</h2>
            <div className="h-0 w-[80px] border-t-[3px] border-dashed border-grey-300" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <p className="font-nunito text-[28px] leading-[39px] font-bold text-grey-500">{intro}</p>
        </SlideIn>

        <div className="flex items-stretch gap-6">
          <TrendCard trends={trends} />
          <PersonaCard personas={personas} />
          <SystemInsightCard insight={systemInsight} />
        </div>
      </div>
    </section>
  );
}
