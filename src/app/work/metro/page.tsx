import type { Metadata } from "next";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Hero } from "./_sections/Hero";
import { ProjectOverview } from "./_sections/ProjectOverview";

// Hand-crafted, bespoke page for this one case study -- deliberately NOT
// driven by the generic project_sections schema. Next.js matches this
// static route ("work/metro") over the dynamic "work/[slug]" route, so it
// takes over from the CMS-driven page for this exact slug while every other
// project still goes through the normal data-driven flow.
//
// This is a full rebuild against the new Figma spec (design system: primary
// orange #FF520D / secondary blue #0D21FF / accent pink #FF5BC0, Nunito
// type scale). Sections are added incrementally in `./_sections/*` — as of
// this commit only Section 1 (Hero) and Section 2 (Project Overview & Core
// Challenges) are implemented; the remaining ~14 sections from the spec
// follow the same pattern (see PORTFOLIO-SPEC discussion) and slot in here
// in order.
//
// Mockup / screenshot / video assets are intentionally placeholder frames
// (<MockupSlot />) until the real media is provided and wired into the CMS
// media-upload flow described in the spec.

export const metadata: Metadata = {
  title: "2025 捷運盃黑客松 — Chung Yun Huang",
  description:
    "重新定義大眾運輸體驗，從介面設計與服務創新出發，為百萬通勤乘客打造最溫柔的數位解答。",
};

export default function MetroPage() {
  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero />
        <ProjectOverview />
      </main>
    </DoorReveal>
  );
}
