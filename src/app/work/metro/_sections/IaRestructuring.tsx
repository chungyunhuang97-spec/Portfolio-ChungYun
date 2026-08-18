"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { TreeStructure, MagnifyingGlass, MagnifyingGlassPlus, X } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

interface IaPoint {
  title: string;
  desktopDesc: string;
  mobileDesc?: string;
}

/**
 * The four illustration icons (compass / stacked-layers / plus-in-circle /
 * walking-figure-with-pins) are Joe's own hand-picked sticker set for this
 * section's desktop stat rows -- fixed assignment by index per Figma
 * (127:357/363/369/375), not admin-configurable per point. Mobile does NOT
 * reuse these -- Figma's mobile FeatureItem (147:243) deliberately swaps
 * them for plain numbered badges (1-4) instead, a genuine per-breakpoint
 * visual difference, not a missing-asset gap.
 */
const POINT_ICONS = [
  "/work/metro/ia-icon-nav.png",
  "/work/metro/ia-icon-depth.png",
  "/work/metro/ia-icon-service.png",
  "/work/metro/ia-icon-flow.png",
];

/**
 * The two IA sitemap diagrams (after/before) are static reference material
 * Joe supplied for this exact section -- same treatment as StrategyBeforeApp's
 * OLD_TABS screenshots (ships as /public assets, not an admin media field,
 * per that file's doc comment rationale: not something Joe swaps via CMS).
 */
const IA_DIAGRAMS = [
  { key: "after" as const, label: "After － 新版 5 大核心導覽", src: "/work/metro/ia-diagram-after.png" },
  { key: "before" as const, label: "Before － 舊版導覽架構", src: "/work/metro/ia-diagram-before.png" },
];

/**
 * Rotating conic-gradient "energy border" -- the project's established
 * tech-feel signature element (see StrategyBeforeApp.tsx's TechGlowBorder,
 * same technique), duplicated here per the per-section-file convention.
 * Reused verbatim so the "科技感" motion language stays consistent across
 * every section that asks for it, rather than inventing a new one.
 */
function TechGlowBorder({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-px ${className}`}>
      <motion.div
        aria-hidden
        className="absolute inset-[-60%]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #ff520d 300deg, #ffb088 330deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-proj-white">{children}</div>
    </div>
  );
}

/**
 * One-time CRT-style scanline sweep on viewport entry -- same technique as
 * StrategyBeforeApp's ScanReveal, duplicated here per the per-section
 * convention. Reads as the IA diagram "powering on", which fits this
 * section's data-structure subject matter well.
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

/**
 * Four pulsing "targeting reticle" corner brackets over the diagram preview
 * -- this section's own tech-feel signature (distinct from the glow border
 * / scan sweep reused above), a common scan/analysis visual motif that fits
 * a "restructuring the information architecture" subject well.
 */
function ScanCorners() {
  const positions = [
    "top-3 left-3 border-t-2 border-l-2 rounded-tl-md",
    "top-3 right-3 border-t-2 border-r-2 rounded-tr-md",
    "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-md",
    "bottom-3 right-3 border-b-2 border-r-2 rounded-br-md",
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {positions.map((pos, i) => (
        <motion.span
          key={pos}
          className={`absolute size-5 border-primary-orange/70 ${pos}`}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/**
 * Desktop-only segmented control switching the inline preview between the
 * after/before diagrams (Figma 127:385) -- same visual pattern as
 * InterfaceBonusExperience's SegmentedTabBar, duplicated per convention.
 */
function DiagramSegmentedControl({
  active,
  onChange,
}: {
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-grey-100 p-2">
      {IA_DIAGRAMS.map((d, i) => {
        const isActive = i === active;
        return (
          <button
            key={d.key}
            type="button"
            onClick={() => onChange(i)}
            className={`font-nunito rounded-full px-5 py-2 text-[13px] transition-colors duration-200 ${
              isActive
                ? "bg-primary-orange font-bold text-proj-white"
                : "bg-proj-white font-semibold text-grey-600"
            }`}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Full-screen lightbox shared by both breakpoints -- desktop's "click to
 * enlarge" on the inline preview and mobile's "點擊查看資訊架構圖" CTA both
 * open this same overlay. Swipeable (drag) between after/before per Joe's
 * "用 Page Control 的形式...往右滑動去顯示舊版" spec -- dot indicators double
 * as tap targets, drag threshold flips the index either direction.
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
  const diagram = IA_DIAGRAMS[activeIndex];

  function handleDragEnd(_event: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -80 && activeIndex < IA_DIAGRAMS.length - 1) {
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
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-primary-black/90 p-4 backdrop-blur-sm md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-proj-white/10 text-proj-white transition-colors hover:bg-proj-white/20"
          >
            <X size={20} weight="bold" />
          </button>

          <div
            className="relative flex w-full max-w-[1100px] flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={diagram.key}
                className="relative aspect-[1380/830] max-h-[70vh] w-full overflow-hidden rounded-2xl bg-proj-white"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                drag={reduceMotion ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
              >
                <Image src={diagram.src} alt={diagram.label} fill sizes="90vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>

            <p className="font-nunito text-[13px] font-bold text-proj-white/80">{diagram.label}</p>

            <div className="flex items-center gap-2">
              {IA_DIAGRAMS.map((d, i) => (
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

function DesktopStatRow({ icon, point, index }: { icon: string; point: IaPoint; index: number }) {
  return (
    <SlideIn delay={0.15 + index * 0.06}>
      <div className="flex w-full items-center gap-4 rounded-r-2xl bg-grey-50 p-2">
        <span className="h-full w-[3px] shrink-0 self-stretch rounded-full bg-primary-orange" aria-hidden />
        <span className="relative size-12 shrink-0">
          <Image src={icon} alt="" fill sizes="48px" className="object-contain" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-nunito text-[14px] font-bold text-grey-800">{point.title}</p>
          <p className="font-nunito text-[13px] leading-[18px] font-normal text-grey-500">{point.desktopDesc}</p>
        </div>
      </div>
    </SlideIn>
  );
}

function MobileFeatureItem({ index, point }: { index: number; point: IaPoint }) {
  return (
    <SlideIn delay={0.15 + index * 0.05}>
      <div className="flex w-full items-center gap-3 rounded-xl border border-grey-100 bg-proj-white p-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-xl bg-primary-orange">
          <span className="font-nunito text-[12px] font-extrabold text-proj-white">{index + 1}</span>
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="font-nunito text-[14px] font-bold text-grey-800">{point.title}</p>
          <p className="font-nunito text-[12px] font-normal text-grey-500">
            {point.mobileDesc || point.desktopDesc}
          </p>
        </div>
      </div>
    </SlideIn>
  );
}

/**
 * 雙軸解決方案與資訊架構重構 (IA Restructuring), Figma desktop node 127:345 /
 * mobile node 147:235. New top-level section slotted in after Section 4's
 * three "Interface & Interaction" sub-blocks -- not itself part of that
 * numbered 01/02/03 family (no eyebrow-shared-once rule to worry about
 * here), so it renders its own eyebrow + heading.
 *
 * Content model: reuses the same `process` row (checked 2026-08-18 for key
 * collisions against every existing top-level field -- `ia*` prefix is
 * clean). Only `iaPoints` (the four stat/feature rows: icon assignment is
 * fixed by index per Figma, title + desktopDesc + optional mobileDesc are
 * CMS copy, same `mobileDesc`-fallback pattern as every other section) is
 * a CMS field. The two intro paragraphs (desktop's longer version, mobile's
 * shorter one) are hardcoded directly in JSX rather than exposed as CMS
 * strings -- both have literal inline bold/colored spans baked into the
 * copy per Figma (e.g. "介面優化" in blue, "服務創新" in orange), and this
 * project's existing convention is to hardcode structural/headline copy
 * with embedded rich formatting (see StrategyBeforeApp's headings) while
 * only exposing genuinely swappable plain-text copy as CMS fields.
 *
 * The four illustration icons and the two IA sitemap diagrams are static
 * /public assets (Joe-supplied reference material), not admin media
 * fields -- same rationale as StrategyBeforeApp's OLD_TABS screenshots.
 *
 * Desktop: left column (eyebrow/heading/divider/intro copy + 4 stat rows),
 * right column (724x438 diagram preview with hover "點擊放大" hint +
 * segmented After/Before control, both bound to the SAME `desktopDiagram`
 * state -- switching the control swaps the inline preview, clicking the
 * preview opens the lightbox on whichever diagram is currently shown).
 * Mobile: single CTA button ("點擊查看資訊架構圖") opens the same lightbox,
 * always starting on "After" per spec, swipeable to "Before" via drag or
 * the dot indicators (Page-Control style).
 */
export function IaRestructuring({ process }: { process: Record<string, unknown> }) {
  const points = Array.isArray(process.iaPoints) ? (process.iaPoints as IaPoint[]) : [];

  const [desktopDiagram, setDesktopDiagram] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (points.length < 4) return null;

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <section className="relative bg-proj-white">
      {/* Mobile layout */}
      <div className="flex flex-col gap-6 px-6 py-12 md:hidden">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <TreeStructure size={18} weight="bold" className="text-accent-pink" />
              <span className="font-nunito text-[13px] font-extrabold text-accent-pink">IA Restructuring</span>
            </div>
            <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
              雙軸解決方案與資訊架構重構
            </h2>
            <div className="h-px w-full bg-[#ededed]" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <p className="font-nunito text-center text-[14px] leading-[22px] font-normal text-grey-800">
            摒棄舊版多層嵌套入口，將所有核心服務收斂歸納為
            <span className="font-bold text-secondary-blue">5 大核心導覽主選單</span>。
          </p>
        </SlideIn>

        <div className="flex flex-col gap-3">
          {points.map((p, i) => (
            <MobileFeatureItem key={p.title} index={i} point={p} />
          ))}
        </div>

        <SlideIn delay={0.35}>
          <TechGlowBorder>
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary-orange px-4 py-3 shadow-[0_2px_4px_rgba(255,82,13,0.2)]"
            >
              <span className="font-nunito text-[13px] font-bold text-proj-white">點擊查看資訊架構圖</span>
              <MagnifyingGlassPlus size={16} weight="bold" className="text-proj-white" />
            </button>
          </TechGlowBorder>
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="hidden items-center gap-8 border-t border-b border-[#ededed] px-[120px] py-[100px] md:flex">
        <SlideIn direction="left" className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <TreeStructure size={18} weight="bold" className="text-accent-pink" />
              <span className="font-nunito text-[13px] font-extrabold text-accent-pink">IA Restructuring</span>
            </div>
            <h2 className="font-nunito text-[32px] leading-[44px] font-bold text-primary-black">
              雙軸解決方案與資訊架構重構
            </h2>
            <div className="h-px w-full bg-[#ededed]" />
            <p className="font-nunito text-[16px] leading-[1.7] font-normal text-grey-800">
              為了將破碎的流程重新收斂，我們採取「
              <span className="font-bold text-secondary-blue">介面優化</span>」與「
              <span className="font-bold text-primary-orange">服務創新</span>
              」雙軌齊下的策略。摒棄繁複的多欄排版，將所有核心服務直接合併收斂至{" "}
              <span className="font-bold text-secondary-blue">5 大導覽核心主選單</span>
              ：路線規劃、各站資訊、捷伴服務、個人帳戶、我的優惠。
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {points.map((p, i) => (
              <DesktopStatRow key={p.title} icon={POINT_ICONS[i]} point={p} index={i} />
            ))}
          </div>
        </SlideIn>

        <SlideIn direction="right" className="flex w-[724px] shrink-0 flex-col items-center gap-4">
          <TechGlowBorder className="w-full">
            <button
              type="button"
              onClick={() => openLightbox(desktopDiagram)}
              className="group relative block aspect-[724/438] w-full overflow-hidden rounded-2xl"
            >
              <Image
                src={IA_DIAGRAMS[desktopDiagram].src}
                alt={IA_DIAGRAMS[desktopDiagram].label}
                fill
                sizes="724px"
                className="object-contain p-2"
              />
              <ScanReveal />
              <ScanCorners />
              <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-primary-black/40 px-3 py-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <MagnifyingGlass size={14} weight="bold" className="text-proj-white" />
                <span className="font-nunito text-[11px] font-bold text-proj-white">點擊放大</span>
              </span>
            </button>
          </TechGlowBorder>
          <DiagramSegmentedControl active={desktopDiagram} onChange={setDesktopDiagram} />
        </SlideIn>
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
