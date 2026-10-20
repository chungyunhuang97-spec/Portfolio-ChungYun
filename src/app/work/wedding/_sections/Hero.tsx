import { DisplayHero, BodyLarge, LabelSmall } from "@/components/design-system/Typography";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";
import { DoodleRings, DoodleAirplane } from "./icons";

interface HeroStat {
  label: string;
  value: string;
}

/**
 * Section 1 — Hero. White background. Pink (accent-pink) is this
 * project's dominant color — the one token no other case study had
 * claimed yet (see docs/case-study-design-conventions.md's "主導色"
 * rule) — fitting for a wedding brand project.
 *
 * Content model: `hero` row — title/subtitle/tagline (kicker) +
 * `stats` (the briefing's 3-column Duration/Role/Deliverables overview
 * card, stored as an array here rather than three separate JSON keys so
 * the row stays easy to extend).
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const kicker = (hero.tagline as string) ?? project.category ?? "FREELANCE · BRAND IDENTITY";
  const title = (hero.title as string) ?? project.title;
  const subtitle = (hero.subtitle as string) ?? project.subtitle ?? "";
  const stats = Array.isArray(hero.stats) ? (hero.stats as HeroStat[]) : [];

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-proj-white px-6 pt-[104px] pb-16 md:px-[120px] md:pt-[200px] md:pb-24"
    >
      <div className="mx-auto flex max-w-[1040px] flex-col items-center gap-10 text-center">
        <SlideIn delay={0.1} className="flex flex-col items-center gap-5">
          <LabelSmall className="tracking-[0.15em] text-accent-pink uppercase">{kicker}</LabelSmall>
          <DisplayHero className="text-primary-black">{title}</DisplayHero>
          {subtitle && <BodyLarge className="max-w-[46ch] text-grey-600">{subtitle}</BodyLarge>}
        </SlideIn>

        <SlideIn delay={0.2} className="relative flex items-center justify-center py-4">
          <DoodleRings className="size-[110px] text-accent-pink md:size-[150px]" aria-hidden />
          <DoodleAirplane
            className="absolute -top-2 -right-4 size-9 -rotate-6 text-primary-black md:-top-4 md:-right-8 md:size-12"
            aria-hidden
          />
        </SlideIn>

        {stats.length > 0 && (
          <SlideIn delay={0.3} className="grid w-full max-w-[600px] grid-cols-3 gap-3 md:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-2xl border border-grey-100 bg-proj-white px-3 py-4 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:py-6"
              >
                <span className="font-nunito text-[10px] font-bold tracking-[0.1em] text-accent-pink uppercase md:text-[12px]">
                  {stat.label}
                </span>
                <span className="font-nunito text-[12px] font-bold text-primary-black md:text-[16px]">
                  {stat.value}
                </span>
              </div>
            ))}
          </SlideIn>
        )}
      </div>
    </section>
  );
}
