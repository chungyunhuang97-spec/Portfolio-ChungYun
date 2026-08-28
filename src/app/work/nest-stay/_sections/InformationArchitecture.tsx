"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CursorClick } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * One node + the arrow leading INTO it (arrow omitted for the first node).
 * The flowing dot travels along the arrow's own length (a fixed-width
 * connector, so a simple 0%→100% `left` tween works without needing SVG
 * path math) -- staggered by `0.12 * index` per the spec, looping with a
 * `repeatDelay` that gives the "1.2s pause" between cycles.
 */
function FlowNode({
  label,
  index,
  vertical,
  playing,
}: {
  label: string;
  index: number;
  vertical: boolean;
  playing: boolean;
}) {
  return (
    <div className={`flex items-center ${vertical ? "flex-col" : ""}`}>
      {index > 0 && (
        <div
          className={
            vertical
              ? "relative h-10 w-px bg-[#e5e0db]"
              : "relative h-px w-10 shrink-0 bg-[#e5e0db] md:w-16"
          }
          aria-hidden
        >
          {playing && (
            <motion.span
              className={`absolute rounded-full bg-primary-orange ${vertical ? "left-1/2 size-[6px] -translate-x-1/2" : "top-1/2 size-[6px] -translate-y-1/2"}`}
              animate={vertical ? { top: ["0%", "100%"] } : { left: ["0%", "100%"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 1.2,
                delay: index * 0.12,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      )}
      <span className="font-nunito shrink-0 rounded-full border border-[#e5e0db] bg-proj-white px-4 py-2 text-[13px] font-bold text-grey-800 shadow-[0_2px_6px_rgba(64,50,42,0.06)] md:px-6 md:py-3 md:text-[15px]">
        {label}
      </span>
    </div>
  );
}

/**
 * 資訊架構 (Information Architecture), part of the same Figma flow-diagram
 * block on desktop node 275:87 / mobile node 404:147. The spec only calls
 * for animating the simple 5-node flow row (`iaFlowSteps`); Figma's larger
 * decorative isometric sitemap illustration in this section is skipped --
 * it isn't downloadable through this pipeline (known Figma-asset
 * limitation) and isn't required by the written interaction spec, which
 * only names the flow-diagram animation. Joe can supply it later as a PNG
 * if he wants it added.
 *
 * Content model: reuses `process` — `iaSubtitle`, `iaFlowSteps` (string
 * array of 5 node labels), `iaMobileCta`.
 *
 * Desktop: horizontal row, animates in at 30% visibility (SlideIn's default
 * viewport threshold approximates this closely enough — see SlideIn.tsx),
 * flowing dot loops continuously once visible.
 * Mobile: collapsed by default behind a CTA button; tapping expands
 * (opacity 0→1, translateY -12→0, 0.45s ease-out) into a vertical flow
 * column, and the flow animation only starts playing once expanded (not
 * before), per spec.
 */
export function InformationArchitecture({ process }: { process: Record<string, unknown> }) {
  const subtitle = process.iaSubtitle as string | undefined;
  const steps = Array.isArray(process.iaFlowSteps) ? (process.iaFlowSteps as string[]) : [];
  const mobileCta = (process.iaMobileCta as string) || "點擊查看資訊架構圖";
  const [expanded, setExpanded] = useState(false);

  if (steps.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col items-center gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-nunito text-[13px] font-extrabold tracking-[2px] text-secondary-blue uppercase">
              Information Architecture
            </span>
            {subtitle && (
              <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[16px] md:leading-[26px]">
                {subtitle}
              </p>
            )}
          </div>
        </SlideIn>

        {/* Mobile — collapsed behind CTA */}
        <div className="w-full md:hidden">
          {!expanded ? (
            <SlideIn delay={0.15}>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mx-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary-orange px-5 py-2.5 shadow-[0_2px_4px_rgba(255,82,13,0.2)]"
              >
                <span className="font-nunito text-[13px] font-bold text-proj-white">{mobileCta}</span>
                <CursorClick size={18} weight="bold" className="text-proj-white" />
              </button>
            </SlideIn>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center gap-0 rounded-2xl border border-[#e5e0db] bg-grey-50 px-6 py-8"
              >
                {steps.map((step, i) => (
                  <FlowNode key={step} label={step} index={i} vertical playing={expanded} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Desktop — always visible, flowing dots loop */}
        <SlideIn delay={0.15} className="hidden md:block">
          <div className="flex items-center justify-center rounded-2xl border border-[#e5e0db] bg-grey-50 px-10 py-10">
            {steps.map((step, i) => (
              <FlowNode key={step} label={step} index={i} vertical={false} playing />
            ))}
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
