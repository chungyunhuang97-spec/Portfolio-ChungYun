"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

/**
 * Figma's own Closing background (node 539:2738 / 543:3512) is a static
 * WebGPU shader: a diamond-grid pattern (white, ~40% opacity, rotated
 * ~72deg) over solid `bg-secondary-blue`. The shader itself is NOT
 * animated (`isAnimated: false` in its manifest) and requires WebGPU, which
 * isn't reliably available -- but Joe separately asked, explicitly, for
 * this backdrop's geometry to actually move ("希望它背後的幾何圖形是有在移動的"),
 * distinct from Nest Stay's diamond-drift. So: same visual language as
 * Figma (diamond grid, white-on-blue, similar rotation) reproduced as a
 * CSS pattern instead of the shader, then animated -- drifting diagonally,
 * matching this codebase's other `GeometricBackdrop` precedents
 * (Nest Stay/Metro Closing.tsx) in technique (`useInView` +
 * `useReducedMotion` gated, pauses off-screen).
 */
const DIAMOND_PATTERN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect x='22' y='22' width='20' height='20' fill='none' stroke='%23ffffff' stroke-opacity='0.4' stroke-width='1.5' transform='rotate(72 32 32)'/%3E%3C/svg%3E";

function GeometricBackdrop() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const run = inView && !reduceMotion;

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-secondary-blue">
      <motion.div
        className="absolute -inset-16"
        style={{ backgroundImage: `url("${DIAMOND_PATTERN_URL}")`, backgroundRepeat: "repeat" }}
        animate={run ? { x: [0, -64], y: [0, 64] } : { x: 0, y: 0 }}
        transition={{ duration: 30, repeat: run ? Infinity : 0, repeatType: "loop", ease: "linear" }}
      />
    </div>
  );
}

/**
 * Closing section, Figma fileKey 8qGUSDUJqOgJaSERffGXVc, desktop node
 * 539:2738 / mobile node 543:3512. `bg-secondary-blue` (piiluu's dominant
 * color) at both breakpoints -- shared skeleton with Nest Stay/Metro's own
 * Closing, copied structurally from Metro's `Closing.tsx` (quote-glyph
 * positioning technique, `id="closing"` for `BackToTop`'s intersection
 * trigger, no separate CTA button here -- the existing global
 * `<BackToTop />` already mounted once in page.tsx is the ONLY "回到頂部"
 * control; this section must not render a second one), but its own
 * `GeometricBackdrop` per the structural convention that signature Closing
 * motion is never reused cross-project.
 *
 * Quote marks are positioned INSIDE the text column (absolute
 * top-left/bottom-right against a wrapper with matching pt/pb reserved
 * space), not pinned to the section's own corners -- this is what keeps
 * them from ever overlapping the quote/body text regardless of how many
 * lines it wraps to, exactly like Metro/Nest Stay's Closing.
 *
 * Content model: `reflection` row -- `closingQuote` / `closingBody`.
 */
export function Closing({ reflection }: { reflection: Record<string, unknown> }) {
  const quote = reflection.closingQuote as string | undefined;
  const body = reflection.closingBody as string | undefined;

  if (!quote && !body) return null;

  return (
    <section id="closing" className="relative overflow-hidden bg-secondary-blue">
      <GeometricBackdrop />

      {/* Mobile */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-20 md:hidden">
        <SlideIn delay={0.1}>
          <div className="relative flex w-full max-w-[326px] flex-col items-center gap-3 pt-12 pb-12 text-center text-white">
            <span aria-hidden className="pointer-events-none absolute left-0 top-0 font-nunito text-[40px] font-bold leading-[40px] text-white">
              「
            </span>
            <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 font-nunito text-[40px] font-bold leading-[40px] text-white">
              」
            </span>
            {quote && <p className="w-full font-nunito text-[16px] font-bold leading-[24px]">{quote}</p>}
            {body && <p className="w-full font-nunito text-[13px] font-normal leading-[20px] opacity-80">{body}</p>}
          </div>
        </SlideIn>
      </div>

      {/* Desktop */}
      <div className="relative hidden w-full flex-col items-center justify-center gap-8 p-[100px] md:flex">
        <span aria-hidden className="absolute left-[120px] top-[80px] font-nunito text-[120px] font-bold leading-[120px] text-white">
          「
        </span>
        <span aria-hidden className="absolute bottom-[100px] right-[120px] translate-x-full translate-y-full font-nunito text-[120px] font-bold leading-[120px] text-white">
          」
        </span>
        <SlideIn delay={0.1}>
          <div className="flex w-[800px] flex-col items-center gap-5 text-center text-white">
            {quote && <p className="w-full font-nunito text-[30px] font-bold leading-[40px]">{quote}</p>}
            {body && <p className="w-[680px] font-nunito text-[18px] font-normal leading-[28px] opacity-80">{body}</p>}
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
