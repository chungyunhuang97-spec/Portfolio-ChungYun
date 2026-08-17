"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { List, X } from "@phosphor-icons/react/dist/ssr";

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

export function Navbar() {
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
              className="font-fredoka text-[20px] text-grey-700"
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
      {open && (
        <div className="mx-6 flex flex-col overflow-hidden rounded-2xl border border-grey-100 bg-proj-white shadow-[0_12px_32px_rgba(0,0,0,0.08)] md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-nunito border-b border-grey-100 px-6 py-4 text-[15px] font-bold text-grey-800 last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

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
