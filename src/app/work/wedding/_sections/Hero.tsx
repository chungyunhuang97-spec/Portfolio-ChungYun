import { Tag } from "@/components/design-system/Tag";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

interface HeroStat {
  label: string;
  value: string;
}

/**
 * Section 1 — Hero. Direction C / type-driven, per the wedding hero spec
 * (full-bleed wedding-yellow top band → eyebrow + display title → tagline
 * + tag chips → divider → stats row). Replaces this page's earlier
 * centered/doodle hero with the spec's type-led direction.
 *
 * Revised per Joe's first-pass review: no stroke on "LANGUAGE" (plain
 * yellow fill only), the top band's right-side summary moved down into a
 * `Tag` chip row under the tagline -- same `project.tags` + `<Tag
 * variant="pink">` pattern every other case-study Hero uses (see tct's
 * Hero badge row) instead of inventing new plain-text styling -- the
 * bottom-right tagline pill removed outright -- and a `MockupSlot` filling
 * the copy block's right-hand whitespace on desktop (no real photography
 * exists for this project yet, same placeholder convention as every other
 * case-study Hero until the CMS media upload is filled in).
 *
 * Breakpoints: this design system targets two breakpoints only (mobile /
 * `md:` desktop — see Typography.tsx's header comment), not the spec's
 * three-tier table, so `md:` here covers both the spec's tablet and
 * desktop rows.
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const topBandLabel =
    (hero.tagline as string) ??
    project.category ??
    "FREELANCE · BRAND IDENTITY · PRINT · DIGITAL · MOTION";
  const eyebrow = (hero.eyebrow as string) ?? "Case Study — 2025–2026";
  const tagline = (hero.subtitle as string) ?? project.subtitle ?? "為一場婚禮建立完整的視覺語言系統";
  const stats = Array.isArray(hero.stats) ? (hero.stats as HeroStat[]) : [];
  const tagChips = project.tags.length > 0 ? project.tags : ["16 Months", "4 Media", "1 Wedding"];

  // "ONE LOVE, ONE LANGUAGE" -> line 1 "ONE LOVE,", line 2 "ONE " + the
  // yellow last word -- generalized off the comma so a CMS-edited title
  // still breaks and highlights sensibly.
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
        <div className="bg-wedding-yellow px-6 py-3 md:px-[120px]">
          <span className="font-nunito text-[10px] font-bold tracking-[0.16em] text-primary-black uppercase md:text-[11px]">
            {topBandLabel}
          </span>
        </div>
      </SlideIn>

      {/* Main content -- copy left, mockup placeholder right (desktop); stacked on mobile */}
      <div className="flex flex-1 flex-col justify-center gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between md:gap-12 md:px-[120px]">
        <div className="flex flex-col md:max-w-[640px]">
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
                  <span className="text-wedding-yellow">{lastWord}</span>
                </span>
              )}
            </h1>
          </SlideIn>

          {tagline && (
            <SlideIn delay={0.2} viewportMargin="0px">
              <p className="font-nunito mt-2 max-w-[46ch] text-[18px] text-grey-600 italic md:text-[clamp(18px,2.5vw,30px)]">
                {tagline}
              </p>
            </SlideIn>
          )}

          {tagChips.length > 0 && (
            <SlideIn delay={0.3} viewportMargin="0px" className="mt-5 flex flex-wrap gap-3">
              {tagChips.map((tag) => (
                <Tag key={tag} variant="pink">
                  {tag}
                </Tag>
              ))}
            </SlideIn>
          )}
        </div>

        <SlideIn
          direction="right"
          delay={0.15}
          viewportMargin="0px"
          className="mx-auto w-full max-w-[220px] md:mx-0 md:w-[280px] md:max-w-none md:shrink-0"
        >
          <MockupSlot aspect="aspect-[3/4]" label="主視覺 Mockup — 素材待上傳" float />
        </SlideIn>
      </div>

      {/* Divider -- full width, between main content and the stats row */}
      <div className="h-px w-full bg-grey-100" />

      {/* Stats row */}
      {stats.length > 0 && (
        <SlideIn delay={0.4} viewportMargin="0px" className="flex flex-wrap gap-6 px-6 py-8 md:gap-10 md:px-[120px]">
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
        </SlideIn>
      )}
    </section>
  );
}
