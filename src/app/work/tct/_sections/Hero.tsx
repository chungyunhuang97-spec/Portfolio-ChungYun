"use client";

import { motion, useReducedMotion } from "framer-motion";
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

/**
 * One concentric "tap" burst -- the touch-kiosk signature motif for this
 * project (no other project page uses a touch-ripple). A single ring
 * expands and fades on a loop so the still-empty mockup slot reads as "a
 * finger just tapped the glass here", not just a decorative blob.
 */
function TapRipple({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="absolute size-3 rounded-full border-2 border-secondary-blue"
      initial={{ opacity: 0.6, scale: 0.3 }}
      animate={{ opacity: 0, scale: 3.2 }}
      transition={{ duration: 2.2, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

function TapPoint() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="absolute bottom-[18%] right-[16%] flex items-center justify-center">
      <span className="size-3 rounded-full bg-secondary-blue shadow-[0_0_0_4px_rgba(13,33,255,0.18)]" />
      {!reduceMotion && (
        <>
          <TapRipple delay={0} />
          <TapRipple delay={0.9} />
        </>
      )}
    </div>
  );
}

/**
 * Landscape touchscreen-kiosk chrome -- this project's own device frame,
 * distinct from the shared `PhoneFrame` (portrait phone chrome doesn't fit
 * a wall-mounted exhibition touchscreen). Kept local to this page rather
 * than added to design-system/, same precedent as Piiluu's local CardFace/
 * DisintegratingCard: this bezel shape has no other caller yet.
 */
function KioskFrame({ textSize = "text-[10px] md:text-[13px]" }: { textSize?: string }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] border-[10px] border-primary-black bg-grey-50 shadow-[0_20px_60px_rgba(0,0,0,0.14)] md:rounded-[28px] md:border-[14px]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <span className={`font-nunito font-bold leading-relaxed text-grey-500 ${textSize}`}>
          展區觸控畫面
          <br />
          （實機拍攝影像待上傳）
        </span>
      </div>
      <TapPoint />
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
}

/** Mobile-only badge trim -- matching Figma's mobile Hero exactly: a
 * strict 3-column grid replaces desktop's wrapping flow (four full-length
 * pills wrapping at this width is what was overlapping before), "Client
 * Work" is dropped, and "Kiosk/Touch UI" shortens to "Kiosk UI" to fit its
 * grid cell. Desktop keeps the full four-badge set from `project.tags`
 * unchanged. */
const MOBILE_HIDDEN_BADGES = new Set(["Client Work"]);
const MOBILE_BADGE_RENAMES: Record<string, string> = { "Kiosk/Touch UI": "Kiosk UI" };

function HeroBody({ kicker, title, titleLine2, body, role, timeframe, badges }: HeroContentProps) {
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
       * content order itself differs, not just sizing. */}
      <SlideIn delay={0.05} className="flex flex-col items-center gap-6 px-6 pt-6 pb-10 text-center md:hidden">
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
          <KioskFrame />
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
          <KioskFrame textSize="text-[13px]" />
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

  return (
    <section id="hero" className="relative overflow-hidden bg-proj-white">
      <HeroBody
        kicker={kicker}
        title={title}
        titleLine2={titleLine2}
        body={body}
        role={role}
        timeframe={timeframe}
        badges={badges}
      />
    </section>
  );
}
