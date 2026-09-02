"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import type { Project } from "@/lib/types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/** The "專案角色 ⋯ · 時程 ⋯" pill, ported from Nest Stay's Hero.tsx MetaPill. */
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
 * The BNPL Platinum card, rendered as a handful of independently-animated
 * "shards" (diagonal stripe, chip, masked number, wordmark) so the card
 * reads as physically breaking apart as scroll progress advances, rather
 * than a single flat fade -- per Joe's explicit ask ("這張信用卡會被解體，並變成
 * 手機的 Mockup"). No image asset exists for the card, so it's built entirely
 * from CSS/gradients/text, matching Figma's described visual (rounded card,
 * diagonal blue+orange stripe, chip icon, masked "••••4821", "GEN Z USER"
 * label, "VALID THRU" expiry, "Piiluu 皮路 / BNPL PLATINUM" wordmark).
 */
function DisintegratingCard({ progress }: { progress: MotionValue<number> }) {
  const cardOpacity = useTransform(progress, [0.05, 0.5], [1, 0]);
  const cardScale = useTransform(progress, [0, 0.5], [1, 0.85]);

  const stripeX = useTransform(progress, [0.08, 0.5], [0, -90]);
  const stripeY = useTransform(progress, [0.08, 0.5], [0, 60]);
  const stripeRotate = useTransform(progress, [0.08, 0.5], [0, 25]);
  const stripeOpacity = useTransform(progress, [0.08, 0.45], [1, 0]);

  const chipX = useTransform(progress, [0.1, 0.55], [0, -60]);
  const chipY = useTransform(progress, [0.1, 0.55], [0, -40]);
  const chipRotate = useTransform(progress, [0.1, 0.55], [0, -35]);
  const chipOpacity = useTransform(progress, [0.1, 0.5], [1, 0]);

  const numberX = useTransform(progress, [0.12, 0.58], [0, 70]);
  const numberY = useTransform(progress, [0.12, 0.58], [0, 30]);
  const numberRotate = useTransform(progress, [0.12, 0.58], [0, 18]);
  const numberOpacity = useTransform(progress, [0.12, 0.52], [1, 0]);

  const wordmarkX = useTransform(progress, [0.15, 0.6], [0, 50]);
  const wordmarkY = useTransform(progress, [0.15, 0.6], [0, 80]);
  const wordmarkRotate = useTransform(progress, [0.15, 0.6], [0, -22]);
  const wordmarkOpacity = useTransform(progress, [0.15, 0.55], [1, 0]);

  const chromeOpacity = useTransform(progress, [0.1, 0.4], [1, 0]);

  return (
    <motion.div
      style={{ opacity: cardOpacity, scale: cardScale }}
      className="relative aspect-[1.586/1] w-full max-w-[320px] rounded-[20px] bg-[#0d1b6b] shadow-[0_20px_50px_rgba(13,33,255,0.35)]"
    >
      <motion.div
        style={{ x: stripeX, y: stripeY, rotate: stripeRotate, opacity: stripeOpacity }}
        className="absolute inset-0 overflow-hidden rounded-[20px]"
        aria-hidden
      >
        <div className="absolute -inset-y-10 -left-10 w-2/3 -rotate-12 bg-gradient-to-b from-secondary-blue to-primary-orange opacity-80" />
      </motion.div>

      <motion.div
        style={{ x: chipX, y: chipY, rotate: chipRotate, opacity: chipOpacity }}
        className="absolute left-6 top-8 h-8 w-10 rounded-[6px] bg-gradient-to-br from-[#f5d98a] to-[#c99a3f]"
        aria-hidden
      />

      <motion.span
        style={{ opacity: chromeOpacity }}
        className="absolute right-6 top-6 font-nunito text-[10px] font-bold tracking-[1.5px] text-white/70"
      >
        GEN Z USER
      </motion.span>

      <motion.p
        style={{ x: numberX, y: numberY, rotate: numberRotate, opacity: numberOpacity }}
        className="absolute left-6 top-[52%] font-fredoka text-[18px] tracking-[3px] text-white"
      >
        •••• •••• •••• 4821
      </motion.p>

      <motion.span
        style={{ opacity: chromeOpacity }}
        className="absolute left-6 bottom-14 font-nunito text-[9px] font-bold tracking-[1px] text-white/60"
      >
        VALID THRU 12/26
      </motion.span>

      <motion.div
        style={{ x: wordmarkX, y: wordmarkY, rotate: wordmarkRotate, opacity: wordmarkOpacity }}
        className="absolute bottom-5 right-6 text-right"
      >
        <p className="font-nunito text-[13px] font-extrabold text-white">Piiluu 皮路</p>
        <p className="font-nunito text-[9px] font-bold tracking-[1px] text-white/60">BNPL PLATINUM</p>
      </motion.div>
    </motion.div>
  );
}

interface HeroContentProps {
  kicker: string;
  title: string;
  body: string;
  role: string;
  timeframe: string;
  badges: string[];
  screen: React.ReactNode;
  title2: string;
}

/**
 * Scroll-jacked pinned "SCROLL TO UNLOCK" opener -- Piiluu's signature Hero
 * motion (docs/piiluu-motion-breakdown.md section 1), reworked per Joe's
 * newest instruction: instead of the card rotating/flying off-screen, it
 * DISINTEGRATES (see DisintegratingCard) while a PhoneFrame assembles in its
 * place, conceptually "physical card -> cardless-payment phone screen".
 * `useScroll` + `useTransform` drive every piece off a single 0-1 progress
 * value scoped to a tall pin container (`position: sticky` inner viewport),
 * not a time-based animation -- matches the old site's "跟手" (scroll-linked,
 * not eased) feel the breakdown doc observed.
 */
function HeroUnlockScene({ kicker, title, body, role, timeframe, badges, screen }: HeroContentProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  const titleColor = useTransform(progress, [0, 1], ["#1a1a1a", "#0d21ff"]);
  const watermarkOpacity = useTransform(progress, [0, 0.6, 1], [0, 0.08, 0.08]);
  const watermarkScale = useTransform(progress, [0, 1], [0.85, 1.15]);
  const hintOpacity = useTransform(progress, [0, 0.15], [1, 0]);
  const phoneOpacity = useTransform(progress, [0.35, 0.75], [0, 1]);
  const phoneScale = useTransform(progress, [0.35, 0.8], [0.7, 1]);
  const contentOpacity = useTransform(progress, [0, 0.05], [1, 1]);

  return (
    <div ref={pinRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-proj-white px-6">
        <motion.p
          aria-hidden
          style={{ opacity: watermarkOpacity, scale: watermarkScale }}
          className="pointer-events-none absolute font-fredoka text-[28vw] leading-none text-secondary-blue select-none md:text-[22vw]"
        >
          PIILUU
        </motion.p>

        <motion.div
          style={{ opacity: contentOpacity }}
          className="relative z-10 flex flex-col items-center gap-3 pt-[72px] text-center md:pt-[24px]"
        >
          <LabelSmall className="text-secondary-blue">{kicker}</LabelSmall>
          <motion.h1
            style={{ color: titleColor }}
            className="font-nunito text-[35px] leading-[48px] font-bold md:text-[80px] md:leading-[112px]"
          >
            {title}
          </motion.h1>
          {body && (
            <p className="max-w-[600px] font-nunito text-[14px] leading-[21px] font-normal text-grey-600 md:text-[18px] md:leading-[25px]">
              {body}
            </p>
          )}
          {timeframe && <MetaPill role={role} timeframe={timeframe} />}
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {badges.map((badge) => (
                <Tag key={badge} variant="blue">
                  {badge}
                </Tag>
              ))}
            </div>
          )}
        </motion.div>

        <div className="relative z-10 mt-6 flex w-full max-w-[280px] items-center justify-center md:mt-8 md:max-w-[240px]">
          <DisintegratingCard progress={progress} />
          <motion.div
            style={{ opacity: phoneOpacity, scale: phoneScale }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="pointer-events-auto w-[58%] max-w-[200px]">
              <PhoneFrame screen={screen} />
            </div>
          </motion.div>
        </div>

        <motion.p
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 font-nunito text-[11px] font-bold tracking-[3px] text-grey-500 md:bottom-10"
        >
          SCROLL TO UNLOCK
        </motion.p>
      </div>
    </div>
  );
}

/** `prefers-reduced-motion` fallback -- no pin/scroll-jack, no card
 * disintegration; jumps straight to the "unlocked" end state (phone mockup,
 * final title color) with a plain content fade-in, per every other custom
 * motion piece's reduced-motion handling in this codebase. */
function HeroStatic({ kicker, title, body, role, timeframe, badges, screen }: HeroContentProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 pt-[104px] pb-16 text-center md:pt-[180px] md:pb-[100px]">
      <LabelSmall className="text-secondary-blue">{kicker}</LabelSmall>
      <h1 className="font-nunito text-[35px] leading-[48px] font-bold text-secondary-blue md:text-[80px] md:leading-[112px]">
        {title}
      </h1>
      {body && (
        <p className="max-w-[600px] font-nunito text-[14px] leading-[21px] font-normal text-grey-600 md:text-[18px] md:leading-[25px]">
          {body}
        </p>
      )}
      {timeframe && <MetaPill role={role} timeframe={timeframe} />}
      {badges.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge) => (
            <Tag key={badge} variant="blue">
              {badge}
            </Tag>
          ))}
        </div>
      )}
      <div className="mt-4 w-[58%] max-w-[220px]">
        <PhoneFrame screen={screen} />
      </div>
    </div>
  );
}

/**
 * Section 1 -- Hero (Figma fileKey 8qGUSDUJqOgJaSERffGXVc, desktop node
 * 473:185 / mobile 542:190). One responsive implementation (not a
 * mobile/desktop dual tree) since the pinned unlock interaction and content
 * order are identical at both breakpoints, only sizing differs -- handled
 * via `md:` overrides throughout, same strategy Typography.tsx uses.
 *
 * Content model: `hero` row -- `kicker` (falls back to
 * "UI/UX DESIGN PROJECT"), `title` (falls back to `project.title`), `badges`
 * (string[]), `timeframeLabel`, `mockup_media_url` (admin-uploadable, empty
 * for now -- PhoneFrame shows its built-in placeholder). `role`/`body` reuse
 * `project.role` / `project.subtitle`, matching Nest Stay/Metro's Hero
 * convention.
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const reduceMotion = useReducedMotion();

  const kicker = (hero.kicker as string) || project.category || "UI/UX DESIGN PROJECT";
  const title = (hero.title as string) ?? project.title;
  const body = project.subtitle ?? "";
  const role = project.role || "UI/UX Designer";
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

  const contentProps: HeroContentProps = { kicker, title, body, role, timeframe, badges, screen, title2: title };

  return (
    <section id="hero" className="relative overflow-hidden bg-proj-white">
      {reduceMotion ? <HeroStatic {...contentProps} /> : <HeroUnlockScene {...contentProps} />}
    </section>
  );
}
