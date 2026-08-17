"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Strategy {
  title: string;
  desc: string;
}

interface OldTab {
  label: string;
  src: string;
}

const OLD_TABS: OldTab[] = [
  { label: "首頁", src: "/work/metro/before/home.png" },
  { label: "路線搜尋", src: "/work/metro/before/route.png" },
  { label: "更多功能 & 我的帳戶", src: "/work/metro/before/account.png" },
  { label: "Go 優惠", src: "/work/metro/before/discount.png" },
];

/**
 * A rotating conic-gradient "energy border" — the tech-feel signature
 * element for this section, wraps the PROJECT VISION callout. Two-layer
 * trick: outer layer spins a conic-gradient sliver behind everything,
 * inner layer sits 1px inset with the real solid background so only a
 * thin animated seam of light is visible tracing the rounded rect.
 */
function TechGlowBorder({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-px ${className}`}>
      <motion.div
        aria-hidden
        className="absolute inset-[-60%]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #ff520d 300deg, #ffb088 330deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-grey-50">{children}</div>
    </div>
  );
}

/**
 * One-time CRT-style scanline sweep that plays across a mockup screenshot
 * as it enters the viewport — reads as the "old interface" powering on,
 * tying the tech-feel motion language to the retrospective content.
 */
function ScanReveal({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 rounded-[16px] bg-gradient-to-b from-transparent via-white/70 to-transparent"
      initial={{ y: "-100%", opacity: 1 }}
      whileInView={{ y: "120%", opacity: [1, 1, 0] }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: "easeIn" }}
    />
  );
}

function IconToggle({ variant = "diamond" }: { variant?: "diamond" | "dot" }) {
  if (variant === "dot") {
    return <span className="size-4 shrink-0 rounded-full bg-primary-orange" aria-hidden />;
  }
  return (
    <span
      className="size-3 shrink-0 rotate-45 rounded-[2px] bg-primary-orange"
      aria-hidden
    />
  );
}

function ArrowIconButton({
  onClick,
  disabled,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="顯示更多畫面"
      animate={disabled ? { scale: 1, opacity: 0.35 } : { scale: [1, 1.06, 1] }}
      transition={
        disabled ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
      }
      whileHover={disabled ? undefined : { scale: 1.12 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-orange shadow-[0_4px_12px_rgba(255,82,13,0.35)] disabled:cursor-not-allowed ${className}`}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#FF520D" />
        <path
          d="M19.701 15.2425C20.1282 15.7138 20.0975 16.4091 19.6094 16.8485L14.276 21.6485C13.7553 22.1172 12.9112 22.1172 12.3905 21.6485C11.8698 21.1799 11.8698 20.4203 12.3905 19.9516L16.7812 16L12.3905 12.0484C11.8698 11.5797 11.8698 10.8201 12.3905 10.3515C12.9112 9.88284 13.7553 9.88284 14.276 10.3515L19.6094 15.1515L19.701 15.2425Z"
          fill="white"
        />
      </svg>
    </motion.button>
  );
}

function MobileOldTabsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  function handleScrollNext() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: 169, behavior: "smooth" });
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;
    setAtEnd(remaining < 8);
  }

  return (
    <div className="relative w-full">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex w-full gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {OLD_TABS.map((tab, i) => (
          <SlideIn key={tab.label} delay={0.06 * i} className="shrink-0">
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-[320px] w-[157px] overflow-hidden rounded-[16px] border border-[#d9d6d4] bg-grey-100">
                <Image
                  src={tab.src}
                  alt={tab.label}
                  fill
                  sizes="157px"
                  className="object-cover object-top"
                />
                <ScanReveal delay={0.06 * i} />
              </div>
              <p className="font-nunito text-center text-[13px] font-semibold whitespace-nowrap text-[#66615c]">
                {tab.label}
              </p>
            </div>
          </SlideIn>
        ))}
      </div>

      {!atEnd && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end bg-gradient-to-l from-grey-50 to-transparent pr-1">
          <div className="pointer-events-auto">
            <ArrowIconButton onClick={handleScrollNext} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Section 3 — 雙軸優化策略 + 改版前的台北捷運 GO App
 * (Figma desktop node 127:127 + 139:42 / mobile combined node 151:395).
 *
 * Content model: both blocks share the `process` section row (same row
 * that already carries the long-form process narrative in `items` —
 * left untouched). Headings/eyebrows/tab labels are structural and
 * hardcoded per Figma; `strategies`, `visionText` / `mobileVisionText`
 * and `beforeAppSubtext` are the CMS-editable copy. The four old-app
 * screenshots are static reference material (not something Joe swaps
 * via admin), so they ship as /public assets rather than a media field.
 *
 * Desktop: white "雙軸優化策略" block (2 strategy cards + vision callout)
 * directly above a full-width, rounded, warm-gradient "改版前的台北捷運
 * GO App" card showing all 4 old screens side by side — no overflow, so
 * no arrow control at this breakpoint.
 * Mobile: two structurally distinct blocks per Figma — a compact
 * eyebrow+title strategy block, then a flat grey before-app block whose
 * mockup row shows exactly 2 full cards by default; the orange arrow
 * button scrolls to reveal the remaining two.
 */
export function StrategyBeforeApp({ process }: { process: Record<string, unknown> }) {
  const strategies = Array.isArray(process.strategies)
    ? (process.strategies as Strategy[])
    : [];
  const visionText = (process.visionText as string) ?? "";
  const mobileVisionText = (process.mobileVisionText as string) || visionText;
  const beforeAppSubtext = (process.beforeAppSubtext as string) ?? "";

  return (
    <>
      {/* Section 3a — 雙軸優化策略 */}
      <section className="bg-proj-white px-6 py-12 md:border-t md:border-b md:border-[#ededed] md:px-[120px] md:py-[100px]">
        {/* Mobile layout */}
        <div className="flex flex-col gap-6 md:hidden">
          <SlideIn delay={0.1}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-[4px] bg-primary-orange" aria-hidden />
                <span className="font-nunito text-[12px] font-extrabold tracking-[1px] text-primary-orange uppercase">
                  Design Strategy
                </span>
              </div>
              <h2 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black">
                雙軸優化策略
              </h2>
              <div className="h-px w-full border-t border-dashed border-[#ededed]" />
            </div>
          </SlideIn>

          <div className="flex flex-col gap-4">
            {strategies.map((s, i) => (
              <SlideIn key={s.title} delay={0.15 + i * 0.06}>
                <div className="flex items-center gap-2 rounded-2xl bg-proj-white p-4 shadow-[0_4px_8px_rgba(64,50,42,0.06)]">
                  <IconToggle variant={i === 0 ? "diamond" : "dot"} />
                  <p className="font-nunito text-[14px] font-bold text-grey-700">{s.title}</p>
                </div>
              </SlideIn>
            ))}
          </div>

          <SlideIn delay={0.3}>
            <TechGlowBorder>
              <div className="flex flex-col items-center gap-2 px-4 py-4 text-center">
                <p className="font-nunito text-[11px] font-extrabold tracking-[1px] text-primary-orange uppercase">
                  Project Vision
                </p>
                <p className="font-nunito text-[15px] leading-[22px] font-normal text-primary-black">
                  {mobileVisionText}
                </p>
              </div>
            </TechGlowBorder>
          </SlideIn>
        </div>

        {/* Desktop layout */}
        <div className="hidden flex-col gap-14 md:flex">
          <SlideIn delay={0.1}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="font-nunito text-[32px] leading-[48px] font-bold text-primary-black">
                  雙軸優化策略
                </h2>
                <p className="font-nunito text-[16px] leading-[24px] font-normal text-grey-800">
                  基於這些問題，我們進一步研究現行資訊架構，整理出兩大優化方向：
                </p>
              </div>
              <div className="flex gap-4">
                {strategies.map((s, i) => (
                  <SlideIn
                    key={s.title}
                    direction={i % 2 === 0 ? "left" : "right"}
                    delay={i * 0.1}
                    className="flex-1"
                  >
                    <div className="flex h-full flex-col gap-2 rounded-2xl bg-proj-white p-8 shadow-[0_4px_8px_rgba(64,50,42,0.06)]">
                      <p className="font-nunito text-[16px] leading-[24px] font-bold text-secondary-blue">
                        {s.title}
                      </p>
                      <p className="font-nunito text-[14px] leading-[21px] font-normal text-grey-800">
                        {s.desc}
                      </p>
                    </div>
                  </SlideIn>
                ))}
              </div>
            </div>
          </SlideIn>

          <SlideIn delay={0.25}>
            <TechGlowBorder>
              <div className="flex flex-col items-center justify-center gap-4 px-8 py-8 text-center">
                <p className="font-nunito text-[13px] leading-[18px] font-bold tracking-[1px] text-primary-orange uppercase">
                  Project Vision
                </p>
                <p className="font-nunito max-w-[880px] text-[22px] leading-[31px] font-bold text-primary-black">
                  {visionText}
                </p>
              </div>
            </TechGlowBorder>
          </SlideIn>
        </div>
      </section>

      {/* Section 3b — 改版前的台北捷運 GO App */}
      <section className="bg-grey-50 px-6 py-12 md:px-[120px] md:py-12">
        {/* Mobile layout */}
        <div className="flex flex-col gap-4 md:hidden">
          <SlideIn delay={0.1}>
            <h3 className="font-nunito text-[24px] leading-[36px] font-bold text-primary-black">
              改版前的台北捷運 GO App
            </h3>
          </SlideIn>
          <MobileOldTabsCarousel />
        </div>

        {/* Desktop layout */}
        <div className="hidden flex-col gap-6 md:flex">
          <SlideIn delay={0.1}>
            <div className="flex flex-col gap-3">
              <h3 className="font-nunito text-[32px] leading-[48px] font-bold text-primary-black">
                改版前的台北捷運 GO App
              </h3>
              <p className="font-nunito text-[15px] font-normal text-grey-500">
                {beforeAppSubtext}
              </p>
            </div>
          </SlideIn>

          <SlideIn delay={0.2}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#f7f5f3] to-white">
              <div className="flex items-center justify-center gap-6 rounded-[48px] bg-white/60 px-6 py-12">
                {OLD_TABS.map((tab, i) => (
                  <SlideIn key={tab.label} delay={0.08 * i} className="shrink-0">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative h-[320px] w-[157px] overflow-hidden rounded-[16px] border border-[#d9d6d4] bg-grey-100">
                        <Image
                          src={tab.src}
                          alt={tab.label}
                          fill
                          sizes="157px"
                          className="object-cover object-top"
                        />
                        <ScanReveal delay={0.08 * i} />
                      </div>
                      <p className="font-nunito text-center text-[13px] font-semibold whitespace-nowrap text-[#66615c]">
                        {tab.label}
                      </p>
                    </div>
                  </SlideIn>
                ))}
              </div>
            </div>
          </SlideIn>
        </div>
      </section>
    </>
  );
}
