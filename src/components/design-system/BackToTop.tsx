"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";

/**
 * Floating "回到頂部" (back to top) button, reused across project pages —
 * same reuse tier as <Navbar />. Figma specs two near-identical instances
 * (desktop 137:113, mobile 147:385): white fill, 1.5px secondary-blue
 * border, 12px radius, bold Nunito label + a 24px arrow icon. The only
 * real difference between the two Figma instances is desktop's extra
 * 0.5px letter-spacing on the label — everything else (padding, colors,
 * icon) is identical, so this is one adaptive component (`md:` breakpoint
 * for the type-scale ticks) rather than two separate ones.
 *
 * Figma's own vector for the icon (a plain stroke, not a self-contained
 * glyph) isn't downloadable through this pipeline (see the project's
 * established Figma-asset limitation) — reused Phosphor's `ArrowUp` at
 * bold weight instead, which reads the same at this size.
 *
 * Behavior (not specified in Figma, since the static mockup has no
 * interaction layer to read from): hidden until the visitor scrolls past
 * roughly one viewport height, then fades/slides in bottom-right, fixed at
 * a lower z-index than <Navbar /> (z-40 vs Navbar's z-50) so it never
 * competes with the nav pill. Clicking scrolls back to the element whose
 * id matches `targetId` (defaults to "hero" — Hero's outer <section> in
 * every case-study page carries `id="hero"` for exactly this purpose) via
 * native smooth scrollIntoView; if that id isn't present on the page for
 * some reason, falls back to scrolling the window to the very top so the
 * button never silently does nothing.
 */
export function BackToTop({ targetId = "hero" }: { targetId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleClick() {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="回到頂部"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-xl border-[1.5px] border-secondary-blue bg-proj-white px-4 py-3 font-nunito text-[14px] font-bold text-secondary-blue shadow-[0_8px_20px_rgba(13,33,255,0.15)] md:bottom-10 md:right-10 md:text-[16px] md:tracking-[0.5px]"
        >
          回到頂部
          <ArrowUp size={20} weight="bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
