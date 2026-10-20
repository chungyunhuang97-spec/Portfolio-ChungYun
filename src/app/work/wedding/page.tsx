import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Footer } from "@/components/design-system/Footer";
import { BackToTop } from "@/components/design-system/BackToTop";
import { Hero } from "./_sections/Hero";
import { Background } from "./_sections/Background";
import { Touchpoints } from "./_sections/Touchpoints";
import { DesignThread } from "./_sections/DesignThread";
import { Closing } from "./_sections/Closing";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted, bespoke page for this case study — same static-route
// pattern as ./work/metro, ./work/nest-stay, ./work/piiluu, ./work/tct
// (Next.js matches this more specific route over the generic
// "work/[slug]" CMS-driven page). Built from the project briefing
// ("One Love, One Language" wedding case study) rather than a Figma file
// — no Figma source exists for this project yet — so it's art-directed
// directly from that content plus docs/case-study-design-conventions.md's
// "結構層 vs 個性層" rule, the same way tct's first pass was.
//
// Structure layer (tokens, shared components — Typography/Tag/SlideIn/
// SectionKicker/MockupSlot/PhoneFrame/Navbar/Footer/BackToTop/DoorReveal,
// card-shadow formula, mobile/desktop content split where it actually
// differs) matches every other case study exactly. Personality layer for
// this project:
//   - Dominant accent: accent-pink — the one color token no other case
//     study had claimed as its dominant yet (Nest Stay=orange, Metro/
//     Piiluu/TCT=blue), and it fits a wedding brand project. Closing
//     reuses this page's own dominant color instead of the cross-project
//     bg-secondary-blue convention, since that convention exists to give
//     every *other* project's Closing a shared accent distinct from its
//     own dominant color — here pink already IS the dominant color.
//   - Pacing: continuous scroll, not slideshow — a single 16-month,
//     four-medium story, closer to Nest Stay/Piiluu's narrative pacing
//     than Metro's argument-by-argument slides.
//   - Signature motifs (none reused from another project): Hero's
//     hand-drawn rings + paper-airplane doodle (no real photography
//     exists yet, so this page gets an intentional illustration instead
//     of an empty slot, same precedent tct set), Touchpoints' alternating
//     left/right card layout, and DesignThread's dashed heart-stitch
//     line standing in for "一條隱藏的脈絡".
//
// No uploaded media exists yet for this project (cover_image_url is
// null) — every visual slot is either an original inline SVG doodle or a
// clearly labeled MockupSlot/PhoneFrame placeholder, so the page reads as
// intentional and can be upgraded later without a layout change.

export const revalidate = 60;

async function loadWedding() {
  const result = await getProjectWithSections("wedding");
  if (!result) return null;
  const { project, sections } = result;
  const getSection = (type: string) =>
    sections.find((s) => s.section_type === type)?.content ?? {};
  return {
    project,
    hero: getSection("hero"),
    overview: getSection("overview"),
    process: getSection("process"),
    outcome: getSection("outcome"),
    reflection: getSection("reflection"),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadWedding();
  if (!data) return { title: "One Love, One Language — Chung Yun Huang" };
  return {
    title: `${data.project.title} — Chung Yun Huang`,
    description: data.project.subtitle ?? undefined,
  };
}

export default async function WeddingPage() {
  const data = await loadWedding();
  if (!data) notFound();

  return (
    <DoorReveal>
      <Navbar backHref="/" />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} />
        <Background overview={data.overview} />
        <Touchpoints process={data.process} />
        <DesignThread outcome={data.outcome} />
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
