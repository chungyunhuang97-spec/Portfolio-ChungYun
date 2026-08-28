"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

interface UiFlowStep {
  stepNumber: string;
  title: string;
  desc: string;
}

interface UiFlowFeature {
  title: string;
  desc: string;
}

interface UiFlowTab {
  tabLabel: string;
  features: UiFlowFeature[];
}

interface UiFlowBlock {
  sectionNumber: string;
  sectionTitle: string;
  tabs: UiFlowTab[];
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
 * One desktop zigzag panel — mockup fades in first, then the description
 * items stagger in 0.1s each, per spec. `SlideIn`'s own viewport trigger
 * approximates the spec's "20% visibility" threshold; the fade-then-stagger
 * sequencing inside is a nested variants tree so the mockup (no delay)
 * always finishes its own fade slightly ahead of the text column starting.
 */
const stepContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
} as const;
const stepItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

function DesktopStepPanel({
  step,
  media,
  reverse,
  delay,
}: {
  step: UiFlowStep;
  media?: string;
  reverse?: boolean;
  delay: number;
}) {
  return (
    <SlideIn direction={reverse ? "right" : "left"} delay={delay}>
      <div className={`flex w-full items-center gap-10 rounded-[32px] bg-grey-50 p-8 ${reverse ? "flex-row-reverse" : ""}`}>
        <motion.div
          className="flex flex-1 flex-col gap-3"
          variants={stepContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={stepItem} className="flex items-center gap-4">
            <span className="font-fredoka text-primary-orange/20 text-[64px] leading-[64px]">{step.stepNumber}</span>
            <h4 className="font-nunito text-[22px] leading-[30px] font-bold text-primary-black">{step.title}</h4>
          </motion.div>
          <motion.p variants={stepItem} className="font-nunito text-[14px] leading-[22px] font-normal text-grey-700">
            {step.desc}
          </motion.p>
        </motion.div>
        <motion.div
          className="w-[240px] shrink-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <PhoneFrame screen={mediaScreen(media)} />
        </motion.div>
      </div>
    </SlideIn>
  );
}

/**
 * Mobile folder-tab switcher, adapted from metro's InterfaceRouteSearch
 * FolderTabs (same visual mechanism — a sliding inset pill via
 * `layoutId`) but generic over an arbitrary `tabs` array instead of the
 * whole `blocks` list, since here each of the 3 blocks owns its own
 * 2-tab switcher rather than one switcher choosing between blocks.
 * Explicit `focus-visible` ring added per the interaction spec's "必須支援
 * 鍵盤/focus-visible" requirement (native <button> already gets keyboard
 * activation for free; this adds the visible indicator).
 */
function TabSwitcher({
  tabs,
  active,
  onChange,
  layoutId,
}: {
  tabs: UiFlowTab[];
  active: number;
  onChange: (i: number) => void;
  layoutId: string;
}) {
  return (
    <div className="flex w-full gap-1 rounded-t-2xl border border-b-0 border-[#e5e0db] bg-grey-100 p-1.5">
      {tabs.map((tab, i) => {
        const isActive = i === active;
        return (
          <button
            key={tab.tabLabel}
            type="button"
            onClick={() => onChange(i)}
            className="relative flex-1 rounded-xl px-2 py-2.5 text-center outline-none focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-2"
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span className={`font-nunito relative z-10 text-[14px] font-bold ${isActive ? "text-primary-black" : "text-grey-600"}`}>
              {tab.tabLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tab content transition per spec: old content slides out -12px over
 * 0.18s, new content slides in from +12px over 0.28s. `AnimatePresence
 * mode="wait"` plus asymmetric initial/exit offsets + per-phase durations
 * (set directly on `transition`, distinct in from out) reproduce that
 * exactly rather than reusing a single symmetric duration.
 */
function TabPanel({ tab, media }: { tab: UiFlowTab; media?: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab.tabLabel}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } }}
        exit={{ opacity: 0, x: -12, transition: { duration: 0.18, ease: "easeIn" } }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-[46vw] max-w-[190px] min-w-[150px]">
          <PhoneFrame screen={mediaScreen(media)} label="App 畫面（後臺可上傳影片或圖片）" />
        </div>
        <div className="flex w-full flex-col gap-3">
          {tab.features.map((f) => (
            <div key={f.title} className="flex w-full items-start gap-3 rounded-2xl border border-grey-50 bg-proj-white p-3">
              <span className="mt-0.5 h-auto min-h-[32px] w-1 shrink-0 self-stretch rounded-[2px] bg-primary-orange" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="font-nunito text-[13px] font-bold text-primary-orange">{f.title}</p>
                <p className="font-nunito text-[12.5px] leading-[18px] font-normal text-grey-700">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MobileBlock({ block, media, delay }: { block: UiFlowBlock; media: (string | undefined)[]; delay: number }) {
  const [active, setActive] = useState(0);
  return (
    <SlideIn delay={delay}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="font-fredoka text-[24px] leading-[24px] text-primary-orange">{block.sectionNumber}</span>
          <h4 className="font-nunito text-[18px] leading-[26px] font-bold text-primary-black">{block.sectionTitle}</h4>
        </div>
        <div className="flex flex-col">
          <TabSwitcher tabs={block.tabs} active={active} onChange={setActive} layoutId={`uiflow-tab-${block.sectionNumber}`} />
          <div className="w-full overflow-hidden rounded-b-2xl border border-t-0 border-[#e5e0db] bg-proj-white px-4 py-5">
            <TabPanel tab={block.tabs[active]} media={media[active]} />
          </div>
        </div>
      </div>
    </SlideIn>
  );
}

/**
 * 參與併團流程 (UI Flow), Figma desktop node 275:87's UI Flow block (a plain
 * always-visible 6-step narrative, NO tabs at that breakpoint) / mobile
 * node 404:147 (3 numbered blocks, each a 2-tab folder switcher — confirmed
 * against 407:1033 for the alternate tab-active states). This exactly
 * mirrors metro's own InterfaceRouteSearch precedent: desktop shows
 * everything at once in a zigzag; mobile collapses into FolderTabs. Here
 * the desktop side has no per-panel tabs at all (6 sequential steps
 * instead of 2 side-by-side panels), while mobile groups those same 6
 * steps into 3 blocks of 2 tabs each (block N's tab 0 = step 2N-1, tab 1 =
 * step 2N) — both breakpoints tell the same story, just restructured.
 *
 * Content model: reuses `process` — `uiFlowTitle`, `uiFlowSubtitle`,
 * `uiFlowSteps` (desktop, 6× `{stepNumber, title, desc}`), `uiFlowBlocks`
 * (mobile, 3× `{sectionNumber, sectionTitle, tabs: [{tabLabel, features}]}`
 * — genuinely different copy/structure from desktop, not a trim, so no
 * fallback between them). 12 media fields (`uiFlow{Search,Browse,Detail,
 * Join,Apply,Complete}{Desktop,Mobile}MediaUrl`), left empty for Joe to
 * upload via admin per his explicit request — same admin-uploadable
 * pattern as every other project's mockup slots.
 */
export function UIFlow({ process }: { process: Record<string, unknown> }) {
  const title = process.uiFlowTitle as string | undefined;
  const subtitle = process.uiFlowSubtitle as string | undefined;
  const steps = Array.isArray(process.uiFlowSteps) ? (process.uiFlowSteps as UiFlowStep[]) : [];
  const blocks = Array.isArray(process.uiFlowBlocks) ? (process.uiFlowBlocks as UiFlowBlock[]) : [];

  const desktopMedia = [
    process.uiFlowSearchDesktopMediaUrl,
    process.uiFlowBrowseDesktopMediaUrl,
    process.uiFlowDetailDesktopMediaUrl,
    process.uiFlowJoinDesktopMediaUrl,
    process.uiFlowApplyDesktopMediaUrl,
    process.uiFlowCompleteDesktopMediaUrl,
  ] as (string | undefined)[];

  const mobileMedia = [
    process.uiFlowSearchMobileMediaUrl,
    process.uiFlowBrowseMobileMediaUrl,
    process.uiFlowDetailMobileMediaUrl,
    process.uiFlowJoinMobileMediaUrl,
    process.uiFlowApplyMobileMediaUrl,
    process.uiFlowCompleteMobileMediaUrl,
  ] as (string | undefined)[];

  if (steps.length === 0 && blocks.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <SlideIn delay={0.1}>
        <div className="mb-8 flex flex-col gap-3 md:mb-16">
          <span className="font-nunito text-[13px] font-extrabold tracking-[2px] text-primary-orange uppercase">
            UI Flow
          </span>
          {title && (
            <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[36px] md:leading-[48px]">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="font-nunito max-w-[680px] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      {/* Mobile — 3 blocks, each its own 2-tab switcher */}
      <div className="flex flex-col gap-8 md:hidden">
        {blocks.map((block, i) => (
          <MobileBlock
            key={block.sectionTitle}
            block={block}
            media={[mobileMedia[i * 2], mobileMedia[i * 2 + 1]]}
            delay={0.1 + i * 0.08}
          />
        ))}
      </div>

      {/* Desktop — 6 always-visible zigzag steps */}
      <div className="hidden flex-col gap-10 md:flex">
        {steps.map((step, i) => (
          <DesktopStepPanel
            key={step.stepNumber}
            step={step}
            media={desktopMedia[i]}
            reverse={i % 2 === 1}
            delay={0.05 * i}
          />
        ))}
      </div>
    </section>
  );
}
