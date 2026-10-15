"use client";

import { useRef, useState } from "react";
import type { RefObject, SVGProps } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface ZoneStep {
  label: string;
  desc?: string;
  /** Design-mode screenshot for this specific step. Only one step tends to
   * have a matching reference screenshot at a time -- steps without one
   * fall back to DeviceFrame's own empty state rather than reusing another
   * step's image, since the screens genuinely differ step to step. */
  designImage?: string;
}

interface GalleryItem {
  title: string;
  titleEn?: string;
  date?: string;
}

interface Spotlight {
  title: string;
  titleEn?: string;
  tag?: string;
  textZh?: string;
  textEn?: string;
}

interface Zone {
  title: string;
  desc: string;
  steps?: ZoneStep[];
  /** Fallback Design-mode image for zones with no per-step stepper
   * (Zone 2/3). Zone 1 instead uses each step's own `designImage`. */
  designImage?: string;
  designCaption?: string;
  /** One real recording per zone, shown in Live mode regardless of which
   * step is selected -- the footage demonstrates the zone as a whole, it
   * isn't cut per step. */
  liveImage?: string;
  liveCaption?: string;
  gallery?: GalleryItem[];
  spotlight?: Spotlight;
}

/** Zone 1 -- 世界地圖導覽: a hierarchical drill-down (world → continent →
 * session → detail), drawn as three nested rings collapsing toward a
 * center point. */
function DoodleDrillDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <circle cx="24" cy="24" r="19" strokeDasharray="2 4" />
      <circle cx="24" cy="24" r="12" />
      <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Zone 2 -- 舞台之外的風景: a waterfall/masonry photo wall, drawn as
 * three offset rectangles of different heights. */
function DoodleMasonry(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" {...props}>
      <rect x="5" y="10" width="12" height="18" rx="2" />
      <rect x="19" y="6" width="12" height="26" rx="2" />
      <rect x="33" y="14" width="10" height="14" rx="2" />
    </svg>
  );
}

/** Zone 3 -- 直覺式影音操作: an oversized play button, matching the
 * "放大熱區" accessibility goal rather than a generic media icon. */
function DoodlePlayTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <circle cx="24" cy="24" r="19" />
      <path d="M20 16l12 8-12 8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ZONE_ICONS = [DoodleDrillDown, DoodleMasonry, DoodlePlayTarget];

/**
 * Scroll-linked wayfinding line -- this section's signature motion. A
 * dotted guide line runs behind the three zone number badges; as the
 * visitor scrolls through the section, a solid pink line fills in behind
 * it, same idea as walking a numbered exhibition route. `prefers-reduced-
 * motion` just shows the line fully drawn (no fill, no sudden jump).
 */
function WayfindingLine({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <div className="absolute left-[23px] top-6 bottom-6 w-[2px] md:left-[31px]" aria-hidden>
      <div className="h-full w-full bg-grey-100" style={{ backgroundImage: "repeating-linear-gradient(to bottom, var(--color-grey-300) 0 4px, transparent 4px 10px)" }} />
      <motion.div
        className="absolute inset-x-0 top-0 w-full origin-top bg-accent-pink"
        style={reduceMotion ? { scaleY: 1 } : { scaleY: scrollYProgress }}
      />
    </div>
  );
}

/** Zone 1's own left-rail step list (世界全覽 → 洲際聚焦 → 場次選擇 →
 * 演出詳情), ported from the original site's interactive stepper. Clicking
 * a step swaps the Design-mode screenshot on the right to that step's own
 * `designImage` (when one exists); Live mode is unaffected, since it's one
 * continuous recording of the zone rather than per-step footage. */
function StepList({
  steps,
  active,
  onSelect,
}: {
  steps: ZoneStep[];
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div>
      <p className="font-nunito mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-grey-400">
        ↓ scroll or click
      </p>
      <ol className="space-y-0">
        {steps.map((step, i) => {
          const isActive = i === active;
          return (
            <li key={step.label} className="relative flex gap-3 border-l-2 border-grey-100 pl-4 pb-4 last:pb-0">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={isActive}
                className="absolute -left-[7px] top-0.5 flex size-3 items-center justify-center rounded-full"
              >
                <span
                  className={`size-3 rounded-full border-2 transition-colors ${
                    isActive ? "border-accent-pink bg-accent-pink" : "border-grey-300 bg-proj-white"
                  }`}
                />
              </button>
              <button type="button" onClick={() => onSelect(i)} className="text-left">
                <p className={`font-nunito text-[11px] font-extrabold tracking-[0.1em] ${isActive ? "text-accent-pink" : "text-grey-400"}`}>
                  STEP {String(i + 1).padStart(2, "0")}
                </p>
                <p className={`font-nunito text-[15px] font-bold ${isActive ? "text-grey-800" : "text-grey-500"}`}>
                  {step.label}
                </p>
                {isActive && step.desc && (
                  <p className="font-nunito mt-1 max-w-[40ch] text-[13px] leading-[20px] font-normal text-grey-600">
                    {step.desc}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** macOS-style window chrome around a zone's Design/Live screenshot --
 * this project's own device frame for showing a kiosk screen mockup,
 * matching the traffic-light window treatment the original site used for
 * every zone. Kept local like Hero's `KioskFrame`, same shape family but a
 * flatter "browser window" rather than a bezeled touchscreen, since this
 * is for a 16:10-ish screenshot rather than the Hero's portrait kiosk. */
function DeviceFrame({ image, alt }: { image?: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-grey-100 bg-proj-white shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-1.5 border-b border-grey-100 bg-grey-50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="aspect-[2000/1255] w-full bg-grey-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image} src={image} alt={alt} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center">
            <p className="font-nunito text-[12px] font-bold leading-relaxed text-grey-400">
              此畫面製作中
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** DESIGN / LIVE segmented toggle, only rendered when a zone actually has
 * both states -- some zones (e.g. 展區三) only have a Live recording. */
function ModeToggle({
  mode,
  onChange,
}: {
  mode: "design" | "live";
  onChange: (m: "design" | "live") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-grey-100 bg-proj-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
      {(["design", "live"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`font-nunito rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors ${
            mode === m ? "bg-accent-pink text-proj-white" : "text-grey-500 hover:text-grey-700"
          }`}
        >
          {m === "design" ? "Design" : "Live"}
        </button>
      ))}
    </div>
  );
}

/**
 * Zone 2/3's "幕後花絮" strip -- a horizontally swipeable, snap-scrolling
 * carousel rather than the original site's click-to-open modal. A kiosk-
 * style click/tap-to-reveal pattern reads as a dead end on a portfolio
 * page (nothing visibly indicates it's clickable, and clicking to "open"
 * content that's already fully known defeats the point) -- everything here
 * is visible by just scrolling the strip sideways, no click required. The
 * spotlight entry (the one with a full bilingual caption, e.g. 娜魯灣劇場
 * 演出) leads as a wider feature card; the rest of the same gallery follow
 * as compact date-chip cards.
 */
function GalleryCarousel({ spotlight, gallery }: { spotlight?: Spotlight; gallery?: GalleryItem[] }) {
  if (!spotlight && (!gallery || gallery.length === 0)) return null;

  return (
    <div className="mt-6">
      <p className="font-nunito mb-2 text-[11px] font-semibold tracking-[0.05em] text-grey-400">
        ← 左右滑動瀏覽幕後花絮 →
      </p>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {spotlight && (
          <div className="w-[260px] shrink-0 snap-start rounded-[16px] border border-accent-pink/20 bg-accent-pink/5 p-5 md:w-[320px]">
            {spotlight.tag && (
              <p className="font-nunito text-[11px] font-extrabold uppercase tracking-[0.1em] text-accent-pink">
                {spotlight.tag}
              </p>
            )}
            <h5 className="font-nunito mt-1 text-[15px] font-bold leading-6 text-grey-800">{spotlight.title}</h5>
            {spotlight.titleEn && (
              <p className="font-nunito text-[11px] font-semibold text-grey-500">{spotlight.titleEn}</p>
            )}
            {spotlight.textZh && (
              <p className="font-nunito mt-3 text-[12px] leading-[19px] font-normal text-grey-700">
                {spotlight.textZh}
              </p>
            )}
          </div>
        )}
        {gallery?.map((item) => (
          <div
            key={item.title}
            className="w-[160px] shrink-0 snap-start rounded-[16px] border border-grey-100 bg-grey-50 p-4"
          >
            <p className="font-nunito text-[13px] font-bold leading-5 text-grey-800">{item.title}</p>
            {item.date && <p className="font-nunito mt-1 text-[11px] font-semibold text-grey-400">{item.date}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoneCard({ zone, index }: { zone: Zone; index: number }) {
  const Icon = ZONE_ICONS[index] ?? ZONE_ICONS[0];
  const hasSteps = Boolean(zone.steps && zone.steps.length > 0);
  const hasToggle = Boolean((hasSteps || zone.designImage) && zone.liveImage);
  const [mode, setMode] = useState<"design" | "live">(hasSteps || zone.designImage ? "design" : "live");
  const [activeStep, setActiveStep] = useState(() => Math.min(1, (zone.steps?.length ?? 1) - 1));

  const designImage = hasSteps ? zone.steps?.[activeStep]?.designImage : zone.designImage;
  const image = mode === "design" ? designImage : zone.liveImage;
  const caption = mode === "design" ? zone.designCaption : zone.liveCaption;

  return (
    <SlideIn delay={0.08 + index * 0.1} className="relative flex gap-5 pl-0 md:gap-8">
      <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-accent-pink bg-proj-white text-accent-pink md:size-16">
        <Icon className="size-6 md:size-8" />
      </div>
      <div className="flex-1 pb-14 pt-1 last:pb-0">
        <p className="font-nunito text-[12px] font-extrabold tracking-[0.1em] text-grey-400">
          展區 {String(index + 1).padStart(2, "0")}
        </p>
        <h4 className="font-nunito mt-1 text-[19px] font-bold leading-6 text-grey-800 md:text-[22px]">
          {zone.title}
        </h4>
        <p className="font-nunito mt-2 max-w-[60ch] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[15px]">
          {zone.desc}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:gap-8">
          <div className="flex flex-col gap-5">
            {hasSteps && zone.steps && (
              <StepList steps={zone.steps} active={activeStep} onSelect={setActiveStep} />
            )}
            {hasToggle && <ModeToggle mode={mode} onChange={setMode} />}
          </div>

          <div>
            <DeviceFrame image={image} alt={caption ?? zone.title} />
            {caption && (
              <p className="font-nunito mt-2 text-[12px] leading-[18px] font-semibold text-grey-500">{caption}</p>
            )}
          </div>
        </div>

        <GalleryCarousel spotlight={zone.spotlight} gallery={zone.gallery} />
      </div>
    </SlideIn>
  );
}

/**
 * Section 4 -- Exhibition Zones (`process` row's `zones`, the "NTSO case"
 * shape the generic SectionBlock renderer already special-cases). Grey-50
 * background like Context, continuing the white/grey alternation.
 */
export function ExhibitionZones({ process }: { process: Record<string, unknown> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const note = process.note as string | undefined;
  const zones = Array.isArray(process.zones) ? (process.zones as Zone[]) : [];

  if (zones.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-10 md:gap-14">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <span className="font-nunito text-[14px] font-extrabold text-accent-pink">PROCESS</span>
          {note && (
            <p className="font-nunito max-w-[65ch] text-[15px] leading-[24px] font-normal text-grey-700 md:text-[18px] md:leading-[28px]">
              {note}
            </p>
          )}
        </SlideIn>

        <div ref={containerRef} className="relative">
          <WayfindingLine containerRef={containerRef} />
          <div className="flex flex-col">
            {zones.map((zone, i) => (
              <ZoneCard key={zone.title} zone={zone} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
