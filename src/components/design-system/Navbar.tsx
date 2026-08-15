"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * Fixed top navigation for project (case-study) pages — reused across
 * every case-study page and, eventually, the homepage.
 *
 * Desktop: centered pill with all links.
 * Mobile: wordmark + hamburger button that reveals a small dropdown
 * (design differs by breakpoint per the Figma spec, not just reflowed).
 */
const LINKS = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#work" },
  { label: "Contact", href: "mailto:chungyunhuang97@gmail.com" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Mobile: wordmark + hamburger */}
      <div className="flex items-center justify-between px-6 py-8 md:hidden">
        <span className="font-nunito text-[18px] font-extrabold text-primary-black">
          Chung Yun
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-grey-100 bg-proj-white text-primary-black shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
        >
          {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
        </button>
      </div>
      {open && (
        <div className="mx-6 flex flex-col overflow-hidden rounded-2xl border border-grey-100 bg-proj-white shadow-[0_12px_32px_rgba(0,0,0,0.08)] md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-nunito border-b border-grey-100 px-6 py-4 text-[15px] font-bold text-grey-900 last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Desktop: centered pill */}
      <div className="hidden justify-center pt-16 md:flex">
        <nav className="flex items-center gap-6 rounded-full bg-proj-white px-[41px] py-[21px] shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-nunito text-[18px] font-bold text-grey-900 transition-colors hover:text-primary-orange"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
