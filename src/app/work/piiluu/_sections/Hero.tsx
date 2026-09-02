"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useAnimationControls,
  useMotionValueEvent,
} from "framer-motion";

type AnimationControls = ReturnType<typeof useAnimationControls>;
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import type { Project } from "@/lib/types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/** The "專案角色 ⋯ · 時程 ⋯" pill -- ported verbatim from Nest Stay's
 * Hero.tsx MetaPill (same padding/gap/backdrop-blur values at each
 * breakpoint, per Figma nodes 542:209 / 513:234). */
function MetaPill({ role, timeframe }: { role: string; timeframe: string }) {
  return (
    <div className="font-nunito flex items-center gap-3 rounded-[40px] border border-black/[0.06] bg-white/60 px-4 py-2 text-[12px] backdrop-blur-[6px] md:gap-4 md:px-5">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-[#808080]">專案角色</span>
        <span className="font-semibold text-[#262626]">{role}</span>
      </div>
      <span className="size-[3px] shrink-0 rounded-full bg-[#808080]/40" aria-hidden />
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-[#808080]">時程</span>
        <span className="font-semibold text-[#262626]">{timeframe}</span>
      </div>
    </div>
  );
}

/**
 * The BNPL Platinum card, matching Figma nodes 543:2798 (mobile, 310×190)
 * and 477:194 (desktop, 380×265) pixel-for-pixel at rest (progress 0):
 * bg-secondary-blue, solid primary-orange diagonal stripe (a single large
 * rotated rectangle clipped by overflow-hidden, exactly Figma's technique
 * -- not a gradient), white chip, masked number, "GEN Z USER" / "VALID
 * THRU 08/27" / "Piiluu 皮路" / "BNPL PLATINUM" labels at Figma's exact
 * positions. Split into independently-animated pieces so it can visibly
 * "disintegrate" as scroll progress advances (Joe's explicit ask: "這張信用卡
 * 會被解體，並變成手機的 Mockup") -- the disintegration deltas are additive on
 * top of this exact rest state, not a redesign of it.
 */
function DisintegratingCard({ controls }: { controls: AnimationControls }) {
  /* Fixed-duration, trigger-once animation instead of continuous
   * scroll-position-linked transforms. The scroll-linked version (opacity/
   * scale/y/rotate all mapped directly off `useScroll` progress) depended
   * on the card's fade-out and the phone's fade-in landing in precisely
   * overlapping progress ranges -- reported to still leave a blank gap /
   * a "card shrinks then nothing" outcome in real testing despite several
   * rounds of retuning the ranges, and this codebase has essentially no
   * other precedent for scroll-scrubbed motion values (the one prior
   * example, HeroDoodleField, is a purely decorative parallax, not
   * content the user needs to actually see appear). Switched to the
   * pattern this codebase DOES rely on everywhere else (SlideIn, the
   * imperative `animate()` calls in Nest Stay/Metro's CountUp-style
   * cards): scroll only TRIGGERS the sequence once, then it plays out
   * over a fixed duration via `animate` controls -- immune to scroll
   * speed/position edge cases, always completes. */
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      animate={controls}
      className="relative h-[190px] w-[310px] overflow-hidden rounded-[16px] bg-secondary-blue shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05),0px_8px_16px_0px_rgba(0,0,0,0.1)] md:h-[265px] md:w-[380px] md:rounded-[20px] md:shadow-[0px_1.5px_1.5px_0px_rgba(64,50,42,0.04),0px_8px_12px_0px_rgba(64,50,42,0.06)]"
    >
      {/* Diagonal stripe -- exact Figma technique: one large solid
          primary-orange rectangle, rotated, clipped by the card's rounded
          overflow-hidden edge. Static (no per-piece scroll animation). */}
      <div
        className="absolute left-[-77.46px] top-[110px] flex h-[261.291px] w-[454.693px] items-center justify-center md:left-[-108.7px] md:top-[150px] md:h-[330.314px] md:w-[567.922px]"
        aria-hidden
      >
        <div className="flex-none rotate-[22deg]">
          <div className="h-[100px] w-[450px] bg-primary-orange md:h-[130px] md:w-[560px]" />
        </div>
      </div>

      <div className="absolute left-6 top-6 h-[26px] w-[38px] rounded-[4px] bg-white opacity-90 md:h-[30px] md:w-[42px] md:rounded-[5px]" aria-hidden />

      <span className="absolute right-6 top-7 font-nunito text-[10px] font-extrabold tracking-[0.5px] text-white">
        GEN Z USER
      </span>

      <p className="absolute left-6 top-[105px] font-nunito text-[16px] font-bold leading-6 whitespace-pre text-white md:top-[148px]">
        {"••••  ••••  ••••  4821"}
      </p>

      <span className="absolute left-6 top-[135px] font-nunito text-[13px] font-bold text-white/85 md:top-[186px]">
        VALID THRU 08/27
      </span>

      <div className="absolute right-6 top-[135px] text-right md:top-[186px]">
        <p className="font-nunito text-[20px] font-extrabold text-white">Piiluu 皮路</p>
        <p className="mt-0.5 font-nunito text-[13px] font-bold text-white/85">BNPL PLATINUM</p>
      </div>
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
}

/**
 * "SCROLL TO UNLOCK" opener -- Piiluu's signature Hero motion
 * (docs/piiluu-motion-breakdown.md section 1), reworked per Joe's
 * instruction: instead of the card rotating/flying off-screen, it
 * DISINTEGRATES (see DisintegratingCard) while a PhoneFrame assembles in
 * its place, conceptually "physical card -> cardless-payment phone screen".
 *
 * Pinned via `position: sticky` inside a `h-[140vh]` container purely to
 * give the moment a "hold" while it plays out, and to make "you have to
 * scroll to see this" legible -- but the transition itself is NOT
 * scroll-position-linked. Three separate rounds of scroll-scrubbed
 * `useTransform` timing (compressed ranges, then wider overlapping ranges,
 * then a fully non-pinned version) all still reproduced a blank gap /
 * "card shrinks then nothing appears" in real testing, and this codebase
 * has no real precedent for scroll-scrubbed content (the one prior
 * example, HeroDoodleField, is decorative parallax, not something the
 * user needs to see resolve). This version instead uses the pattern the
 * rest of the codebase actually relies on (SlideIn, Nest Stay/Metro's
 * imperative CountUp-style `animate()` calls): scrolling only TRIGGERS
 * the sequence once (`useMotionValueEvent` watching progress cross a
 * small threshold), then `useAnimationControls` plays a fixed-duration
 * animation on the card and phone -- once started, it always finishes
 * regardless of how fast/slow/far the user keeps scrolling, so there is
 * no scroll-position window for a gap to live in.
 *
 * All static content/colors below match Figma nodes 542:191 (mobile) /
 * 476:185 (desktop) exactly -- see get_design_context output referenced in
 * commit history for the literal values.
 */
function HeroUnlockScene({ kicker, title, body, role, timeframe, badges, screen }: HeroContentProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  const watermarkOpacity = useTransform(progress, [0, 0.6, 1], [0, 0.07, 0.07]);
  const watermarkScale = useTransform(progress, [0, 1], [0.85, 1.15]);

  const [unlocked, setUnlocked] = useState(false);
  const cardControls = useAnimationControls();
  const phoneControls = useAnimationControls();

  useMotionValueEvent(progress, "change", (v) => {
    if (v > 0.1 && !unlocked) {
      setUnlocked(true);
      cardControls.start({
        opacity: 0,
        scale: 0.85,
        y: 24,
        rotate: -6,
        transition: { duration: 0.75, ease: "easeInOut" },
      });
      phoneControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.75, delay: 0.3, ease: "easeOut" },
      });
    }
  });

  return (
    <div ref={pinRef} className="relative h-[140vh]">
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col items-center justify-center gap-6 overflow-hidden bg-white px-6 pt-6 pb-10 md:gap-10 md:px-[120px] md:pt-[180px] md:pb-[100px]">
        <motion.p
          aria-hidden
          style={{ opacity: watermarkOpacity, scale: watermarkScale }}
          className="pointer-events-none absolute font-fredoka text-[28vw] leading-none text-secondary-blue select-none md:text-[22vw]"
        >
          PIILUU
        </motion.p>

        <div className="relative z-10 flex flex-col items-center gap-3 text-center md:gap-3">
          <span className="font-nunito text-[14px] font-extrabold text-primary-orange">{kicker}</span>
          <h1 className="font-nunito text-[35px] leading-[48px] font-bold text-[#333] md:text-[80px] md:leading-[112px] md:font-extrabold md:text-black">
            {title}
          </h1>
          {body && (
            <p className="max-w-[286px] font-nunito text-[14px] leading-[21px] font-normal text-[#666] md:max-w-none md:whitespace-nowrap md:text-[18px] md:leading-normal md:text-[#737373]">
              {body}
            </p>
          )}
          {timeframe && <MetaPill role={role} timeframe={timeframe} />}
        </div>

        {badges.length > 0 && (
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {badges.map((badge) => (
              <Tag key={badge} variant="orange">
                {badge}
              </Tag>
            ))}
          </div>
        )}

        <div className="relative z-10 flex h-[190px] w-[310px] items-center justify-center md:h-[265px] md:w-[380px]">
          <DisintegratingCard controls={cardControls} />
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={phoneControls}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {/* Shaped wrapper (real aspect ratio + explicit height) so
                PhoneFrame fills it via h-full instead of deriving its own
                (taller) height from aspect-[375/812] applied to a bare
                width, which would overflow this small card-sized box. */}
            <div className="pointer-events-auto aspect-[375/812] h-[170px] md:h-[240px]">
              <PhoneFrame screen={screen} className="h-full" />
            </div>
          </motion.div>
        </div>

        <motion.p
          animate={{ opacity: unlocked ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 font-nunito text-[12px] font-extrabold tracking-[1px] text-secondary-blue"
        >
          SCROLL TO UNLOCK
        </motion.p>
      </div>
    </div>
  );
}

/** `prefers-reduced-motion` fallback -- no pin/scroll-jack, no card
 * disintegration; jumps straight to the "unlocked" end state (phone mockup)
 * with a plain content fade-in, per every other custom motion piece's
 * reduced-motion handling in this codebase. Static colors still match
 * Figma exactly. */
function HeroStatic({ kicker, title, body, role, timeframe, badges, screen }: HeroContentProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 pt-6 pb-10 text-center md:gap-10 md:px-[120px] md:pt-[180px] md:pb-[100px]">
      <div className="flex flex-col items-center gap-3">
        <span className="font-nunito text-[14px] font-extrabold text-primary-orange">{kicker}</span>
        <h1 className="font-nunito text-[35px] leading-[48px] font-bold text-[#333] md:text-[80px] md:leading-[112px] md:font-extrabold md:text-black">
          {title}
        </h1>
        {body && (
          <p className="max-w-[286px] font-nunito text-[14px] leading-[21px] font-normal text-[#666] md:max-w-none md:whitespace-nowrap md:text-[18px] md:leading-normal md:text-[#737373]">
            {body}
          </p>
        )}
        {timeframe && <MetaPill role={role} timeframe={timeframe} />}
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {badges.map((badge) => (
            <Tag key={badge} variant="orange">
              {badge}
            </Tag>
          ))}
        </div>
      )}
      <div className="w-[180px] md:w-[200px]">
        <PhoneFrame screen={screen} />
      </div>
    </div>
  );
}

/**
 * Section 1 -- Hero (Figma fileKey 8qGUSDUJqOgJaSERffGXVc, desktop node
 * 476:185 / mobile node 542:191). One responsive implementation (not a
 * mobile/desktop dual tree) since the pinned unlock interaction and content
 * order are identical at both breakpoints, only sizing/exact positions
 * differ -- handled via `md:` overrides throughout, matching each
 * breakpoint's Figma frame exactly. The global `<Navbar />` (mounted once
 * in page.tsx) already covers the nav-bar instance Figma shows inside this
 * frame, so no per-section nav is rendered here.
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

  const contentProps: HeroContentProps = { kicker, title, body, role, timeframe, badges, screen };

  return (
    <section id="hero" className="relative overflow-hidden bg-white">
      {reduceMotion ? <HeroStatic {...contentProps} /> : <HeroUnlockScene {...contentProps} />}
    </section>
  );
}
