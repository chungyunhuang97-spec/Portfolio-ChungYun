import { DisplayHero, BodyLarge, LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/**
 * Section 1 — Hero. White background.
 *
 * Content is CMS-driven: `kicker` reuses `project.category`, `body` reuses
 * `project.subtitle` (both already edited via the DETAILS form in admin,
 * no need to duplicate them inside the hero section content), `title` and
 * `tags` come from the `hero` section's JSONB (`title`, `tagline` as a
 * string array), and the phone mockup renders `hero.mockup_media_url`
 * (image or video, admin-uploaded) when present, otherwise falls back to
 * the placeholder pattern built into <PhoneFrame />.
 *
 * Desktop: wide text column (max 749px) + fixed-width phone mockup (259px)
 * anchored right, vertically centered as one row.
 * Mobile: kicker + title stacked, then the phone mockup, then the body
 * copy below it — a different sequence from desktop (per Figma), and the
 * chip tags are dropped on mobile to keep the section inside 100vh.
 * Rendered as two structurally distinct blocks (toggled via `md:hidden` /
 * `hidden md:flex`) rather than fought into one shared flex order, since
 * the grouping — not just the order — differs between breakpoints.
 */
export function Hero({
  project,
  hero,
}: {
  project: Project;
  hero: Record<string, unknown>;
}) {
  const kicker = project.category ?? "UI/UX DESIGN PROJECT";
  const title = (hero.title as string) ?? project.title;
  const body = project.subtitle ?? "";
  const tags = Array.isArray(hero.tagline) ? (hero.tagline as string[]) : [];
  const mediaUrl = (hero.mockup_media_url as string) || undefined;

  const screen = mediaUrl ? (
    isVideoUrl(mediaUrl) ? (
      <video
        src={mediaUrl}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
    )
  ) : undefined;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-proj-white px-6 pt-[104px] pb-16 md:flex md:min-h-screen md:items-center md:px-[176px] md:py-0"
    >
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <SlideIn delay={1.0}>
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <DisplayHero className="mt-2 text-primary-black">{title}</DisplayHero>
        </SlideIn>

        <SlideIn delay={1.15} className="mx-auto mt-8 w-[62%] max-w-[240px]">
          <PhoneFrame screen={screen} float />
        </SlideIn>

        <BodyLarge className="mt-8 text-center text-grey-600">{body}</BodyLarge>
      </div>

      {/* Desktop layout */}
      <div className="hidden w-full items-center justify-between gap-x-20 md:flex">
        <SlideIn delay={1.0} className="w-[749px] shrink-0">
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <DisplayHero className="mt-5 whitespace-nowrap text-primary-black">
            {title}
          </DisplayHero>
          <BodyLarge className="mt-5 max-w-[610px] text-grey-600">{body}</BodyLarge>
          {tags.length > 0 && (
            <div className="mt-5 flex gap-4">
              {tags.map((tag) => (
                <Tag key={tag} variant="orange">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </SlideIn>

        <SlideIn direction="right" delay={1.15} className="w-[259px] shrink-0">
          <PhoneFrame screen={screen} float />
        </SlideIn>
      </div>
    </section>
  );
}
