"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, X } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { IAFlowDiagram, IA_DIAGRAM_HEIGHT, IA_DIAGRAM_WIDTH } from "./IAFlowDiagram";

/**
 * Mobile "查看資訊架構圖" pop-up — per Joe's ask, this should read like
 * viewing an image (the same full diagram desktop gets, at true/native
 * pixel size so every label stays legible) rather than the compact vertical
 * list the old inline-expand version showed. The diagram is rendered at its
 * real `IA_DIAGRAM_WIDTH`×`IA_DIAGRAM_HEIGHT` inside a pan/scrollable frame
 * instead of being scaled down to fit the phone's width.
 */
function IADiagramModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-black/80 p-4 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-[#ededed]"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉資訊架構圖"
              className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-proj-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] outline-none focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-2"
            >
              <X size={18} weight="bold" className="text-primary-black" />
            </button>
            <p className="font-nunito absolute top-4 left-4 z-10 text-[12px] font-bold text-grey-500">
              左右滑動可查看完整架構圖
            </p>
            <div className="flex-1 overflow-auto p-6 pt-14">
              <div style={{ width: IA_DIAGRAM_WIDTH, height: IA_DIAGRAM_HEIGHT }}>
                <IAFlowDiagram />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Desktop flow-diagram node — a plain white pill card, static arrow between (Figma has no motion here). */
function FlowCard({ label }: { label: string }) {
  return (
    <div className="flex w-[160px] shrink-0 items-center justify-center rounded-2xl border border-[#ededed] bg-proj-white p-6 text-center">
      <p className="font-nunito text-[15px] leading-[23px] font-bold text-primary-black">{label}</p>
    </div>
  );
}

const FLOW_SEGMENT_DURATION = 0.7;

/**
 * Interaction spec 1 — "流動箭頭": one segment lights up (orange line +
 * travelling dot) at a time, left to right, then hands off to the next —
 * a clear one-at-a-time relay rather than four independently-looping dots,
 * per Joe's feedback that the simultaneous version didn't read as
 * progressive. The base grey arrow is always visible; `active` swaps it
 * orange and plays the dot travelling the gap once.
 */
function FlowArrow({ active }: { active: boolean }) {
  return (
    <svg width="48" height="16" viewBox="0 0 48 16" fill="none" className="mx-2 shrink-0 overflow-visible">
      <motion.line
        x1="2"
        y1="8"
        x2="40"
        y2="8"
        strokeWidth="1.5"
        animate={{ stroke: active ? "var(--color-primary-orange)" : "var(--color-grey-300)" }}
        transition={{ duration: 0.2 }}
      />
      <motion.path
        d="M36 3l6 5-6 5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animate={{ stroke: active ? "var(--color-primary-orange)" : "var(--color-grey-300)" }}
        transition={{ duration: 0.2 }}
      />
      {active && (
        <motion.circle
          r="3"
          fill="var(--color-primary-orange)"
          initial={{ cx: 2, opacity: 0 }}
          animate={{ cx: [2, 2, 40, 40], opacity: [0, 1, 1, 0] }}
          transition={{ duration: FLOW_SEGMENT_DURATION, ease: "easeInOut" }}
        />
      )}
    </svg>
  );
}

/** Mobile numbered list item — orange numeral chip + label, per Figma `FeatureItem`. */
function FeatureItem({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-grey-100 bg-proj-white p-3">
      <span className="font-nunito flex size-6 shrink-0 items-center justify-center rounded-xl bg-primary-orange text-[12px] font-extrabold text-proj-white">
        {index}
      </span>
      <p className="font-nunito flex-1 text-[14px] font-bold text-grey-800">{label}</p>
    </div>
  );
}

/**
 * 產品資訊架構 (Information Architecture), Figma desktop node 275:131 /
 * mobile 404:201. Rebuilt against the real page-level Figma frames.
 *
 * Desktop: a plain grey-50 band (bordered top/bottom) holding the 5-node
 * flow row and, below it, the full sitemap diagram (Figma node 283:4394,
 * itself a single flattened SVG export) — rebuilt node-for-node as real SVG
 * in `IAFlowDiagram` rather than an `<img>` of that export, since the
 * raster asset scaled up soft/blurry on the page. See that file for the
 * exact card/label/connector layout.
 *
 * Mobile: the 5 steps render as an always-visible numbered list, followed by
 * a "點擊查看資訊架構圖" button that opens the same `IAFlowDiagram` desktop
 * uses in a full-screen pop-up, at true pixel size inside a pan/scrollable
 * frame — per Joe's ask, it should read like viewing a (legible) image
 * rather than the compact vertical arrow-list the previous inline-expand
 * version showed.
 *
 * Content model: reuses `process` — `iaSubtitle`, `iaFlowSteps` (5 labels),
 * `iaMobileCta`.
 */
export function InformationArchitecture({ process }: { process: Record<string, unknown> }) {
  const subtitle = process.iaSubtitle as string | undefined;
  const steps = Array.isArray(process.iaFlowSteps) ? (process.iaFlowSteps as string[]) : [];
  const mobileCta = (process.iaMobileCta as string) || "點擊查看資訊架構圖";
  const [expanded, setExpanded] = useState(false);
  const flowRowRef = useRef<HTMLDivElement>(null);
  const flowRowInView = useInView(flowRowRef, { amount: 0.3 });
  const segmentCount = Math.max(steps.length - 1, 0);
  const [activeSegment, setActiveSegment] = useState(0);

  useEffect(() => {
    if (!flowRowInView || segmentCount === 0) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    const advance = () => {
      if (cancelled) return;
      setActiveSegment(i);
      const isLast = i === segmentCount - 1;
      const wait = FLOW_SEGMENT_DURATION + (isLast ? 1.2 : 0.15);
      timer = setTimeout(() => {
        i = (i + 1) % segmentCount;
        advance();
      }, wait * 1000);
    };
    advance();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [flowRowInView, segmentCount]);

  if (steps.length === 0) return null;

  return (
    <section className="border-y border-[#ededed] bg-grey-50 px-6 py-12 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col items-center gap-2 text-center md:items-start md:gap-3 md:text-left">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-primary-orange uppercase">
              Architecture
            </span>
            <h3 className="font-nunito text-[24px] leading-[36px] font-bold text-[#1a1a1a] md:text-[48px] md:leading-[72px] md:text-primary-black">
              產品資訊架構
            </h3>
            {subtitle && (
              <p className="font-nunito max-w-[560px] text-[14px] leading-[21px] font-normal text-grey-600 md:max-w-none md:text-[18px] md:leading-[25px]">
                {subtitle}
              </p>
            )}
            <div className="hidden w-full border-t border-dashed border-[#e0e0e0] md:block" />
          </div>
        </SlideIn>

        {/* Mobile — always-visible numbered list + optional expand */}
        <div className="flex flex-col gap-4 md:hidden">
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <FeatureItem key={step} index={i + 1} label={step} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary-orange px-4 py-2 shadow-[0_2px_4px_rgba(255,82,13,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-2"
            aria-haspopup="dialog"
          >
            <span className="font-nunito text-[13px] font-bold text-proj-white">{mobileCta}</span>
            <ArrowRight size={16} weight="bold" className="text-proj-white" />
          </button>
          <IADiagramModal open={expanded} onClose={() => setExpanded(false)} />
        </div>

        {/* Desktop — static flow row + illustration */}
        <div className="hidden flex-col gap-10 md:flex">
          <SlideIn delay={0.15}>
            <div ref={flowRowRef} className="flex w-full items-center justify-between">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-0">
                  {i > 0 && <FlowArrow active={flowRowInView && i - 1 === activeSegment} />}
                  <FlowCard label={step} />
                </div>
              ))}
            </div>
          </SlideIn>

          <SlideIn delay={0.2}>
            <div className="relative h-[420px] w-full overflow-hidden rounded-[30px] bg-[#ededed] p-6">
              <IAFlowDiagram />
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
