"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate, AnimatePresence, useInView } from "framer-motion";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
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
  /** Desktop-only description paragraph -- mobile MetricCards have no body copy inline, it's revealed via the info-button tooltip instead (see MobileMetricCard). */
  descDesktop?: string;
  /** Desktop-only bullet insights -- only the service metric card has these (2 bullets), surfaced via the mobile info-button tooltip on that card. */
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

/**
 * Minimal literal "i" glyph (dot + stem) built as an inline SVG, standing in
 * for Figma's own custom "icon/ deco" vector inside the "btn/ icon btn"
 * component (147:333 instances 180:645/652/656) -- that vector is just a
 * thin stroke, not a self-contained circled icon, so it's redrawn by hand
 * rather than reused from Phosphor. This matters concretely: Phosphor's
 * `Info` icon draws its OWN circle outline, and nesting that inside this
 * component's separately-drawn circular button chrome would render as two
 * concentric rings -- a real visual bug, not just an inexact substitute.
 * Colored via `currentColor` so the wrapping button controls it.
 */
function InfoGlyph({ className }: { className?: string }) {
  return (
    <svg width="4" height="12" viewBox="0 0 4 12" fill="none" className={className} aria-hidden>
      <circle cx="2" cy="1.4" r="1.4" fill="currentColor" />
      <rect x="0.8" y="4.6" width="2.4" height="7.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * Mobile-only info button (Figma "btn/ icon btn", 147:333). Figma has no
 * interactive layer to read an on-tap behavior from, so this button's tap
 * behavior is a deliberate addition per Joe's explicit follow-up ("圖一的
 * info button 點選之後，是會以提示訊息的方式顯示電腦版評分下面的文字描述"): tapping
 * toggles a small callout showing the same body copy the desktop card
 * shows inline (the `descDesktop` paragraph, or the two `insightsDesktop`
 * bullets for the service-metric card, which has no paragraph). The glyph
 * itself is orange (`text-primary-orange`) per Joe's screenshot annotation
 * of the Figma reference -- the surrounding button chrome (white fill,
 * light grey border) stays as specced.
 */
function MobileInfoButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label="顯示說明"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#e6e6e6] bg-proj-white text-primary-orange"
    >
      <InfoGlyph />
    </button>
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
  const [open, setOpen] = useState(false);
  const hasTooltip = Boolean(metric.descDesktop || metric.insightsDesktop);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex w-full flex-col gap-1 rounded-xl border border-[#e6e6e6] bg-[#fafaf7] px-4 py-2 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-nunito text-[13px] font-bold leading-[18px] text-grey-600">{metric.titleMobile}</p>
        {hasTooltip && <MobileInfoButton open={open} onToggle={() => setOpen((v) => !v)} />}
      </div>
      {metric.subtitleMobile && (
        <p className="font-nunito text-[12px] leading-[17px] font-normal text-grey-600">{metric.subtitleMobile}</p>
      )}
      <div className="flex w-full items-end gap-3">
        <CountUpValue
          value={metric.value}
          className={`font-fredoka text-[30px] leading-[36px] ${isPink ? "text-accent-pink" : "text-primary-orange"}`}
        />
        {metric.delta && <DeltaBadge delta={metric.delta} size="mobile" />}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 w-full rounded-lg border border-[#e5e0db] bg-proj-white px-3 py-2.5">
              {metric.descDesktop && (
                <p className="font-nunito text-[12.5px] leading-[19px] font-normal text-grey-700">
                  {metric.descDesktop}
                </p>
              )}
              {metric.insightsDesktop && (
                <div className="flex w-full flex-col gap-2">
                  {metric.insightsDesktop.map((insight) => (
                    <div key={insight} className="flex w-full gap-2">
                      <span className="font-nunito text-[12.5px] text-grey-600">•</span>
                      <p className="flex-1 font-nunito text-[12.5px] leading-[19px] font-normal text-grey-700">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DesktopMetricCard({ metric }: { metric: ResultsMetric }) {
  const isPink = metric.value.includes("%");
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-1 flex-col gap-3 self-stretch rounded-2xl bg-[#f7f5f3] p-3 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <p className="font-nunito text-[14px] font-extrabold leading-[21px] text-grey-800">{metric.titleDesktop}</p>
      <div className="flex w-full flex-col gap-1">
        <p className="font-nunito text-[16px] leading-[24px] font-normal text-grey-600">{metric.subtitleDesktop}</p>
        <div className="flex items-end gap-4">
          <CountUpValue
            value={metric.value}
            className={`font-fredoka text-[60px] leading-[72px] ${isPink ? "text-accent-pink" : "text-primary-orange"}`}
          />
          {metric.delta && <DeltaBadge delta={metric.delta} />}
        </div>
      </div>
      <div className="flex w-full flex-1 items-start rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-2">
        {metric.descDesktop && (
          <p className="font-nunito text-[14.5px] leading-[21px] font-normal text-grey-700">{metric.descDesktop}</p>
        )}
        {metric.insightsDesktop && (
          <div className="flex w-full flex-col gap-3">
            {metric.insightsDesktop.map((insight) => (
              <div key={insight} className="flex w-full gap-2.5">
                <span className="font-nunito text-[14.5px] text-grey-600">•</span>
                <p className="flex-1 font-nunito text-[14.5px] leading-[21px] font-normal text-grey-700">{insight}</p>
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
    <div className="flex w-full items-start gap-4 rounded-xl border border-[#e5e0db] bg-proj-white px-4 py-2">
      <div className="pt-[6px]">
        <RadarPing colorClass={bg} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className={`inline-flex w-fit items-center rounded-full px-[10px] py-1 font-nunito text-[12px] font-bold text-proj-white ${bg}`}>
          {tag}
        </span>
        <p className="w-full font-nunito text-[14px] font-normal leading-[1.5] text-grey-700">{desc}</p>
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

/**
 * "APP ROADMAP" / "SERVICE ROADMAP" heading. Figma specs this as Fredoka
 * (weight 400, same "Fredoka One"-look variable font used everywhere else
 * in this project -- see layout.tsx). At this size, two-word all-caps text
 * set in Fredoka reads with visibly wider word/letter gaps than Figma's own
 * render (flagged directly by Joe against a reference screenshot) -- a
 * `tracking-tight` + slightly negative `word-spacing` combo pulls both the
 * inter-letter and inter-word gaps in to match, without swapping fonts
 * (next/font/google only exposes the newer variable "Fredoka" family, not
 * a separate legacy "Fredoka One" export, so a font swap isn't available).
 */
function RoadmapTitle({ children, className }: { children: string; className: string }) {
  return (
    <p className={`font-fredoka tracking-tight text-primary-black ${className}`} style={{ wordSpacing: "-0.12em" }}>
      {children}
    </p>
  );
}

function DesktopRoadmapCard({ title, roadmap }: { title: string; roadmap: ResultsRoadmap }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-1 flex-col gap-1.5 self-stretch rounded-2xl bg-[#f7f5f3] p-4 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
    >
      <RoadmapTitle className="text-[22px] leading-[26px]">{title}</RoadmapTitle>
      <div className="h-px w-full bg-[#e5e0db]" />
      <div className="flex w-full flex-col gap-1.5">
        <DesktopPhase tag="Short-term" desc={roadmap.shortDesktop} color="orange" />
        <div className="h-px w-full bg-[#e5e0db]" />
        <DesktopPhase tag="Long-term" desc={roadmap.longDesktop} color="blue" />
      </div>
    </motion.div>
  );
}

function MobileRoadmapCard({ title, roadmap }: { title: string; roadmap: ResultsRoadmap }) {
  return (
    <div className="flex w-full flex-col gap-1.5 rounded-xl border border-[#e6e6e6] bg-[#fafaf7] px-4 py-2 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]">
      <RoadmapTitle className="w-full text-[16px] leading-none">{title}</RoadmapTitle>
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
    <div className="pointer-events-none absolute right-[28px] top-[380px] grid grid-cols-3 gap-2" aria-hidden>
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
      className="pointer-events-none absolute left-[60px] top-[120px] block size-[18px]"
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
 * exactly what's visually in Figma today rather than the stale frame name.
 *
 * Content model: reuses the `process` row. Section eyebrow/title are
 * hardcoded. Fields: `resultsMetricOne` / `resultsMetricTwo` (route-search
 * and station-info validation cards), `resultsServiceMetric` (the third
 * "捷伴服務" card -- percentage instead of decimal, no delta badge, bullet
 * `insightsDesktop` instead of a paragraph, no mobile subtitle line),
 * `resultsRoadmapApp` / `resultsRoadmapService`. Every mobile field is
 * genuinely different copy from its desktop counterpart in Figma.
 *
 * Layout: both breakpoints `min-h-screen` + vertical centering. Padding,
 * inter-block gaps, card padding, and (after a first-pass round that still
 * overflowed by ~120px on a real 1512x900 window) the headline stat number
 * and roadmap-title sizes themselves are all noticeably tighter than
 * Figma's own authored spec (Figma's desktop canvas for this node is
 * 1024px tall, taller than most real browser viewports once toolbar/chrome
 * is subtracted) -- Joe asked three times across two rounds for this
 * section to fit inside one real screen with no internal scrolling, which
 * a literal 1:1 port of Figma's spacing/type scale cannot guarantee. Body
 * copy text stays at spec size (only line-height/padding trimmed there);
 * only the two big display numbers (68/80 -> 60/72 desktop, 34/40 -> 30/36
 * mobile) and the ROADMAP card titles (24/32 -> 22/26 desktop, 18 -> 16
 * mobile) lost a size step, since those -- not body text -- were the
 * actual budget the first compression pass had already exhausted. Verified
 * against a live 1512px / 390px viewport measured via DOM
 * `getBoundingClientRect()` against `window.innerHeight` after deploy, not
 * just eyeballed against the Figma canvas number.
 *
 * Tech-feel motion: `CountUpValue` drives every number including delta
 * badges. `RadarPing` (desktop only) loops on each roadmap phase's marker
 * dot. `DotGrid` gives Figma's decorative dot flourish a quiet sequential
 * twinkle; `PlusMark` is kept static, matching Figma exactly. Cards get a
 * light hover lift.
 *
 * Mobile info-button tooltip: Figma's "btn/ icon btn" instance has no
 * interaction layer to read from -- Joe explicitly asked (after seeing the
 * first pass live) for tapping it to reveal the same body copy the desktop
 * card shows inline. `MobileMetricCard` owns local open state and toggles
 * a bordered callout with `metric.descDesktop` or `metric.insightsDesktop`.
 * The glyph itself is redrawn as a plain "i" stroke rather than reused from
 * Phosphor's `Info` icon, because Phosphor's icon draws its own circle and
 * would double up with this component's separately-drawn circular button
 * chrome; it's colored orange per Joe's annotation on the Figma reference
 * screenshot (the raw Figma asset color isn't inspectable through this
 * pipeline, only the composited screenshot is, so Joe's direct callout is
 * the source of truth here).
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
      <div className="flex min-h-screen w-full flex-col justify-center gap-2 bg-[#fbfbfa] px-6 py-4 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-1.5">
            <SectionEyebrow />
            <h2 className="font-nunito text-[22px] leading-[26px] font-bold text-primary-black">
              成果驗證與未來展望
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex w-full flex-col gap-1.5">
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
      <div className="relative hidden min-h-screen w-full flex-col justify-center gap-2 border-y border-[#ededed] px-[120px] py-[26px] md:flex">
        <PlusMark />
        <DotGrid />

        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-2">
            <SectionEyebrow />
            <h2 className="font-nunito text-[42px] leading-[46px] font-bold text-primary-black">
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
