"use client";

import { useRef } from "react";
import type { RefObject, SVGProps } from "react";
import { motion, useScroll, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Zone {
  title: string;
  desc: string;
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
 * dotted guide line runs behind the three zone numbers; as the visitor
 * scrolls through the section, a solid pink line fills in behind it,
 * same idea as walking a numbered exhibition route. `prefers-reduced-
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

function ZoneRow({ zone, index }: { zone: Zone; index: number }) {
  const Icon = ZONE_ICONS[index] ?? ZONE_ICONS[0];
  return (
    <SlideIn delay={0.08 + index * 0.1} className="relative flex gap-5 pl-0 md:gap-8">
      <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-accent-pink bg-proj-white text-accent-pink md:size-16">
        <Icon className="size-6 md:size-8" />
      </div>
      <div className="flex-1 pb-10 pt-1 last:pb-0">
        <p className="font-nunito text-[12px] font-extrabold tracking-[0.1em] text-grey-400">
          展區 {String(index + 1).padStart(2, "0")}
        </p>
        <h4 className="font-nunito mt-1 text-[19px] font-bold leading-6 text-grey-800 md:text-[22px]">
          {zone.title}
        </h4>
        <p className="font-nunito mt-2 max-w-[60ch] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[15px]">
          {zone.desc}
        </p>
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
      <div className="mx-auto flex max-w-[800px] flex-col gap-10 md:gap-14">
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
              <ZoneRow key={zone.title} zone={zone} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
