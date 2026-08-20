"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * Animated backdrop for the Closing section — Joe's explicit ask this round
 * ("背景的幾何希望可以有動畫、動態移動的效果，然後整體也要有一個金屬感的科技動態呈現":
 * the background geometry should animate/drift, and the whole thing should
 * read with a metallic tech feel). Figma itself only shows a *static*
 * scattered dot texture on the blue field (confirmed via
 * get_design_context screenshot, no motion data on this node) — the motion
 * design here is this section's own judgment call, same tier as every
 * other section's bespoke "科技感" signature (RadarPing / FlowPulse /
 * ScanReveal etc), not a literal Figma-specified animation.
 *
 * Three independent layers, kept purely to `transform`/`background-position`
 * (no layout-affecting properties) so they're cheap to run indefinitely:
 * 1. `DotDrift` — Figma's dot texture reproduced as a repeating
 *    radial-gradient (not individual DOM nodes, since the pattern tiles
 *    indefinitely) whose `backgroundPosition` crawls diagonally forever —
 *    this IS the literal "background geometry that moves" ask.
 * 2. `MetallicSheen` — a soft diagonal highlight band that sweeps back and
 *    forth across the whole section, mimicking brushed-metal light glare.
 *    This is what supplies the "金屬感" read; without it the section is
 *    just a flat blue field with dots.
 * 3. `OrbitRings` — two large thin-stroke outline shapes (a rounded square
 *    and a circle) rotating slowly at different speeds/directions in
 *    opposite corners, echoing the geometric-quote-mark motif already in
 *    this section without competing with it (very low opacity, outline
 *    only, same restrained treatment as every other section's decorative
 *    flourishes like Results' PlusMark/DotGrid).
 */
function GeometricBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-[80px]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.5px)",
          backgroundSize: "42px 42px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "84px 84px"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-y-0 -left-1/2 w-[200%]"
        style={{
          background:
            "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0.08) 54%, transparent 65%)",
        }}
        animate={{ x: ["-12%", "12%"] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 -top-16 size-[200px] rounded-[36px] border border-white/10 md:size-[320px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-16 size-[160px] rounded-full border border-white/10 md:size-[260px]"
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/**
 * 結論 (Closing), Figma desktop node 127:692 / mobile node 151:578 (both
 * named "Closing - Proposal A 漸層引號" -- "gradient quote marks"). Content
 * model: this is the first section to source its copy from the
 * `reflection` project_sections row rather than piling onto `process` --
 * unlike every prior post-Hero section, this one's subject (a closing
 * reflective statement on the whole case study) maps semantically onto an
 * existing, still-unused section_type, so it gets its own row instead of
 * further overloading `process`. New fields `closingQuote` / `closingBody`
 * sit alongside the pre-existing (and untouched) `text` key from before
 * this project's per-section refactor. Figma's desktop and mobile copy is
 * byte-identical (confirmed via get_design_context on both nodes), so
 * there's a single field each, no mobile/desktop split.
 *
 * Typography: desktop numbers matched to Figma spec (120px quote glyphs,
 * 30px/18px body). Mobile quote/body sizes are NOT ported literally from
 * Figma's raw dev-mode export (14px / 10px) -- that mobile frame's own
 * decorative quote marks are tiny bespoke SVG assets scaled to a 326px
 * frame, and 10px body copy would sit below every other mobile body-text
 * size already shipped on this page (the established floor across
 * MobileMetricCard/MobilePhase/tooltips is ~12-13px). Bumped to 16px/13px
 * for legibility parity with the rest of the site's mobile scale -- same
 * kind of deliberate, documented deviation Results.tsx made when it
 * upsized (not downsized) its own headline numbers for a real-device
 * legibility reason.
 *
 * The mobile decorative corner glyphs are Figma image assets
 * (decorative-quote-mark-open/close, ~11x21px) that aren't downloadable
 * through this pipeline (known Figma-asset limitation, see this project's
 * planning doc) -- reused the same literal "「"/"」" text glyphs the
 * desktop version already uses, just scaled down, rather than attempting a
 * pixel replica of the unreachable SVGs.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote || !body) return null;

  return (
    <section id="closing" className="relative overflow-hidden bg-secondary-blue">
      <GeometricBackdrop />

      {/* Mobile layout */}
      {/* Quote marks live INSIDE the same box as the text (not anchored to
          the outer section) and that box reserves `pt-12`/`pb-12` — exactly
          the marks' own line-height — so they can never overlap the copy
          no matter how many lines the quote/body wrap to (Joe's 8/20
          report: marks were overlapping content because they were pinned
          to the section's corners independent of content height). Both
          <p>s are `w-full` so the quote and body render as the SAME column
          width instead of each shrink-wrapping to its own longest line
          (Joe's report: title rendered wider than subtitle). */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 md:hidden">
        <SlideIn delay={0.1}>
          <div className="relative flex w-full max-w-[326px] flex-col items-center gap-3 pt-12 pb-12 text-center text-proj-white">
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white"
            >
              「
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 font-nunito text-[40px] font-bold leading-[40px] text-proj-white"
            >
              」
            </span>
            <p className="w-full font-nunito text-[16px] font-bold leading-[24px]">{quote}</p>
            <p className="w-full font-nunito text-[13px] font-normal leading-[20px] opacity-80">{body}</p>
          </div>
        </SlideIn>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex">
        <span
          aria-hidden
          className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-proj-white"
        >
          「
        </span>
        <span
          aria-hidden
          className="absolute bottom-[200px] right-[240px] translate-x-full translate-y-full font-nunito text-[120px] font-bold leading-[120px] text-proj-white"
        >
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
