import { getAllSiteContent, getProjectGridSettings, getPublishedProjects } from "@/lib/data";
import { FadeIn } from "@/components/FadeIn";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/design-system/Navbar";
import { ProjectsSection } from "@/components/projects/ProjectsSection";

export const revalidate = 60;

export default async function Home() {
  const [siteContent, caseStudies] = await Promise.all([
    getAllSiteContent(),
    getPublishedProjects("case_study"),
  ]);

  const heroTagline = (siteContent.hero_tagline?.text as string | undefined) ?? "";
  const aboutMe = (siteContent.about_me?.text as string | undefined) ?? "";
  const positioningTags =
    (siteContent.positioning_tags?.items as { title: string; desc: string }[] | undefined) ?? [];
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

        {/* About + positioning */}
        <section id="about" className="border-t border-line">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-10 md:py-24">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl">About</h2>
              <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-ink-muted">
                {aboutMe}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="divide-y divide-line">
                {positioningTags.map((tag) => (
                  <div key={tag.title} className="py-6 first:pt-0">
                    <h3 className="text-lg">{tag.title}</h3>
                    <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-ink-muted">
                      {tag.desc}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 text-sm text-ink-faint md:flex-row md:items-center md:justify-between md:px-10">
            <p>© {new Date().getFullYear()} Chung Yun Huang</p>
            <a
              href="mailto:chungyunhuang97@gmail.com"
              className="transition-colors hover:text-ink"
            >
              chungyunhuang97@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
