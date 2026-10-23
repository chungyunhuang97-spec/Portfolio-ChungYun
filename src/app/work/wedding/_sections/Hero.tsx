import { Tag } from "@/components/design-system/Tag";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { SlideIn } from "@/components/design-system/SlideIn";
import { HeroPhotoReveal } from "./HeroPhotoReveal";
import { HeroCrosswalkPhoto } from "./HeroCrosswalkPhoto";
import type { Project } from "@/lib/types";

interface HeroStat {
  label: string;
  value: string;
}

const DEFAULT_STATS: HeroStat[] = [
  { label: "時程", value: "Jun 2025 – Oct 2026" },
  { label: "專案角色", value: "Sole Designer" },
];
const DEFAULT_TAGS = ["UI設計", "網站開發", "平面設計", "影片剪輯"];

/** Frosted pill stats row -- identical treatment overlaid on the desktop
 * Hero photo and sitting plain below the mobile photo (see Hero below).
 * Generalized to N dot-separated stats rather than a hardcoded pair. */
function HeroStatsPill({ stats }: { stats: HeroStat[] }) {
  if (stats.length === 0) return null;
  return (
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
  );
}

function HeroBadgeRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {tags.map((tag) => (
        <Tag key={tag} variant="cream">
          {tag}
        </Tag>
      ))}
    </div>
  );
}

/**
 * Section 1 — Hero, rebuilt from the "pc-EVA 婚禮" / "mb-EVA 婚禮" Figma
 * frames Joe shared (this page previously had no Figma source at all --
 * see page.tsx's header comment for that earlier state).
 *
 * Desktop: the whole first screen is now one crosswalk photo with the
 * eyebrow/title/tagline/stats/badges overlaid directly on top of it
 * (pale "wedding-cream" type over a drop-shadowed dark photo), not a
 * separate text-only screen followed by a photo band the way this
 * section used to work. Mobile keeps the title block in normal flow
 * above the photo instead (overlaying light type on a portrait crop with
 * the couple off to one side read as fighting the photo on narrow
 * screens) — genuinely separate desktop/mobile trees, same precedent
 * DesignThread.tsx's table/cards split already set on this page, not one
 * shared tree forced through breakpoints.
 *
 * The photo itself is HeroCrosswalkPhoto's new scroll choreography --
 * replaces the old three-layer parallax HeroLayeredPhoto entirely (see
 * that component's own doc comment for the walk-off + scale-up
 * mechanism). Needs `heroBackgroundImageUrl` + `heroCutoutImageUrl`
 * (the stars/doodle overlay layer the old hero used doesn't appear in
 * this redesign, so it's dropped); falls back to the flat `heroImageUrl`
 * + HeroPhotoReveal path when either is missing, same graceful-
 * degradation precedent as before, so an in-progress upload never breaks
 * the section.
 */
export function Hero({ project, hero }: { project: Project; hero: Record<string, unknown> }) {
  const eyebrow = (hero.eyebrow as string) ?? "Wedding Identity Design";
  const title = (hero.title as string) ?? project.title ?? "Eva & Shangchi’s Wedding";
  const tagline =
    (hero.subtitle as string) ?? project.subtitle ?? "No brief. No guidelines. Just two people I know.";
  const stats = Array.isArray(hero.stats) && hero.stats.length > 0 ? (hero.stats as HeroStat[]) : DEFAULT_STATS;
  const tagChips = project.tags.length > 0 ? project.tags : DEFAULT_TAGS;
  const heroImageUrl = (hero.heroImageUrl as string) || undefined;
  const heroBackgroundImageUrl = (hero.heroBackgroundImageUrl as string) || undefined;
  const heroCutoutImageUrl = (hero.heroCutoutImageUrl as string) || undefined;
  const hasCrosswalkPhoto = Boolean(heroBackgroundImageUrl && heroCutoutImageUrl);

  const overlay = (
    <div className="hidden flex-col items-center gap-16 px-[120px] md:flex">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <p className="font-nunito mb-3 text-[14px] font-extrabold text-wedding-cream">{eyebrow}</p>
          <h1
            className="font-nunito text-center text-[clamp(44px,5.5vw,80px)] leading-[1.15] font-extrabold text-wedding-cream"
            style={{ textShadow: "0px 1px 30px rgba(0,0,0,0.65)" }}
          >
            {title}
          </h1>
        </div>
        <p
          className="font-nunito text-center text-[clamp(18px,2vw,24px)] font-bold text-grey-50"
          style={{ textShadow: "0px 3px 4px rgba(0,0,0,0.45)" }}
        >
          {tagline}
        </p>
        <HeroStatsPill stats={stats} />
      </div>
      <HeroBadgeRow tags={tagChips} />
    </div>
  );

  return (
    <section id="hero" className="relative overflow-hidden bg-proj-white">
      {/* Mobile only -- title block in normal flow above the photo (see
          component doc comment for why this isn't overlaid like desktop). */}
      <div className="flex flex-col gap-2 px-6 pt-[104px] text-left md:hidden">
        <SlideIn delay={0.1}>
          <p className="font-nunito text-[14px] font-extrabold text-[#999]">{eyebrow}</p>
        </SlideIn>
        <SlideIn delay={0.15}>
          <h1 className="font-nunito text-[32px] leading-[1.2] font-bold text-grey-800">{title}</h1>
        </SlideIn>
        <SlideIn delay={0.2}>
          <p className="font-nunito text-[14px] leading-[21px] text-grey-600">{tagline}</p>
        </SlideIn>
      </div>

      <div className="pt-6 md:pt-[140px]">
        {hasCrosswalkPhoto ? (
          <HeroCrosswalkPhoto
            backgroundSrc={heroBackgroundImageUrl!}
            cutoutSrc={heroCutoutImageUrl!}
            alt={project.title}
            overlay={overlay}
          />
        ) : heroImageUrl ? (
          <HeroPhotoReveal src={heroImageUrl} alt={project.title} />
        ) : (
          <div className="px-6 md:px-[120px]">
            <MockupSlot aspect="aspect-[1082/559]" label="主視覺照片 — 素材待上傳" />
          </div>
        )}
      </div>

      {/* Mobile only -- stats pill + skill badges in normal flow below the photo. */}
      <div className="flex flex-col items-center gap-6 px-6 pt-8 pb-16 md:hidden">
        <SlideIn delay={0.1}>
          <HeroStatsPill stats={stats} />
        </SlideIn>
        <SlideIn delay={0.2}>
          <HeroBadgeRow tags={tagChips} />
        </SlideIn>
      </div>
    </section>
  );
}
