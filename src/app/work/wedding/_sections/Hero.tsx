import { Tag } from "@/components/design-system/Tag";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { SlideIn } from "@/components/design-system/SlideIn";
import { HeroPhotoReveal } from "./HeroPhotoReveal";
import type { Project } from "@/lib/types";

interface HeroStat {
  label: string;
  value: string;
}

/**
 * Section 1 — Hero. Direction C / type-driven, per the wedding hero spec
 * (eyebrow + display title → tagline + tag chips → divider → stats row).
 * Replaces this page's earlier centered/doodle hero with the spec's
 * type-led direction.
 *
 * Revised across Joe's review rounds:
 * - Dropped the full-bleed yellow top band entirely (redundant with the
 *   tag chips below it).
 * - "LANGUAGE"'s outline moved off `-webkit-text-stroke` entirely --
 *   text-stroke strokes a glyph's whole vector path including its
 *   counters, and on this bold weight that produced the broken/jagged
 *   triangle artifacts Joe flagged twice, even at 1px. A stacked
 *   `text-shadow` fakes the same "outer edge only" outline by layering
 *   solid filled copies instead of stroking a path, which can't
 *   self-intersect the way a vector stroke can. Originally 8 directions
 *   (cardinal + diagonal); the diagonals doubled up at every corner and
 *   read as too thick at this font-black weight/size, so it's now just
 *   the 4 cardinal directions.
 * - `heroImageUrl` media field -- a real photo of the couple, not another
 *   App-style Mockup, since every touchpoint below already has its own
 *   mockup and this slot is reserved for the couple's own photography
 *   instead. Admin: open this project's HERO section, "ADD FIELD" -> key
 *   `heroImageUrl`, type Media, to get an upload dropzone for it.
 * - Stats row restyled from bare label/value pairs into the frosted
 *   rounded pill (`rounded-[40px] border border-black/[0.06] bg-white/60
 *   backdrop-blur-[6px]`, dot-separated) every other project page's Hero
 *   already uses for its role/timeframe `MetaPill` -- Joe flagged the old
 *   plain-text row as inconsistent with the rest of the portfolio.
 *   Generalized to N stats (dot between every pair) rather than copying
 *   MetaPill's hardcoded 2-item shape, since this hero's content model is
 *   3 stats (duration/role/deliverables), not role+timeframe.
 * - Once Joe actually had a real photo to test (a desaturated street
 *   candid of the couple, color kept only in the bouquet, hand-drawn
 *   stars/ring doodles scattered across the full ~1.94:1 frame), the
 *   original side-by-side layout (copy left, photo in a 3:4 box right)
 *   turned out to fight the photo's own shape -- cropping a landscape
 *   shot into a portrait box lost most of the doodles and all of the
 *   street context, cutting into art direction Joe had already finished.
 *   Rebuilt as two stacked pieces instead: a `min-h-[100svh]` block with
 *   everything EXCEPT the photo (title/tagline/tags/stats -- Joe's ask:
 *   those should still read as a complete first screen on their own),
 *   followed by the photo as a full-bleed band that isn't forced to fit
 *   that first screen at all -- see `HeroPhotoReveal` for how it reveals
 *   its full, uncropped frame as the visitor scrolls to it instead of
 *   ever being statically cropped.
 * - That split also meant the first screen no longer has a photo on the
 *   right to balance the text column -- once it was alone, Joe flagged
 *   the left-aligned block as lopsided, so title/tagline/tags/stats are
 *   now centered as one group instead. The title also went from `md:max-
 *   w-[640px]` (needed when a photo column sat beside it) to no width cap
 *   + `whitespace-nowrap` per line, which is also what fixed it rendering
 *   as 3 lines instead of 2 -- line 2 ("ONE LANGUAGE") was soft-wrapping
 *   inside its own span at that width.
 *
 * Breakpoints: this design system targets two breakpoints only (mobile /
 * `md:` desktop — see Typography.tsx's header comment), not the spec's
 * three-tier table, so `md:` here covers both the spec's tablet and
 * desktop rows.
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const eyebrow = (hero.eyebrow as string) ?? "Case Study — 2025–2026";
  const tagline = (hero.subtitle as string) ?? project.subtitle ?? "為一場婚禮建立完整的視覺語言系統";
  const stats = Array.isArray(hero.stats) ? (hero.stats as HeroStat[]) : [];
  const tagChips = project.tags.length > 0 ? project.tags : ["16 Months", "4 Media", "1 Wedding"];
  const heroImageUrl = (hero.heroImageUrl as string) || undefined;

  // 4 cardinal 1px-offset copies (no diagonal corners) read as a thin outer
  // outline without stroking (and self-intersecting on) the glyph's own
  // vector path -- see the component doc comment above. The diagonal
  // corners an 8-direction stack would add double up at every corner and
  // read as a noticeably thicker outline at this font-black weight/size;
  // dropping them is what Joe asked for when he flagged it as too thick.
  const outlineShadow = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
  ]
    .map(([x, y]) => `${x}px ${y}px 0 var(--color-primary-black)`)
    .join(", ");

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
    <section id="hero" className="relative overflow-hidden bg-proj-white">
      {/* First screen -- title/tagline/tags/stats only, no photo, so this
          block alone always fits min-h-[100svh] regardless of the photo
          below it (see HeroPhotoReveal). Centered -- with the photo gone
          from this screen entirely, a left-aligned text column read as
          lopsided (all the weight on one side, the right half empty), so
          Joe asked for everything here -- title, tagline, tags, stats --
          centered as one block instead. */}
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-10 px-6 pt-[104px] pb-10 text-center md:gap-16 md:px-[120px] md:pt-[180px]">
        <div className="flex flex-col items-center">
          <SlideIn delay={0.1} viewportMargin="0px" className="flex flex-col items-center">
            <p className="font-nunito mb-3 text-[11px] font-semibold tracking-[0.16em] text-grey-600 uppercase">
              {eyebrow}
            </p>
            {/* `whitespace-nowrap` on each line -- same convention Metro's
                Hero uses for its own big single-line headline. Without it
                "ONE LANGUAGE" (line 2) could still soft-wrap into "ONE" +
                "LANGUAGE" on their own lines at this font size, reading as
                3 lines total instead of the intended 2 -- exactly what Joe
                flagged as too cramped/tall. */}
            <h1 className="font-nunito text-[48px] leading-[0.95] font-black tracking-[-0.03em] text-primary-black uppercase md:text-[clamp(52px,7vw,96px)] md:leading-[0.92]">
              <span className="block whitespace-nowrap">
                {firstLine}
                {restParts.length > 0 ? "," : ""}
              </span>
              {secondLine && (
                <span className="block whitespace-nowrap">
                  {secondLineLead && `${secondLineLead} `}
                  <span className="text-wedding-yellow" style={{ textShadow: outlineShadow }}>
                    {lastWord}
                  </span>
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
            <SlideIn delay={0.3} viewportMargin="0px" className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {tagChips.map((tag) => (
                <Tag key={tag} variant="pink">
                  {tag}
                </Tag>
              ))}
            </SlideIn>
          )}
        </div>

        {/* Divider -- full width, between the title block and the stats row */}
        <div className="h-px w-full bg-grey-100" />

        {/* Stats row -- same frosted-pill treatment as every other project's
            Hero MetaPill (role/timeframe), generalized to N dot-separated
            stats instead of a hardcoded pair. */}
        {stats.length > 0 && (
          <SlideIn delay={0.4} viewportMargin="0px" className="flex justify-center">
            <div className="font-nunito inline-flex flex-wrap items-center justify-center gap-3 rounded-[40px] border border-black/[0.06] bg-white/60 px-5 py-2.5 text-[12px] backdrop-blur-[6px] md:gap-4">
              {stats.flatMap((stat, i) => [
                i > 0 ? (
                  <span key={`dot-${stat.label}`} className="size-[3px] shrink-0 rounded-full bg-grey-300" aria-hidden />
                ) : null,
                <div key={stat.label} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-grey-500">{stat.label}</span>
                  <span className="font-semibold text-primary-black">{stat.value}</span>
                </div>,
              ])}
            </div>
          </SlideIn>
        )}
      </div>

      {/* Photo -- full-bleed band below the first screen, not constrained
          to fit it. Real photo scroll-zooms out to its full frame (see
          HeroPhotoReveal); unset falls back to a plain placeholder band,
          no scroll effect since there's nothing yet to reveal. */}
      {heroImageUrl ? (
        <HeroPhotoReveal src={heroImageUrl} alt={project.title} />
      ) : (
        <div className="px-6 pb-16 md:px-[120px]">
          <MockupSlot aspect="aspect-[16/9]" label="主視覺照片 — 素材待上傳" />
        </div>
      )}
    </section>
  );
}
