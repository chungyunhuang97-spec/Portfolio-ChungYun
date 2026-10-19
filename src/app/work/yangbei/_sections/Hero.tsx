"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { LaptopFrame } from "@/components/design-system/LaptopFrame";
import type { Project } from "@/lib/types";
import type { YangbeiPlatform } from "../types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/** 後台 is desktop-first — same device-matching rule as PlatformShowcase. */
function isDesktopPlatform(platform: YangbeiPlatform) {
  return platform.id === "admin";
}

/**
 * One device mockup in the Hero's three-platform overview row — a phone
 * for 前台/中台, a (smaller, scaled-down) laptop for 後台. Purely visual:
 * no role label underneath, since this row is a quick "it's a three-tier
 * system" glance, not the place that explains what each platform is
 * (PlatformShowcase does that below).
 */
function MiniDevice({
  platform,
  sizeClass,
  float = false,
}: {
  platform: YangbeiPlatform;
  /** Height class (phones size off height, via aspect-ratio) or width
   *  class (the laptop frame sizes off width — its total height is the
   *  16:10 screen plus its own browser-chrome bar, so a height-driven
   *  aspect-ratio box would mismatch the component's real rendered size). */
  sizeClass: string;
  float?: boolean;
}) {
  if (isDesktopPlatform(platform)) {
    return (
      <div className={sizeClass}>
        <LaptopFrame
          screen={
            platform.screenshot_url ? (
              <Image
                src={platform.screenshot_url}
                alt={`${platform.name} ${platform.label} 介面截圖`}
                fill
                sizes="260px"
                className="object-contain"
              />
            ) : undefined
          }
        />
      </div>
    );
  }

  const screen = platform.screenshot_url ? (
    <Image
      src={platform.screenshot_url}
      alt={`${platform.name} ${platform.label} 介面截圖`}
      fill
      sizes="220px"
      className="object-cover object-top"
    />
  ) : undefined;

  return (
    <div className={`w-auto ${sizeClass}`} style={{ aspectRatio: "375/812" }}>
      <PhoneFrame screen={screen} float={float} />
    </div>
  );
}

/**
 * Hero's "三端並排" overview row — 前台 centered and larger, 中台/後台
 * flanking smaller, so the one visual says "this is a three-tier system"
 * at a glance without duplicating PlatformShowcase's per-platform deep
 * dive below. Plain size hierarchy only (no rotation/offset per device —
 * that read as misaligned rather than intentionally staggered).
 */
function PlatformMockupRow({
  platforms,
  centerHeight,
  sideHeight,
  adminWidth,
  float = false,
}: {
  platforms: YangbeiPlatform[];
  centerHeight: string;
  sideHeight: string;
  adminWidth: string;
  float?: boolean;
}) {
  const frontend = platforms.find((p) => p.id === "frontend") ?? platforms[0];
  const instructor = platforms.find((p) => p.id === "instructor") ?? platforms[1];
  const admin = platforms.find((p) => p.id === "admin") ?? platforms[2];

  return (
    <div className="flex items-center justify-center gap-3 md:gap-6">
      {instructor && (
        <div className="md:-translate-y-3">
          <MiniDevice platform={instructor} sizeClass={sideHeight} />
        </div>
      )}
      {frontend && <MiniDevice platform={frontend} sizeClass={centerHeight} float={float} />}
      {admin && (
        <div className="md:translate-y-4">
          <MiniDevice platform={admin} sizeClass={adminWidth} />
        </div>
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
 * 專案角色 · 時程 frosted pill — same single-row shape as every other
 * project's Hero (ported from nest-stay/piiluu's MetaPill: one line,
 * `whitespace-nowrap` on each field, no stacking). `overflow-x-auto` is a
 * silent backstop only: it never shows a visible scrollbar at this size in
 * any mainstream mobile browser, so the pill still *reads* as a single
 * line — it only matters if yangbei's timeframe copy is ever long enough
 * to not fit even this unabridged, which is a copy-length question, not
 * a layout one.
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
      className={`font-nunito flex items-center gap-4 overflow-x-auto rounded-[40px] border border-black/[0.06] bg-white/60 px-5 py-2 text-[12px] backdrop-blur-[6px] ${className}`}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-grey-500">專案角色</span>
        <span className="font-semibold text-[#262626]">{role}</span>
      </div>
      <span className="size-[3px] shrink-0 rounded-full bg-grey-300" aria-hidden />
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

  // Fallback single-mockup path — only used if `platforms` isn't supplied
  // (e.g. content not migrated yet). The three-platform row above is the
  // intended rendering per the yangbei design memo.
  const screen =
    mediaUrl && mediaUrl.length > 0 ? (
      isVideoUrl(mediaUrl) ? (
        <video
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={mediaUrl}
          alt={title}
          fill
          sizes="(min-width: 768px) 188px, 150px"
          className="object-cover"
        />
      )
    ) : undefined;

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

        {/* Mockup row — flex-1 so it fills remaining space, capped to avoid overflow */}
        <motion.div variants={heroItem} className="flex min-h-0 flex-1 items-center justify-center py-1">
          {platforms.length > 0 ? (
            <PlatformMockupRow
              platforms={platforms}
              centerHeight="h-[170px]"
              sideHeight="h-[130px]"
              adminWidth="w-[120px]"
              float
            />
          ) : (
            <div className="h-full max-h-[320px] w-auto" style={{ aspectRatio: "375/812" }}>
              <PhoneFrame screen={screen} float />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Desktop */}
      <motion.div
        className="relative z-10 hidden flex-col items-center gap-10 px-[120px] pt-[180px] pb-[100px] md:flex"
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

        <motion.div variants={heroItem}>
          {platforms.length > 0 ? (
            <TiltMockup>
              <PlatformMockupRow
                platforms={platforms}
                centerHeight="h-[300px]"
                sideHeight="h-[220px]"
                adminWidth="w-[260px]"
                float
              />
            </TiltMockup>
          ) : (
            <div className="w-[188px]">
              <TiltMockup>
                <PhoneFrame screen={screen} float />
              </TiltMockup>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
