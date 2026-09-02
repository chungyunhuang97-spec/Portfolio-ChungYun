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
  mediaLabels?: [string, string];
  /** Row 3 ("支付密碼設定優化") uniquely uses a blue "before" pill instead of
   * the usual grey/orange -- matched exactly from Figma, not a general rule. */
  beforeVariant?: "blue";
}

/** Resolves to a real screenshot/video URL once admin-uploaded, else
 * undefined (PhoneFrame's own placeholder). Media lives in flat top-level
 * `process` keys ending in `_media_url` (snake_case -- e.g.
 * `showcase_row1_before_media_url`) rather than nested inside
 * `showcaseRows[i]`, required for the admin `ContentEditor`'s
 * upload-dropzone auto-detection: `MEDIA_KEY_PATTERN =
 * /(_media_url|_image_url|_video_url)$/i` in
 * `src/components/admin/ContentEditor.tsx` requires a LITERAL underscore
 * before "media"/"url" -- camelCase keys like `showcaseRow1BeforeMediaUrl`
 * (no underscores) never match it and silently render as a plain text
 * field instead of an upload dropzone. (Metro's existing `*MediaUrl`
 * fields are camelCase too and, per this same regex, don't actually get
 * the dropzone treatment either -- that's a pre-existing latent mismatch
 * in that page, not something to copy. Hero's own `mockup_media_url`,
 * which Joe already successfully uploaded through, is the one real
 * confirmed-working example: snake_case.) */
function rowMedia(process: Record<string, unknown>, rowIndex: number): [string | undefined, string | undefined] {
  const before = process[`showcase_row${rowIndex + 1}_before_media_url`] as string | undefined;
  const after = process[`showcase_row${rowIndex + 1}_after_media_url`] as string | undefined;
  return [before || undefined, after || undefined];
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

/**
 * Desktop -- both Before/After phone images shown at once, side by side,
 * each with its own pill label below (Figma 526:1622).
 *
 * IMPORTANT sizing fix: `PhoneFrame` always derives its own height from
 * `aspect-[375/812]` applied to whatever width it's given -- it never
 * respects an externally-set height. The previous version wrapped it in a
 * fixed `h-[416px] w-[215px]` box; at 215px wide, PhoneFrame's own ratio
 * computes ~465px tall, ~49px TALLER than that box, so it visibly
 * overflowed downward and covered the Before/After pill sitting right
 * below it. Fix: give the OUTER wrapper the real height (tall, ~fills the
 * row per Joe's "fill 100VH" ask) via `aspect-[375/812]` + an explicit
 * height, then pass `h-full` into PhoneFrame so it fills that
 * already-correctly-shaped box instead of computing its own.
 */
function DesktopMediaPair({
  beforeUrl,
  afterUrl,
  labels,
  beforeVariant,
}: {
  beforeUrl?: string;
  afterUrl?: string;
  labels?: [string, string];
  beforeVariant?: "blue";
}) {
  const [beforeLabel, afterLabel] = labels ?? ["Before", "After"];
  const beforePillClass =
    beforeVariant === "blue" ? "bg-secondary-blue text-white" : "bg-grey-50 text-primary-orange";
  return (
    <div className="flex shrink-0 items-center gap-6">
      <div className="flex flex-col items-center gap-6">
        <div className="aspect-[375/812] h-[62vh] max-h-[640px]">
          <PhoneFrame screen={mediaScreen(beforeUrl)} className="h-full" />
        </div>
        <span className={`inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 font-nunito text-[12px] font-bold ${beforePillClass}`}>
          {beforeLabel}
        </span>
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="aspect-[375/812] h-[62vh] max-h-[640px]">
          <PhoneFrame screen={mediaScreen(afterUrl)} className="h-full" />
        </div>
        <span className="inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary-orange px-4 py-1.5 font-nunito text-[12px] font-bold text-white">
          {afterLabel}
        </span>
      </div>
    </div>
  );
}

/** Desktop row -- alternates text/image sides per index (Figma
 * ImprovementRow-01..04, 526:1426/1446/1466/1589). Every row shares one
 * fixed `min-h-screen` height (per Joe: "後面區域的 Flow 也固定跟 Section One
 * 的大小一樣，不要每個都不一樣") instead of each sizing to its own content. */
function DesktopRow({ row, process, rowIndex, reversed }: { row: ShowcaseRow; process: Record<string, unknown>; rowIndex: number; reversed: boolean }) {
  const [beforeUrl, afterUrl] = rowMedia(process, rowIndex);
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
  const media = (
    <DesktopMediaPair beforeUrl={beforeUrl} afterUrl={afterUrl} labels={row.mediaLabels} beforeVariant={row.beforeVariant} />
  );
  return (
    <div className="flex min-h-screen items-center gap-16 py-12">
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
 * (Figma 550:3535..). Copied verbatim (structure + class strategy) from
 * Metro's `FolderTabs` (`src/app/work/metro/_sections/InterfaceRouteSearch.tsx`)
 * per Joe's explicit ask to reuse that exact component rather than a
 * reimplementation -- the seamless tab-to-panel connection (no border/color
 * gap) comes from: tab track drops its bottom border + rounds only its top
 * corners, the panel drops its top border + rounds only its bottom corners,
 * both share the same border color, and the active-tab pill's fill matches
 * the panel's own background -- with zero gap between the two wrapper
 * elements (a single `flex flex-col`, no `gap` class). */
function FolderTabs({ afterActive, onChange }: { afterActive: boolean; onChange: (after: boolean) => void }) {
  return (
    <div className="flex w-full gap-1 rounded-t-2xl border border-b-0 border-[#e5e0db] bg-grey-100 p-1.5">
      {[
        { label: "調整後", isActive: afterActive, onClick: () => onChange(true) },
        { label: "調整前", isActive: !afterActive, onClick: () => onChange(false) },
      ].map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={tab.onClick}
          className="relative flex-1 rounded-xl px-2 py-2.5 text-center"
        >
          {tab.isActive && (
            <motion.span
              layoutId="piiluuFolderTabBg"
              className="absolute inset-0 rounded-xl bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            />
          )}
          <span className={`font-nunito relative z-10 text-[15px] font-bold ${tab.isActive ? "text-primary-black" : "text-grey-600"}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Every mobile row is capped at exactly one viewport tall (Joe: "一進入到
 * 數字之後，就應該高度控制在 100vh"). Rather than picking a fixed phone size
 * that has to guess how much room the pain/solution copy needs, the phone
 * is HEIGHT-driven: its wrapper is `flex-1 min-h-0` (fills whatever
 * vertical space is left after the pain/solution block's own natural
 * height) with `aspect-[375/812]` deriving its width from that available
 * height, then `h-full` into `PhoneFrame` so it fills the wrapper instead
 * of computing its own size from a bare width (PhoneFrame otherwise always
 * derives height FROM width, never the reverse -- same "shaped wrapper"
 * technique used everywhere else in this codebase). This makes the phone
 * as large as each row's own copy allows -- consistently sized across all
 * four rows since their copy lengths are similar -- while the
 * pain/solution block keeps its natural height directly under it, which
 * reads as "docked to the bottom" of the panel precisely because the
 * phone above it is what expands to fill the remaining space. */
function MobileRow({ row, process, rowIndex }: { row: ShowcaseRow; process: Record<string, unknown>; rowIndex: number }) {
  const [afterActive, setAfterActive] = useState(true);
  const [beforeUrl, afterUrl] = rowMedia(process, rowIndex);
  const activeUrl = afterActive ? afterUrl : beforeUrl;

  return (
    <div className="flex h-[100dvh] w-full flex-col gap-3 bg-white px-6 pt-10 pb-5">
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-fredoka text-[32px] leading-none text-primary-orange">{row.number}</span>
        <span className="flex-1 font-nunito text-[28px] leading-[39px] font-bold text-black">{row.title}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <FolderTabs afterActive={afterActive} onChange={setAfterActive} />
        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-hidden rounded-b-2xl border border-t-0 border-[#e5e0db] bg-proj-white px-4 py-4">
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={afterActive ? "after" : "before"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="aspect-[375/812] h-full"
              >
                <PhoneFrame screen={mediaScreen(activeUrl)} className="h-full" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="w-full shrink-0">
            <PainSolutionBlock pain={row.pain} solution={row.solution} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interface Showcase ("關鍵介面優化與體驗重塑"), Figma fileKey
 * 8qGUSDUJqOgJaSERffGXVc, desktop nodes 526:1417 (intro) + 526:1426/1446/
 * 1466/1589 (4 rows) / mobile nodes 550:3564 (intro) + 550:3535 + 3 sibling
 * InterfaceDesign_0X frames. Desktop: one shared section heading, then 4
 * alternating-side rows, each `min-h-screen` so all 4 share one consistent
 * size regardless of copy length. Mobile: per-row heading (no separate
 * subtitle line, title in black not blue) + Metro's exact FolderTabs
 * switcher toggling one image.
 *
 * Content model: `process.interfaceShowcaseHeading`, `.
 * interfaceShowcaseIntro`, `process.showcaseRows` (4x {number, title,
 * subtitle, pain, solution, mediaLabels?, beforeVariant?}); media URLs live in flat snake_case `process.showcase_row{N}_{before,after}_media_url` keys.
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
            <DesktopRow row={row} process={process} rowIndex={i} reversed={i % 2 === 1} />
          </SlideIn>
        ))}
      </div>

      <div className="flex flex-col md:hidden">
        {rows.map((row, i) => (
          <SlideIn key={row.number} delay={0.1 + i * 0.05}>
            <MobileRow row={row} process={process} rowIndex={i} />
          </SlideIn>
        ))}
      </div>
    </section>
  );
}
