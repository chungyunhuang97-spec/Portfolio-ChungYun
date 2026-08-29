"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, MapTrifold } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";

/** Desktop flow-diagram node — a plain white pill card, static arrow between (Figma has no motion here). */
function FlowCard({ label }: { label: string }) {
  return (
    <div className="flex w-[160px] shrink-0 items-center justify-center rounded-2xl border border-[#ededed] bg-proj-white p-6 text-center">
      <p className="font-nunito text-[15px] leading-[23px] font-bold text-primary-black">{label}</p>
    </div>
  );
}

/**
 * Interaction spec 1 — "流動箭頭": a grey base arrow with an orange light
 * dot that travels the gap once the row is 30% visible, 0.12s stagger per
 * arrow, 0.8s per pass, pausing 1.2s between loops, and pausing entirely
 * once the row scrolls out of view.
 */
function FlowArrow({ delay, active }: { delay: number; active: boolean }) {
  return (
    <svg width="48" height="16" viewBox="0 0 48 16" fill="none" className="mx-2 shrink-0 overflow-visible">
      <line x1="2" y1="8" x2="40" y2="8" stroke="var(--color-grey-300)" strokeWidth="1.5" />
      <path d="M36 3l6 5-6 5" stroke="var(--color-grey-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {active && (
        <motion.circle
          r="3"
          fill="var(--color-primary-orange)"
          initial={{ cx: 2, opacity: 0 }}
          animate={{ cx: [2, 2, 40, 40], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.8, delay, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
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
 * flow row (static white cards + static arrows, no animation in Figma) and,
 * below it, a large decorative isometric illustration. That illustration is
 * one big composited vector group in Figma that isn't downloadable through
 * this pipeline (same known asset limitation as before) — shown here as a
 * placeholder panel; swap `illustrationSrc` in for the real exported PNG/SVG
 * whenever Joe sends one (right-click node 281:4301 in Figma → Export).
 *
 * Mobile: the 5 steps render as an always-visible numbered list (no
 * click-to-expand — that was this build's own invention, not in Figma),
 * followed by a "点擊查看資訊架構圖" button that reveals a compact vertical
 * version of the flow for anyone who wants the full picture on a small
 * screen.
 *
 * Content model: reuses `process` — `iaSubtitle`, `iaFlowSteps` (5 labels),
 * `iaMobileCta`.
 */
export function InformationArchitecture({ process }: { process: Record<string, unknown> }) {
  const subtitle = process.iaSubtitle as string | undefined;
  const steps = Array.isArray(process.iaFlowSteps) ? (process.iaFlowSteps as string[]) : [];
  const mobileCta = (process.iaMobileCta as string) || "點擊查看資訊架構圖";
  const illustrationSrc = process.iaIllustrationUrl as string | undefined;
  const [expanded, setExpanded] = useState(false);
  const flowRowRef = useRef<HTMLDivElement>(null);
  const flowRowInView = useInView(flowRowRef, { amount: 0.3 });

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
            <div className="hidden h-px w-full bg-[#e0e0e0] md:block" />
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
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary-orange px-4 py-2 shadow-[0_2px_4px_rgba(255,82,13,0.2)]"
            aria-expanded={expanded}
          >
            <span className="font-nunito text-[13px] font-bold text-proj-white">{mobileCta}</span>
            <ArrowRight size={16} weight="bold" className="text-proj-white" />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col items-center gap-0 rounded-2xl bg-[#ededed] px-6 py-8">
                  {steps.map((step, i) => (
                    <div key={step} className="flex flex-col items-center">
                      {i > 0 && <div className="h-6 w-px bg-grey-300" aria-hidden />}
                      <span className="font-nunito rounded-full border border-[#ededed] bg-proj-white px-4 py-2 text-[13px] font-bold text-grey-800 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop — static flow row + illustration */}
        <div className="hidden flex-col gap-10 md:flex">
          <SlideIn delay={0.15}>
            <div ref={flowRowRef} className="flex w-full items-center justify-between">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-0">
                  {i > 0 && <FlowArrow delay={(i - 1) * 0.12} active={flowRowInView} />}
                  <FlowCard label={step} />
                </div>
              ))}
            </div>
          </SlideIn>

          <SlideIn delay={0.2}>
            <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-[30px] bg-[#ededed]">
              {illustrationSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={illustrationSrc} alt="產品資訊架構示意圖" className="h-[85%] w-[95%] object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-grey-300">
                  <MapTrifold size={40} weight="light" />
                  <span className="font-nunito text-[13px] font-bold">架構示意圖（待補圖）</span>
                </div>
              )}
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
