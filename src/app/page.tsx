import {
  getAboutData,
  getAllSiteContent,
  getProjectGridSettings,
  getPublishedProjects,
  getVideoWorksData,
} from "@/lib/data";
import { AboutSection } from "@/components/about/AboutSection";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/design-system/Navbar";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { VideoWorksSection } from "@/components/video-works/VideoWorksSection";

export const revalidate = 60;

export default async function Home() {
  const [siteContent, caseStudies, videoCategories, aboutData] = await Promise.all([
    getAllSiteContent(),
    getPublishedProjects("case_study"),
    getVideoWorksData(),
    getAboutData(),
  ]);

  const heroTagline = (siteContent.hero_tagline?.text as string | undefined) ?? "";
  const gridSettings = getProjectGridSettings(siteContent);
  // Already sorted by display_order; is_visible is the homepage-only switch.
  const gridProjects = caseStudies.filter((project) => project.is_visible !== false);

  return (
    <>
      <Navbar wordmarkTone="light" />
      <main className="flex-1">
        {/* Hero — scribble-collage poster with scroll parallax + idle doodle motion. */}
        <Hero tagline={heroTagline} />

        {/* Selected work -- Bento grid, directly under the Hero so the Star
            Drop transition can hand the Hero's splat down into it. */}
        <ProjectsSection projects={gridProjects} settings={gridSettings} />

        {/* 02 / ABOUT -- about_* tables (blue). */}
        {aboutData && (
          <AboutSection data={aboutData} marqueeEnabled={gridSettings.enable_scroll_choreography} />
        )}

        {/* 03 / VIDEO WORKS -- video_categories + videos (v2 tables). */}
        {videoCategories && <VideoWorksSection categories={videoCategories} />}

        {/* Footer -- orange bookend to the Hero; dark type (cream on orange
            is only 2.8:1). Doubles as the Contact block. */}
        <footer className="bg-primary-orange text-primary-black">
          <div
            className="mx-auto flex max-w-[1400px] flex-col gap-4 py-10 font-nunito text-sm font-bold md:flex-row md:items-center md:justify-between md:px-10"
            style={{
              paddingLeft: "max(24px, env(safe-area-inset-left))",
              paddingRight: "max(24px, env(safe-area-inset-right))",
              paddingBottom: "max(40px, env(safe-area-inset-bottom))",
            }}
          >
            <p>© {new Date().getFullYear()} Chung Yun Huang</p>
            <a
              href="mailto:chungyunhuang97@gmail.com"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            >
              chungyunhuang97@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
