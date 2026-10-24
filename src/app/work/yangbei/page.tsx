import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/design-system/Navbar";
import { DoorReveal } from "@/components/design-system/DoorReveal";
import { Footer } from "@/components/design-system/Footer";
import { BackToTop } from "@/components/design-system/BackToTop";
import { Hero } from "./_sections/Hero";
import { WhyThisProject } from "./_sections/WhyThisProject";
import { YangbeiSystemRoles } from "./_sections/YangbeiSystemRoles";
import { YangbeiVideoSection } from "./_sections/YangbeiVideoSection";
import { YangbeiTransitionCard } from "./_sections/YangbeiTransitionCard";
import { AIWorkflow } from "./_sections/AIWorkflow";
import { Outcomes } from "./_sections/Outcomes";
import { Closing } from "./_sections/Closing";
import { getProjectWithSections } from "@/lib/data";
import type { YangbeiPlatform } from "./types";

// Hand-crafted static route for 央北社宅活動報名系統 case study.
// Next.js resolves this more-specific route before the generic /work/[slug] page.
//
// Content model (Supabase project_sections):
//   hero     → kicker / title / subtitle / timeframeLabel / badges / mockup_media_url
//   process  → whyIntro / whySteps / systemRoles (3×) / platforms (3×) /
//              {frontend,instructor,admin}_video_url / {frontend,instructor,admin}_highlights /
//              aiWorkflowTitle / aiWorkflowDesc / aiWorkflowItems (3×) / outcomesTitle / outcomes (3×)
//   reflection → closingQuote / closingBody
//
// Section ordering mirrors the narrative arc:
//   Hero → WhyThisProject → YangbeiSystemRoles
//   → YangbeiVideoSection(01 前台) → YangbeiTransitionCard
//   → YangbeiVideoSection(02 中台) → YangbeiTransitionCard
//   → YangbeiVideoSection(03 後台) → AIWorkflow → Outcomes → Closing
//
// The three video walkthroughs read their own video URL + highlights off
// `process.{frontend,instructor,admin}_{video_url,highlights}` — each
// independently CMS-editable.

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

  const platforms = Array.isArray(data.process.platforms)
    ? (data.process.platforms as YangbeiPlatform[])
    : [];
  const byId = (id: string) => platforms.find((p) => p.id === id);
  const highlightsOf = (key: string) =>
    Array.isArray(data.process[key]) ? (data.process[key] as string[]) : [];

  return (
    <DoorReveal>
      <Navbar />
      <main className="font-nunito bg-proj-white">
        <Hero project={data.project} hero={data.hero} platforms={platforms} />
        <WhyThisProject process={data.process} />
        <YangbeiSystemRoles process={data.process} />
        <YangbeiVideoSection
          index="01"
          label="前台：住戶視角"
          description="從瀏覽課程到完成報名，專為年長住戶簡化每一個步驟。"
          videoUrl={data.process.frontend_video_url as string | undefined}
          highlights={highlightsOf("frontend_highlights")}
          color={byId("frontend")?.color ?? "#FF520D"}
        />
        <YangbeiTransitionCard text="這些報名資料，講師要怎麼管理？" />
        <YangbeiVideoSection
          index="02"
          label="中台：講師視角"
          description="講師登入後，管理課程、記錄出席與查看學員回饋的日常操作。"
          videoUrl={data.process.instructor_video_url as string | undefined}
          highlights={highlightsOf("instructor_highlights")}
          color={byId("instructor")?.color ?? "#0D21FF"}
          reverse
        />
        <YangbeiTransitionCard text="整體資料與帳號，由誰統籌管理？" />
        <YangbeiVideoSection
          index="03"
          label="後台：管理員視角"
          description="從課程建立到報名漏斗監控，後台工具讓管理員掌握平台全局。"
          videoUrl={data.process.admin_video_url as string | undefined}
          highlights={highlightsOf("admin_highlights")}
          color={byId("admin")?.color ?? "#FF5BC0"}
        />
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
