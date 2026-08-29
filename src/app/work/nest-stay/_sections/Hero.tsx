"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import type { Project } from "@/lib/types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/**
 * Desktop-only ±2° mouse-tracking parallax tilt on the phone mockup, per the
 * interaction spec ("桌面端：Mockup 可保留極輕微滑鼠視差，最大 rotateX/Y ±2deg /
 * 手機端：停用視差"). Transform-only (rotateX/rotateY), never mounted on mobile.
 */
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

/** The "專案角色 ⋯ · 時程 ⋯" frosted pill (Figma `Frame` 359:904 / 407:675). */
function MetaPill({ role, timeframe, className = "" }: { role: string; timeframe: string; className?: string }) {
  return (
    <div
      className={`font-nunito flex items-center gap-4 rounded-[40px] border border-black/[0.06] bg-white/60 px-5 py-2 text-[12px] backdrop-blur-[6px] ${className}`}
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

/**
 * Section 1 — Hero (Figma desktop node 275:87 / mobile node 404:148).
 * Rebuilt against the actual fetched Figma design context — both
 * breakpoints are a CENTERED, STACKED column (kicker → title → subtitle →
 * meta pill → badges → phone mockup), not the left-text/right-mockup split
 * layout Metro's Hero uses. Mobile keeps the title block left-aligned per
 * Figma, while everything else (meta pill, badges, mockup, subtitle) stays
 * full-width/centered, with the subtitle moved to the very bottom.
 *
 * `role`/`timeframe` come straight off the `projects` row (`project.role` =
 * "組長 & UI/UX 設計", `project.timeframe`) rather than the `hero` JSONB —
 * Figma's meta pill text matches those fields exactly, and `hero.
 * timeframeLabel` duplicates the short form already used elsewhere, so it's
 * preferred when present.
 *
 * Entrance motion: interaction spec 1 — 標題/副標題/專案資訊/Mockup 依序淡入上移,
 * 0.12s stagger, 0.6s duration, cubic-bezier(0.16,1,0.3,1).
 */
const EASE_SPEC: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SPEC } },
};

export function Hero({
  project,
  hero,
}: {
  project: Project;
  hero: Record<string, unknown>;
}) {
  const kicker = (hero.kicker as string) || project.category || "UI/UX DESIGN PROJECT";
  const title = (hero.title as string) ?? project.title;
  const body = project.subtitle ?? "";
  const role = project.role || "組長 & UI/UX 設計";
  const timeframe = (hero.timeframeLabel as string) || project.timeframe || "";
  const badges = Array.isArray(hero.badges) ? (hero.badges as string[]) : [];
  const mediaUrl = (hero.mockup_media_url as string) || undefined;

  const screen = mediaUrl ? (
    isVideoUrl(mediaUrl) ? (
      <video src={mediaUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
    )
  ) : undefined;

  return (
    <section id="hero" className="relative overflow-hidden bg-proj-white">
      {/* Mobile layout — no tilt, title block left-aligned, subtitle at the bottom */}
      <motion.div
        className="flex flex-col gap-4 px-6 pt-[104px] pb-12 md:hidden"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem} className="flex flex-col items-start gap-2">
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <h1 className="font-nunito text-[35px] leading-[48px] font-bold text-[#333]">{title}</h1>
        </motion.div>

        {timeframe && (
          <motion.div variants={heroItem}>
            <MetaPill role={role} timeframe={timeframe} className="w-full justify-between" />
          </motion.div>
        )}

        {badges.length > 0 && (
          <motion.div variants={heroItem} className="flex w-full flex-wrap items-center justify-between gap-y-1.5">
            {badges.map((badge) => (
              <Tag key={badge} variant="orange">
                {badge}
              </Tag>
            ))}
          </motion.div>
        )}

        <motion.div variants={heroItem} className="mx-auto w-[62%] max-w-[240px] py-4">
          <PhoneFrame screen={screen} float />
        </motion.div>

        <motion.div variants={heroItem}>
          <p className="font-nunito text-center text-[14px] leading-[21px] font-normal text-[#666]">{body}</p>
        </motion.div>
      </motion.div>

      {/* Desktop layout — centered stacked column, ±2° parallax tilt on the mockup */}
      <motion.div
        className="hidden flex-col items-center gap-10 px-[120px] pt-[180px] pb-[100px] md:flex"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem} className="flex flex-col items-center gap-3">
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <h1 className="font-nunito text-center text-[80px] leading-[112px] font-bold text-primary-black">{title}</h1>
          {body && <p className="font-nunito max-w-[667px] text-center text-[18px] leading-normal font-normal text-[#737373]">{body}</p>}
          {timeframe && (
            <motion.div variants={heroItem}>
              <MetaPill role={role} timeframe={timeframe} />
            </motion.div>
          )}
        </motion.div>

        {badges.length > 0 && (
          <motion.div variants={heroItem} className="flex items-center justify-center gap-4">
            {badges.map((badge) => (
              <Tag key={badge} variant="orange">
                {badge}
              </Tag>
            ))}
          </motion.div>
        )}

        <motion.div variants={heroItem} className="w-[188px]">
          <TiltMockup>
            <PhoneFrame screen={screen} float />
          </TiltMockup>
        </motion.div>
      </motion.div>
    </section>
  );
}
