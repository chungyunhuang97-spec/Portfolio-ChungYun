"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import type { Project } from "@/lib/types";
import type { YangbeiPlatform } from "../types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function toHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * Live preview of the real 前台 site inside the phone mockup, instead of a
 * static screenshot — loads it at a real mobile viewport size (375×812,
 * matching PhoneFrame's own aspect ratio) in a hidden-size iframe, then
 * scales that whole iframe down with a CSS transform to fit whatever the
 * frame is actually rendered at (a fluid width, so a hardcoded scale would
 * drift). Genuinely interactive (taps/scroll reach the iframe) rather than
 * a flattened preview, per request -- a transform-scaled iframe still hit-
 * tests correctly, so a tap lands on the right element inside it even
 * though everything is shrunk.
 *
 * Caveat: if the live site ever sends a restrictive
 * `X-Frame-Options`/`Content-Security-Policy: frame-ancestors` header,
 * browsers block the embed silently (no JS error fires), and the iframe
 * just shows blank. There's no reliable way to detect that from here and
 * fall back to a screenshot — if that happens, the fix is on the embedded
 * site's own headers.
 */
function LivePreviewScreen({ url, alt }: { url: string; alt: string }) {
  const DEVICE_W = 375;
  const DEVICE_H = 812;
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    function measure() {
      if (el) setScale(el.getBoundingClientRect().width / DEVICE_W);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="relative h-full w-full overflow-hidden bg-grey-50">
      {scale > 0 && (
        <iframe
          src={toHref(url)}
          title={alt}
          className="origin-top-left border-0"
          style={{ width: DEVICE_W, height: DEVICE_H, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

/** Desktop ±2° mouse-tracking parallax tilt on the phone mockup. */
function TiltMockup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [2, -2]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-2, 2]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 專案角色 · 時程 frosted pill. Stacked (one field per line) on mobile
 * instead of a single `whitespace-nowrap` row — yangbei's actual copy
 * ("全端設計 + AI 協作實作" / "Soft Launch 7–8 月 → 正式開放 9 月") is long
 * enough that a single row genuinely overflowed the viewport with no
 * visible scroll affordance (just text cut off at the edge). Each stacked
 * line is still short enough to fit on its own, so no font-size shrink is
 * needed. Desktop keeps the original single-row layout, which has room.
 */
function MetaPill({
  role,
  timeframe,
  className = "",
}: {
  role: string;
  timeframe: string;
  className?: string;
}) {
  return (
    <div
      className={`font-nunito flex flex-col items-start gap-1.5 rounded-[24px] border border-black/[0.06] bg-white/60 px-4 py-2.5 text-[12px] backdrop-blur-[6px] md:flex-row md:items-center md:gap-4 md:rounded-[40px] md:px-5 md:py-2 ${className}`}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-grey-500">專案角色</span>
        <span className="font-semibold text-[#262626]">{role}</span>
      </div>
      <span className="hidden size-[3px] shrink-0 rounded-full bg-grey-300 md:block" aria-hidden />
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-grey-500">時程</span>
        <span className="font-semibold text-[#262626]">{timeframe}</span>
      </div>
    </div>
  );
}

const EASE_SPEC: [number, number, number, number] = [0.16, 1, 0.3, 1];
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SPEC } },
};

export function Hero({
  project,
  hero,
  platforms = [],
}: {
  project: Project;
  hero: Record<string, unknown>;
  platforms?: YangbeiPlatform[];
}) {
  const kicker =
    (hero.kicker as string) || project.category || "COMMUNITY SERVICE DESIGN";
  const title = (hero.title as string) ?? project.title;
  const body =
    (hero.subtitle as string) || project.subtitle || "";
  const role = project.role || "全端設計 + AI 協作實作";
  const timeframe =
    (hero.timeframeLabel as string) || project.timeframe || "";
  const badges = Array.isArray(hero.badges)
    ? (hero.badges as string[])
    : [];
  const mediaUrl = (hero.mockup_media_url as string) || undefined;

  // Hero mockup — a phone screenshot of 前台 (not a desktop/browser
  // capture): the registration flow's actual users are residents signing
  // up on their phones, so a phone mockup represents real usage. Falls
  // back to the generic hero.mockup_media_url if no platform screenshot is
  // set yet. Same single mockup on both breakpoints (just a different
  // size) — it used to be a three-device row on mobile only, which no
  // longer matched the desktop version after that switched to one phone.
  const frontend = platforms.find((p) => p.id === "frontend");
  const frontendShotUrl = frontend?.screenshot_url || mediaUrl;
  const frontendScreen =
    frontendShotUrl && frontendShotUrl.length > 0 ? (
      isVideoUrl(frontendShotUrl) ? (
        <video
          src={frontendShotUrl}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <Image
          src={frontendShotUrl}
          alt={`${title} 前台介面截圖`}
          fill
          sizes="(min-width: 768px) 220px, 170px"
          quality={90}
          className="object-cover object-top"
        />
      )
    ) : undefined;

  // Mobile-only live preview of the real 前台 site (see LivePreviewScreen) —
  // desktop keeps the static screenshot/video mockup above. Only swapped in
  // when a live URL is actually set; falls back to the screenshot otherwise.
  const frontendLiveUrl = frontend?.url;
  const frontendMobileScreen = frontendLiveUrl ? (
    <LivePreviewScreen url={frontendLiveUrl} alt={`${title} 前台即時預覽`} />
  ) : (
    frontendScreen
  );

  return (
    <section id="hero" className="relative overflow-hidden bg-proj-white">
      {/* Mobile — fits within 100dvh */}
      <motion.div
        className="relative z-10 flex h-dvh flex-col gap-3 px-6 pt-[88px] pb-6 md:hidden"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem} className="flex flex-col items-start gap-2">
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <h1 className="font-nunito text-[32px] leading-[44px] font-bold text-[#333]">
            {title}
          </h1>
        </motion.div>

        {timeframe && (
          <motion.div variants={heroItem}>
            <MetaPill role={role} timeframe={timeframe} className="w-full" />
          </motion.div>
        )}

        {badges.length > 0 && (
          <motion.div
            variants={heroItem}
            className="flex w-full flex-wrap items-center justify-center gap-2"
          >
            {badges.map((badge, i) => (
              <Tag
                key={badge}
                variant="orange"
                className={i % 2 === 0 ? "-rotate-1" : "rotate-1"}
              >
                {badge}
              </Tag>
            ))}
          </motion.div>
        )}

        {/* Mockup — flex-1 so it fills remaining space, capped to avoid overflow */}
        <motion.div variants={heroItem} className="flex min-h-0 flex-1 items-center justify-center py-1">
          <div className="h-full max-h-[300px] w-auto" style={{ aspectRatio: "375/812" }}>
            <PhoneFrame label="前台畫面（上傳截圖後顯示）" screen={frontendMobileScreen} float />
          </div>
        </motion.div>
      </motion.div>

      {/* Desktop — same centered/stacked shape as every other case-study
          Hero (kicker → title → subtitle → meta pill → badges → mockup).
          pt-[170px] keeps content clear of the fixed Navbar pill (pt-16 +
          ~64px pill ≈ 128px) with room to spare — a tighter value here
          previously let the kicker text peek out from under it. */}
      <motion.div
        className="relative z-10 hidden flex-col items-center gap-6 px-[120px] pt-[170px] pb-16 md:flex"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem} className="flex flex-col items-center gap-3">
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <h1 className="font-nunito text-center text-[80px] leading-[112px] font-bold text-primary-black">
            {title}
          </h1>
          {body && (
            <p className="font-nunito max-w-[667px] text-center text-[18px] leading-normal font-normal text-[#737373]">
              {body}
            </p>
          )}
          {timeframe && (
            <motion.div variants={heroItem}>
              <MetaPill role={role} timeframe={timeframe} />
            </motion.div>
          )}
        </motion.div>

        {badges.length > 0 && (
          <motion.div
            variants={heroItem}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            {badges.map((badge, i) => (
              <Tag
                key={badge}
                variant="orange"
                className={i % 2 === 0 ? "-rotate-1" : "rotate-1"}
              >
                {badge}
              </Tag>
            ))}
          </motion.div>
        )}

        {/* The "前往體驗網站" CTA now lives in PlatformShowcase's 前台 tab
            instead of here — it reads better paired with that platform's
            own description than floating off the Hero mockup's corner. */}
        <motion.div variants={heroItem} className="w-[220px]">
          <TiltMockup>
            <PhoneFrame label="前台畫面（上傳截圖後顯示）" screen={frontendScreen} float />
          </TiltMockup>
        </motion.div>
      </motion.div>
    </section>
  );
}
