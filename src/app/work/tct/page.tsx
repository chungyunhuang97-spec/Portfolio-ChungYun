import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Footer } from "@/components/design-system/Footer";
import { BackToTop } from "@/components/design-system/BackToTop";
import { Hero } from "./_sections/Hero";
import { Context } from "./_sections/Context";
import { RoleContribution } from "./_sections/RoleContribution";
import { ExhibitionZones } from "./_sections/ExhibitionZones";
import { OnSite } from "./_sections/OnSite";
import { Outcome } from "./_sections/Outcome";
import { Closing } from "./_sections/Closing";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted, bespoke page for the NTSO case study -- same static-route
// pattern as ./work/metro, ./work/nest-stay, ./work/piiluu (Next.js matches
// this more specific route over the generic "work/[slug]" CMS-driven page,
// which is what this project rendered through before this rebuild).
//
// Originally had no Figma source -- it was never designed there, only
// content-authored through the admin CMS (see the 7 typed `project_sections`
// rows: hero / overview / challenge / role / process / outcome / reflection),
// so the first build was art-directed directly from that content plus
// docs/case-study-design-conventions.md's "結構層 vs 個性層" rule rather than
// ported from a design file. Joe has since built out a real Figma file for
// this page (fileKey 8qGUSDUJqOgJaSERffGXVc, desktop node 594:319, mobile
// node 594:1599) and this page was brought in line with it in two rounds:
// a first pass added the shared `SectionKicker` component and each section's
// missing H2 heading between kicker and body copy (the "進一步分段" Joe asked
// for, giving each section its own heading so the page reads less dense),
// then a correction pass checked every changed value against the actual
// Figma node data and fixed drift from it -- `font-display`/Outfit was
// swapped back to `font-nunito` (the Figma file specifies Nunito
// exclusively, no Outfit anywhere in it), the new H2 headings' sizes and a
// couple of their exact wordings were corrected to match their Figma nodes
// precisely, the Outcome stat digits were brought back from an unFigma'd
// 64px/40px to the spec'd 48px/24px, and Hero got its still-missing changes:
// desktop title 64px -> 90px, and a from-scratch mobile layout (the body
// caption moved below the badge row instead of crowding the title/meta
// pill, and badges switched from a wrapping flow to a fixed 3-column grid
// with one dropped and one shortened -- Joe's "本來會有點疊在一起" fix).
// Closing's desktop quote also split into two stacked blocks instead of one
// run-on paragraph, matching Figma's two separate text nodes there.
// Structure layer (tokens, shared components, card-shadow formula, SlideIn/
// FadeIn motion feel, mobile/desktop as two independent trees) still
// matches the other three pages exactly -- only this page's own personality
// layer below changed. Personality layer for this project:
//   - Dominant accent: secondary-blue (#0D21FF) -- originally launched with
//     accent-pink (the one color token not yet claimed, per the conventions
//     doc's "每個專案挑一個主導色" checklist), but switched to blue per Joe's
//     call: the real NTSO touchscreen interface is itself blue-dominant, so
//     matching that reads truer than picking an unclaimed color for its own
//     sake -- even though this token's exact hex isn't the interface's own
//     blue. Shares the token with Metro/Piiluu, but the conventions doc's
//     "one dominant color per project" rule was about visual identity within
//     each page, not a hard exclusivity lock across projects.
//   - Pacing: continuous scroll, not slideshow -- this is a single product
//     story (constraint -> three exhibition zones -> outcome), closer to
//     Nest Stay/Piiluu's narrative pacing than Metro's argument-by-argument
//     slides.
//   - Signature motions (none reused from another project): Hero's
//     touch-ripple pulse (the exhibition is a touchscreen kiosk), Context's
//     torn-paper/enlarged-target icon pairing, ExhibitionZones' scroll-linked
//     01→02→03 wayfinding line, Outcome's CountUp stat row, and Closing's
//     film-grain/scanline flicker (analog archive turning legible).
//
// Section order after a round of Joe's feedback against the original site's
// screenshots: Hero -> Context -> RoleContribution -> ExhibitionZones (each
// zone: Design/Live toggle, Zone 1's own step-driven screenshot, Zone 2/3's
// swipeable spotlight+gallery carousel) -> OnSite (展覽現場實況, restored --
// a plain real-photo collage, kept separate from the zones' own Live
// recordings per Joe's explicit call) -> Outcome (成果與反思: stat row +
// the grandma anecdote as intro + a split-out insight/pull-quote card from
// the `reflection` row) -> Closing (`reflection` row again, full quote).
// Closing itself keeps the cross-project `bg-secondary-blue` convention that
// metro/nest-stay/piiluu all share regardless of their own dominant color
// (same as Footer always being orange, BackToTop always blue-bordered) --
// only its ambient backdrop motif is this project's own.
//
// No uploaded media exists yet for this project (cover_image_url is null,
// no public/work/tct assets) -- every visual slot below is either an
// original inline SVG doodle (matching components/design-system/doodles.tsx'
// hand-drawn style) or a clearly labeled MockupSlot-style placeholder for a
// real on-site photo/recording, so the page still reads as intentional and
// can be upgraded later without a layout change.

export const revalidate = 60;

async function loadTct() {
  const result = await getProjectWithSections("tct");
  if (!result) return null;
  const { project, sections } = result;
  const getSection = (type: string) =>
    sections.find((s) => s.section_type === type)?.content ?? {};
  return {
    project,
    hero: getSection("hero"),
    overview: getSection("overview"),
    challenge: getSection("challenge"),
    role: getSection("role"),
    process: getSection("process"),
    outcome: getSection("outcome"),
    reflection: getSection("reflection"),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadTct();
  if (!data) return { title: "NTSO 80週年特展 — Chung Yun Huang" };
  return {
    title: `${data.project.title} — Chung Yun Huang`,
    description: data.project.subtitle ?? undefined,
  };
}

export default async function TctPage() {
  const data = await loadTct();
  if (!data) notFound();

  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} />
        <Context overview={data.overview} challenge={data.challenge} />
        <RoleContribution role={data.role} />
        <ExhibitionZones process={data.process} />
        <OnSite outcome={data.outcome} />
        <Outcome outcome={data.outcome} reflection={data.reflection} />
        <Closing reflection={data.reflection} />
      </main>
      <Footer
        copyright={
          data.project.footer_copyright ??
          `© ${new Date().getFullYear()} ${data.project.title}. All rights reserved.`
        }
      />
      <BackToTop />
    </DoorReveal>
  );
}
