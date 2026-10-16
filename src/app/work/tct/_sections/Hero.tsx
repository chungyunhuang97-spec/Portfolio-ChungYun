"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { Tag } from "@/components/design-system/Tag";
import { SectionKicker } from "@/components/design-system/SectionKicker";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

/** "專案角色 ⋯ · 時程 ⋯" pill, same shape as every other project page's
 * Hero MetaPill, re-themed blue for this project's dominant accent. */
function MetaPill({ role, timeframe }: { role: string; timeframe: string }) {
  return (
    <div className="font-nunito flex items-center gap-3 rounded-[40px] border border-black/[0.06] bg-white/60 px-4 py-2 text-[12px] backdrop-blur-[6px] md:gap-4 md:px-5">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-grey-500">專案角色</span>
        <span className="font-semibold text-grey-800">{role}</span>
      </div>
      <span className="size-[3px] shrink-0 rounded-full bg-grey-500/40" aria-hidden />
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-grey-500">時程</span>
        <span className="font-semibold text-grey-800">{timeframe}</span>
      </div>
    </div>
  );
}

/** Rendered frame count for the Opera House turntable sequence below --
 * Joe's Gemini-generated reference clip downsampled from its native 24fps/
 * 10s to 48 evenly-spaced stills (background keyed out), since a short,
 * slow turntable doesn't need every frame to read as smooth once scroll
 * (not a timer) is driving which one shows. */
const OPERA_HOUSE_FRAME_COUNT = 48;
const OPERA_HOUSE_FRAMES = Array.from(
  { length: OPERA_HOUSE_FRAME_COUNT },
  (_, i) => `/work/tct/hero/opera-house/frame-${String(i + 1).padStart(3, "0")}.webp`
);

/** How far a mouse sweep from edge to edge nudges the turntable away from
 * its scroll position, in frames -- Joe's desktop-only "跟著滑鼠旋轉" ask.
 * Deliberately small relative to `OPERA_HOUSE_FRAME_COUNT`: this rides on
 * top of the scroll-driven frame as a hover nudge, not a second way to
 * drive the full rotation, so it can never itself reach the first/last
 * frame scroll hasn't earned yet. */
const MOUSE_NUDGE_FRAMES = 5;

/**
 * Scroll-scrubbed turntable of the Taichung Opera House massing model --
 * replaces the old placeholder kiosk-screen mockup now that Joe has a real
 * hero visual, and ties directly to the exhibition's actual venue instead
 * of a generic touchscreen render. Framed as a sprite-swap sequence rather
 * than a `<video>` because scrubbing `video.currentTime` from scroll is
 * unreliable across browsers (seeks snap to keyframes and stutter); a
 * preloaded still sequence swaps instantly on every scroll tick instead.
 *
 * `heroRef` is `Hero`'s own `<section>` ref, not a ref on this component --
 * progress is measured across the WHOLE hero section (title/body/badges
 * included), not just this frame's own small transit through the
 * viewport, so the rotation plays out while Joe's visitor reads the hero
 * copy and finishes exactly as the section scrolls past, matching his
 * "最後轉到大門，再接著繼續往下滑" ask: scrolling further after that just
 * continues normally into Exhibition Zones, nothing stays pinned.
 *
 * Desktop also gets a mouse-follow nudge on top of the scroll position --
 * moving the cursor left/right across the model offsets a few frames
 * either way, so it reads as "the model responds to you", not just an
 * autoplaying strip. Gated on `(hover: hover) and (pointer: fine)` so
 * touch scrolling/tapping on mobile never fights the scroll-driven frame
 * (a touch "move" has no equivalent of hovering off to reset it).
 */
function OperaHouseModel({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const reduceMotion = useReducedMotion();
  const [frameIndex, setFrameIndex] = useState(0);
  const [mouseNudge, setMouseNudge] = useState(0);
  const canHoverRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  useEffect(() => {
    // Warms the browser's own image cache so swapping `src` below never
    // flashes an unloaded frame -- the objects themselves are discarded,
    // only the cache entries they trigger are kept.
    OPERA_HOUSE_FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    canHoverRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduceMotion) return;
    setFrameIndex(Math.min(OPERA_HOUSE_FRAME_COUNT - 1, Math.max(0, Math.floor(v * OPERA_HOUSE_FRAME_COUNT))));
  });

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion || !canHoverRef.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const fromCenter = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 (left edge) .. 1 (right edge)
    const clamped = Math.min(1, Math.max(-1, fromCenter));
    setMouseNudge(Math.round(clamped * MOUSE_NUDGE_FRAMES));
  }

  function handlePointerLeave() {
    setMouseNudge(0);
  }

  // Reduced motion skips both the scroll-driven rotation and the mouse
  // nudge, resting on the final "facing the entrance" frame -- same
  // precedent as this page's other scroll-driven motion (`ScrollySteps`)
  // falling back to a settled static state rather than animating.
  const displayedIndex = reduceMotion
    ? OPERA_HOUSE_FRAME_COUNT - 1
    : Math.min(OPERA_HOUSE_FRAME_COUNT - 1, Math.max(0, frameIndex + mouseNudge));
  const activeFrame = OPERA_HOUSE_FRAMES[displayedIndex];

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative aspect-[16/10] w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rapid src
       * swapping across a preloaded sequence, not a fit for next/image's
       * lazy-loading model. */}
      <img
        src={activeFrame}
        alt="台中國家歌劇院 3D 量體模型"
        className="h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(13,33,255,0.16)]"
      />
    </div>
  );
}

interface HeroContentProps {
  kicker: string;
  title: string;
  titleLine2?: string;
  body: string;
  role: string;
  timeframe: string;
  badges: string[];
  heroRef: RefObject<HTMLElement | null>;
}

/** Mobile-only badge trim -- matching Figma's mobile Hero exactly: a
 * strict 3-column grid replaces desktop's wrapping flow (four full-length
 * pills wrapping at this width is what was overlapping before), "Client
 * Work" is dropped, and "Kiosk/Touch UI" shortens to "Kiosk UI" to fit its
 * grid cell. Desktop keeps the full four-badge set from `project.tags`
 * unchanged. */
const MOBILE_HIDDEN_BADGES = new Set(["Client Work"]);
const MOBILE_BADGE_RENAMES: Record<string, string> = { "Kiosk/Touch UI": "Kiosk UI" };

function HeroBody({ kicker, title, titleLine2, body, role, timeframe, badges, heroRef }: HeroContentProps) {
  const mobileBadges = badges
    .filter((badge) => !MOBILE_HIDDEN_BADGES.has(badge))
    .map((badge) => MOBILE_BADGE_RENAMES[badge] ?? badge);

  // The body caption has a literal "," splitting its two clauses -- on
  // desktop it stays one `whitespace-nowrap` line (comma and all), but the
  // mobile redesign breaks it into two short lines at that same point and
  // drops the comma, so it reads as two beats rather than one run-on
  // sentence at mobile width.
  const bodyParts = body.split(",");
  const [bodyLine1, bodyLine2] = bodyParts.length > 1 ? bodyParts : [body, undefined];

  return (
    <>
      {/* Mobile -- reworked per Joe's "本來會有點疊在一起" fix. Two
       * structural changes from desktop, not just smaller text: the body
       * caption moves from right under the title (where it was colliding
       * with the meta pill) down to just above the kiosk frame, reading as
       * the frame's own caption instead; and the badge row below switches
       * from desktop's wrapping flow to a fixed 3-column grid (see
       * `MOBILE_HIDDEN_BADGES`/`MOBILE_BADGE_RENAMES` above). Kept as its
       * own tree rather than reshuffled with responsive classes, since the
       * content order itself differs, not just sizing.
       *
       * `min-h-[100dvh]` + `justify-center` so the section fills the first
       * screen the way Piiluu's mobile Hero does, instead of just starting
       * at the top and running however tall its content happens to be.
       * `pt-[104px]` is `Navbar`'s own fixed mobile header footprint
       * (py-8 top/bottom padding + the 40px hamburger button) -- `Navbar`
       * is `position: fixed`, so it doesn't push this section down on its
       * own; Metro and Nest Stay's Heroes already use this same 104px
       * value for the same reason. Previously this was a plain `pt-6`,
       * which let the title render underneath the fixed header -- Joe's
       * "100 VH 完整顯示，同時不會跟 header 打架" report. */}
      <SlideIn
        delay={0.05}
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 pt-[104px] pb-10 text-center md:hidden"
      >
        <div className="flex flex-col items-center gap-3">
          <SectionKicker color="blue" icon={null}>{kicker}</SectionKicker>
          <div className="flex flex-col items-center">
            <h1 className="font-nunito text-[35px] leading-[48px] font-bold text-grey-800">{title}</h1>
            {titleLine2 && (
              <p className="font-nunito text-[24px] leading-[36px] font-bold text-grey-500">{titleLine2}</p>
            )}
          </div>
          {timeframe && <MetaPill role={role} timeframe={timeframe} />}
        </div>

        {mobileBadges.length > 0 && (
          <div className="grid w-full grid-cols-3 gap-2">
            {mobileBadges.map((badge) => (
              <Tag key={badge} variant="blue" className="w-full justify-center">
                {badge}
              </Tag>
            ))}
          </div>
        )}

        {body && (
          <p className="max-w-[286px] font-nunito text-[14px] leading-[21px] font-normal text-grey-600">
            {bodyLine1}
            {bodyLine2 && (
              <>
                <br />
                {bodyLine2}
              </>
            )}
          </p>
        )}

        <div className="w-full max-w-[640px]">
          <OperaHouseModel heroRef={heroRef} />
        </div>
      </SlideIn>

      {/* Desktop -- same shape as before (kicker/title/subtitle/body/
       * metapill, then badges, then frame); only the title grew from 64px
       * to 90px per the redesign. */}
      <div className="hidden flex-col items-center gap-10 px-[120px] pt-[180px] pb-[100px] text-center md:flex">
        <SlideIn delay={0.05} className="flex flex-col items-center gap-4">
          <SectionKicker color="blue" icon={null}>{kicker}</SectionKicker>
          {/* Split into two tiers -- the project's full name ("NTSO 80週年
           * 特展 互動展區體驗設計") read as one run-on h1 wrapped awkwardly
           * across lines and was hard to parse. `title` (NTSO 80週年特展)
           * is the main headline; `titleLine2` (互動展區體驗設計) follows
           * immediately after as a smaller, lighter second line. */}
          <h1 className="font-nunito text-[90px] leading-[100px] font-extrabold text-primary-black">{title}</h1>
          {titleLine2 && (
            <p className="font-nunito text-[28px] leading-[38px] font-bold text-grey-600">{titleLine2}</p>
          )}
          {body && (
            <p className="max-w-[640px] font-nunito text-[18px] leading-[28px] font-normal text-grey-600">{body}</p>
          )}
          {timeframe && <MetaPill role={role} timeframe={timeframe} />}
        </SlideIn>

        {badges.length > 0 && (
          <SlideIn delay={0.15} className="flex flex-wrap items-center justify-center gap-4">
            {badges.map((badge) => (
              <Tag key={badge} variant="blue">
                {badge}
              </Tag>
            ))}
          </SlideIn>
        )}

        <SlideIn delay={0.25} className="w-full max-w-[640px]">
          <OperaHouseModel heroRef={heroRef} />
        </SlideIn>
      </div>
    </>
  );
}

/**
 * Section 1 -- Hero. Content model: `hero` row (`title`/`subtitle`), plus
 * `project.category` (kicker fallback), `project.role`/`timeframe` (meta
 * pill) and `project.tags` (badge row) -- same fallback convention every
 * other case-study Hero uses.
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const kicker = project.category || "INTERACTIVE EXHIBITION";
  const title = (hero.title as string) ?? project.title;
  const titleLine2 = hero.titleLine2 as string | undefined;
  const body = (hero.subtitle as string) ?? project.subtitle ?? "";
  const role = project.role || "UI Designer";
  const timeframe = project.timeframe || "";
  const badges = project.tags ?? [];
  // Scroll range for OperaHouseModel's turntable -- spans this whole
  // section (not just the model's own small frame) so the rotation plays
  // out across the full hero scroll, see that component's doc comment.
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section id="hero" ref={heroRef} className="relative overflow-hidden bg-proj-white">
      <HeroBody
        kicker={kicker}
        title={title}
        titleLine2={titleLine2}
        body={body}
        role={role}
        timeframe={timeframe}
        badges={badges}
        heroRef={heroRef}
      />
    </section>
  );
}
