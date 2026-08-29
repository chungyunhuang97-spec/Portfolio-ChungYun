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
 * interaction layer to read from): per the current interaction spec
 * ("互動4 — 回到頂部：使用者滾動超過頁面60%後顯示"), visibility is driven by a
 * page-scroll-percentage threshold — shown once `scrollY / (scrollHeight -
 * innerHeight)` passes 0.6, hidden again if the user scrolls back above
 * that line. (Supersedes an earlier revision that gated visibility on the
 * Closing section's own intersection instead.) The button is horizontally
 * centered via a full-width fixed wrapper with `flex justify-center` rather
 * than a `left-1/2 -translate-x-1/2` hack — framer-motion writes its own
 * inline `transform` for the `whileHover`/`animate` scale, which would
 * silently clobber a Tailwind translate-based centering class on the same
 * element, so centering is done one level up on a plain (non-animated)
 * wrapper instead. That wrapper spans the full width and is given
 * `pointer-events-none` so it doesn't swallow clicks on whatever sits
 * beneath it (e.g. Footer links); `pointer-events-auto` on the button
 * itself restores its own clickability. Clicking scrolls back to the
 * element whose id matches `targetId` (defaults to "hero" — Hero's outer
 * <section> in every case-study page carries `id="hero"` for exactly this
 * purpose) via native smooth scrollIntoView; if that id isn't present on
 * the page for some reason, falls back to scrolling the window to the very
 * top so the button never silently does nothing.
 */
export function BackToTop({ targetId = "hero" }: { targetId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      setVisible(ratio > 0.6);
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
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center md:bottom-10">
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            onClick={handleClick}
            aria-label="回到頂部"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto flex items-center gap-2 rounded-xl border-[1.5px] border-secondary-blue bg-proj-white px-4 py-3 font-nunito text-[14px] font-bold text-secondary-blue shadow-[0_8px_20px_rgba(13,33,255,0.15)] md:text-[16px] md:tracking-[0.5px]"
          >
            回到頂部
            <ArrowUp size={20} weight="bold" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
