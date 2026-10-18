"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-8 flex flex-col gap-3 md:mb-12">
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
        <div className="mb-8 flex gap-2 md:mb-10">
          {platforms.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              className={`font-nunito relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 md:text-[14px] ${
                i === active ? "text-proj-white" : "text-grey-500 hover:text-primary-black"
              }`}
            >
              {i === active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: current.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex flex-col gap-8 md:flex-row md:items-center md:gap-16"
          >
          {/* Device mockup — laptop for desktop-first platforms, phone otherwise */}
          {DESKTOP_PLATFORM_IDS.has(current.id) ? (
            <div className="w-full md:max-w-[480px] md:shrink-0">
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.screenshot_url}
                      alt={`${current.name} 介面截圖`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <PlaceholderScreen color={current.color} label={current.label} />
                  )
                }
              />
            </div>
          ) : (
            <div className="flex justify-center md:w-[220px] md:shrink-0">
              <div className="w-[180px] md:w-[220px]">
                <PhoneFrame
                  screen={
                    current.screenshot_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={current.screenshot_url}
                        alt={`${current.name} 介面截圖`}
                        className="h-full w-full object-cover object-top"
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

          {/* Text details */}
          <div className="flex flex-1 flex-col gap-5">
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

            <ul className="flex flex-col gap-3">
              {current.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: current.color }}
                    aria-hidden
                  />
                  <span className="font-nunito text-[14px] text-primary-black">
                    {feat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        </AnimatePresence>
      </SlideIn>
    </section>
  );
}
