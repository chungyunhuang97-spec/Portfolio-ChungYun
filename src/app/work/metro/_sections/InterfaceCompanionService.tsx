"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExclamationMark } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import Image from "next/image";

interface FeatureItem {
  title: string;
  desc: string;
  mobileDesc?: string;
}

interface CompanionBlock {
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
 * Section-wide "tech feel" background treatment -- deliberately different
 * from InterfaceRouteSearch's grey/white PhoneGlow-only look, since this
 * sub-block sits on a solid orange field and Joe asked for a distinct
 * flavor of motion here (his own suggestion: "科技感的動態，或是噪點").
 *
 * Two layered effects, both tied thematically to this block's copy
 * (即時位置共享 / 全程守護 -- a live-location safety escort):
 *  1. An animated film-grain overlay (SVG feTurbulence, cycling `seed` on
 *     an interval) -- reads as a faint scan/static texture on the orange
 *     field rather than a flat color fill.
 *  2. A soft horizontal light band that sweeps top-to-bottom on a slow
 *     loop, echoing a radar/location-ping sweep.
 * Both respect prefers-reduced-motion (checked once via Framer's
 * useReducedMotion) by freezing the grain seed and skipping the sweep
 * entirely. Purely decorative (aria-hidden), absolutely positioned behind
 * the real content, which sits in a `relative z-10` wrapper.
 */
function TechBackground() {
  const reduceMotion = useReducedMotion();
  const filterId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);

  // 2026-08-18 perf fix: the grain used to cycle via a React state update
  // (`setSeed`) every 220ms -- a re-render 4-5x/sec, running continuously
  // the whole time this section is mounted, even while it's still below
  // the fold and nobody can see it. That's a plausible reason Joe felt this
  // sub-block laggier than the first one (see the technical note in the
  // planning doc). Two changes: (1) mutate the SVG filter's `seed`
  // attribute directly via ref, bypassing React's render cycle entirely;
  // (2) gate the interval behind an IntersectionObserver so it only runs
  // while the section is actually in/near the viewport.
  useEffect(() => {
    if (reduceMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let seed = 1;

    const start = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        seed = (seed % 8) + 1;
        turbulenceRef.current?.setAttribute("seed", String(seed));
      }, 220);
    };
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    observer.observe(container);

    return () => {
      stop();
      observer.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div ref={containerRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay">
        <filter id={filterId}>
          <feTurbulence
            ref={turbulenceRef}
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={1}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
      {!reduceMotion && (
        <motion.div
          className="absolute inset-x-0 h-[280px] bg-gradient-to-b from-transparent via-white/15 to-transparent blur-2xl"
          initial={{ y: "-30%" }}
          animate={{ y: "130%" }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

/**
 * Soft rotating conic glow behind a PhoneFrame -- reused as-is from
 * InterfaceRouteSearch (same visual signature), still legible against the
 * white card the phone sits inside even though the section itself is
 * orange now.
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
 * Mobile-only auto-rotating "page control" for the feature list -- same fix
 * as InterfaceRouteSearch's version (see that file's doc comment for the
 * full rationale), duplicated here per this codebase's per-section-file
 * convention. Dot colors stay orange-on-grey rather than switching to the
 * section's white-on-orange scheme, because this carousel lives inside the
 * white content panel below the tabs, not directly on the orange field.
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
 * corner -- identical pattern to InterfaceRouteSearch's version, duplicated
 * here rather than shared per this codebase's self-contained-per-section
 * convention.
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
 * Folder-style tab switcher for mobile -- same 2026-08-18 redesign as
 * InterfaceRouteSearch's version (see that file's doc comment for the full
 * rationale): a fixed-height track holding all tabs at equal height, with
 * the active state shown as an inset pill (rounded on every corner) that
 * slides via `layoutId`, instead of the old per-button height differential
 * that left the active tab's own corners square. Color scheme stays the
 * same as before: the page background here is solid orange, so the track
 * and inactive tabs use translucent white, and the active pill flips to
 * orange text on a white fill.
 */
function FolderTabs({
  blocks,
  active,
  onChange,
}: {
  blocks: CompanionBlock[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex w-full gap-1 rounded-t-2xl border border-b-0 border-white/30 bg-white/10 p-1.5">
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
                layoutId="companionFolderTabBg"
                className="absolute inset-0 rounded-xl bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span
              className={`font-nunito relative z-10 text-[15px] font-bold ${
                isActive ? "text-primary-orange" : "text-proj-white"
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
  block: CompanionBlock;
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
 * Section 4 (second sub-block) -- 02 捷伴陪同服務 (companion-accompaniment
 * service), Figma desktop node 127:208 / mobile node 147:174.
 *
 * Architecturally a sibling of InterfaceRouteSearch, not a shared
 * component -- deliberately self-contained (helpers duplicated) per this
 * codebase's per-section-file convention. Differences from that first
 * sub-block: solid orange field (`bg-primary-orange`) instead of
 * grey/white, a solid-white (not ghosted) numeral since it now needs to
 * read against orange, THREE panels/tabs instead of two, a recolored
 * FolderTabs for the orange background, and a new `TechBackground` layer
 * (animated grain + radar-style light sweep) as the distinct "different
 * flavor" of motion Joe asked for on this orange block specifically.
 *
 * Content model: reuses the same `process` row (see InterfaceRouteSearch's
 * doc comment) via new top-level keys: `companionSectionNumber` /
 * `companionSectionTitle` (structural) and `companionBlocks` (the three
 * panels' copy, incl. `mobileDesc` shorthands -- only the 協助者 tab exists
 * as an authored mobile state in Figma, so 被協助者 / 成就系統 mobileDesc
 * values were authored here). Six media slots
 * (`companionHelperDesktopMediaUrl` / `companionHelpedDesktopMediaUrl` /
 * `companionAchievementDesktopMediaUrl` and the three `...MobileMediaUrl`
 * equivalents) are admin-uploadable, same URL-by-extension convention as
 * every other media field on this page.
 *
 * No eyebrow/heading here -- "Interface & Interaction" renders exactly
 * once, in InterfaceRouteSearch.
 */
export function InterfaceCompanionService({ process }: { process: Record<string, unknown> }) {
  const sectionNumber = (process.companionSectionNumber as string) || "02";
  const sectionTitle = (process.companionSectionTitle as string) || "捷伴陪同服務";
  const blocks = Array.isArray(process.companionBlocks) ? (process.companionBlocks as CompanionBlock[]) : [];
  const desktopMedia = [
    process.companionHelperDesktopMediaUrl as string | undefined,
    process.companionHelpedDesktopMediaUrl as string | undefined,
    process.companionAchievementDesktopMediaUrl as string | undefined,
  ];
  const mobileMedia = [
    process.companionHelperMobileMediaUrl as string | undefined,
    process.companionHelpedMobileMediaUrl as string | undefined,
    process.companionAchievementMobileMediaUrl as string | undefined,
  ];

  const [activeTab, setActiveTab] = useState(0);
  const activeBlock = blocks[activeTab];

  if (blocks.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-primary-orange px-6 py-8 md:px-[120px] md:py-[100px]">
      <TechBackground />

      <div className="relative z-10">
        {/* Mobile layout -- 2026-08-18: same vertical-rhythm tightening +
            mockup shrink + feature carousel as InterfaceRouteSearch (see
            that file for the full rationale). This block had the worse
            100vh overflow of the two per Joe's screenshots (extra heading
            row + a 3rd tab), so the same fix applies here too. */}
        <div className="flex flex-col gap-3 md:hidden">
          <SlideIn delay={0.1}>
            <div className="flex items-center gap-3">
              <span className="font-fredoka text-proj-white text-[32px] leading-[32px]">{sectionNumber}</span>
              <h2 className="font-nunito flex-1 text-[28px] leading-[39px] font-bold text-proj-white">
                {sectionTitle}
              </h2>
            </div>
          </SlideIn>

          <SlideIn delay={0.15}>
            <div className="flex flex-col">
              <FolderTabs blocks={blocks} active={activeTab} onChange={setActiveTab} />

              <div className="w-full overflow-hidden rounded-b-2xl border border-t-0 border-white/30 bg-proj-white px-4 py-5">
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
        <div className="hidden flex-col gap-10 md:flex">
          <SlideIn delay={0.1}>
            <div className="flex items-center gap-5">
              <span className="font-fredoka text-proj-white text-[100px] leading-[100px]">{sectionNumber}</span>
              <h3 className="font-nunito text-[36px] leading-[50px] font-bold text-proj-white">{sectionTitle}</h3>
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
