"use client";

import { motion } from "framer-motion";
import { ChartBar } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface CompetitiveRow {
  /** App / service name shown in the left cell, e.g. "台北捷運GO". */
  app: string;
  /**
   * True only for the row representing Joe's own product (台北捷運GO) --
   * Figma marks this row with an orange dot + orange bold app name on both
   * breakpoints, everything else uses a neutral grey dot + black text.
   */
  highlight?: boolean;
  /** Desktop-only "服務內容" column. */
  service: string;
  /** Desktop-only "UI/UX 易用性" column. */
  usability: string;
  /** Desktop-only "弱勢友善度" column. */
  accessibility: string;
  /**
   * Mobile-only combined summary sentence. NOT a truncated/fallback version
   * of the three desktop columns above -- Figma's mobile CompetitorsList
   * (147:268) collapses those three columns into one hand-written sentence
   * per row, so this is its own genuinely different copy, not a
   * `mobileDesc || desc` fallback like other sections use.
   */
  mobileDesc: string;
}

/**
 * Rotating conic-gradient "energy border" -- the project's established
 * tech-feel signature element (see StrategyBeforeApp.tsx's TechGlowBorder /
 * IaRestructuring.tsx's copy of the same), duplicated here per the
 * per-section-file convention. Not used in this section (see ScanReveal +
 * PingDot doc comments below for why), kept unused-but-available would be
 * dead code, so it is intentionally omitted from this file.
 */

/**
 * One-time CRT-style scanline sweep on viewport entry -- same technique as
 * StrategyBeforeApp / IaRestructuring's ScanReveal, duplicated here per the
 * per-section convention. Applied over the whole comparison table/list
 * (rather than a single image) so the table reads as "scanning the
 * competitor data" on entry -- this section's flat data-table Figma spec
 * has no diagram/photo to wrap in a glow border, so a sweep-on-reveal was
 * chosen as the fitting tech-feel motion instead of forcing TechGlowBorder
 * onto a plain table (would visually diverge from spec for no reason).
 */
function ScanReveal({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-proj-white/60 to-transparent"
      initial={{ y: "-100%", opacity: 1 }}
      whileInView={{ y: "120%", opacity: [1, 1, 0] }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay, ease: "easeIn" }}
    />
  );
}

/**
 * Pulsing "radar ping" dot -- this section's own tech-feel signature,
 * distinct from the scan sweep above. Only the highlighted (Joe's own
 * product) row pings; every other competitor row gets a plain static grey
 * dot. Reads as "this is the one we're tracking" among the comparison
 * rows, echoing Figma's existing orange-dot-for-our-row convention while
 * adding the motion Joe asked for.
 */
function PingDot({ highlight }: { highlight?: boolean }) {
  return (
    <span className="relative inline-flex size-2 shrink-0 items-center justify-center">
      {highlight && (
        <motion.span
          aria-hidden
          className="absolute inline-flex size-2 rounded-full bg-primary-orange"
          animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={`relative inline-flex size-2 rounded-full ${
          highlight ? "bg-primary-orange" : "bg-grey-300"
        }`}
      />
    </span>
  );
}

function SectionEyebrow({ size = "small" }: { size?: "small" | "large" }) {
  return (
    <div className="flex items-center gap-2">
      <ChartBar size={18} weight="bold" className="text-primary-orange" />
      <span className={`font-nunito font-extrabold text-primary-orange ${size === "large" ? "text-[13px]" : "text-[13px]"}`}>
        Competitive Analysis
      </span>
    </div>
  );
}

/**
 * 競品分析與定位 (Competitive Analysis & Positioning), Figma desktop node
 * 127:555 / mobile node 147:268.
 *
 * Note for whoever picks up the next section: the mobile link Joe first
 * supplied for this task (147:251) actually resolves to the separate
 * "MarketResearch" frame that sits directly BEFORE this one on the mobile
 * page (same eyebrow-icon pattern, different content -- 3 research-topic
 * cards, not a competitor table) -- confirmed via get_metadata on the full
 * mobile page (147:47). 147:268 is the correct "CompetitiveAnalysis"-named
 * mobile frame and is what this component implements. The 3-icon vertical
 * SVG Joe pasted alongside (arrow-right / users / smartphone, in the
 * project's exact primary-orange / secondary-blue / accent-pink tokens)
 * matches MarketResearch's three card icons, not anything in this section
 * -- keep it on hand for when MarketResearch (147:481 desktop / 147:251
 * mobile) gets built next.
 *
 * Content model: reuses the `process` row (checked against every existing
 * top-level key first -- `competitive*` prefix is clean, see IaRestructuring's
 * doc comment for the running list). Fields: `competitiveIntro` (desktop-only
 * intro sentence -- mobile's Figma frame has no equivalent paragraph, this
 * is a genuine per-breakpoint omission, not a missing-content gap),
 * `competitiveRows` (the 5 competitor entries, each carrying both the
 * desktop's 3-column breakdown AND mobile's own combined sentence -- see
 * `CompetitiveRow` doc comment for why `mobileDesc` isn't a fallback field
 * here), `competitiveConclusionDesktop` / `competitiveConclusionMobile`
 * (two separate fields, not a shared-with-fallback pair, because Figma's
 * desktop and mobile conclusion banners are genuinely different sentences,
 * not the same text at two lengths).
 *
 * Tech-feel motion (Joe's "一樣需要有科技感動態" request): ScanReveal sweeps
 * once across the whole table/list on scroll-in, every row staggers in via
 * SlideIn, and the highlighted "our own product" row gets a looping
 * PingDot radar pulse. Deliberately did NOT wrap the table in TechGlowBorder
 * (the rotating conic-gradient border used elsewhere for diagram/photo
 * previews) -- this section's Figma spec is a flat data table with no
 * image to frame, so a glowing border would be motion for its own sake
 * rather than motion that fits the content.
 */
export function CompetitiveAnalysis({ process }: { process: Record<string, unknown> }) {
  const intro = typeof process.competitiveIntro === "string" ? process.competitiveIntro : "";
  const rows = Array.isArray(process.competitiveRows) ? (process.competitiveRows as CompetitiveRow[]) : [];
  const conclusionDesktop =
    typeof process.competitiveConclusionDesktop === "string" ? process.competitiveConclusionDesktop : "";
  const conclusionMobile =
    typeof process.competitiveConclusionMobile === "string" ? process.competitiveConclusionMobile : "";

  if (rows.length < 5) return null;

  return (
    <section className="relative bg-proj-white">
      {/* Mobile layout */}
      <div className="flex flex-col gap-6 px-6 py-12 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              競品分析與定位
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="relative overflow-hidden rounded-xl border border-[#e6e6e6]">
            <ScanReveal />
            {rows.map((row, i) => (
              <div
                key={row.app}
                className={`flex items-center gap-3 p-4 ${i % 2 === 1 ? "bg-[#fafafa]" : "bg-proj-white"} ${
                  i < rows.length - 1 ? "border-b border-[#e6e6e6]" : ""
                }`}
              >
                <div className="flex w-[104px] shrink-0 items-center gap-2">
                  <PingDot highlight={row.highlight} />
                  <span
                    className={`font-nunito text-[14px] leading-[22px] font-extrabold ${
                      row.highlight ? "text-primary-orange" : "text-primary-black"
                    }`}
                  >
                    {row.app}
                  </span>
                </div>
                <p className="flex-1 font-nunito text-[13px] leading-[19px] font-normal text-grey-800">
                  {row.mobileDesc}
                </p>
              </div>
            ))}
          </div>
        </SlideIn>

        {/*
          viewportMargin="0px": CompetitiveAnalysis is now the LAST section
          on the page (mounted after IaRestructuring in page.tsx), so this
          conclusion banner is the final element in the mobile layout --
          same page-bottom trap documented on IaRestructuring's mobile CTA
          (SlideIn's default "-80px" trigger margin can never be satisfied
          once there's no more room to scroll). See SlideIn.tsx's
          viewportMargin doc comment.
        */}
        <SlideIn delay={0.2} viewportMargin="0px">
          <div className="rounded-xl bg-primary-orange p-4">
            <p className="font-nunito text-[13px] leading-[19px] font-bold text-proj-white">{conclusionMobile}</p>
          </div>
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="hidden flex-col gap-6 border-t border-b border-[#ededed] px-[120px] py-[64px] md:flex">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow size="large" />
            <h2 className="font-nunito text-[48px] leading-[72px] font-bold text-primary-black">
              競品分析與定位
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <p className="font-nunito text-[28px] leading-[1.5] font-bold text-grey-500">{intro}</p>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="relative overflow-hidden rounded-2xl border border-[#e6e6e6] bg-[#f7f5f3] px-6 py-6 shadow-[0px_8px_24px_-4px_rgba(64,50,42,0.06),0px_1px_3px_0px_rgba(64,50,42,0.04)]">
            <ScanReveal />
            <div className="flex w-full rounded-[8px] border-b border-[#ededed] bg-primary-orange p-4">
              <p className="font-nunito w-[200px] shrink-0 text-[14px] leading-[21px] font-semibold text-proj-white">
                運輸應用
              </p>
              <p className="font-nunito w-[340px] shrink-0 text-[14px] leading-[21px] font-semibold text-proj-white">
                服務內容
              </p>
              <p className="font-nunito w-[310px] shrink-0 text-[14px] leading-[21px] font-semibold text-proj-white">
                UI/UX 易用性
              </p>
              <p className="font-nunito flex-1 text-[14px] leading-[21px] font-semibold text-proj-white">
                弱勢友善度
              </p>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.app}
                className={`flex w-full items-start p-4 ${i % 2 === 1 ? "bg-[#fafafa]" : "bg-proj-white"} ${
                  i < rows.length - 1 ? "border-b border-[#eae7e4]" : ""
                }`}
              >
                <div className="flex w-[200px] shrink-0 items-center gap-2">
                  <PingDot highlight={row.highlight} />
                  <span
                    className={`font-nunito text-[15px] leading-[23px] font-bold ${
                      row.highlight ? "text-primary-orange" : "text-primary-black"
                    }`}
                  >
                    {row.app}
                  </span>
                </div>
                <p className="font-nunito w-[340px] shrink-0 text-[14px] leading-[21px] font-normal text-grey-800">
                  {row.service}
                </p>
                <p className="font-nunito w-[310px] shrink-0 text-[14px] leading-[21px] font-normal text-grey-800">
                  {row.usability}
                </p>
                <p className="font-nunito flex-1 text-[14px] leading-[21px] font-normal text-grey-800">
                  {row.accessibility}
                </p>
              </div>
            ))}
          </div>
        </SlideIn>

        {/* Same page-bottom viewportMargin fix as the mobile conclusion banner above. */}
        <SlideIn delay={0.25} viewportMargin="0px">
          <div className="flex w-full rounded-xl bg-primary-orange px-8 py-6 shadow-[0px_4px_8px_rgba(255,82,13,0.2)]">
            <p className="font-nunito flex-1 text-[20px] leading-[30px] font-bold text-proj-white">
              {conclusionDesktop}
            </p>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
