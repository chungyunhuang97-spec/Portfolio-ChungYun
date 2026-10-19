"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { YangbeiPlatform as Platform } from "../types";

function toHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: EASE },
  }),
};

/**
 * 前台 ↔ 中台 connector (desktop only) — a slowly spinning looping arrow
 * rather than a straight line + single arrowhead, since the three
 * platforms actually form a cycle (使用者報名 → 講師管理 → 回到使用者),
 * not a one-way pipeline. Muted orange, slow and understated ("有點沉
 * 地的感覺") rather than a flashy spin. Only rendered between 前台/中台 —
 * Joe's call that 中台↔後台 doesn't need a visible connection.
 */
function CycleConnector() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="hidden shrink-0 items-center justify-center md:flex" aria-hidden>
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        className="text-primary-orange/60"
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M21 9a8 8 0 1 0 1.6 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M22.8 3.5l.8 6-5.8-1.4 5-4.6Z" fill="currentColor" />
        <path
          d="M7 19a8 8 0 1 0 -1.6 -7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M5.2 24.5l-.8-6 5.8 1.4-5 4.6Z" fill="currentColor" />
      </motion.svg>
    </div>
  );
}

/**
 * 一套系統，三種角色 — architecture overview.
 * Shows the 3-layer platform (前台/中台/後台) as cards with colour-coded accents.
 * Content from `process.architectureTitle`, `process.architectureSubtitle`, `process.platforms`.
 */
export function ThreeLayerArchitecture({ process }: { process: Record<string, unknown> }) {
  const title = (process.architectureTitle as string) || "一套系統，三種角色";
  const subtitle = (process.architectureSubtitle as string) || "";
  const platforms = Array.isArray(process.platforms)
    ? (process.platforms as Platform[])
    : [];

  if (platforms.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            System Architecture
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      {/* Architecture diagram: horizontal on desktop, vertical stack on mobile */}
      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {platforms.map((platform, i) => (
          <div key={platform.id} className="contents">
            {/* Only 前台↔中台 gets a visible connector — Joe's call that
                中台↔後台 doesn't need one, just breathing room between the cards. */}
            {i === 1 && <CycleConnector />}
            {i === 2 && <div className="hidden w-6 shrink-0 md:block" aria-hidden />}
            <motion.div
              custom={i}
              variants={cardVariants}
              className="flex flex-1 flex-col gap-4 rounded-2xl border border-grey-100 bg-grey-50 p-6 md:p-7"
              style={{ borderTopColor: platform.color, borderTopWidth: 3 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span
                  className="font-nunito text-[20px] font-bold leading-none"
                  style={{ color: platform.color }}
                >
                  {platform.name}
                </span>
                <span className="font-nunito rounded-full border border-grey-300 px-2.5 py-0.5 text-[11px] text-grey-600">
                  {platform.label}
                </span>
              </div>

              {/* Auth badge */}
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="6" stroke="#b3b3b3" strokeWidth="1.2" />
                  <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="#808080" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-nunito text-[12px] text-grey-500">
                  {platform.auth}
                </span>
              </div>

              {/* Desc */}
              <p className="font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px] md:leading-[22px]">
                {platform.desc}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2 border-t border-grey-100 pt-4">
                {platform.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <span
                      className="size-[5px] shrink-0 rounded-full"
                      style={{ backgroundColor: platform.color }}
                      aria-hidden
                    />
                    <span className="font-nunito text-[12px] text-grey-600 md:text-[13px]">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* URL chip — clickable so recruiters can open the live product */}
              <div className="mt-auto pt-2">
                {platform.url ? (
                  <a
                    href={toHref(platform.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-nunito inline-flex items-center gap-1 rounded-md bg-grey-100 px-2.5 py-1 text-[11px] text-grey-600 font-mono transition-colors hover:text-primary-orange"
                  >
                    {platform.url}
                    <ArrowUpRight size={11} weight="bold" aria-hidden />
                  </a>
                ) : null}
              </div>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
