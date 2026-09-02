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
 * The BNPL Platinum card face, matching Figma nodes 543:2798 (mobile,
 * 310×190) and 477:194 (desktop, 380×265) pixel-for-pixel at rest: bg-
 * secondary-blue, solid primary-orange diagonal stripe (a single large
 * rotated rectangle clipped by overflow-hidden, exactly Figma's technique
 * -- not a gradient), white chip, masked number, "GEN Z USER" / "VALID
 * THRU 08/27" / "Piiluu 皮路" / "BNPL PLATINUM" labels at Figma's exact
 * positions. Rendered twice by `DisintegratingCard` (see below) so each
 * copy can be clipped to one triangular half -- kept as one shared
 * component so both halves' content stays pixel-identical/aligned instead
 * of two hand-duplicated copies drifting apart over edits.
 */
function CardFace() {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden rounded-[16px] bg-secondary-blue md:rounded-[20px]">
      {/* Diagonal stripe -- exact Figma technique: one large solid
          primary-orange rectangle, rotated, clipped by the card's rounded
          overflow-hidden edge. */}
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
    </div>
  );
}

/**
 * One torn-off half of the card: the full `CardFace` cropped by a
 * diagonal `clip-path` to a triangle, matching the reference recording of
 * the original Framer piiluu site (Joe's 2026-09-02 screen recording) --
 * the card visibly tears into two triangular fragments along its own
 * diagonal that fly apart and fade, rather than the whole card shrinking
 * as one unit. `variant` picks which half: "top-left" keeps the top-left
 * corner (logo/chip side), "bottom-right" keeps the opposite corner
 * (number/expiry side) -- together the two clip-paths cover the full
 * rectangle with a shared diagonal seam from the top-right corner to the
 * bottom-left corner.
 */
function CardHalf({ variant, controls }: { variant: "top-left" | "bottom-right"; controls: AnimationControls }) {
  const clipPath =
    variant === "top-left" ? "polygon(0 0, 100% 0, 0 100%)" : "polygon(100% 0, 100% 100%, 0 100%)";
  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      animate={controls}
      style={{ clipPath }}
      className="absolute inset-0 h-full w-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05),0px_8px_16px_0px_rgba(0,0,0,0.1)] md:shadow-[0px_1.5px_1.5px_0px_rgba(64,50,42,0.04),0px_8px_12px_0px_rgba(64,50,42,0.06)]"
    >
      <CardFace />
    </motion.div>
  );
}

/** The two-piece card, torn along its diagonal -- see `CardHalf`. Each
 * half is driven by its own `AnimationControls` so they can fly apart in
 * opposite directions. */
function DisintegratingCard({
  topControls,
  bottomControls,
}: {
  topControls: AnimationControls;
  bottomControls: AnimationControls;
}) {
  return (
    <div className="relative h-[190px] w-[310px] md:h-[265px] md:w-[380px]">
      <CardHalf variant="top-left" controls={topControls} />
      <CardHalf variant="bottom-right" controls={bottomControls} />
    </div>
  );
}

interface HeroContentProps {
  kicker: string;
  title: string;
  body: string;
  role: string;
  timeframe: string;
  badges: string[];
  mediaUrl?: string;
}

/**
 * The App mockup slot. Unlike every other PhoneFrame usage in this
 * codebase, the uploaded Hero mockup asset is a pre-composed device mockup
 * image (it already has its own phone body/bezel baked in) -- wrapping it
 * in PhoneFrame's chrome again would double-frame it. So once a real
 * mockup is uploaded, render the image/video directly at its own
 * proportions (`object-contain`, no cropping); only fall back to
 * PhoneFrame's built-in placeholder chrome when nothing has been uploaded
 * yet, so the empty state still looks intentional.
 */
function HeroMockup({ mediaUrl, title, className = "" }: { mediaUrl?: string; title: string; className?: string }) {
  if (!mediaUrl) {
    return (
      <div className={`aspect-[375/812] ${className}`}>
        <PhoneFrame className="h-full" />
      </div>
    );
  }
  return isVideoUrl(mediaUrl) ? (
    <video src={mediaUrl} autoPlay loop muted playsInline className={`w-auto object-contain ${className}`} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mediaUrl} alt={title} className={`w-auto object-contain ${className}`} />
  );
}

/**
 * "SCROLL TO UNLOCK" opener -- Piiluu's signature Hero motion
 * (docs/piiluu-motion-breakdown.md section 1), reworked per Joe's
 * instruction: instead of the card rotating/flying off-screen, it
 * DISINTEGRATES (see DisintegratingCard) while a PhoneFrame assembles in
 * its place, conceptually "physical card -> cardless-payment phone screen".
 *
 * Pinned via `position: sticky` inside a short `h-[112vh]` container purely
 * to give the moment a brief "hold" while it plays out, and to make "you
 * have to scroll to see this" legible -- but the transition itself is NOT
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
 * regardless of how fast/slow/far the user keeps scrolling.
 *
 * The pin height is deliberately short (just 12vh of "extra" scroll beyond
 * one viewport, not the 40vh an earlier version used). A `position:sticky`
 * container this tall can only release once the user has scrolled through
 * its *entire* extra height -- with 40vh of that, most of it was consumed
 * AFTER the ~1s trigger-once animation had already finished, which is
 * exactly the "an unnatural blank area appears below the phone" gap Joe
 * reported: the sticky frame stays held (fully resolved, nothing left to
 * animate) while its own top content scrolls out of view first, leaving
 * a tall stretch of plain white before the next section is finally
 * allowed to appear. Shrinking the extra scroll distance to ~12vh keeps
 * just enough runway for the animation to read as an intentional "hold,"
 * without a long dead tail once it's done.
 *
 * All static content/colors below match Figma nodes 542:191 (mobile) /
 * 476:185 (desktop) exactly -- see get_design_context output referenced in
 * commit history for the literal values.
 */
function HeroUnlockScene({ kicker, title, body, role, timeframe, badges, mediaUrl }: HeroContentProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: progress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  const watermarkOpacity = useTransform(progress, [0, 0.6, 1], [0, 0.07, 0.07]);
  const watermarkScale = useTransform(progress, [0, 1], [0.85, 1.15]);

  const [unlocked, setUnlocked] = useState(false);
  const cardTopControls = useAnimationControls();
  const cardBottomControls = useAnimationControls();
  const phoneControls = useAnimationControls();

  useMotionValueEvent(progress, "change", (v) => {
    if (v > 0.1 && !unlocked) {
      setUnlocked(true);
      // Top-left fragment (logo/chip) tears up and to the left; the
      // bottom-right fragment (number/expiry) tears down and to the
      // right -- opposite directions and rotations so the two pieces
      // read as torn apart, not just one card shrinking in place.
      cardTopControls.start({
        x: -64,
        y: -56,
        rotate: -20,
        opacity: 0,
        transition: { duration: 0.8, ease: "easeInOut" },
      });
      cardBottomControls.start({
        x: 64,
        y: 56,
        rotate: 20,
        opacity: 0,
        transition: { duration: 0.8, ease: "easeInOut" },
      });
      // The box itself is already sized to the phone's full dimensions
      // (see below), so it naturally sits lower/bigger than the old
      // card-sized box just by being taller within the vertically-centered
      // column -- this extra `y` is a smaller top-up on top of that, not
      // the whole effect. Joe: settling a bit past the box's own bottom
      // edge (potentially the tiniest bit past the section boundary) reads
      // better than being conservative about strict containment here.
      phoneControls.start({
        opacity: 1,
        scale: 1,
        y: 16,
        transition: { duration: 0.75, delay: 0.35, ease: "easeOut" },
      });
    }
  });

  return (
    <div ref={pinRef} className="relative h-[112vh]">
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

        {/* This box is sized for the LARGER of the two things it holds --
            the phone mockup, not the smaller card (190/265px) that used to
            be its only occupant. The card is absolutely positioned at its
            own fixed (smaller) size and just centers within the taller
            box. Sizing the box for the card (as before) meant the phone
            silently overflowed its declared layout space -- invisible to
            the box's own flex sizing (absolutely positioned children don't
            contribute to it) but exactly why the settled phone kept
            reading as sitting too high with a mismatched gap below it: the
            surrounding flex column never actually reserved room for the
            phone's real size. The phone's `y: 44` settle (above) then
            lands it deliberately a bit below this box's own center --
            Joe's explicit ask to prioritize a well-centered, generously
            sized mockup over strictly containing it within the box's
            original (card-sized) bounds. */}
        <div className="relative z-10 flex h-[300px] w-[310px] items-center justify-center md:h-[440px] md:w-[380px]">
          <DisintegratingCard topControls={cardTopControls} bottomControls={cardBottomControls} />
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 0 }}
            animate={phoneControls}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="pointer-events-auto">
              <HeroMockup mediaUrl={mediaUrl} title={title} className="h-[300px] md:h-[440px]" />
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
function HeroStatic({ kicker, title, body, role, timeframe, badges, mediaUrl }: HeroContentProps) {
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
      <HeroMockup mediaUrl={mediaUrl} title={title} className="h-[300px] md:h-[420px]" />
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

  const contentProps: HeroContentProps = { kicker, title, body, role, timeframe, badges, mediaUrl };

  return (
    <section id="hero" className="relative overflow-hidden bg-white">
      {reduceMotion ? <HeroStatic {...contentProps} /> : <HeroUnlockScene {...contentProps} />}
    </section>
  );
}
