import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Hero } from "./_sections/Hero";
import { ProjectOverview } from "./_sections/ProjectOverview";
import { StrategyBeforeApp } from "./_sections/StrategyBeforeApp";
import { InterfaceRouteSearch } from "./_sections/InterfaceRouteSearch";
import { InterfaceCompanionService } from "./_sections/InterfaceCompanionService";
import { InterfaceBonusExperience } from "./_sections/InterfaceBonusExperience";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted, bespoke page for this one case study -- deliberately NOT
// driven by the generic project_sections RENDERING schema (layout/markup
// is custom code, not data-driven Section blocks). Next.js matches this
// static route ("work/metro") over the dynamic "work/[slug]" route, so it
// takes over from the CMS-driven page for this exact slug while every
// other project still goes through the normal data-driven flow.
//
// However, the actual COPY (text) and media for the sections that exist
// below (hero / overview / challenge / process) IS read live from Supabase
// here -- editing them in /admin/projects/metro updates this page
// immediately (admin actions call revalidatePath(`/work/metro`)). Only the
// bespoke layout/markup itself is hand-coded; the content inside it is real
// CMS data. This was previously hardcoded as constants, which meant admin
// edits had no effect on this page -- fixed so admin truly is the single
// source of truth for content, per the design system: primary orange
// #FF520D / secondary blue #0D21FF / accent pink #FF5BC0, Nunito type
// scale. Sections are added incrementally in `./_sections/*` -- as of this
// commit Section 1 (Hero), Section 2 (Project Overview & Core Challenges),
// Section 3 (雙軸優化策略 + 改版前的台北捷運 GO App, Figma 127:127 / 139:42 /
// mobile 151:395) and Section 4's three sub-blocks (核心介面優化與服務創新設計 /
// 01 路線搜尋與規劃, Figma desktop 127:142 / mobile 147:140; 02 捷伴陪同服務, Figma
// desktop 127:208 / mobile 147:174; and 03 附加體驗與優化, Figma desktop 127:294
// / mobile 147:200) are implemented. Sections 3 and 4 all reuse the
// `process` row's content (same row that also carries the long-form process
// narrative in `items`, left untouched) -- each component only reads the
// fields it needs off that same content object (StrategyBeforeApp:
// `strategies`, `visionText`, `mobileVisionText`, `beforeAppSubtext`;
// InterfaceRouteSearch: `interfaceEyebrow`, `interfaceHeading`,
// `interfaceSectionNumber`, `interfaceSectionTitle`, `interfaceBlocks`, and
// the four `interface*MediaUrl` fields; InterfaceCompanionService:
// `companionSectionNumber`, `companionSectionTitle`, `companionBlocks`, and
// the six `companion*MediaUrl` fields; InterfaceBonusExperience:
// `bonusSectionNumber`, `bonusSectionTitle`, `bonusBlocks`, and the four
// `bonus*MediaUrl` fields). Any further sub-block beyond "03" follows the
// same pattern and slots in here in order, each wired the same way (fetch
// content below, pass as props) -- note the Interface & Interaction
// eyebrow/heading should only render once (in InterfaceRouteSearch), so
// later sub-block components must NOT repeat it.

export const revalidate = 60;

async function loadMetro() {
  const result = await getProjectWithSections("metro");
  if (!result) return null;
  const { project, sections } = result;
  const getSection = (type: string) =>
    sections.find((s) => s.section_type === type)?.content ?? {};
  return {
    project,
    hero: getSection("hero"),
    overview: getSection("overview"),
    challenge: getSection("challenge"),
    process: getSection("process"),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadMetro();
  if (!data) return { title: "2025 捷運盃黑客松 — Chung Yun Huang" };
  return {
    title: `${data.project.title} — Chung Yun Huang`,
    description: data.project.subtitle ?? undefined,
  };
}

export default async function MetroPage() {
  const data = await loadMetro();
  if (!data) notFound();

  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} />
        <ProjectOverview project={data.project} overview={data.overview} challenge={data.challenge} />
        <StrategyBeforeApp process={data.process} />
        <InterfaceRouteSearch process={data.process} />
        <InterfaceCompanionService process={data.process} />
        <InterfaceBonusExperience process={data.process} />
      </main>
    </DoorReveal>
  );
}
