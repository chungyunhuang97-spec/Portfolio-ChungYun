"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { YangbeiPlatform as Platform } from "../types";

interface SystemRole {
  role: string;
  system: string;
  desc: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Decorative character illustration per platform, keyed by `platform.id`
 * (same ids Hero.tsx already relies on: "frontend", "instructor", "admin").
 * Purely visual — a role with an id outside this map just renders without
 * one, so this never blocks new CMS content from showing up.
 */
const ILLUSTRATIONS: Record<string, string> = {
  frontend: "/case-studies/yangbei/illustration-frontend.png",
  instructor: "/case-studies/yangbei/illustration-instructor.png",
  admin: "/case-studies/yangbei/illustration-admin.png",
};

/**
 * Small continuous bob + tilt on each role's illustration so the row
 * doesn't read as three static stickers pasted onto the cards. Disabled
 * under prefers-reduced-motion.
 */
function FloatingIllustration({ src, flip }: { src: string; flip: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="pointer-events-none absolute -top-8 right-3 z-10 size-16 select-none sm:-top-10 sm:size-20 md:-top-12 md:-right-6 md:size-28"
      style={{ scaleX: flip ? -1 : 1 }}
      animate={reduceMotion ? {} : { y: [0, -8, 0], rotate: flip ? [2, -2, 2] : [-2, 2, -2] }}
      transition={reduceMotion ? undefined : { duration: 11, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      {/* unoptimized: small (~70KB), already-compressed flat-color stickers --
          resizing through Next's pipeline for this slot softened edges and
          flattened color noticeably, and the bandwidth cost of skipping
          optimization is trivial at this file size. */}
      <Image src={src} alt="" fill sizes="112px" unoptimized className="object-contain drop-shadow-sm" />
    </motion.div>
  );
}

/** One drawn-in connector line, shared by the mobile stem and the desktop
 * measured diagonals — a single `pathLength` tween triggered the moment
 * this particular line scrolls into view, so each connection "runs out" to
 * the next card as you scroll rather than just appearing. */
function DrawnLine({ x1, y1, x2, y2 }: { x1: number | string; y1: number | string; x2: number | string; y2: number | string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      vectorEffect="non-scaling-stroke"
      stroke="var(--color-primary-orange)"
      strokeOpacity={0.4}
      strokeWidth={1.5}
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: false, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
    />
  );
}

/**
 * Pure vertical gap between two stacked cards on mobile, where there's no
 * left/right offset for a diagonal to bridge. The desktop diagonal lives in
 * `ConnectorOverlay` instead.
 */
function GapSpacer() {
  return (
    <div className="flex h-16 items-stretch justify-center md:h-28 lg:h-32">
      <svg className="h-full w-px overflow-visible md:hidden" viewBox="0 0 2 100" preserveAspectRatio="none" fill="none" aria-hidden>
        <DrawnLine x1="1" y1="0" x2="1" y2="100" />
      </svg>
    </div>
  );
}

interface LinePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Desktop connector lines, measured from the cards' actual rendered
 * positions (via `getBoundingClientRect`, not `offsetLeft/Top` — each card
 * sits inside SlideIn's `motion.div`, which keeps a CSS `transform` set
 * even at rest, and an ancestor with an active transform becomes the
 * offsetParent for everything inside it). `settleSignal` bumps once per
 * card as its own SlideIn entrance finishes, so lines are only ever
 * re-measured a small, fixed number of times instead of on every frame.
 */
function ConnectorOverlay({
  containerRef,
  cardRefs,
  count,
  settleSignal,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  count: number;
  settleSignal: number;
}) {
  const [lines, setLines] = useState<LinePoints[]>([]);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const cards = cardRefs.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next: LinePoints[] = [];
      for (let i = 0; i < count - 1; i++) {
        const a = cards[i]?.getBoundingClientRect();
        const b = cards[i + 1]?.getBoundingClientRect();
        if (!a || !b) continue;
        const aAlignLeft = i % 2 === 0;
        next.push({
          x1: (aAlignLeft ? a.right : a.left) - containerRect.left,
          y1: a.bottom - containerRect.top,
          x2: (aAlignLeft ? b.left : b.right) - containerRect.left,
          y2: b.top - containerRect.top,
        });
      }
      setLines(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    cardRefs.current.forEach((el) => el && ro.observe(el));
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, cardRefs, count, settleSignal]);

  if (lines.length === 0) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" fill="none" aria-hidden>
      {lines.map((l, i) => (
        <DrawnLine key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
      ))}
    </svg>
  );
}

function RoleCard({
  item,
  color,
  illustration,
  align,
  cardRef,
  onSettled,
}: {
  item: SystemRole;
  color: string;
  illustration?: string;
  align: "left" | "right";
  cardRef: (el: HTMLDivElement | null) => void;
  onSettled?: () => void;
}) {
  return (
    <SlideIn
      direction={align === "left" ? "left" : "right"}
      viewportMargin="-100px"
      onAnimationComplete={onSettled}
    >
      {/* Fluid, content-hugging width on desktop so the card reads as its
          own object in open space rather than a bar stretched edge to edge.
          Full-width on mobile, where there's no room to offset left/right. */}
      <div
        ref={cardRef}
        className={`relative w-full md:w-[48%] md:max-w-[420px] ${align === "left" ? "md:mr-auto" : "md:ml-auto"}`}
      >
        {illustration && <FloatingIllustration src={illustration} flip={align === "right"} />}

        <div
          className="flex flex-col gap-3 rounded-2xl border border-grey-100 bg-grey-50 p-6 md:p-7"
          style={{ borderTopColor: color, borderTopWidth: 3 }}
        >
          <span className="font-nunito text-[20px] font-bold leading-none" style={{ color }}>
            {item.role}
          </span>
          <span
            className="font-nunito inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            {item.system}
          </span>
          <p className="font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px] md:leading-[22px]">
            {item.desc}
          </p>
        </div>
      </div>
    </SlideIn>
  );
}

/**
 * 一套系統，三種角色 — role-orientation overview, shown before the three
 * video walkthroughs below so the viewer knows which system each role
 * belongs to before watching it in action. Same scroll-triggered zig-zag +
 * drawn-connector-line treatment as the rest of the page's architecture
 * diagrams: each card reveals on its own as it scrolls into view, with a
 * line drawing itself in from one card to the next. Content from
 * `process.systemRoles` (role/system/desc), colored and illustrated per
 * `process.platforms[i]` by position.
 */
export function YangbeiSystemRoles({ process }: { process: Record<string, unknown> }) {
  const roles = Array.isArray(process.systemRoles) ? (process.systemRoles as SystemRole[]) : [];
  const platforms = Array.isArray(process.platforms) ? (process.platforms as Platform[]) : [];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [settleSignal, setSettleSignal] = useState(0);

  if (roles.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            Who&apos;s Who
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            一套系統，三種角色
          </h2>
          <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
            在看接下來的三段操作影片之前，先搞清楚每個角色在系統裡能做什麼
          </p>
        </div>
      </SlideIn>

      <div ref={containerRef} className="relative flex flex-col">
        {roles.map((item, i) => (
          <div key={item.role} className="contents">
            {i > 0 && <GapSpacer />}
            <RoleCard
              item={item}
              color={platforms[i]?.color ?? "#FF520D"}
              illustration={ILLUSTRATIONS[platforms[i]?.id ?? ""]}
              align={i % 2 === 0 ? "left" : "right"}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
              onSettled={() => setSettleSignal((s) => s + 1)}
            />
          </div>
        ))}
        <ConnectorOverlay
          containerRef={containerRef}
          cardRefs={cardRefs}
          count={roles.length}
          settleSignal={settleSignal}
        />
      </div>
    </section>
  );
}
