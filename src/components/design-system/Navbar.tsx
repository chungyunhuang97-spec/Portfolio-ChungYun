"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { StaggeredMenu } from "./StaggeredMenu";

/**
 * Fixed top navigation for project (case-study) pages — reused across
 * every case-study page and, eventually, the homepage.
 *
 * Desktop: centered pill with all links, always visible (no scroll-based
 * behavior — confirmed mobile-only, see below).
 * Mobile: wordmark + hamburger button that reveals a small dropdown
 * (design differs by breakpoint per the Figma spec, not just reflowed),
 * plus scroll-aware chrome: the "Chung Yun" wordmark only shows at the
 * very top of the page, and the hamburger icon hides while scrolling
 * down and reappears as soon as the user scrolls back up.
 */
const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#work" },
  { label: "Contact", href: "mailto:chungyunhuang97@gmail.com" },
];

export function Navbar({
  wordmarkTone = "dark",
}: {
  /**
   * The mobile-only wordmark ("Chung Yun") only ever shows at the very
   * top of the page, directly over that page's hero. Case-study heroes
   * are white (bg-proj-white), so "dark" (grey) reads correctly there;
   * the homepage hero is bg-primary-orange, so it needs "light" (cream)
   * for contrast instead.
   */
  wordmarkTone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [iconVisible, setIconVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;

    function handleScroll() {
      const y = window.scrollY;
      setAtTop(y < 8);
      // Scrolling up (or back near the top) reveals the icon button;
      // scrolling down hides it. A few px of slack avoids jitter.
      if (y < 8 || y < lastY - 2) {
        setIconVisible(true);
      } else if (y > lastY + 2) {
        setIconVisible(false);
        setOpen(false);
      }
      lastY = y;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The StaggeredMenu panel is a full-viewport takeover — lock body scroll
  // while it's open so the underlying page can't scroll behind it (which
  // would also trip the scroll listener above and auto-close the menu).
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Mobile: wordmark (top-of-page only) + hamburger (hides on scroll down) */}
      <div className="flex items-center justify-between px-6 py-8 md:hidden">
        <AnimatePresence>
          {atTop && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`font-fredoka text-[20px] ${
                wordmarkTone === "light" ? "text-cream" : "text-grey-700"
              }`}
            >
              Chung Yun
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {iconVisible && (
            <motion.button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-grey-100 bg-proj-white text-primary-black shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {/* Mobile menu panel — same trigger/data as before (hamburger button
          above, LINKS array), just rendered via the staggered color-wipe
          panel instead of the old small dropdown. Desktop never sets `open`
          true (its pill nav below is independent), so this stays inert
          off-screen at md+ widths. */}
      <StaggeredMenu
        open={open}
        onRequestClose={() => setOpen(false)}
        items={LINKS.map((link) => ({ label: link.label, ariaLabel: link.label, link: link.href }))}
      />

      {/* Desktop: centered pill (unchanged, always visible) */}
      <div className="hidden justify-center pt-16 md:flex">
        <nav className="flex items-center gap-6 rounded-full bg-proj-white px-[41px] py-[21px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-nunito text-[18px] font-bold text-grey-800 transition-colors hover:text-primary-orange"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
