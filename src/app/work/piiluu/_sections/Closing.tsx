"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

/** Fixed-ish node positions (percent of the backdrop box) forming a loose
 * "trust network" graph -- a financial/trust theme distinct from both Nest
 * Stay's diamond-drift grid and Metro's dot-grid+sheen+rings (per Joe's
 * explicit ask that Closing NOT resemble either prior project's treatment).
 * Edges connect a subset of node pairs so the graph reads as a connected
 * network, not a random scatter. */
const NODES = [
  { x: 12, y: 22 },
  { x: 32, y: 12 },
  { x: 55, y: 20 },
  { x: 78, y: 10 },
  { x: 88, y: 32 },
  { x: 68, y: 42 },
  { x: 40, y: 40 },
  { x: 18, y: 55 },
  { x: 50, y: 65 },
  { x: 75, y: 70 },
  { x: 25, y: 80 },
  { x: 92, y: 85 },
] as const;

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [1, 6],
  [6, 7],
  [5, 6],
  [5, 8],
  [8, 9],
  [7, 10],
  [8, 10],
  [9, 11],
];

/**
 * Piiluu's own Closing signature motion -- a slowly-drawing, gently-pulsing
 * "trust network" (nodes + connecting lines), fitting the "金融信任 /
 * 系統化設計" theme this case study is actually about. Three layered motions
 * (per Joe's "動態不要太呆板" note -- vary timing/phase across layers rather
 * than one flat linear loop):
 *  1. Edges draw in once via `pathLength` (spring-ish ease, staggered by
 *     index) when the section scrolls into view.
 *  2. Nodes pulse (scale + opacity, `easeInOut` + `repeatType: "mirror"`,
 *     each on its own phase/duration) after drawing in.
 *  3. The whole graph drifts very slightly (a slow, large-radius float) as
 *     one more layer of motion, distinct from the per-node pulses.
 * Disabled entirely under `prefers-reduced-motion` -- nodes/edges render at
 * full opacity, static, same convention as Nest Stay/Metro's own Closing
 * backdrops.
 */
function GeometricBackdrop() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const run = inView && !reduceMotion;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        animate={run ? { x: [0, 1.2, 0, -1.2, 0], y: [0, -0.8, 0, 0.8, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 22, repeat: run ? Infinity : 0, ease: "easeInOut" }}
      >
        {EDGES.map(([a, b], i) => {
          const from = NODES[a];
          const to = NODES[b];
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={0.25}
              initial={reduceMotion ? undefined : { pathLength: 0, opacity: 0 }}
              animate={run ? { pathLength: 1, opacity: 1 } : reduceMotion ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{ duration: 1.4, delay: 0.4 + i * 0.06, ease: "easeOut" }}
            />
          );
        })}
        {NODES.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={0.9}
            fill="rgba(255,255,255,0.7)"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0 }}
            animate={
              run
                ? { opacity: [0.5, 1, 0.5], scale: [1, 1.6, 1] }
                : reduceMotion
                ? { opacity: 1, scale: 1 }
                : undefined
            }
            transition={
              run
                ? {
                    opacity: { duration: 2.6 + (i % 4) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 },
                    scale: { duration: 2.6 + (i % 4) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 },
                  }
                : { duration: 0.6, delay: 0.4 + i * 0.06 }
            }
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          />
        ))}
      </motion.svg>
    </div>
  );
}

/**
 * 結論 (Closing), Figma fileKey 8qGUSDUJqOgJaSERffGXVc. Structural skeleton
 * (open/close quote glyphs, two staggered text lines, `bg-secondary-blue`
 * since blue is piiluu's dominant color, `id="closing"`, mobile/desktop dual
 * tree) copied from Nest Stay/Metro's `Closing - Proposal A 漸層引號`
 * component -- only `GeometricBackdrop` above is wholly new. No shared
 * `Button` component exists in this codebase and neither Nest Stay's nor
 * Metro's Closing renders a separate CTA button (both rely on the global
 * floating `<BackToTop />` instead) -- following that same precedent here
 * rather than inventing a one-off button, per the task's own ask to
 * pattern-match the two existing implementations' actual code.
 *
 * Content model: `reflection` row -- `closingQuote` / `closingBody`.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote || !body) return null;

  return (
    <section id="closing" className="relative overflow-hidden bg-secondary-blue">
      <GeometricBackdrop />

      {/* Mobile layout */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 md:hidden">
        <SlideIn delay={0.1}>
          <div className="relative flex w-full max-w-[326px] flex-col items-center gap-3 pt-12 pb-12 text-center text-proj-white">
            <span aria-hidden className="pointer-events-none absolute left-0 top-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white">
              「
            </span>
            <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white">
              」
            </span>
            <p className="w-full font-nunito text-[16px] font-bold leading-[24px]">{quote}</p>
            <p className="w-full font-nunito text-[13px] font-normal leading-[20px] opacity-80">{body}</p>
          </div>
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex">
        <span aria-hidden className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          「
        </span>
        <span aria-hidden className="absolute bottom-[200px] right-[240px] translate-x-full translate-y-full font-nunito text-[120px] font-bold leading-[120px] text-proj-white">
          」
        </span>
        <SlideIn delay={0.1}>
          <div className="flex w-[800px] flex-col items-center gap-5 text-center text-proj-white">
            <p className="w-full font-nunito text-[30px] font-bold leading-[40px]">{quote}</p>
            <p className="w-[680px] font-nunito text-[18px] font-normal leading-[28px] opacity-80">{body}</p>
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
