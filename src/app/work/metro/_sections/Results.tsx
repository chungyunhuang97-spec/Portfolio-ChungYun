"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView } from "framer-motion";
import { ShieldCheck, Info } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface ResultsMetric {
  titleDesktop: string;
  titleMobile: string;
  subtitleDesktop: string;
  /** Only metrics 1/2 have a mobile subtitle line -- the service metric (>82%) has none on mobile. */
  subtitleMobile?: string;
  /** e.g. "4.16", "3.79", or ">82%" -- CountUpValue parses the optional leading ">" and trailing "%". */
  value: string;
  /** e.g. "+0.66" -- absent for the service metric (no delta badge in Figma for that card). */
  delta?: string;
  /** Desktop-only description paragraph -- mobile MetricCards have no body copy at all, just number + delta. */
  descDesktop?: string;
  /** Desktop-only bullet insights -- only the service metric card has these (2 bullets), not present on mobile. */
  insightsDesktop?: string[];
}

interface ResultsRoadmap {
  shortDesktop: string;
  shortMobile: string;
  longDesktop: string;
  longMobile: string;
}

/**
 * Counts a stat up from 0 to its target once scrolled into view. Handles the
 * three literal formats this section uses: plain decimals ("4.16"), a
 * leading ">" ("82" inside ">82%"), and a "+" delta ("+0.66") -- the sign/
 * comparison characters are captured as a fixed prefix and re-applied after
 * the numeric tween, the decimal-place count is preserved so "4.16" doesn't
 * finish on "4.2", and the target VALUE itself is what animates (not just
 * an opacity fade) -- this is Joe's explicit ask this round ("數據部分以漸增
 * 動畫呈現"), reusing the pattern established for UserResearch's stat cards
 * but generalized to also handle ">" and "+" prefixes those didn't need.
 */
function CountUpValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const match = value.match(/^([+>]?)(-?\d+(?:\.\d+)?)(.*)$/);
  const prefix = match ? match[1] : "";
  const target = match ? parseFloat(match[2]) : 0;
  const decimals = match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const suffix = match ? match[3] : "";
  const [text, setText] = useState(match ? `${prefix}0${suffix}` : value);

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setText(`${prefix}${v.toFixed(decimals)}${suffix}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/**
 * A looping radar-style expanding ring behind each roadmap phase's colored
 * marker dot -- this section's own "科技感動態" signature, distinct from
 * every prior section's motion (CountUpValue/ScanReveal/PulseArrow/
 * ConvergeCard/BarGrow etc). Reads as a live status ping on each roadmap
 * milestone, fitting a "Results & Validation" section that's literally
 * about verified, ongoing progress -- desktop only, since Figma's mobile
 * roadmap phases have no marker dot to attach a ping to (see MobilePhase
 * doc comment).
 */
function RadarPing({ colorClass }: { colorClass: string }) {
  return (
    <span className="relative inline-flex size-[10px] shrink-0" aria-hidden>
      <motion.span
        className={`absolute inline-flex size-full rounded-full ${colorClass} opacity-60`}
        animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <span className={`relative inline-flex size-[10px] rounded-full ${colorClass}`} />
    </span>
  );
}

/** Decorative, non-interactive stand-in for Figma's "btn/ icon btn" info glyph on mobile MetricCards -- no linked action in the design, so rendered aria-hidden. */
function InfoBadge() {
  return (
    <span
      aria-hidden
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#e6e6e6] bg-proj-white"
    >
      <Info size={14} weight="bold" className="text-grey-500" />
    </span>
  );
}

function SectionEyebrow() {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck size={18} weight="bold" className="text-grey-500" />
      <span className="font-nunito text-[13px] font-extrabold text-grey-500">Results &amp; Validation</span>
    </div>
  );
}

function DeltaBadge({ delta, size = "desktop" }: { delta: string; size?: "desktop" | "mobile" }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full bg-primary-orange font-nunito font-extrabold text-proj-white ${
        size === "desktop" ? "px-[10px] py-1 text-[14px]" : "px-2 py-0.5 text-[14px]"
      }`}
    >
      <CountUpValue value={delta} />
    </span>
  );
}

function MobileMetricCard({ metric }: { metric: ResultsMetric }) {
  const isPink = metric.value.includes("%");
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex w-full flex-col gap-1 rounded-xl border border-[#e6e6e6] bg-[#fafaf7] px-4 py-3.5 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-nunito text-[13px] font-bold leading-[18px] text-grey-600">{metric.titleMobile}</p>
        <InfoBadge />
      </div>
      {metric.subtitleMobile && (
        <p className="font-nunito text-[12px] leading-[17px] font-normal text-grey-600">{metric.subtitleMobile}</p>
      )}
      <div className="flex w-full items-end gap-3">
        <CountUpValue
          value={metric.value}
          className={`font-fredoka text-[36px] leading-none ${isPink ? "text-accent-pink" : "text-primary-orange"}`}
        />
        {metric.delta && <DeltaBadge delta={metric.delta} size="mobile" />}
      </div>
    </motion.div>
  );
}

function DesktopMetricCard({ metric }: { metric: ResultsMetric }) {
  const isPink = metric.value.includes("%");
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-1 flex-col gap-5 self-stretch rounded-2xl bg-[#f7f5f3] p-4 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <p className="font-nunito text-[14px] font-extrabold leading-[21px] text-grey-800">{metric.titleDesktop}</p>
      <div className="flex w-full flex-col gap-1">
        <p className="font-nunito text-[16px] leading-[24px] font-normal text-grey-600">{metric.subtitleDesktop}</p>
        <div className="flex items-end gap-4">
          <CountUpValue
            value={metric.value}
            className={`font-fredoka text-[80px] leading-[96px] ${isPink ? "text-accent-pink" : "text-primary-orange"}`}
          />
          {metric.delta && <DeltaBadge delta={metric.delta} />}
        </div>
      </div>
      <div className="flex w-full flex-1 items-start rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-3.5">
        {metric.descDesktop && (
          <p className="font-nunito text-[15px] leading-[23px] font-normal text-grey-700">{metric.descDesktop}</p>
        )}
        {metric.insightsDesktop && (
          <div className="flex w-full flex-col gap-4">
            {metric.insightsDesktop.map((insight) => (
              <div key={insight} className="flex w-full gap-2.5">
                <span className="font-nunito text-[15px] text-grey-600">•</span>
                <p className="flex-1 font-nunito text-[15px] leading-[23px] font-normal text-grey-700">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Desktop roadmap phase: colored marker dot with a looping RadarPing, tag
 * pill, description -- each phase gets its own bordered card. Figma's
 * mobile phases have no marker dot and no per-phase card border at all
 * (see MobilePhase below), so this component is desktop-only.
 */
function DesktopPhase({ tag, desc, color }: { tag: "Short-term" | "Long-term"; desc: string; color: "orange" | "blue" }) {
  const bg = color === "orange" ? "bg-primary-orange" : "bg-secondary-blue";
  return (
    <div className="flex w-full items-start gap-4 rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-3.5">
      <div className="pt-[6px]">
        <RadarPing colorClass={bg} />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <span className={`inline-flex w-fit items-center rounded-full px-[10px] py-1 font-nunito text-[12px] font-bold text-proj-white ${bg}`}>
          {tag}
        </span>
        <p className="w-full font-nunito text-[15px] font-normal leading-[1.7] text-grey-700">{desc}</p>
      </div>
    </div>
  );
}

/** Mobile roadmap phase -- bare tag + description, no marker dot, no per-phase card border (Figma places short/long-term side by side with no extra chrome). */
function MobilePhase({ tag, desc, color }: { tag: "Short-term" | "Long-term"; desc: string; color: "orange" | "blue" }) {
  const bg = color === "orange" ? "bg-primary-orange" : "bg-secondary-blue";
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className={`inline-flex w-fit items-center rounded-full px-[10px] py-1 font-nunito text-[10px] font-bold text-proj-white ${bg}`}>
        {tag}
      </span>
      <p className="w-full font-nunito text-[11px] font-normal leading-[1.5] text-grey-700">{desc}</p>
    </div>
  );
}

function DesktopRoadmapCard({ title, roadmap }: { title: string; roadmap: ResultsRoadmap }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-1 flex-col gap-3 self-stretch rounded-2xl bg-[#f7f5f3] p-6 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <p className="font-fredoka text-[28px] leading-[39px] text-primary-black">{title}</p>
      <div className="h-px w-full bg-[#e5e0db]" />
      <div className="flex w-full flex-col gap-3">
        <DesktopPhase tag="Short-term" desc={roadmap.shortDesktop} color="orange" />
        <div className="h-px w-full bg-[#e5e0db]" />
        <DesktopPhase tag="Long-term" desc={roadmap.longDesktop} color="blue" />
      </div>
    </motion.div>
  );
}

function MobileRoadmapCard({ title, roadmap }: { title: string; roadmap: ResultsRoadmap }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-[#e6e6e6] bg-[#fafaf7] px-4 py-4 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]">
      <p className="w-full font-fredoka text-[20px] leading-none text-primary-black">{title}</p>
      <div className="h-px w-full bg-[#e5e0db]" />
      <div className="flex w-full gap-2">
        <MobilePhase tag="Short-term" desc={roadmap.shortMobile} color="orange" />
        <MobilePhase tag="Long-term" desc={roadmap.longMobile} color="blue" />
      </div>
    </div>
  );
}

/** Six-dot decorative array, desktop only (Figma 127:473-478) -- a quiet sequential twinkle gives the flourish a "status readout" read without being loud. */
function DotGrid() {
  const dots = Array.from({ length: 6 });
  return (
    <div className="pointer-events-none absolute right-[28px] top-[519px] grid grid-cols-3 gap-2" aria-hidden>
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className="size-1 rounded-full bg-grey-300"
          animate={{ opacity: [0.25, 0.9, 0.25] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: (i % 3) * 0.3 + Math.floor(i / 3) * 0.15 }}
        />
      ))}
    </div>
  );
}

/** Small plus-mark flourish, desktop only (Figma 127:479-480) -- kept static, matching Figma's fixed 10%-opacity accent-pink cross. */
function PlusMark() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-[60px] top-[172px] block size-[18px]"
    >
      <span className="absolute left-0 top-[7.5px] h-[3px] w-[18px] rounded-[1px] bg-accent-pink/10" />
      <span className="absolute left-[7.5px] top-0 h-[18px] w-[3px] rounded-[1px] bg-accent-pink/10" />
    </span>
  );
}

/**
 * 成果驗證與未來展望 (Results & Validation), Figma desktop node 127:390
 * (frame literally named "提案B - 深色反轉區塊" / "Proposal B - dark inverted
 * block") / mobile node 147:333 (frame name "Results"). The desktop frame's
 * name is a leftover from an earlier design iteration -- both nodes' actual
 * current content, confirmed via `get_design_context` screenshots, is a
 * LIGHT off-white theme (bg-white / #fafaf7 cards), not dark. Implemented
 * exactly what's visually in Figma today rather than the stale frame name,
 * per the design-to-code rule of reproducing the current design, not a
 * label.
 *
 * Content model: reuses the `process` row (checked against every existing
 * top-level key first -- `results*` prefix is clean, no collisions).
 * Section eyebrow/title are hardcoded (brand-style heading text, same
 * pattern as every prior section). Fields: `resultsMetricOne` /
 * `resultsMetricTwo` (route-search and station-info validation cards --
 * `titleDesktop`/`titleMobile`/`subtitleDesktop`/`subtitleMobile`/`value`/
 * `delta`/`descDesktop`), `resultsServiceMetric` (the third "捷伴服務" card --
 * structurally different from the other two: a percentage instead of a
 * decimal, no delta badge, bullet `insightsDesktop` instead of a paragraph,
 * no mobile subtitle line at all), `resultsRoadmapApp` / `resultsRoadmapService`
 * (`shortDesktop`/`shortMobile`/`longDesktop`/`longMobile`). Every single
 * one of these mobile fields is genuinely DIFFERENT copy from its desktop
 * counterpart in Figma -- not trims of the same sentence, several have
 * different numbers or dropped clauses entirely (e.g. the SERVICE roadmap
 * short-term item drops "並推出動畫新手引導" on mobile) -- confirmed by
 * reading both nodes' raw text directly, so every field is stored twice
 * with no fallback assumption of sameness, continuing the precedent from
 * DesignPrinciples. Desktop-only structure (per-phase marker dot + RadarPing,
 * per-card description/insights box) and mobile-only structure (no
 * description/insights at all, phases laid out side-by-side with no marker)
 * are both fixed presentational differences, not CMS fields.
 *
 * Layout: both breakpoints `min-h-screen` + vertical centering, continuing
 * the 100vh-per-slide pattern from UserResearch/DesignPrinciples.
 *
 * Tech-feel motion (Joe's recurring request, this round explicitly asking
 * for the numeric data to count up): `CountUpValue` drives every number in
 * the section -- the three headline stats AND the delta badges -- parsing
 * the ">" / "+" / "%" characters this section's specific values use.
 * `RadarPing` (desktop only) is this section's own signature beyond the
 * count-up: a looping expanding ring behind each roadmap phase's marker
 * dot, reading as a live status ping fitting a section literally about
 * verified results and an ongoing roadmap. `DotGrid` gives Figma's
 * decorative dot flourish a quiet sequential twinkle; `PlusMark` is kept
 * static, matching Figma exactly. Cards get a light hover lift, consistent
 * with every prior section.
 */
export function Results({ process }: { process: Record<string, unknown> }) {
  const metricOne = process.resultsMetricOne as ResultsMetric | undefined;
  const metricTwo = process.resultsMetricTwo as ResultsMetric | undefined;
  const serviceMetric = process.resultsServiceMetric as ResultsMetric | undefined;
  const roadmapApp = process.resultsRoadmapApp as ResultsRoadmap | undefined;
  const roadmapService = process.resultsRoadmapService as ResultsRoadmap | undefined;

  if (!metricOne || !metricTwo || !serviceMetric || !roadmapApp || !roadmapService) return null;

  return (
    <section className="relative overflow-hidden bg-proj-white">
      {/* Mobile layout */}
      <div className="flex min-h-screen w-full flex-col justify-center gap-4 bg-[#fbfbfa] px-6 py-10 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              成果驗證與未來展望
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex w-full flex-col gap-2">
            <MobileMetricCard metric={metricOne} />
            <MobileMetricCard metric={metricTwo} />
            <MobileMetricCard metric={serviceMetric} />
          </div>
        </SlideIn>

        <SlideIn delay={0.2}>
          <MobileRoadmapCard title="APP ROADMAP" roadmap={roadmapApp} />
        </SlideIn>

        <SlideIn delay={0.25} viewportMargin="0px">
          <MobileRoadmapCard title="SERVICE ROADMAP" roadmap={roadmapService} />
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden min-h-screen w-full flex-col justify-center gap-6 border-y border-[#ededed] px-[120px] py-[80px] md:flex">
        <PlusMark />
        <DotGrid />

        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <SectionEyebrow />
            <h2 className="font-nunito text-[48px] leading-[72px] font-bold text-primary-black">
              成果驗證與未來展望
            </h2>
            <div className="h-px w-full bg-[#e5e0db]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex w-full items-stretch gap-6">
            <DesktopMetricCard metric={metricOne} />
            <DesktopMetricCard metric={metricTwo} />
            <DesktopMetricCard metric={serviceMetric} />
          </div>
        </SlideIn>

        <SlideIn delay={0.2} viewportMargin="0px">
          <div className="flex w-full items-stretch gap-6">
            <DesktopRoadmapCard title="APP ROADMAP" roadmap={roadmapApp} />
            <DesktopRoadmapCard title="SERVICE ROADMAP" roadmap={roadmapService} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
