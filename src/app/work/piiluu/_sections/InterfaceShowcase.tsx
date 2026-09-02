"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

interface ShowcaseRow {
  number: string;
  title: string;
  subtitle: string;
  painLabel?: string;
  pain: string;
  solutionLabel?: string;
  solution: string;
  /** [before, after] screenshot URLs -- admin-uploadable, empty for now. */
  media?: [string | undefined, string | undefined];
  mediaLabels?: [string, string];
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function mediaScreen(url?: string) {
  if (!url) return undefined;
  return isVideoUrl(url) ? (
    <video src={url} autoPlay loop muted playsInline className="h-full w-full object-cover" />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-full w-full object-cover" />
  );
}

function PainSolutionBlock({ row }: { row: ShowcaseRow }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 rounded-xl bg-grey-50 p-3.5">
        <span className="font-nunito text-[11px] font-extrabold tracking-[0.6px] text-grey-500 uppercase">
          {row.painLabel || "Pain Point"}
        </span>
        <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-700 md:text-[14px] md:leading-[22px]">
          {row.pain}
        </p>
      </div>
      <div className="flex flex-col gap-1 rounded-xl bg-secondary-blue/[0.06] p-3.5">
        <span className="font-nunito text-[11px] font-extrabold tracking-[0.6px] text-secondary-blue uppercase">
          {row.solutionLabel || "Solution"}
        </span>
        <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-800 md:text-[14px] md:leading-[22px]">
          {row.solution}
        </p>
      </div>
    </div>
  );
}

function MediaLabel({ text }: { text: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-primary-black/80 px-2.5 py-1 font-nunito text-[10px] font-bold text-proj-white">
      {text}
    </span>
  );
}

/** Desktop zigzag panel -- image column + text column, alternating sides,
 * copied from Metro's `DesktopPanel` pattern in InterfaceRouteSearch.tsx. */
function DesktopRowPanel({ row, reverse, delay }: { row: ShowcaseRow; reverse: boolean; delay: number }) {
  const media = row.media ?? [undefined, undefined];
  const labels = row.mediaLabels ?? ["Before", "After"];
  return (
    <SlideIn direction={reverse ? "right" : "left"} delay={delay}>
      <div className={`flex w-full items-center gap-10 rounded-[32px] bg-proj-white p-8 ${reverse ? "flex-row-reverse" : ""}`}>
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="font-fredoka text-secondary-blue/15 text-[64px] leading-[64px]">{row.number}</span>
            <div className="flex flex-col gap-1">
              <p className="font-nunito text-[22px] leading-[28px] font-bold text-grey-400">{row.title}</p>
              <p className="font-nunito text-[24px] leading-[32px] font-bold text-secondary-blue">{row.subtitle}</p>
            </div>
          </div>
          <PainSolutionBlock row={row} />
        </div>
        <div className="flex shrink-0 items-end gap-4">
          <div className="flex w-[140px] flex-col items-center gap-2">
            <PhoneFrame screen={mediaScreen(media[0])} />
            <MediaLabel text={labels[0]} />
          </div>
          <div className="flex w-[140px] flex-col items-center gap-2">
            <PhoneFrame screen={mediaScreen(media[1])} />
            <MediaLabel text={labels[1]} />
          </div>
        </div>
      </div>
    </SlideIn>
  );
}

/** Mobile folder-style 2-tab switcher toggling between the row's two
 * screenshots -- copied from Metro's mobile `FolderTabs` pattern
 * (InterfaceRouteSearch.tsx), recolored for piiluu's blue dominant accent
 * (active-tab indicator + label colors stay neutral per that component's
 * own design -- only the section's surrounding accents shift to blue). */
function FolderTabs({
  labels,
  active,
  onChange,
}: {
  labels: [string, string];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex w-full gap-1 rounded-t-2xl border border-b-0 border-[#e5e0db] bg-grey-100 p-1.5">
      {labels.map((label, i) => {
        const isActive = i === active;
        return (
          <button key={label} type="button" onClick={() => onChange(i)} className="relative flex-1 rounded-xl px-2 py-2.5 text-center">
            {isActive && (
              <motion.span
                layoutId={`piiluu-tab-bg-${labels.join("-")}`}
                className="absolute inset-0 rounded-xl bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span className={`font-nunito relative z-10 text-[14px] font-bold ${isActive ? "text-primary-black" : "text-grey-600"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MobileRow({ row, delay }: { row: ShowcaseRow; delay: number }) {
  const media = row.media ?? [undefined, undefined];
  const labels = row.mediaLabels ?? ["Before", "After"];
  const [active, setActive] = useState(0);

  return (
    <SlideIn delay={delay}>
      <div className="flex flex-col gap-4 rounded-2xl border border-grey-100 bg-proj-white p-5">
        <div className="flex items-center gap-3">
          <span className="font-fredoka text-[22px] leading-[22px] text-secondary-blue">{row.number}</span>
          <div className="flex flex-col">
            <p className="font-nunito text-[13px] leading-[18px] font-bold text-grey-500">{row.title}</p>
            <h4 className="font-nunito text-[17px] leading-[24px] font-bold text-primary-black">{row.subtitle}</h4>
          </div>
        </div>

        <div className="flex flex-col">
          <FolderTabs labels={labels} active={active} onChange={setActive} />
          <div className="flex w-full flex-col items-center gap-3 rounded-b-2xl border border-t-0 border-[#e5e0db] bg-grey-50 px-4 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-[46vw] max-w-[190px] min-w-[150px]"
              >
                <PhoneFrame screen={mediaScreen(media[active])} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <PainSolutionBlock row={row} />
      </div>
    </SlideIn>
  );
}

/**
 * Interface Showcase ("關鍵介面優化與體驗重塑"), Figma fileKey
 * 8qGUSDUJqOgJaSERffGXVc. 4 pain-point -> solution rows, each with 2 phone
 * screenshots. Desktop: alternating left/right zigzag (both images always
 * visible), copied from Metro's `DesktopPanel` pattern. Mobile: each row is
 * its own block with a 2-tab FolderTabs switcher toggling the 2 screenshots,
 * copied from Metro's mobile FolderTabs pattern.
 *
 * Content model: `process.interfaceShowcaseIntro`, `process.showcaseRows`
 * (4x {number, title, subtitle, painLabel?, pain, solutionLabel?, solution,
 * media?, mediaLabels?}). No real screenshots exist yet -- every PhoneFrame
 * renders its built-in placeholder until admin uploads media.
 */
export function InterfaceShowcase({ process }: { process: Record<string, unknown> }) {
  const heading = (process.interfaceShowcaseHeading as string) || "關鍵介面優化與體驗重塑";
  const intro = process.interfaceShowcaseIntro as string | undefined;
  const rows = Array.isArray(process.showcaseRows) ? (process.showcaseRows as ShowcaseRow[]) : [];

  if (rows.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-secondary-blue uppercase">
              Interface Showcase
            </span>
            <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
              {heading}
            </h3>
            {intro && (
              <p className="font-nunito max-w-[720px] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[18px] md:leading-[25px]">
                {intro}
              </p>
            )}
            <div className="w-full border-t border-dashed border-[#e0e0e0]" />
          </div>
        </SlideIn>

        {/* Mobile */}
        <div className="flex flex-col gap-6 md:hidden">
          {rows.map((row, i) => (
            <MobileRow key={row.number} row={row} delay={0.1 + i * 0.05} />
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden flex-col gap-10 md:flex">
          {rows.map((row, i) => (
            <DesktopRowPanel key={row.number} row={row} reverse={i % 2 === 1} delay={0.1 + i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
