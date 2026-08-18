"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PenNib, ExclamationMark } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

interface FeatureItem {
  title: string;
  desc: string;
  mobileDesc?: string;
}

interface InterfaceBlock {
  tabLabel: string;
  title: string;
  subtitle: string;
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
 * Soft rotating conic glow behind a PhoneFrame -- a lighter-weight cousin of
 * StrategyBeforeApp's TechGlowBorder, sized for a phone mockup rather than a
 * callout card. This is the section's tech-feel signature element.
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
    <div className="flex w-full items-center gap-3 rounded-2xl bg-grey-50 p-4">
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

function FeatureRow({ feature, mobile = false }: { feature: FeatureItem; mobile?: boolean }) {
  return (
    <div
      className={`flex w-full items-start gap-4 rounded-2xl border border-grey-50 bg-proj-white ${
        mobile ? "p-3" : "p-6"
      }`}
    >
      <span className="mt-0.5 h-auto min-h-[38px] w-1 shrink-0 self-stretch rounded-[2px] bg-primary-orange" aria-hidden />
      <div className="flex flex-col gap-1.5">
        <p className="font-nunito text-[14px] font-bold text-primary-orange md:text-[15px]">{feature.title}</p>
        <p className="font-nunito text-[13px] leading-[18px] font-normal text-grey-800 md:text-[14px] md:leading-[22px]">
          {mobile ? feature.mobileDesc || feature.desc : feature.desc}
        </p>
      </div>
    </div>
  );
}

/**
 * Mobile-only auto-rotating "page control" for the feature list -- 2026-08-18
 * fix for Joe's "100vh 內看不到完整三項說明" report. Showing all 3
 * FeatureRows stacked (previous behaviour) pushed the section well past one
 * mobile viewport when combined with the phone mockup above it. Instead,
 * show ONE row at a time, auto-advance every 3.2s, and offer dots so every
 * item still surfaces without requiring a page scroll (per Joe's own
 * proposed "Page Control" spec). Remounts fresh (index resets to 0) every
 * time the parent's `key={activeTab}` changes tabs, since this lives inside
 * that keyed subtree -- no extra reset effect needed.
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
 * corner -- the mobile equivalent of desktop's always-visible 痛點解決
 * callout. Tapping it pops a small anchored card (not a full modal, so it
 * stays lightweight/native-feeling) with a spring-in/out transition.
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
 * Folder-style tab switcher for mobile -- 2026-08-18 redesign after Joe
 * flagged the active tab's right edge and bottom (the seam against the
 * content panel) as looking like a sharp, unfinished right angle. The
 * previous version varied each button's HEIGHT to make the active tab
 * "pop up" (44px vs 34px), which only left room to round the outer two
 * corners of the whole strip -- every other corner, including the active
 * tab's own corners, stayed square.
 *
 * This version keeps the same "no gap/notch between tabs" principle (still
 * reads as one continuous folder body, not separate pills) but switches the
 * mechanism: a single fixed-height track (rounded-t-2xl, bordered) holds
 * all tabs at equal height, and the active state is a small inset pill
 * (rounded-xl on every corner) that slides between positions via
 * `layoutId`. Because there's no height differential anymore, there's
 * nothing to leave square -- the track's top corners round into the panel
 * below (which keeps its own rounded-b-2xl), so the whole tab+panel unit
 * reads as one seamless rounded card. This also drops the per-button
 * `transition-[height]` that used to fight the layoutId spring animation on
 * every tap -- one less animated layout property should help the tap-lag
 * Joe reported (see MobileFeatureCarousel / TechBackground for the other
 * two perf fixes from this same pass).
 */
function FolderTabs({
  blocks,
  active,
  onChange,
}: {
  blocks: InterfaceBlock[];
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
                layoutId="folderTabBg"
                className="absolute inset-0 rounded-xl bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span
              className={`font-nunito relative z-10 text-[15px] font-bold ${
                isActive ? "text-primary-black" : "text-grey-600"
              }`}
            >
              {b.tabLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DesktopPanel({
  block,
  media,
  reverse,
  delay,
}: {
  block: InterfaceBlock;
  media?: string;
  reverse?: boolean;
  delay: number;
}) {
  return (
    <SlideIn direction={reverse ? "right" : "left"} delay={delay}>
      <div
        className={`flex w-full items-center gap-10 rounded-[32px] bg-proj-white p-8 ${
          reverse ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-nunito text-[28px] leading-[39px] font-bold text-grey-400">{block.title}</p>
            <p className="font-nunito text-[24px] leading-[36px] font-bold text-secondary-blue">{block.subtitle}</p>
          </div>
          <PainPointCallout text={block.painPoint} />
          <div className="flex flex-col gap-4">
            {block.features.map((f) => (
              <FeatureRow key={f.title} feature={f} />
            ))}
          </div>
        </div>
        <div className="w-[280px] shrink-0">
          <PhoneGlow>
            <PhoneFrame screen={mediaScreen(media)} />
          </PhoneGlow>
        </div>
      </div>
    </SlideIn>
  );
}

/**
 * Section 4 (first sub-block) -- 核心介面優化與服務創新設計 / 01 路線搜尋與規劃
 * (Figma desktop node 127:142 / mobile node 147:140).
 *
 * The desktop node bundles the mega-section heading ("Interface &
 * Interaction" / 核心介面優化與服務創新設計) together with TWO always-visible,
 * zigzag-laid-out panels under the single "01 路線搜尋與規劃" heading --
 * panel 1 = 搜尋路線 (route search), panel 2 = 站點資訊 (station info). Mobile
 * collapses those same two panels into one folder-tab switcher instead of
 * showing both at once (confirmed by the 站點資訊 tab label + FeatureItem
 * titles in panel 2 matching 1:1). Future "02 / 03" numbered sub-blocks
 * (Figma InterfaceDesign_02 / _03, not part of this task) will need their
 * own component reusing this same SectionHeading-once-then-blocks pattern
 * -- the eyebrow/heading here should NOT be repeated by that later work.
 *
 * Content model: reuses the `process` row again (same row as Section 3),
 * adding `interfaceEyebrow` / `interfaceHeading` / `interfaceSectionNumber`
 * / `interfaceSectionTitle` (structural, rarely edited) and
 * `interfaceBlocks` (the two panels' copy, incl. `mobileDesc` shorthands
 * for feature descriptions -- the 站點資訊 mobileDesc values were authored
 * here, not pulled from Figma, since only the 搜尋路線 tab exists as an
 * active state in the file). The four media slots
 * (`interfaceSearchDesktopMediaUrl` / `interfaceStationDesktopMediaUrl` /
 * `interfaceSearchMobileMediaUrl` / `interfaceStationMobileMediaUrl`) are
 * admin-uploadable per Joe's request -- desktop takes images, mobile takes
 * video, but the field just stores a URL and `mediaScreen()` picks
 * <video>/<img> by file extension at render time (same pattern as Hero).
 *
 * Desktop: SectionHeading, then "01 路線搜尋與規劃" numeral+title, then both
 * panels stacked with alternating image side (zigzag) inside a glowing
 * PhoneFrame. Mobile: numeral+title only (no eyebrow, per Figma), a
 * folder-shaped tab switcher, and a single active panel whose PhoneFrame
 * carries an overlapping "!" button that pops the 痛點解決 copy shown
 * inline on desktop.
 */
export function InterfaceRouteSearch({ process }: { process: Record<string, unknown> }) {
  const eyebrow = (process.interfaceEyebrow as string) || "Interface & Interaction";
  const heading = (process.interfaceHeading as string) || "核心介面優化與服務創新設計";
  const sectionNumber = (process.interfaceSectionNumber as string) || "01";
  const sectionTitle = (process.interfaceSectionTitle as string) || "路線搜尋與規劃";
  const blocks = Array.isArray(process.interfaceBlocks) ? (process.interfaceBlocks as InterfaceBlock[]) : [];
  const desktopMedia = [
    process.interfaceSearchDesktopMediaUrl as string | undefined,
    process.interfaceStationDesktopMediaUrl as string | undefined,
  ];
  const mobileMedia = [
    process.interfaceSearchMobileMediaUrl as string | undefined,
    process.interfaceStationMobileMediaUrl as string | undefined,
  ];

  const [activeTab, setActiveTab] = useState(0);
  const activeBlock = blocks[activeTab];

  if (blocks.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-8 md:px-[120px] md:py-[100px]">
      {/* Mobile layout -- 2026-08-18: tightened vertical rhythm (gap-4→gap-3,
          section py-12→py-8, panel py-6→py-5, phone→list gap-6→gap-4) and
          shrunk the phone mockup to a viewport-relative width so it doesn't
          dominate a short screen, per Joe's "100vh 高度適配" ask. Combined
          with MobileFeatureCarousel below (showing one feature at a time
          instead of all 3 stacked), heading + tabs + mockup + a feature row
          should now fit one mobile viewport without scrolling. */}
      <div className="flex flex-col gap-3 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex items-center gap-3">
            <span className="font-fredoka text-[32px] leading-[32px] text-primary-orange">{sectionNumber}</span>
            <h2 className="font-nunito flex-1 text-[28px] leading-[39px] font-bold text-primary-black">
              {sectionTitle}
            </h2>
          </div>
        </SlideIn>

        {/* FolderTabs + content panel are grouped into ONE flex child so the
            parent's `gap-3` (meant to space the heading from this whole
            folder unit) never lands BETWEEN the tabs and the panel -- the
            tab strip sits flush against the panel below it, no seam. */}
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

      {/* Desktop layout */}
      <div className="hidden flex-col gap-[80px] md:flex">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <PenNib size={18} weight="fill" className="text-primary-orange" />
              <span className="font-nunito text-[13px] leading-[20px] font-extrabold text-primary-orange">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-nunito text-[48px] leading-[72px] font-bold text-primary-black">{heading}</h2>
            <div className="h-px w-full border-t border-dashed border-[#ededed]" />
          </div>
        </SlideIn>

        <div className="flex flex-col gap-10">
          <SlideIn delay={0.15}>
            <div className="flex items-center gap-5">
              <span className="font-fredoka text-primary-orange/15 text-[100px] leading-[100px]">
                {sectionNumber}
              </span>
              <h3 className="font-nunito text-[36px] leading-[50px] font-bold text-primary-black">{sectionTitle}</h3>
            </div>
          </SlideIn>

          <div className="flex flex-col gap-10">
            {blocks.map((block, i) => (
              <DesktopPanel
                key={block.tabLabel}
                block={block}
                media={desktopMedia[i]}
                reverse={i % 2 === 1}
                delay={0.1 + i * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
