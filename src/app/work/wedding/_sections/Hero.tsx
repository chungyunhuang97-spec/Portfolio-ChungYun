import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

interface HeroStat {
  label: string;
  value: string;
}

/**
 * Section 1 — Hero. Direction C / type-driven, per the wedding hero spec
 * (full-bleed wedding-yellow top band → centered display title with the
 * "LANGUAGE" word yellow-filled + black-stroked → divider → bottom row
 * pairing the project stats with a tagline pill). Replaces this page's
 * earlier centered/doodle hero with the spec's type-led direction.
 *
 * Breakpoints: this design system targets two breakpoints only (mobile /
 * `md:` desktop — see Typography.tsx's header comment), not the spec's
 * three-tier table, so `md:` here covers both the spec's tablet and
 * desktop rows.
 *
 * Content model: unchanged from before (`hero.title`/`subtitle`/`tagline`/
 * `stats`), plus two new optional string fields the spec's top band needs
 * (`hero.meta` for the right-aligned "16 months · 4 media · 1 wedding"
 * summary, `hero.pill` for the bottom-right tagline pill) — both fall
 * back to this project's own spec copy when absent.
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const topBandLabel =
    (hero.tagline as string) ??
    project.category ??
    "FREELANCE · BRAND IDENTITY · PRINT · DIGITAL · MOTION";
  const topBandMeta = (hero.meta as string) ?? "16 MONTHS · 4 MEDIA · 1 WEDDING";
  const eyebrow = (hero.eyebrow as string) ?? "Case Study — 2025–2026";
  const tagline = (hero.subtitle as string) ?? project.subtitle ?? "為一場婚禮建立完整的視覺語言系統";
  const stats = Array.isArray(hero.stats) ? (hero.stats as HeroStat[]) : [];
  const pillText = (hero.pill as string) ?? "No Brief. Just Them.";

  // "ONE LOVE, ONE LANGUAGE" -> line 1 "ONE LOVE,", line 2 "ONE " + the
  // yellow/stroked last word -- generalized off the comma so a CMS-edited
  // title still breaks and highlights sensibly.
  const rawTitle = ((hero.title as string) ?? project.title).toUpperCase();
  const [firstLine, ...restParts] = rawTitle.split(",").map((part) => part.trim());
  const secondLine = restParts.join(", ");
  const secondLineWords = secondLine.split(" ").filter(Boolean);
  const lastWord = secondLineWords.pop();
  const secondLineLead = secondLineWords.join(" ");

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-proj-white pt-[104px] md:pt-[180px]"
    >
      {/* Top band -- full-bleed, ignores the page's side padding by design */}
      <SlideIn viewportMargin="0px">
        <div className="flex items-center justify-between gap-4 bg-wedding-yellow px-6 py-3 md:px-[120px]">
          <span className="font-nunito text-[10px] font-bold tracking-[0.16em] text-primary-black uppercase md:text-[11px]">
            {topBandLabel}
          </span>
          <span className="font-nunito hidden text-[10px] text-black/50 md:inline">{topBandMeta}</span>
        </div>
      </SlideIn>

      {/* Main content */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 md:px-[120px]">
        <SlideIn delay={0.1} viewportMargin="0px" className="flex flex-col">
          <p className="font-nunito mb-3 text-[11px] font-semibold tracking-[0.16em] text-grey-600 uppercase">
            {eyebrow}
          </p>
          <h1 className="font-nunito text-[48px] leading-[0.95] font-black tracking-[-0.03em] text-primary-black uppercase md:text-[clamp(52px,7vw,96px)] md:leading-[0.92]">
            <span className="block">
              {firstLine}
              {restParts.length > 0 ? "," : ""}
            </span>
            {secondLine && (
              <span className="block">
                {secondLineLead && `${secondLineLead} `}
                <span
                  className="text-wedding-yellow"
                  style={{ WebkitTextStroke: "1.5px var(--color-primary-black)" }}
                >
                  {lastWord}
                </span>
              </span>
            )}
          </h1>
          {tagline && (
            <p className="font-nunito mt-2 max-w-[46ch] text-[18px] text-grey-600 italic md:text-[clamp(18px,2.5vw,30px)]">
              {tagline}
            </p>
          )}
        </SlideIn>
      </div>

      {/* Divider -- full width, between main content and the bottom row */}
      <div className="h-px w-full bg-grey-100" />

      {/* Bottom row */}
      <SlideIn
        delay={0.2}
        viewportMargin="0px"
        className="flex flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-[120px]"
      >
        {stats.length > 0 && (
          <div className="flex flex-wrap gap-6 md:gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-nunito text-[9px] font-bold tracking-[0.14em] text-grey-600 uppercase md:text-[10px]">
                  {stat.label}
                </span>
                <span className="font-nunito text-[14px] font-semibold text-primary-black md:text-[15px]">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
        {pillText && (
          <span className="font-nunito hidden rounded-full border border-grey-100 px-4 py-1.5 text-[12px] font-medium text-grey-600 md:inline-block">
            {pillText}
          </span>
        )}
      </SlideIn>
    </section>
  );
}
