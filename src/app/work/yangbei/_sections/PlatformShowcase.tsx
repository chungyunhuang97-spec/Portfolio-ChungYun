"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { LaptopFrame } from "@/components/design-system/LaptopFrame";
import type { YangbeiPlatform as Platform } from "../types";

/**
 * Which platforms are used on a computer rather than a phone — drives which
 * device frame renders its screenshot. 後台 (admin) is desktop-first: course
 * management and the signup-funnel monitor are built for a wide screen, so a
 * phone mockup would misrepresent how it's actually used. Keyed on `id`
 * rather than matching the display name, since that's CMS-editable copy.
 */
const DESKTOP_PLATFORM_IDS = new Set(["admin"]);

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Platform screenshot placeholder — shown when no mockup_media_url is available.
 * Renders a gradient swatch using the platform's brand color.
 */
function PlaceholderScreen({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      style={{ background: `linear-gradient(160deg, ${color}22 0%, ${color}08 100%)` }}
    >
      <span
        className="font-nunito text-[32px] font-bold"
        style={{ color }}
      >
        {label}
      </span>
      <span className="font-nunito text-[11px] text-white/30">
        截圖上傳後顯示
      </span>
    </div>
  );
}

/**
 * 平台 UI 展示 — tabbed showcase for 前台 / 中台 / 後台.
 * Switches between platform previews with a tab strip.
 * Content from `process.platforms`.
 *
 * Note: actual screenshots are uploaded via /admin/projects/yangbei after deployment.
 * Until then, placeholder swatches are rendered.
 */
export function PlatformShowcase({ process }: { process: Record<string, unknown> }) {
  const platforms = Array.isArray(process.platforms)
    ? (process.platforms as Platform[])
    : [];
  const [active, setActive] = useState(0);

  if (platforms.length === 0) return null;

  const current = platforms[active];

  return (
    <section className="flex flex-col justify-center bg-proj-white px-6 py-16 md:min-h-screen md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-8 flex flex-col items-center gap-3 text-center md:mb-12">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            Platform UI
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            三個端的使用體驗
          </h2>
        </div>
      </SlideIn>

      {/* Tab strip + content — wrapped in one scroll-triggered reveal so this
          section doesn't just "pop in" already-settled by the time the user
          scrolls to it (it used to animate once on mount only, which plays
          out long before anyone below-the-fold ever sees it). The
          AnimatePresence tab-switch crossfade below is a separate, independent
          animation on its own element and still runs on every tab click. */}
      <SlideIn delay={0.1}>
        {/* Segmented-control shell (bg-grey-100 track + padding) so the strip
            reads as one clickable tab bar at a glance, not three loose
            buttons floating on the page — Joe's "感觉不太像一个tab bar" note. */}
        <div role="tablist" aria-label="平台視角" className="mb-8 flex justify-center md:mb-10">
          <div className="inline-flex gap-1 rounded-full bg-grey-100 p-1.5">
            {platforms.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`font-nunito relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 md:px-5 md:text-[14px] ${
                  i === active ? "text-proj-white" : "text-grey-500 hover:text-primary-black"
                }`}
              >
                {i === active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full shadow-sm"
                    style={{ backgroundColor: current.color }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col gap-8 min-[810px]:flex-row min-[810px]:items-center min-[810px]:justify-between min-[810px]:gap-10 min-[1512px]:gap-16"
          >
          {/* Device mockup — laptop for desktop-first platforms, phone otherwise.
              Fixed per-tier width (not flex-grow) so the parent row's
              justify-between does the work of spacing it from the now
              reading-width-capped text column below. */}
          {DESKTOP_PLATFORM_IDS.has(current.id) ? (
            <div className="w-full min-[810px]:w-[360px] min-[810px]:shrink-0 min-[1512px]:w-[480px]">
              <LaptopFrame
                url={current.url}
                screen={
                  current.screenshot_url ? (
                    // object-contain, not object-cover: the current admin
                    // screenshot is a mobile-width capture, not a real
                    // desktop one, so cropping to fill this 16:10 frame cut
                    // off most of the content. Showing the whole image
                    // letterboxed is correct until a real desktop capture
                    // replaces it.
                    <Image
                      src={current.screenshot_url}
                      alt={`${current.name} 介面截圖`}
                      fill
                      sizes="480px"
                      className="object-contain"
                    />
                  ) : (
                    <PlaceholderScreen color={current.color} label={current.label} />
                  )
                }
              />
            </div>
          ) : (
            <div className="flex justify-center min-[810px]:shrink-0">
              <div className="w-[180px] min-[810px]:w-[190px] min-[1512px]:w-[220px]">
                <PhoneFrame
                  screen={
                    current.screenshot_url ? (
                      <Image
                        src={current.screenshot_url}
                        alt={`${current.name} 介面截圖`}
                        fill
                        sizes="220px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <PlaceholderScreen color={current.color} label={current.label} />
                    )
                  }
                  float
                />
              </div>
            </div>
          )}

          {/* Text details — capped reading width (400px tablet / 520px
              desktop) instead of stretching to fill the row, which read as
              uncomfortably long line-lengths at wide viewports. */}
          <div className="flex flex-col gap-5 min-[810px]:max-w-[400px] min-[1512px]:max-w-[520px]">
            <div className="flex items-center gap-3">
              <span
                className="font-nunito text-[24px] font-bold md:text-[32px]"
                style={{ color: current.color }}
              >
                {current.name}
              </span>
              <span className="font-nunito rounded-full bg-grey-100 px-3 py-1 text-[12px] text-grey-600">
                {current.label}
              </span>
            </div>

            <p className="font-nunito text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
              {current.desc}
            </p>

            <ul className="flex flex-col gap-2.5">
              {current.features.map((feat, i) => (
                <motion.li
                  key={feat}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: EASE }}
                  className="flex items-center gap-3 rounded-xl border border-grey-100 bg-grey-50 px-4 py-3"
                >
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${current.color}1A`, color: current.color }}
                    aria-hidden
                  >
                    <Check size={13} weight="bold" />
                  </span>
                  <span className="font-nunito text-[14px] font-medium text-primary-black">
                    {feat}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
        </AnimatePresence>
      </SlideIn>
    </section>
  );
}
