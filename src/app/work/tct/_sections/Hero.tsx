"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Tag } from "@/components/design-system/Tag";
import type { Project } from "@/lib/types";

/** "專案角色 ⋯ · 時程 ⋯" pill, same shape as every other project page's
 * Hero MetaPill, re-themed pink for this project's dominant accent. */
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
      className="absolute size-3 rounded-full border-2 border-accent-pink"
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
      <span className="size-3 rounded-full bg-accent-pink shadow-[0_0_0_4px_rgba(255,91,192,0.18)]" />
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
function KioskFrame() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] border-[10px] border-primary-black bg-grey-50 shadow-[0_20px_60px_rgba(0,0,0,0.14)] md:rounded-[28px] md:border-[14px]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="font-nunito text-[11px] font-bold leading-relaxed text-grey-500 md:text-[13px]">
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

function HeroBody({ kicker, title, titleLine2, body, role, timeframe, badges }: HeroContentProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 pt-6 pb-10 text-center md:gap-10 md:px-[120px] md:pt-[180px] md:pb-[100px]">
      <div className="flex flex-col items-center gap-3 md:gap-4">
        <span className="font-nunito text-[14px] font-extrabold text-accent-pink">{kicker}</span>
        {/* Split into two tiers -- the project's full name ("NTSO 80週年
         * 特展 互動展區體驗設計") read as one run-on h1 wrapped awkwardly
         * across lines and was hard to parse. `title` (NTSO 80週年特展)
         * is the main headline; `titleLine2` (互動展區體驗設計) follows
         * immediately after as a smaller, lighter second line -- same
         * "big headline + supporting line" shape as Nest Stay/Metro's own
         * Hero titles, just split into two DB fields instead of one here
         * since this project's name itself has that two-part structure. */}
        <h1 className="font-nunito max-w-[22ch] text-[32px] leading-[42px] font-bold text-grey-800 md:text-[64px] md:leading-[80px] md:font-extrabold md:text-primary-black">
          {title}
        </h1>
        {titleLine2 && (
          <p className="font-nunito max-w-[24ch] text-[18px] font-bold leading-[26px] text-grey-600 md:text-[28px] md:leading-[38px]">
            {titleLine2}
          </p>
        )}
        {body && (
          <p className="max-w-[320px] font-nunito text-[14px] leading-[21px] font-normal text-grey-600 md:max-w-[640px] md:text-[18px] md:leading-[28px]">
            {body}
          </p>
        )}
        {timeframe && <MetaPill role={role} timeframe={timeframe} />}
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {badges.map((badge) => (
            <Tag key={badge} variant="pink">
              {badge}
            </Tag>
          ))}
        </div>
      )}

      <div className="w-full max-w-[640px]">
        <KioskFrame />
      </div>
    </div>
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
