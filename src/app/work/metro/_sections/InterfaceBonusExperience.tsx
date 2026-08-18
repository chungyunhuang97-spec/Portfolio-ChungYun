"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExclamationMark } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

interface FeatureItem {
  title: string;
  mobileTitle?: string;
  desc: string;
  mobileDesc?: string;
}

interface BonusBlock {
  tabLabel: string;
  mobileTabLabel?: string;
  painPoint: string;
  features: FeatureItem[];
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

/**
 * Soft rotating conic glow behind a PhoneFrame -- reused as-is from
 * InterfaceRouteSearch / InterfaceCompanionService (same visual signature).
 */
function PhoneGlow({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-5 rounded-[3rem] opacity-50 blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #ff520d 50deg, transparent 130deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function PainPointCallout({ text }: { text: string }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-grey-100 p-4">
      <span className="relative size-[50px] shrink-0 overflow-hidden rounded-2xl">
        <Image src="/work/metro/Property_1painpoints.png" alt="" fill sizes="50px" className="object-contain" />
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="font-nunito text-[14px] font-bold text-primary-orange">痛點解決</p>
        <p className="font-nunito text-[13px] leading-[18px] font-normal text-grey-600">{text}</p>
      </div>
    </div>
  );
}

/**
 * Same FeatureRow shape as the other two sub-blocks, extended with an
 * optional `mobileTitle` -- Figma's mobile FeaturesList for this sub-block
 * actually swaps in a shorter FEATURE TITLE on mobile too (e.g. desktop
 * "精準需求過濾" vs mobile "精準需求適配"), not just a shorter description like
 * the previous two sub-blocks. `mobileDesc`-only fallback wouldn't have
 * captured that, so this file's copy of FeatureRow gains the extra prop
 * (kept local to this file per the per-section convention -- not touching
 * the other two files' identical-but-simpler FeatureRow).
 */
function FeatureRow({ feature, mobile = false }: { feature: FeatureItem; mobile?: boolean }) {
  return (
    <div
      className={`flex w-full items-start gap-4 rounded-2xl border border-grey-50 bg-proj-white ${
        mobile ? "p-3" : "p-6"
      }`}
    >
      <span className="mt-0.5 h-auto min-h-[38px] w-1 shrink-0 self-stretch rounded-[2px] bg-primary-orange" aria-hidden />
      <div className="flex flex-col gap-1.5">
        <p className="font-nunito text-[14px] font-bold text-primary-orange md:text-[15px]">
          {mobile ? feature.mobileTitle || feature.title : feature.title}
        </p>
        <p className="font-nunito text-[13px] leading-[18px] font-normal text-grey-800 md:text-[14px] md:leading-[22px]">
          {mobile ? feature.mobileDesc || feature.desc : feature.desc}
        </p>
      </div>
    </div>
  );
}

/**
 * Mobile-only auto-rotating "page control" for the feature list -- identical
 * fix/rationale as the other two sub-blocks (see InterfaceRouteSearch's doc
 * comment), duplicated here per the per-section-file convention.
 */
function MobileFeatureCarousel({ features }: { features: FeatureItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (features.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % features.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [features]);

  const active = features[index];
  if (!active) return null;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.title}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          <FeatureRow feature={active} mobile />
        </motion.div>
      </AnimatePresence>
      {features.length > 1 && (
        <div className="flex items-center gap-2">
          {features.map((f, i) => (
            <button
              key={f.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`查看第 ${i + 1} 項說明：${f.title}`}
              className={`h-[10px] rounded-[5px] transition-all duration-300 ${
                i === index ? "w-[28px] bg-primary-orange" : "w-[10px] bg-grey-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile-only "!" trigger overlapping the phone mockup's bottom-right
 * corner -- identical pattern to the other two sub-blocks, duplicated here
 * per the self-contained-per-section convention.
 */
function MobilePainPointButton({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute -right-10 bottom-6 z-20">
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              key="popup"
              role="dialog"
              className="absolute right-0 bottom-full z-40 mb-3 w-[220px] origin-bottom-right rounded-2xl border border-primary-orange/20 bg-proj-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <p className="font-nunito text-[11px] font-extrabold tracking-[1px] text-primary-orange uppercase">
                痛點解決
              </p>
              <p className="font-nunito mt-1 text-[13px] leading-[19px] font-normal text-grey-800">{text}</p>
              <span
                className="absolute right-6 -bottom-[6px] size-3 rotate-45 border-r border-b border-primary-orange/20 bg-proj-white"
                aria-hidden
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="查看痛點解決說明"
        animate={open ? { scale: 1 } : { scale: [1, 1.12, 1] }}
        transition={open ? { duration: 0.2 } : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.88 }}
        className="relative z-40 flex size-8 items-center justify-center rounded-full bg-primary-orange shadow-[0_4px_12px_rgba(255,82,13,0.4)]"
      >
        <ExclamationMark size={16} weight="bold" className="text-proj-white" />
      </motion.button>
    </div>
  );
}

/**
 * Mobile FolderTabs -- same fixed-height-track + inset-sliding-pill
 * structure as the other two sub-blocks (2026-08-18 redesign, see
 * InterfaceRouteSearch's doc comment for the full rationale), duplicated
 * here per the per-section-file convention. Colors match this sub-block's
 * literal Figma border (`#e5e0db`, distinct from section 1's implicit grey)
 * -- track sits on `bg-grey-100` against the section's `bg-grey-50` page
 * background so it still reads as a raised tab strip.
 */
function FolderTabs({
  blocks,
  active,
  onChange,
}: {
  blocks: BonusBlock[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex w-full gap-1 rounded-t-2xl border border-b-0 border-[#e5e0db] bg-grey-100 p-1.5">
      {blocks.map((b, i) => {
        const isActive = i === active;
        return (
          <button
            key={b.tabLabel}
            type="button"
            onClick={() => onChange(i)}
            className="relative flex-1 rounded-xl px-2 py-2.5 text-center"
          >
            {isActive && (
              <motion.span
                layoutId="bonusFolderTabBg"
                className="absolute inset-0 rounded-xl bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span
              className={`font-nunito relative z-10 truncate px-1 text-[14px] font-bold ${
                isActive ? "text-primary-black" : "text-grey-600"
              }`}
            >
              {b.mobileTabLabel || b.tabLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Desktop segmented-control tab bar -- distinct component from mobile's
 * FolderTabs (Figma names it "tab bar" separately, node
 * I127:321;60:2642-2647): a white pill (`rounded-[32px]`) holding two
 * equal-width buttons, active = solid orange fill + white text, inactive =
 * white fill + grey border + grey text. Sits directly under the phone
 * mockup in the center column and is the ONLY interactive control that
 * switches `activeTab` on desktop (the two side panels are also clickable
 * as a secondary affordance -- see `BonusPanel`).
 */
function SegmentedTabBar({
  blocks,
  active,
  onChange,
}: {
  blocks: BonusBlock[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-[32px] bg-proj-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {blocks.map((b, i) => {
        const isActive = i === active;
        return (
          <button
            key={b.tabLabel}
            type="button"
            onClick={() => onChange(i)}
            className={`font-nunito flex-1 rounded-xl px-4 py-2.5 text-center text-[13px] transition-colors duration-200 ${
              isActive
                ? "bg-primary-orange font-bold text-proj-white shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                : "border border-grey-100 bg-proj-white font-semibold text-grey-600"
            }`}
          >
            {b.tabLabel}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Desktop side panel -- 2026-08-18 new pattern, NOT the zigzag `DesktopPanel`
 * the other two sub-blocks use. Both panels are always mounted side by side
 * (left = block 0, right = block 1) flanking the phone+tab-bar column; which
 * one reads as "selected" is controlled by opacity (100% active / 65% per
 * Figma's literal inactive-state value, never fully hidden) rather than by
 * swapping which panel renders. Also doubles as a click target so the
 * dimmed panel itself is a second way to switch tabs, not just the
 * SegmentedTabBar below the phone -- matches Joe's "被選取時的內容要更明顯，未被
 * 選取的...不至於到完全隱藏" spec while adding an obvious extra affordance.
 */
function BonusPanel({
  block,
  isActive,
  onSelect,
}: {
  block: BonusBlock;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isActive}
      aria-pressed={isActive}
      className={`flex flex-1 flex-col gap-4 rounded-2xl bg-grey-50 p-4 text-left transition-opacity duration-300 ${
        isActive ? "opacity-100" : "cursor-pointer opacity-65 hover:opacity-85"
      }`}
    >
      <p className="font-nunito text-[24px] leading-[36px] font-bold text-secondary-blue">{block.tabLabel}</p>
      <PainPointCallout text={block.painPoint} />
      <div className="flex flex-col gap-4">
        {block.features.map((f) => (
          <FeatureRow key={f.title} feature={f} />
        ))}
      </div>
    </button>
  );
}

/**
 * Mobile-only decorative background -- Joe's explicit ask for this
 * sub-block specifically ("底圖...可以有一些幾何圖形作為裝飾...用灰色加一些幾何圖形做
 * 點綴，並嘗試用 Motion 的方式來呈現"). Self-contained absolutely-positioned
 * layer (own `overflow-hidden`, own `-z-10`) so it never clips sibling
 * content like the MobilePainPointButton popup -- same isolation pattern as
 * InterfaceCompanionService's TechBackground. Four simple line-art shapes
 * (dashed ring, rotating diamond outline, drifting dot, rotating rounded
 * square) parked in the corners/edges of the section so they never sit
 * under body text; respects prefers-reduced-motion by freezing all of them.
 * Desktop is intentionally NOT decorated -- Joe's ask was scoped to the
 * mobile background specifically, and the desktop layout is already a busy
 * three-column composition that doesn't need more visual noise.
 */
function GeometricAccents() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.span
        className="absolute top-[4%] right-[6%] size-16 rounded-full border-2 border-dashed border-primary-orange/25"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute top-[34%] -left-8 size-20 rounded-2xl border-2 border-secondary-blue/12"
        style={{ rotate: 45 }}
        animate={reduceMotion ? undefined : { rotate: [45, 405] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute bottom-[22%] right-[8%] size-3 rounded-full bg-primary-orange/25"
        animate={reduceMotion ? undefined : { y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute bottom-[4%] left-[12%] size-12 rounded-xl border-2 border-grey-300"
        style={{ rotate: 12 }}
        animate={reduceMotion ? undefined : { rotate: [12, 372] }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/**
 * Section 4 (third sub-block) -- 03 附加體驗與優化 (accessibility & AR nav +
 * the Go rewards interface tune-up), Figma desktop node 127:294 / mobile
 * node 147:200.
 *
 * Structurally different from the first two sub-blocks: those show BOTH
 * their panels stacked (zigzag) at once. This one shows both panels
 * side-by-side in a single row flanking a shared phone mockup, and uses a
 * tab control (SegmentedTabBar on desktop, FolderTabs on mobile) to decide
 * which panel is "selected" -- selected = opacity-100, unselected =
 * opacity-65 (never fully hidden), per Joe's spec. Because it's one row
 * instead of two stacked panels, this sub-block is naturally much shorter
 * than the previous two and reads as roughly one desktop viewport tall
 * without any explicit height clamping -- no `h-screen`/`overflow-hidden`
 * trick needed, just not stacking multiple panels vertically.
 *
 * Content model: reuses the same `process` row, adding `bonusSectionNumber`
 * / `bonusSectionTitle` (structural) and `bonusBlocks` (the two panels'
 * copy). Each block's `features[]` carries `mobileTitle` in addition to the
 * existing `mobileDesc` pattern, because Figma's mobile FeaturesList for
 * this sub-block genuinely retitles feature 1 ("精準需求過濾" desktop vs
 * "精準需求適配" mobile), not just re-describes it. `mobileTabLabel` similarly
 * covers the shorter mobile tab text ("Go 優惠" vs desktop's full "Go 優惠
 * 介面調整"). The second block's mobile copy was authored here (same as the
 * other two sub-blocks' secondary tabs) since only the first tab exists as
 * an authored mobile state in Figma. Four media slots
 * (`bonusAccessibilityDesktopMediaUrl` / `bonusPromoDesktopMediaUrl` /
 * `bonusAccessibilityMobileMediaUrl` / `bonusPromoMobileMediaUrl`) are
 * admin-uploadable, same URL-by-extension convention as every other media
 * field on this page.
 *
 * No eyebrow/heading here -- "Interface & Interaction" renders exactly once,
 * in InterfaceRouteSearch.
 */
export function InterfaceBonusExperience({ process }: { process: Record<string, unknown> }) {
  const sectionNumber = (process.bonusSectionNumber as string) || "03";
  const sectionTitle = (process.bonusSectionTitle as string) || "附加體驗與優化";
  const blocks = Array.isArray(process.bonusBlocks) ? (process.bonusBlocks as BonusBlock[]) : [];
  const desktopMedia = [
    process.bonusAccessibilityDesktopMediaUrl as string | undefined,
    process.bonusPromoDesktopMediaUrl as string | undefined,
  ];
  const mobileMedia = [
    process.bonusAccessibilityMobileMediaUrl as string | undefined,
    process.bonusPromoMobileMediaUrl as string | undefined,
  ];

  const [activeTab, setActiveTab] = useState(0);
  const activeBlock = blocks[activeTab];

  if (blocks.length < 2) return null;

  return (
    <section className="bg-grey-50 px-6 py-8 md:px-[120px] md:py-[100px]">
      {/* Mobile layout -- same vertical rhythm / mockup-shrink / feature
          carousel as the other two sub-blocks, plus GeometricAccents behind
          everything per Joe's ask. */}
      <div className="relative flex flex-col gap-3 md:hidden">
        <GeometricAccents />

        <SlideIn delay={0.1}>
          <div className="flex items-center gap-3">
            <span className="font-fredoka text-[32px] leading-[32px] text-primary-orange">{sectionNumber}</span>
            <h2 className="font-nunito flex-1 text-[28px] leading-[39px] font-bold text-primary-black">
              {sectionTitle}
            </h2>
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex flex-col">
            <FolderTabs blocks={blocks} active={activeTab} onChange={setActiveTab} />

            <div className="w-full overflow-hidden rounded-b-2xl border border-t-0 border-[#e5e0db] bg-proj-white px-4 py-5">
              <AnimatePresence mode="wait">
                {activeBlock && (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="relative w-[46vw] max-w-[190px] min-w-[150px]">
                      <PhoneGlow>
                        <PhoneFrame screen={mediaScreen(mobileMedia[activeTab])} label="App 畫面（後臺可上傳影片）" />
                      </PhoneGlow>
                      <MobilePainPointButton text={activeBlock.painPoint} />
                    </div>
                    <MobileFeatureCarousel features={activeBlock.features} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SlideIn>
      </div>

      {/* Desktop layout -- single row (left panel / phone+tabbar / right
          panel), no zigzag stacking, so this sub-block reads as roughly one
          viewport tall without any explicit height trick. */}
      <div className="hidden flex-col gap-10 md:flex">
        <SlideIn delay={0.1}>
          <div className="flex items-center gap-5">
            <span className="font-fredoka text-primary-orange/15 text-[100px] leading-[100px]">{sectionNumber}</span>
            <h3 className="font-nunito text-[36px] leading-[50px] font-bold text-primary-black">{sectionTitle}</h3>
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex w-full items-stretch gap-8 rounded-[32px] bg-proj-white p-8">
            <BonusPanel block={blocks[0]} isActive={activeTab === 0} onSelect={() => setActiveTab(0)} />

            <div className="flex w-[280px] shrink-0 flex-col items-center justify-center gap-5">
              <PhoneGlow>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <PhoneFrame screen={mediaScreen(desktopMedia[activeTab])} />
                  </motion.div>
                </AnimatePresence>
              </PhoneGlow>
              <SegmentedTabBar blocks={blocks} active={activeTab} onChange={setActiveTab} />
            </div>

            <BonusPanel block={blocks[1]} isActive={activeTab === 1} onSelect={() => setActiveTab(1)} />
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
