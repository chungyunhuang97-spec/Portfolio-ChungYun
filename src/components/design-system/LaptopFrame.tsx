"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Minimal browser-chrome frame for desktop-first screens — grey top bar with
 * macOS-style traffic-light dots (real red/yellow/green, not neutral grey)
 * + a URL pill, same reuse tier as <PhoneFrame />. Used where the real user
 * sits at a computer (央北社宅 admin backend: course management,
 * signup-funnel monitoring; the Hero's 前台 screenshot), so the device frame
 * itself signals "this one's used on a laptop" rather than defaulting every
 * platform to a phone mockup regardless of how it's actually used.
 *
 * Deliberately no window-manager bezel/shadow-frame beyond the browser
 * chrome itself — per the yangbei design memo, a simple chrome bar is
 * enough and a heavier skeuomorphic frame would be overkill here.
 */
export function LaptopFrame({
  screen,
  url,
  label = "後台畫面（上傳截圖後顯示）",
  className = "",
  float = false,
}: {
  screen?: ReactNode;
  url?: string;
  label?: string;
  className?: string;
  /** Same slow up/down bob as `<PhoneFrame float />` — used on the Hero's
   *  mockup so it doesn't read as a dead, flat screenshot. */
  float?: boolean;
}) {
  const frame = (
    <div
      className={`overflow-hidden rounded-xl border border-grey-100 bg-proj-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* browser chrome */}
      <div className="flex h-8 items-center gap-2 border-b border-grey-100 bg-[#F0F0F0] pr-4 pl-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#FF5F56]" />
          <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="size-2.5 rounded-full bg-[#27C93F]" />
        </div>
        {url && (
          <div className="font-nunito ml-2 flex-1 truncate rounded-full bg-proj-white px-3 py-1 text-[11px] text-grey-500">
            {url}
          </div>
        )}
      </div>

      {/* screen */}
      <div className="relative aspect-[16/10] w-full bg-grey-50">
        {screen ? (
          <div className="absolute inset-0">{screen}</div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="font-nunito text-[12px] font-bold text-grey-500">{label}</p>
          </div>
        )}
      </div>
    </div>
  );

  const reduceMotion = useReducedMotion();
  if (!float || reduceMotion) return frame;

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {frame}
    </motion.div>
  );
}
