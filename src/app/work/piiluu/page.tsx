import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Footer } from "@/components/design-system/Footer";
import { BackToTop } from "@/components/design-system/BackToTop";
import { Hero } from "./_sections/Hero";
import { Context } from "./_sections/Context";
import { ThreePillars } from "./_sections/ThreePillars";
import { InterfaceShowcase } from "./_sections/InterfaceShowcase";
import { DesignSystem } from "./_sections/DesignSystem";
import { Milestones } from "./_sections/Milestones";
import { Closing } from "./_sections/Closing";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted, bespoke page for this one case study -- same static-route
// pattern as ./work/nest-stay/page.tsx and ./work/metro/page.tsx (Next.js
// matches this more specific route over the generic "work/[slug]"
// CMS-driven page). Follows Nest Stay's simpler 3-section-type content
// model (hero / process / reflection -- process is a grab-bag JSONB feeding
// every middle section, same convention both existing case studies use).
//
// Section order (Figma fileKey 8qGUSDUJqOgJaSERffGXVc, desktop node
// 473:185 "pc-piiluu" / mobile node 542:190 "mobile-piiluu-1"): Hero (`hero`
// row -- scroll-jacked "SCROLL TO UNLOCK" card-disintegration-to-phone
// opener, piiluu's own signature motion) -> Context (從落地到迭代:
// contextHeadingLine1/2, contextIntro, contextCards) -> ThreePillars
// (三大核心策略: pillars) -> InterfaceShowcase (關鍵介面優化與體驗重塑: 4
// pain-point -> solution rows, each 2 phone screenshots, zigzag desktop /
// FolderTabs mobile) -> DesignSystem (DualTrackIntro + UI Kit System grid:
// dualTrackHeading/Body, uiKitColors/Buttons/Inputs, efficiencyColumns) ->
// Milestones (里程碑與學習: scroll-linked progress bar + sequential ACHIEVED
// reveal, piiluu's second signature motion) -> Closing (`reflection` row --
// closingQuote/closingBody, new "trust network" GeometricBackdrop, distinct
// from both Nest Stay's and Metro's Closing treatments per Joe's explicit
// ask).
//
// Dominant accent color is `secondary-blue` (#0D21FF), not `primary-orange`
// -- per docs/case-study-design-conventions.md's "每個專案挑一個主導色" rule
// (orange is already Nest Stay's dominant); every section here uses blue
// wherever Nest Stay/Metro's equivalent uses their own dominant color.
//
// <Footer /> and <BackToTop /> are the same page-chrome components every
// other case-study page uses, mounted identically.

export const revalidate = 60;

async function loadPiiluu() {
  const result = await getProjectWithSections("piiluu");
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
  const data = await loadPiiluu();
  if (!data) return { title: "Piiluu 皮路 — Chung Yun Huang" };
  return {
    title: `${data.project.title} — Chung Yun Huang`,
    description: data.project.subtitle ?? undefined,
  };
}

export default async function PiiluuPage() {
  const data = await loadPiiluu();
  if (!data) notFound();

  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} />
        <Context process={data.process} />
        <ThreePillars process={data.process} />
        <InterfaceShowcase process={data.process} />
        <DesignSystem process={data.process} />
        <Milestones process={data.process} />
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
