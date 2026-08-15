import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Hero } from "./_sections/Hero";
import { ProjectOverview } from "./_sections/ProjectOverview";
import { getProjectWithSections } from "@/lib/data";

// Hand-crafted, bespoke page for this one case study -- deliberately NOT
// driven by the generic project_sections RENDERING schema (layout/markup
// is custom code, not data-driven Section blocks). Next.js matches this
// static route ("work/metro") over the dynamic "work/[slug]" route, so it
// takes over from the CMS-driven page for this exact slug while every
// other project still goes through the normal data-driven flow.
//
// However, the actual COPY (text) and media for the sections that exist
// below (hero / overview / challenge) IS read live from Supabase here --
// editing them in /admin/projects/metro updates this page immediately
// (admin actions call revalidatePath(`/work/metro`)). Only the bespoke
// layout/markup itself is hand-coded; the content inside it is real CMS
// data. This was previously hardcoded as constants, which meant admin
// edits had no effect on this page -- fixed so admin truly is the single
// source of truth for content, per the design system: primary orange
// #FF520D / secondary blue #0D21FF / accent pink #FF5BC0, Nunito type
// scale. Sections are added incrementally in `./_sections/*` -- as of this
// commit only Section 1 (Hero) and Section 2 (Project Overview & Core
// Challenges) are implemented; the remaining ~14 sections from the spec
// follow the same pattern (see PORTFOLIO-SPEC discussion) and slot in here
// in order, each wired the same way (fetch content below, pass as props).

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
      </main>
    </DoorReveal>
  );
}
