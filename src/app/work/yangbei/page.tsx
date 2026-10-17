import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Footer } from "@/components/design-system/Footer";
import { BackToTop } from "@/components/design-system/BackToTop";
import { Hero } from "./_sections/Hero";
import { WhyThisProject } from "./_sections/WhyThisProject";
import { ThreeLayerArchitecture } from "./_sections/ThreeLayerArchitecture";
import { PlatformShowcase } from "./_sections/PlatformShowcase";
import { AIWorkflow } from "./_sections/AIWorkflow";
import { Outcomes } from "./_sections/Outcomes";
import { Closing } from "./_sections/Closing";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted static route for 央北社宅活動報名系統 case study.
// Next.js resolves this more-specific route before the generic /work/[slug] page.
//
// Content model (Supabase project_sections):
//   hero     → kicker / title / subtitle / timeframeLabel / badges / mockup_media_url
//   process  → whyIntro / whySteps / architectureTitle / architectureSubtitle /
//              platforms (3×) / aiWorkflowTitle / aiWorkflowDesc / aiWorkflowItems (3×) /
//              outcomesTitle / outcomes (3×)
//   reflection → closingQuote / closingBody
//
// Section ordering mirrors the narrative arc:
//   Hero → WhyThisProject → ThreeLayerArchitecture → PlatformShowcase
//   → AIWorkflow → Outcomes → Closing

export const revalidate = 60;

async function loadYangbei() {
  const result = await getProjectWithSections("yangbei");
  if (!result) return null;
  const { project, sections } = result;
  const getSection = (type: string) =>
    sections.find((s) => s.section_type === type)?.content ?? {};
  return {
    project,
    hero: getSection("hero"),
    process: getSection("process"),
    reflection: getSection("reflection"),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadYangbei();
  if (!data) return { title: "央北社宅活動報名系統 — Chung Yun Huang" };
  return {
    title: `${data.project.title} — Chung Yun Huang`,
    description: data.project.subtitle ?? undefined,
  };
}

export default async function YangbeiPage() {
  const data = await loadYangbei();
  if (!data) notFound();

  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} />
        <WhyThisProject process={data.process} />
        <ThreeLayerArchitecture process={data.process} />
        <PlatformShowcase process={data.process} />
        <AIWorkflow process={data.process} />
        <Outcomes process={data.process} />
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
