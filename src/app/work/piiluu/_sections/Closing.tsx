"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";

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

/** "回到頂部" CTA -- Figma node 539:2744, white bg / secondary-blue border
 * and text, distinct from Nest Stay/Metro's own Closing buttons. */
function BackToTopButton() {
  return (
    <a
      href="#hero"
      className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-secondary-blue bg-white px-4 py-4 font-nunito text-[16px] font-bold text-secondary-blue transition-transform hover:scale-[1.03]"
    >
      回到頂部
      <ArrowUp size={20} weight="bold" />
    </a>
  );
}

/**
 * Closing section, Figma fileKey 8qGUSDUJqOgJaSERffGXVc, desktop node
 * 539:2738 / mobile node 543:3512. `bg-secondary-blue` (piiluu's dominant
 * color) at both breakpoints -- shared skeleton with Nest Stay/Metro's own
 * Closing (open/close quote glyphs, two staggered text lines, `id="closing"`
 * for `BackToTop`'s intersection trigger), but its own `GeometricBackdrop`
 * per the structural convention that signature Closing motion is never
 * reused cross-project.
 *
 * Desktop quote glyphs are literal "「"/"」" text at 120px; mobile uses
 * Figma's small decorative SVG glyphs instead -- two different techniques
 * kept as Figma has them, not unified.
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
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 py-20 text-center md:hidden">
        <Image src="/work/piiluu/closing/quote-open.svg" alt="" width={11} height={21} className="mb-1" />
        <div className="flex w-[326px] max-w-full flex-col items-center gap-1.5 text-white">
          {quote && <p className="font-nunito text-[14px] leading-[21px] font-bold">{quote}</p>}
          {body && <p className="font-nunito text-[10px] leading-[17px] font-normal opacity-80">{body}</p>}
        </div>
        <Image src="/work/piiluu/closing/quote-close.svg" alt="" width={11} height={21} className="mt-1" />
        <div className="mt-4">
          <BackToTopButton />
        </div>
      </div>

      {/* Desktop */}
      <div className="relative z-10 hidden flex-col items-center justify-center gap-8 p-[100px] md:flex">
        <span className="absolute left-[120px] top-[80px] font-nunito text-[120px] leading-[120px] font-bold text-white">「</span>
        <span className="absolute bottom-[80px] right-[120px] font-nunito text-[120px] leading-[120px] font-bold text-white">」</span>
        <div className="flex w-[800px] max-w-full flex-col items-center gap-5 text-center text-white">
          {quote && <p className="font-nunito text-[30px] leading-10 font-bold">{quote}</p>}
          {body && <p className="font-nunito text-[18px] leading-7 font-normal opacity-80">{body}</p>}
        </div>
        <BackToTopButton />
      </div>
    </section>
  );
}
