import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Footer } from "@/components/design-system/Footer";
import { BackToTop } from "@/components/design-system/BackToTop";
import { Hero } from "./_sections/Hero";
import { WhyThisProject } from "./_sections/WhyThisProject";
import { InformationArchitecture } from "./_sections/InformationArchitecture";
import { UIFlow } from "./_sections/UIFlow";
import { FrontendDemo } from "./_sections/FrontendDemo";
import { UserTesting } from "./_sections/UserTesting";
import { AchievementsRoadmap } from "./_sections/AchievementsRoadmap";
import { Closing } from "./_sections/Closing";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted, bespoke page for this one case study — same static-route
// pattern as ./work/metro/page.tsx (Next.js matches this more specific
// route over the generic "work/[slug]" CMS-driven page). Built per Joe's
// explicit request: reuse metro's components/specs wherever the two
// projects' designs overlap, so both case studies read as one consistent
// design-system theme, plus a detailed 7-region interaction/motion spec
// (Figma desktop node 275:87 / mobile 404:148 + 407:1033 — the two mobile
// links are identical except the UI Flow block's alternate tab-active
// states, which 407:1033 was used to read).
//
// Section map (Figma order, all reusing the SAME `process` row except
// Hero/Closing — see each file's own doc comment for its exact field
// list): Hero (`hero` row: kicker/title/timeframeLabel/badges/mockup) →
// WhyThisProject (四步驟漸進聚焦: whyIntro/whySteps) →
// InformationArchitecture (5-node flow diagram: iaSubtitle/iaFlowSteps/
// iaMobileCta — the larger decorative isometric sitemap illustration in
// Figma is skipped, not downloadable through this pipeline and not
// required by the written spec) → UIFlow (參與併團流程: desktop 6-step
// always-visible zigzag / mobile 3-block×2-tab FolderTabs, mirroring
// metro's InterfaceRouteSearch precedent) → FrontendDemo (not one of the
// spec's 7 numbered regions — bridges UI Flow to User Testing with the
// existing 與工程師協作 / GitHub Pages Demo narrative already established
// in `outcome.demo_url`) → UserTesting (score bars + CountUp average +
// insight cards) → AchievementsRoadmap (Project Achievements + Future
// Roadmap, minus the closing statement) → Closing (`reflection` row:
// closingQuote/closingBody, reusing metro's Closing section's exact
// bg-secondary-blue quote-mark treatment per Joe's theming request, with
// this round's own ambient-geometry drift spec).
//
// <Footer /> and <BackToTop /> are the same page-chrome components metro
// uses, mounted the same way (Footer pulls `project.footer_copyright`;
// BackToTop appears past 60% scroll and returns to `id="hero"`).

export const revalidate = 60;

async function loadNestStay() {
  const result = await getProjectWithSections("nest-stay");
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
  const data = await loadNestStay();
  if (!data) return { title: "Nest Stay 巢居 — Chung Yun Huang" };
  return {
    title: `${data.project.title} — Chung Yun Huang`,
    description: data.project.subtitle ?? undefined,
  };
}

export default async function NestStayPage() {
  const data = await loadNestStay();
  if (!data) notFound();

  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} />
        <WhyThisProject process={data.process} />
        <InformationArchitecture process={data.process} />
        <UIFlow process={data.process} />
        <FrontendDemo project={data.project} process={data.process} />
        <UserTesting process={data.process} />
        <AchievementsRoadmap process={data.process} />
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
