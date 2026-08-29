"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

interface UiFlowStep {
  stepNumber: string;
  title: string;
  desc: string;
  /** Only steps 04 / 05 carry this — the highlighted role-description box. */
  callout?: string;
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

/** Inline `**bold**` markup → orange bold spans, matching Figma's highlighted phrases. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-primary-orange">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const DESC_TEXT_CLASS = "font-nunito text-[15px] leading-[22px] font-normal text-grey-800 md:text-[16px] md:leading-[24px]";

/**
 * A step's `desc` renders as a plain paragraph, EXCEPT where the content
 * itself is authored as multiple `\n\n`-separated points (per Figma, e.g.
 * step 03's two-part explanation) — those render as a bulleted list
 * instead, matching the design's bullet-point treatment for that step.
 */
function DescBlock({ text }: { text: string }) {
  const points = text.split("\n\n").filter(Boolean);
  if (points.length <= 1) {
    return (
      <p className={DESC_TEXT_CLASS}>
        <RichText text={text} />
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {points.map((point, i) => (
        <li key={i} className={`flex items-start gap-2.5 ${DESC_TEXT_CLASS}`}>
          <span className="mt-[9px] size-[5px] shrink-0 rounded-full bg-grey-800" aria-hidden />
          <span>
            <RichText text={point} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Orange circular chevron badge sitting between a step's two mockups (Figma: `chevron-right`). */
function ChevronBadge() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-orange" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </div>
  );
}

function SingleMedia({ src }: { src?: string }) {
  return (
    <div className="w-[150px] shrink-0">
      <PhoneFrame screen={mediaScreen(src)} />
    </div>
  );
}

function MediaPair({ images }: { images: (string | undefined)[] }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[150px] shrink-0">
        <PhoneFrame screen={mediaScreen(images[0])} />
      </div>
      <ChevronBadge />
      <div className="w-[150px] shrink-0">
        <PhoneFrame screen={mediaScreen(images[1])} />
      </div>
    </div>
  );
}

/**
 * Steps 05 / 06 each show 4 mockups in Figma (`carousel pagination` instance),
 * as two pairs of 2 side-by-side screens. Auto-plays every 4s and supports
 * click-to-switch via the two dots — matches Figma's dot styling exactly
 * (active: orange w-7 h-2.5 pill / inactive: grey-300 10px dot).
 */
function CarouselMediaPair({ images }: { images: (string | undefined)[] }) {
  const pairs = [images.slice(0, 2), images.slice(2, 4)];
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  // Auto-play only while on screen, per spec ("元素離開可視區域時暫停循環動畫").
  const inView = useInView(ref, { amount: 0.3 });

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => setActive((a) => (a + 1) % pairs.length), 4000);
    return () => clearInterval(timer);
  }, [pairs.length, inView]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <MediaPair images={pairs[active]} />
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-2" role="tablist" aria-label="切換畫面組">
        {pairs.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`第 ${i + 1} 組畫面`}
            onClick={() => setActive(i)}
            className={`h-[10px] rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-2 ${
              i === active ? "w-7 bg-primary-orange" : "w-[10px] bg-grey-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** Figma's `Frame 1000006462` — grey role-description callout with a leading icon chip (steps 04 / 05 only). */
function CalloutBox({ text }: { text: string }) {
  return (
    <div className="flex w-full items-center gap-2.5 rounded-lg bg-grey-50 p-2">
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary-orange" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <p className="font-nunito flex-1 text-[16px] leading-[24px] font-normal text-grey-800">
        <RichText text={text} />
      </p>
    </div>
  );
}

const stepContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
} as const;
const stepItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

/**
 * One desktop row. Figma alternates media/text sides per step (01 media-left,
 * 02 text-left, 03 media-left, 04 text-left, 05 media-left, 06 text-left —
 * i.e. media-first on even indices), with no card background — steps sit
 * directly on the white section background, separated by hairline dividers
 * rendered by the parent list.
 */
function DesktopStepPanel({
  step,
  media,
  mediaFirst,
  delay,
}: {
  step: UiFlowStep;
  media: (string | undefined)[];
  mediaFirst: boolean;
  delay: number;
}) {
  const mediaBlock = (
    <motion.div
      className="flex shrink-0 items-center justify-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {media.length >= 4 ? (
        <CarouselMediaPair images={media} />
      ) : media.length >= 2 ? (
        <MediaPair images={media} />
      ) : (
        <SingleMedia src={media[0]} />
      )}
    </motion.div>
  );

  const textBlock = (
    <motion.div
      className="flex flex-1 flex-col gap-4"
      variants={stepContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div variants={stepItem} className="flex items-center gap-4">
        <span className="font-fredoka shrink-0 rounded-[4px] bg-primary-orange/[0.08] px-2 py-[3px] text-[12px] tracking-[0.72px] text-primary-orange">
          {step.stepNumber}
        </span>
        <h4 className="font-nunito text-[22px] leading-[30px] font-bold text-secondary-blue md:text-[28px] md:leading-[39px]">
          {step.title}
        </h4>
      </motion.div>
      <motion.div variants={stepItem} className="w-full">
        <DescBlock text={step.desc} />
      </motion.div>
      {step.callout && (
        <motion.div variants={stepItem} className="w-full">
          <CalloutBox text={step.callout} />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <SlideIn direction={mediaFirst ? "left" : "right"} delay={delay}>
      <div className="flex w-full items-center gap-10">
        {mediaFirst ? (
          <>
            {mediaBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {mediaBlock}
          </>
        )}
      </div>
    </SlideIn>
  );
}

/**
 * Mobile folder-tab switcher — a sliding inset pill via `layoutId`, generic
 * over an arbitrary `tabs` array since each of the 3 mobile blocks owns its
 * own 2-tab switcher rather than one switcher choosing between blocks.
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

/** Fixed media-slot count per desktop step, per Figma (`carousel pagination` only on 05 / 06). */
const DESKTOP_MEDIA_COUNTS = [2, 1, 2, 2, 4, 4];

/**
 * 參與併團流程 (UI Flow), Figma desktop node 275:175 / mobile 404:228 +
 * 407:810/845/873. Rebuilt against the real page-level Figma frames (the
 * links used for the first build were scoped to Hero only) — desktop step
 * titles are `secondary-blue` not black, steps 01/03/04/05/06 each show TWO
 * mockups side by side with an orange chevron badge between them (only step
 * 02 has a single mockup), steps 04/05 additionally carry a grey role-
 * description callout box, and steps 05/06 each cycle through 4 mockups (two
 * pairs) via an auto-playing + click-switchable dot carousel, per Joe's
 * explicit request.
 *
 * Content model: reuses `process` — `uiFlowTitle`, `uiFlowSubtitle`,
 * `uiFlowSteps` (desktop, 6× `{stepNumber, title, desc, callout?}` — `desc`/
 * `callout` support inline `**bold**` markup for the orange highlighted
 * phrases Figma shows inline), `uiFlowDesktopMedia` (`{ [stepNumber]:
 * string[] }`, sized 2/1/2/2/4/4 per step, left for Joe to upload via admin),
 * `uiFlowBlocks` (mobile, unchanged — 3× `{sectionNumber, sectionTitle,
 * tabs}`), plus the existing 6 `uiFlow*MobileMediaUrl` fields for mobile.
 */
export function UIFlow({ process }: { process: Record<string, unknown> }) {
  const title = process.uiFlowTitle as string | undefined;
  const subtitle = process.uiFlowSubtitle as string | undefined;
  const steps = Array.isArray(process.uiFlowSteps) ? (process.uiFlowSteps as UiFlowStep[]) : [];
  const blocks = Array.isArray(process.uiFlowBlocks) ? (process.uiFlowBlocks as UiFlowBlock[]) : [];

  const desktopMediaMap = (process.uiFlowDesktopMedia ?? {}) as Record<string, (string | undefined)[]>;
  const desktopMedia = steps.map((step, i) => {
    const arr = desktopMediaMap[step.stepNumber] ?? [];
    const count = DESKTOP_MEDIA_COUNTS[i] ?? arr.length;
    return Array.from({ length: count }, (_, idx) => arr[idx]);
  });

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
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-primary-orange uppercase">
              UI Flow
            </span>
            {title && (
              <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[48px] md:leading-[72px]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-nunito max-w-[680px] text-[14px] leading-[22px] font-normal text-grey-600 md:max-w-none md:text-[18px] md:leading-[25px]">
                {subtitle}
              </p>
            )}
            <div className="hidden w-full border-t border-dashed border-[#e0e0e0] md:block" />
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

        {/* Desktop — 6 steps, hairline divider between each */}
        <div className="hidden flex-col gap-10 md:flex">
          {steps.flatMap((step, i) => {
            const panel = (
              <DesktopStepPanel
                key={`panel-${step.stepNumber}`}
                step={step}
                media={desktopMedia[i]}
                mediaFirst={i % 2 === 0}
                delay={0.05 * i}
              />
            );
            if (i === steps.length - 1) return [panel];
            return [panel, <div key={`divider-${step.stepNumber}`} className="h-px w-full bg-[#e0e0e0]" />];
          })}
        </div>
      </div>
    </section>
  );
}
