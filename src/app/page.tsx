import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getAllSiteContent, getPublishedProjects, getVideoSectionData } from "@/lib/data";
import { FadeIn } from "@/components/FadeIn";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/design-system/Navbar";

export const revalidate = 60;

export default async function Home() {
  const [siteContent, caseStudies, videoSectionData] = await Promise.all([
    getAllSiteContent(),
    getPublishedProjects("case_study"),
    getVideoSectionData(),
  ]);

  const heroTagline = (siteContent.hero_tagline?.text as string | undefined) ?? "";
  const aboutMe = (siteContent.about_me?.text as string | undefined) ?? "";
  const positioningTags =
    (siteContent.positioning_tags?.items as { title: string; desc: string }[] | undefined) ?? [];

  return (
    <>
      <Navbar wordmarkTone="light" />
      <main className="flex-1">
        {/* Hero — scribble-collage poster with scroll parallax + idle doodle motion. */}
        <Hero tagline={heroTagline} />

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

        {/* Case studies */}
        <section id="work" className="border-t border-line">
          <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl">Case Studies</h2>
            </FadeIn>

            {caseStudies.length === 0 ? (
              <p className="mt-8 text-sm text-ink-faint">
                尚未有已發布的案例 — 在 Supabase Table Editor 把 projects.status 改成 published 即可顯示。
              </p>
            ) : (
              <div className="mt-10 divide-y divide-line">
                {caseStudies.map((project, index) => (
                  <FadeIn key={project.id} delay={index * 0.05}>
                    <Link
                      href={`/work/${project.slug}`}
                      className="group grid grid-cols-1 gap-3 py-8 first:pt-0 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8"
                    >
                      <span className="font-mono text-sm text-ink-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-xl transition-colors group-hover:text-accent md:text-2xl">
                          {project.title}
                        </h3>
                        {project.subtitle && (
                          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-muted">
                            {project.subtitle}
                          </p>
                        )}
                        {project.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                            {project.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] tracking-[0.15em] text-ink-faint"
                              >
                                {tag.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight
                        size={20}
                        weight="light"
                        className="hidden text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent md:block"
                      />
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Video & content production — teaser only, full content lives on its own page */}
        {videoSectionData && (videoSectionData.featured.length > 0 || videoSectionData.more.length > 0) && (
          <section className="border-t border-line">
            <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl">影片製作</h2>
                <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-ink-muted">
                  企劃、執導、剪輯——婚禮開場、紀錄片與社群短影音的幕後工作。
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <Link
                  href="/video"
                  className="group inline-flex shrink-0 items-center gap-2 border-b border-ink pb-1 text-sm tracking-wide transition-colors hover:border-accent hover:text-accent"
                >
                  查看影片作品
                  <ArrowRight
                    size={16}
                    weight="light"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </FadeIn>
            </div>
          </section>
        )}

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
