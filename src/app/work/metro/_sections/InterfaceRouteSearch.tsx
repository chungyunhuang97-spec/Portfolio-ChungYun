"use client";

import { useState } from "react";
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
 * Mobile-only "!" trigger overlapping the phone mockup's bottom-right
 * corner -- the mobile equivalent of desktop's always-visible 痛點解決
 * callout. Tapping it pops a small anchored card (not a full modal, so it
 * stays lightweight/native-feeling) with a spring-in/out transition.
 */
function MobilePainPointButton({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute right-2 bottom-2 z-20">
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
 * Folder-style tab switcher for mobile -- the active tab uses a shared
 * layoutId so its white background "morphs" smoothly between positions
 * when Joe taps 搜尋路線 / 站點資訊, reading like a folder tab flipping
 * forward rather than a hard cut.
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
    <div className="flex h-11 w-full items-end gap-0">
      {blocks.map((b, i) => {
        const isActive = i === active;
        // Only the OUTER edges of the tab strip round -- the seam between
        // adjacent tabs stays square so the two pieces read as one
        // continuous folder body (no curved notch exposing the page
        // background between them) rather than two separate pills.
        const isFirst = i === 0;
        const isLast = i === blocks.length - 1;
        const edgeRounding = `${isFirst ? "rounded-tl-2xl" : ""} ${isLast ? "rounded-tr-2xl" : ""}`.trim();
        return (
          <button
            key={b.tabLabel}
            type="button"
            onClick={() => onChange(i)}
            className={`relative flex flex-1 items-center justify-center overflow-visible transition-[height] duration-300 ${
              isActive ? "h-11" : "h-[34px]"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="folderTabBg"
                className={`absolute inset-0 border border-b-0 border-[#e5e0db] bg-proj-white ${edgeRounding}`}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              />
            ) : (
              <span className={`absolute inset-0 bg-grey-100 ${edgeRounding}`} aria-hidden />
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
    <section className="bg-grey-50 px-6 py-12 md:px-[120px] md:py-[100px]">
      {/* Mobile layout */}
      <div className="flex flex-col gap-4 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex items-center gap-3">
            <span className="font-fredoka text-[32px] leading-[32px] text-primary-orange">{sectionNumber}</span>
            <h2 className="font-nunito flex-1 text-[28px] leading-[39px] font-bold text-primary-black">
              {sectionTitle}
            </h2>
          </div>
        </SlideIn>

        {/* FolderTabs + content panel are grouped into ONE flex child so the
            parent's `gap-4` (meant to space the heading from this whole
            folder unit) never lands BETWEEN the tabs and the panel -- the
            tab strip sits flush against the panel below it, no seam. */}
        <SlideIn delay={0.15}>
          <div className="flex flex-col">
            <FolderTabs blocks={blocks} active={activeTab} onChange={setActiveTab} />

            <div className="w-full overflow-hidden rounded-b-2xl border border-t-0 border-[#e5e0db] bg-proj-white px-4 py-6">
              <AnimatePresence mode="wait">
                {activeBlock && (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative w-[215px]">
                      <PhoneGlow>
                        <PhoneFrame screen={mediaScreen(mobileMedia[activeTab])} label="App 畫面（後臺可上傳影片）" />
                      </PhoneGlow>
                      <MobilePainPointButton text={activeBlock.painPoint} />
                    </div>
                    <div className="flex w-full flex-col gap-3">
                      {activeBlock.features.map((f) => (
                        <FeatureRow key={f.title} feature={f} mobile />
                      ))}
                    </div>
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
