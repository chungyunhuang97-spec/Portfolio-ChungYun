"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenNib } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

interface ShowcaseRow {
  number: string;
  title: string;
  subtitle: string;
  pain: string;
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

/** Pain/Solution card pair -- Figma nodes 526:1433 / 550:3581. Solution
 * badge is solid black, not blue/orange -- matched exactly, not themed. */
function PainSolutionBlock({ pain, solution }: { pain: string; solution: string }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-xl bg-grey-50 p-4">
        <span className="inline-flex w-fit items-center rounded bg-primary-orange px-2 py-1 font-nunito text-[13px] font-bold text-white">
          PAIN POINT
        </span>
        <p className="font-nunito text-[14px] leading-[21px] font-normal text-[#333]">{pain}</p>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-grey-50 p-4">
        <span className="inline-flex w-fit items-center rounded bg-black px-2 py-1 font-nunito text-[13px] font-bold text-white">
          SOLUTION
        </span>
        <p className="font-nunito text-[14px] leading-[21px] font-normal text-[#333]">{solution}</p>
      </div>
    </div>
  );
}

/** Desktop -- both Before/After phone images shown at once, side by side,
 * each with its own pill label below (Figma 526:1622). */
function DesktopMediaPair({ media, labels }: { media?: [string | undefined, string | undefined]; labels?: [string, string] }) {
  const [beforeUrl, afterUrl] = media ?? [undefined, undefined];
  const [beforeLabel, afterLabel] = labels ?? ["Before", "After"];
  return (
    <div className="flex shrink-0 items-center gap-6">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="h-[416px] w-[215px]"><PhoneFrame screen={mediaScreen(beforeUrl)} /></div>
        <span className="inline-flex w-[70px] items-center justify-center rounded-full bg-grey-50 px-4 py-1.5 font-nunito text-[12px] font-bold text-primary-orange">
          {beforeLabel}
        </span>
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="h-[416px] w-[215px]"><PhoneFrame screen={mediaScreen(afterUrl)} /></div>
        <span className="inline-flex w-[70px] items-center justify-center rounded-full bg-primary-orange px-4 py-1.5 font-nunito text-[12px] font-bold text-white">
          {afterLabel}
        </span>
      </div>
    </div>
  );
}

/** Desktop row -- alternates text/image sides per index (Figma
 * ImprovementRow-01..04, 526:1426/1446/1466/1589). */
function DesktopRow({ row, reversed }: { row: ShowcaseRow; reversed: boolean }) {
  const content = (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="font-nunito text-[36px] font-extrabold text-primary-orange">{row.number}</span>
          <span className="font-nunito text-[16px] font-semibold text-[#1a1a1a]">{row.title}</span>
        </div>
        <p className="font-nunito text-[28px] leading-[39px] font-bold text-secondary-blue">{row.subtitle}</p>
      </div>
      <PainSolutionBlock pain={row.pain} solution={row.solution} />
    </div>
  );
  const media = <DesktopMediaPair media={row.media} labels={row.mediaLabels} />;
  return (
    <div className="flex items-center gap-16 py-12">
      {reversed ? (
        <>
          {media}
          {content}
        </>
      ) : (
        <>
          {content}
          {media}
        </>
      )}
    </div>
  );
}

/** Mobile -- 2-tab FolderTabs switching one image between "調整後"/"調整前"
 * (Figma 550:3535..) -- fixed Chinese tab labels regardless of the stored
 * `mediaLabels` (those only drive desktop's Before/After pills). Sliding
 * active-tab pill copied from Metro's FolderTabs pattern
 * (InterfaceRouteSearch.tsx). */
function MobileRow({ row }: { row: ShowcaseRow }) {
  const [afterActive, setAfterActive] = useState(true);
  const [beforeUrl, afterUrl] = row.media ?? [undefined, undefined];
  const activeUrl = afterActive ? afterUrl : beforeUrl;

  return (
    <div className="flex w-full flex-col gap-4 bg-white px-6 pt-12 pb-6">
      <div className="flex items-center gap-3">
        <span className="font-fredoka text-[32px] leading-none text-primary-orange">{row.number}</span>
        <span className="flex-1 font-nunito text-[28px] leading-[39px] font-bold text-black">{row.title}</span>
      </div>

      <div className="flex h-[44px] w-full items-end">
        <button
          type="button"
          onClick={() => setAfterActive(true)}
          className={`relative flex h-full flex-1 items-center justify-center rounded-tl-xl rounded-tr-2xl border-t border-l border-[#e5e0db] font-nunito text-[15px] font-bold transition-colors ${
            afterActive ? "bg-white text-black" : "h-[34px] self-end bg-grey-100 text-[#666]"
          }`}
        >
          調整後
        </button>
        <button
          type="button"
          onClick={() => setAfterActive(false)}
          className={`relative flex h-full flex-1 items-center justify-center rounded-tr-xl border-t border-r border-[#e5e0db] font-nunito text-[15px] font-bold transition-colors ${
            !afterActive ? "bg-white text-black" : "h-[34px] self-end bg-grey-100 text-[#666]"
          }`}
        >
          調整前
        </button>
      </div>
      <div className="flex w-full flex-col items-center gap-6 rounded-b-xl border-b border-l border-r border-[#e5e0db] px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={afterActive ? "after" : "before"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="aspect-[306/591.6] w-full max-w-[260px]"
          >
            <PhoneFrame screen={mediaScreen(activeUrl)} />
          </motion.div>
        </AnimatePresence>
        <PainSolutionBlock pain={row.pain} solution={row.solution} />
      </div>
    </div>
  );
}

/**
 * Interface Showcase ("關鍵介面優化與體驗重塑"), Figma fileKey
 * 8qGUSDUJqOgJaSERffGXVc, desktop nodes 526:1417 (intro) + 526:1426/1446/
 * 1466/1589 (4 rows) / mobile nodes 550:3564 (intro) + 550:3535 + 3 sibling
 * InterfaceDesign_0X frames. Desktop: one shared section heading, then 4
 * alternating-side rows with both Before/After images visible at once.
 * Mobile: per-row heading (no separate subtitle line, title in black not
 * blue) + a real 2-tab FolderTabs switcher toggling one image.
 *
 * Content model: `process.interfaceShowcaseHeading`, `.
 * interfaceShowcaseIntro`, `process.showcaseRows` (4x {number, title,
 * subtitle, pain, solution, media?, mediaLabels?}).
 */
export function InterfaceShowcase({ process }: { process: Record<string, unknown> }) {
  const heading = (process.interfaceShowcaseHeading as string) || "關鍵介面優化與體驗重塑";
  const intro = process.interfaceShowcaseIntro as string | undefined;
  const rows = Array.isArray(process.showcaseRows) ? (process.showcaseRows as ShowcaseRow[]) : [];

  if (rows.length === 0) return null;

  return (
    <section className="bg-white px-6 py-8 md:px-[200px] md:py-20">
      {/* Desktop -- one shared heading */}
      <SlideIn delay={0.1} className="hidden md:block">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <PenNib size={18} weight="bold" className="text-primary-orange" />
            <span className="font-nunito text-[13px] font-extrabold text-primary-orange">Interface &amp; Interaction</span>
          </div>
          <h3 className="font-nunito text-[48px] leading-[72px] font-bold text-black">{heading}</h3>
          {intro && <p className="font-nunito text-[18px] leading-[25px] font-normal text-[#666]">{intro}</p>}
          <div className="h-px w-full bg-grey-300/50" />
        </div>
      </SlideIn>

      {/* Mobile -- shared intro block, then per-row headings inline */}
      <SlideIn delay={0.1} className="md:hidden">
        <div className="flex flex-col gap-3 py-4">
          <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-primary-orange">Interface &amp; Interaction</span>
          <h3 className="font-nunito text-[24px] leading-9 font-bold text-[#1a1a1a]">{heading}</h3>
          {intro && <p className="font-nunito text-[14px] leading-[21px] font-normal text-[#666]">{intro}</p>}
          <div className="h-px w-full bg-grey-300/50" />
        </div>
      </SlideIn>

      <div className="hidden divide-y divide-grey-100 md:block">
        {rows.map((row, i) => (
          <SlideIn key={row.number} delay={0.1 + i * 0.05}>
            <DesktopRow row={row} reversed={i % 2 === 1} />
          </SlideIn>
        ))}
      </div>

      <div className="flex flex-col md:hidden">
        {rows.map((row, i) => (
          <SlideIn key={row.number} delay={0.1 + i * 0.05}>
            <MobileRow row={row} />
          </SlideIn>
        ))}
      </div>
    </section>
  );
}
