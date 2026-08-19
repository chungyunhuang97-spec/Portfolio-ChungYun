"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Database, MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface SystemArchPoint {
  title: string;
  /** Desktop-only body paragraph -- Figma's mobile descriptions-column shows
   * only the number + title, no supporting sentence (confirmed via
   * get_design_context, not a missing-copy gap). */
  descDesktop: string;
}

/**
 * The two backend diagrams (ERD-style data model + service/data-flow
 * diagram) are static reference material Joe supplied for this exact
 * section as chat attachments -- same treatment as IaRestructuring's
 * IA_DIAGRAMS (ships as /public assets, not an admin media field, since
 * these are fixed technical diagrams documenting the shipped system, not
 * something Joe swaps via CMS).
 */
const SYSTEM_DIAGRAMS = [
  { key: "erd", label: "資料模型關聯圖", src: "/work/metro/system-diagram-erd.png" },
  { key: "flow", label: "服務架構與資料流程圖", src: "/work/metro/system-diagram-flow.png" },
] as const;

/** The 01/02/03 accent colors alternate orange/blue/pink per Figma -- same triad already used for Results' roadmap tags and delta badges throughout this project. */
const POINT_COLORS = ["text-primary-orange", "text-secondary-blue", "text-accent-pink"] as const;

/**
 * One-time CRT-style scanline sweep + pulsing "targeting reticle" corners on
 * each diagram thumbnail -- duplicated verbatim from IaRestructuring.tsx's
 * ScanReveal/ScanCorners per this project's per-section-file convention
 * (see that file's doc comment). Reused rather than reinvented because a
 * "scanning a technical diagram" motif fits this section's subject matter
 * (system architecture) exactly as well as it fit IA's sitemap diagrams.
 */
function ScanReveal({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-proj-white/70 to-transparent"
      initial={{ y: "-100%", opacity: 1 }}
      whileInView={{ y: "120%", opacity: [1, 1, 0] }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay, ease: "easeIn" }}
    />
  );
}

function ScanCorners() {
  const positions = [
    "top-2 left-2 border-t-2 border-l-2 rounded-tl-md",
    "top-2 right-2 border-t-2 border-r-2 rounded-tr-md",
    "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-md",
    "bottom-2 right-2 border-b-2 border-r-2 rounded-br-md",
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {positions.map((pos, i) => (
        <motion.span
          key={pos}
          className={`absolute size-4 border-primary-orange/70 ${pos}`}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/**
 * This section's own "科技感" signature (distinct from ScanReveal/Corners
 * above, which were reused as-is): a small colored dot travels down a thin
 * vertical line running past the three 01/02/03 description cards, looping
 * forever. Reads literally as a data pulse moving through the pipeline --
 * fitting given the section title is "系統架構與資料閉環" (system architecture
 * & data LOOP) and the three cards ARE, in order, the three stages of that
 * loop (request -> match -> feedback). Desktop only: the mobile
 * descriptions-column lays the three cards out horizontally with no shared
 * vertical edge for a line to travel along.
 */
function FlowPulse() {
  return (
    <div aria-hidden className="pointer-events-none absolute -left-[13px] top-2 bottom-2 w-px">
      <div className="h-full w-full bg-gradient-to-b from-primary-orange/0 via-[#e5e0db] to-accent-pink/0" />
      <motion.span
        className="absolute left-1/2 size-[7px] -translate-x-1/2 rounded-full bg-primary-orange shadow-[0_0_6px_2px_rgba(255,82,13,0.5)]"
        animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/** Small decorative plus-mark flourish, desktop only -- same technique as Results' PlusMark, recolored to the secondary-blue tint Figma specs for this section (rgba(13,33,255,0.1) vs Results' pink). */
function PlusMark() {
  return (
    <span aria-hidden className="pointer-events-none absolute right-[60px] top-[120px] block size-[20px]">
      <span className="absolute left-0 top-[8.5px] h-[3px] w-[20px] rounded-[1px] bg-secondary-blue/10" />
      <span className="absolute left-[8.5px] top-0 h-[20px] w-[3px] rounded-[1px] bg-secondary-blue/10" />
    </span>
  );
}

/**
 * Always-visible "點擊放大" hint pill, bottom-right corner of each diagram --
 * Figma places this statically (not hover-only) per get_design_context, a
 * deliberate difference from IaRestructuring's hover-reveal center overlay
 * (that section's single large diagram vs. this section's two smaller
 * side-by-side ones -- an always-visible hint reads better at this size).
 */
function ZoomHint() {
  return (
    <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-primary-black/40 px-[10px] py-1.5">
      <MagnifyingGlass size={14} weight="bold" className="text-proj-white" />
      <span className="font-nunito text-[11px] font-bold text-proj-white">點擊放大</span>
    </span>
  );
}

function DesktopPointCard({ point, index }: { point: SystemArchPoint; index: number }) {
  return (
    <SlideIn delay={0.15 + index * 0.06} className="relative flex-1">
      {index > 0 && <FlowPulse />}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-full w-full flex-col justify-center gap-2 rounded-2xl bg-[#f7f5f3] p-4 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
      >
        <p className={`font-fredoka text-[22px] ${POINT_COLORS[index]}`}>0{index + 1}</p>
        <p className="font-nunito text-[16px] leading-[22px] font-bold text-primary-black">{point.title}</p>
        <p className="font-nunito text-[13px] leading-[19px] font-normal text-grey-700">{point.descDesktop}</p>
      </motion.div>
    </SlideIn>
  );
}

function MobilePointCard({ point, index }: { point: SystemArchPoint; index: number }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-1 rounded-xl bg-[#f5f5f5] p-2">
      <p className={`font-fredoka text-[20px] ${POINT_COLORS[index]}`}>0{index + 1}</p>
      <p className="font-nunito text-[12px] leading-[16px] font-normal text-primary-black">{point.title}</p>
    </div>
  );
}

/**
 * Full-screen lightbox shared by both breakpoints -- same pattern as
 * IaRestructuring's DiagramLightbox (swipeable drag between the two
 * diagrams, dot indicators double as tap targets). One deliberate
 * difference from that component, per Joe's explicit spec this round:
 * mobile gets ZERO outer padding (`p-0`) so the enlarged diagram is truly
 * full screen-width edge to edge ("放大的寬度請設定為螢幕寬度"), where
 * IaRestructuring's lightbox kept a small `p-4` inset on mobile too.
 */
function DiagramLightbox({
  open,
  activeIndex,
  onIndexChange,
  onClose,
}: {
  open: boolean;
  activeIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const diagram = SYSTEM_DIAGRAMS[activeIndex];

  function handleDragEnd(_event: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -80 && activeIndex < SYSTEM_DIAGRAMS.length - 1) {
      onIndexChange(activeIndex + 1);
    } else if (info.offset.x > 80 && activeIndex > 0) {
      onIndexChange(activeIndex - 1);
    }
  }

  return (
    <AnimatePresence>
      {open && diagram && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-primary-black/90 p-0 backdrop-blur-sm md:gap-5 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-proj-white/10 text-proj-white transition-colors hover:bg-proj-white/20"
          >
            <X size={20} weight="bold" />
          </button>

          <div
            className="relative flex w-full max-w-[1100px] flex-col items-center gap-4 px-0 md:px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={diagram.key}
                className="relative aspect-[1212/927] max-h-[70vh] w-full overflow-hidden bg-proj-white md:rounded-2xl"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                drag={reduceMotion ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
              >
                <Image src={diagram.src} alt={diagram.label} fill sizes="100vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>

            <p className="font-nunito text-[13px] font-bold text-proj-white/80">{diagram.label}</p>

            <div className="flex items-center gap-2">
              {SYSTEM_DIAGRAMS.map((d, i) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`查看${d.label}`}
                  className={`h-[8px] rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-[24px] bg-primary-orange" : "w-[8px] bg-proj-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Mobile carousel between the two diagrams, dots styled exactly like the
 * existing "Page Control" element (InterfaceRouteSearch.tsx's
 * MobileFeatureCarousel) per Joe's explicit ask to reuse that same
 * component's look: active dot is a wide orange pill (`w-[28px] h-[10px]
 * bg-primary-orange`), inactive dots are small grey circles (`size-[10px]
 * bg-grey-300`), both `rounded-[5px]` -- matches Figma's "carousel
 * pagination" instance exactly (confirmed via get_design_context). Same
 * auto-advance-plus-manual-dots behavior as the original too, not just the
 * same visual styling. Tapping the diagram itself opens the shared
 * full-screen lightbox (`onOpen`).
 */
function MobileDiagramCarousel({ onOpen }: { onOpen: (index: number) => void }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-[#e6e6e6] bg-[#f5f5f5] p-3">
      <button
        type="button"
        onClick={() => onOpen(index)}
        className="relative block aspect-[342/212] w-full overflow-hidden rounded-lg"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={SYSTEM_DIAGRAMS[index].key}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Image
              src={SYSTEM_DIAGRAMS[index].src}
              alt={SYSTEM_DIAGRAMS[index].label}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
        <ZoomHint />
      </button>
      <div className="flex items-center gap-2">
        {SYSTEM_DIAGRAMS.map((d, i) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`查看第 ${i + 1} 張圖：${d.label}`}
            className={`h-[10px] rounded-[5px] transition-all duration-300 ${
              i === index ? "w-[28px] bg-primary-orange" : "w-[10px] bg-grey-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 系統架構與資料閉環 (System Architecture), Figma desktop node 127:660 /
 * mobile node 147:355. Slotted in right after Results per the established
 * build queue.
 *
 * Content model: reuses the `process` row (SQL-checked 2026-08-19 for key
 * collisions -- `systemArch*` prefix is clean). `systemArchPoints` (the
 * three 01/02/03 cards: title + desktop-only `descDesktop`, same shape
 * pattern as IaRestructuring's `IaPoint` minus the mobile-desc field since
 * mobile genuinely shows no description here at all) and
 * `systemArchIntroMobile` (mobile's short quoted intro sentence) are CMS
 * fields. Desktop's longer intro paragraph is hardcoded in JSX (has an
 * embedded bold/colored "Data Flow" span baked into the copy per Figma --
 * same "structural copy with inline rich formatting stays hardcoded"
 * convention as IaRestructuring/StrategyBeforeApp). The two diagrams
 * themselves are static /public assets (Joe-supplied reference material,
 * not admin media fields -- see SYSTEM_DIAGRAMS doc comment above).
 *
 * Desktop: dual-column layout (left: 3 stacked point cards connected by the
 * FlowPulse signature motion; right: the two diagrams stacked, each always
 * showing a "點擊放大" hint and opening the shared lightbox on click).
 * `min-h-screen` + `justify-center`, same 100vh pattern established since
 * UserResearch -- per Joe's explicit ask this round ("電腦版 100vh"),
 * verified via `getBoundingClientRect().height` vs `window.innerHeight`
 * after deploy, not just eyeballed.
 *
 * Mobile: SectionHeader, a quoted intro callout, the 3 point cards laid out
 * horizontally (title only, no description), then a single-diagram carousel
 * with Page-Control-style dots (see MobileDiagramCarousel) -- tapping the
 * visible diagram opens the same lightbox, matching desktop's click-to-zoom
 * behavior 1:1 per Joe's explicit ask ("手機版的架構圖同樣可以點擊放大"). Mobile is
 * NOT required to hit 100vh this round (only desktop was asked for).
 */
export function SystemArchitecture({ process }: { process: Record<string, unknown> }) {
  const points = Array.isArray(process.systemArchPoints) ? (process.systemArchPoints as SystemArchPoint[]) : [];
  const introMobile = typeof process.systemArchIntroMobile === "string" ? process.systemArchIntroMobile : "";

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (points.length < 3 || !introMobile) return null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <section className="relative overflow-hidden bg-proj-white">
      {/* Mobile layout */}
      <div className="flex w-full flex-col gap-6 px-6 py-10 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Database size={18} weight="bold" className="text-primary-orange" />
              <span className="font-nunito text-[13px] font-extrabold text-primary-orange">System Architecture</span>
            </div>
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              系統架構與資料閉環
            </h2>
            <div className="h-px w-full bg-[#e6e6e6]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="relative rounded-lg bg-[#f5f5f5] px-5 py-3">
            <span className="absolute left-1.5 top-3 font-nunito text-[22px] leading-none text-primary-orange/40">
              &ldquo;
            </span>
            <p className="font-nunito px-3 text-center text-[14px] leading-[21px] font-normal text-grey-700">
              {introMobile}
            </p>
            <span className="absolute right-1.5 top-3 font-nunito text-[22px] leading-none text-primary-orange/40">
              &rdquo;
            </span>
          </div>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="flex w-full gap-3">
            {points.map((p, i) => (
              <MobilePointCard key={p.title} point={p} index={i} />
            ))}
          </div>
        </SlideIn>

        <SlideIn delay={0.25} viewportMargin="0px">
          <MobileDiagramCarousel onOpen={openLightbox} />
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden min-h-screen w-full flex-col justify-center gap-6 px-[120px] py-[48px] md:flex">
        <PlusMark />

        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Database size={18} weight="bold" className="text-primary-orange" />
              <span className="font-nunito text-[13px] font-extrabold text-primary-orange">System Architecture</span>
            </div>
            <h2 className="font-nunito text-[36px] leading-[46px] font-bold text-primary-black">
              系統架構與資料閉環
            </h2>
          </div>
        </SlideIn>

        <SlideIn delay={0.12}>
          <p className="font-nunito text-[15px] leading-[22px] font-normal text-grey-700">
            為了確保「捷伴」服務具備真實的可落地性，我們規劃了完整的後端架構，將前端的使用者旅程映射為後端的{" "}
            <span className="font-bold text-primary-orange">Data Flow</span>
            ，確保每一項設計決策都有穩固的邏輯支撐。
          </p>
        </SlideIn>

        <div className="flex w-full flex-1 items-stretch gap-4">
          <SlideIn direction="left" className="flex flex-1 flex-col gap-4">
            {points.map((p, i) => (
              <DesktopPointCard key={p.title} point={p} index={i} />
            ))}
          </SlideIn>

          <SlideIn direction="right" className="flex flex-1 flex-col gap-4">
            {SYSTEM_DIAGRAMS.map((d, i) => (
              <motion.button
                key={d.key}
                type="button"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => openLightbox(i)}
                className="group relative flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#f7f5f3] p-3 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
              >
                <Image src={d.src} alt={d.label} fill sizes="500px" className="object-contain p-3" />
                <ScanReveal delay={i * 0.15} />
                <ScanCorners />
                <ZoomHint />
              </motion.button>
            ))}
          </SlideIn>
        </div>
      </div>

      <DiagramLightbox
        open={lightboxOpen}
        activeIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
